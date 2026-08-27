"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import dynamic from "next/dynamic";
import { LoaderCircle, LockKeyhole } from "lucide-react";
import { IntroExperience } from "@/components/layout/IntroExperience";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { HomeView } from "@/components/home/HomeView";
import { CollectionView } from "@/components/content/CollectionView";
import { LoginGate } from "@/components/auth/LoginGate";
import { DEFAULT_SETTINGS, PORTAL_CONFIG, ROUTE_TO_TABLE } from "@/lib/config/portal";
import {
  getSessionAndProfile,
  isFallbackOnlyPortalSettings,
  loadCollections,
  loadCompliments,
  loadMyAccess,
  loadPortalSettings,
  signIn,
  signOut,
  subscribeToAuth,
} from "@/lib/supabase/repository";
import type { Compliment, PortalCollections, PortalRoute, PortalSettings, Profile, RoleAccessPolicy } from "@/types/portal";

const EMPTY_COLLECTIONS: PortalCollections = {
  app_modules: [], news_posts: [], audit_reports: [], documents: [], publications: [],
};

const INITIAL_SETTINGS: PortalSettings = { ...DEFAULT_SETTINGS, banners: [] };

const AdminDashboard = dynamic(
  () => import("@/components/admin/AdminDashboard").then((module) => module.AdminDashboard),
  { ssr: false, loading: () => <div className="portal-loading"><LoaderCircle className="spin" size={28} /><strong>Abriendo el centro de control...</strong></div> },
);

function routeIsAllowed(route: PortalRoute, access: RoleAccessPolicy | null, canManage: boolean) {
  if (!access?.can_access_portal) return false;
  if (route === "perfil") return true;
  if (route === "admin") return canManage;
  if (route === "inicio") return access.can_view_home;
  if (route === "apps") return access.can_view_apps;
  if (route === "documentos") return access.can_view_documents;
  if (route === "noticias") return access.can_view_news;
  if (route === "auditorias") return access.can_view_audits;
  if (route === "publicaciones") return access.can_view_publications;
  return false;
}

function firstAllowedRoute(access: RoleAccessPolicy | null): PortalRoute {
  if (!access) return "perfil";
  const candidates: Array<[PortalRoute, boolean]> = [
    ["inicio", access.can_view_home], ["apps", access.can_view_apps], ["documentos", access.can_view_documents],
    ["noticias", access.can_view_news], ["auditorias", access.can_view_audits], ["publicaciones", access.can_view_publications],
  ];
  return candidates.find(([, allowed]) => allowed)?.[0] || "perfil";
}

export function PortalApp() {
  const [route, setRoute] = useState<PortalRoute>("inicio");
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [access, setAccess] = useState<RoleAccessPolicy | null>(null);
  const [settings, setSettings] = useState<PortalSettings>(INITIAL_SETTINGS);
  const [settingsReady, setSettingsReady] = useState(false);
  const [collections, setCollections] = useState<PortalCollections>(EMPTY_COLLECTIONS);
  const [compliments, setCompliments] = useState<Compliment[]>([]);
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState("");

  const supabaseConfigured = Boolean(PORTAL_CONFIG.supabaseUrl && PORTAL_CONFIG.supabasePublishableKey);
  const canManage = profile?.is_active !== false && ["super_admin", "admin", "editor"].includes(profile?.role || "");
  const effectiveRoute = access && !routeIsAllowed(route, access, canManage)
    ? firstAllowedRoute(access)
    : route;

  const refreshAuth = useCallback(async () => {
    const auth = await getSessionAndProfile();
    let nextAccess: RoleAccessPolicy | null = null;
    if (auth.profile && auth.session) nextAccess = await loadMyAccess(auth.profile.role);
    setSession(auth.session);
    setProfile(auth.profile);
    setAccess(nextAccess);
    return { ...auth, access: nextAccess };
  }, []);

  const refreshData = useCallback(async () => {
    setLoading(true);
    const [settingsResult, collectionsResult, complimentsResult] = await Promise.allSettled([
      loadPortalSettings(), loadCollections(), loadCompliments(),
    ]);
    if (settingsResult.status === "fulfilled" && !isFallbackOnlyPortalSettings(settingsResult.value)) {
      setSettings(settingsResult.value);
      setSettingsReady(true);
    } else if (settingsResult.status === "rejected") console.error("No fue posible actualizar la configuración del portal:", settingsResult.reason);
    if (collectionsResult.status === "fulfilled") setCollections(collectionsResult.value);
    else console.error("No fue posible actualizar los contenidos del portal:", collectionsResult.reason);
    if (complimentsResult.status === "fulfilled") setCompliments(complimentsResult.value);
    else console.error("No fue posible actualizar los reconocimientos:", complimentsResult.reason);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!supabaseConfigured) return undefined;

    let active = true;
    void (async () => {
      try {
        const auth = await refreshAuth();
        if (auth.session && auth.profile?.is_active !== false && auth.access?.can_access_portal) await refreshData();
      } catch (error) {
        console.error("No fue posible restaurar la sesión del portal:", error);
      } finally {
        if (active) setAuthReady(true);
      }
    })();

    const subscription = subscribeToAuth(() => {
      void (async () => {
        try {
          const auth = await refreshAuth();
          if (auth.session && auth.profile?.is_active !== false && auth.access?.can_access_portal) await refreshData();
          else {
            setCollections(EMPTY_COLLECTIONS);
            setSettings(INITIAL_SETTINGS);
            setSettingsReady(false);
          }
        } catch (error) {
          console.error("No fue posible actualizar el estado de autenticación:", error);
        }
      })();
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, [refreshAuth, refreshData, supabaseConfigured]);

  useEffect(() => {
    if (!session) return;
    window.scrollTo({ top: 0, behavior: settings.visual.reducedMotion ? "auto" : "smooth" });
  }, [effectiveRoute, session, settings.visual.reducedMotion]);

  async function handleLogin(email: string, password: string) {
    setLoginBusy(true);
    setLoginError("");
    try {
      const { error } = await signIn(email, password);
      if (error) {
        setLoginError(error.message === "Invalid login credentials" ? "Correo o contraseña incorrectos." : error.message);
        return;
      }
      const auth = await refreshAuth();
      if (!auth.profile || !auth.session) {
        setLoginError("La sesión se inició, pero no fue posible validar el perfil del portal.");
        return;
      }
      if (auth.profile.is_active === false) return;
      if (!auth.access?.can_access_portal) return;
      setRoute(firstAllowedRoute(auth.access));
      await refreshData();
    } catch (caught) {
      setLoginError(caught instanceof Error ? caught.message : "No fue posible iniciar sesión.");
    } finally {
      setLoginBusy(false);
    }
  }

  async function handleLogout() {
    await signOut();
    setSession(null);
    setProfile(null);
    setAccess(null);
    setCollections(EMPTY_COLLECTIONS);
    setSettings(INITIAL_SETTINGS);
    setSettingsReady(false);
    setRoute("inicio");
  }

  function navigate(next: PortalRoute) {
    if (routeIsAllowed(next, access, canManage)) setRoute(next);
  }

  const allowedRoutes = useMemo(() => {
    const routes: PortalRoute[] = ["inicio", "apps", "documentos", "noticias", "auditorias", "publicaciones", "perfil", "admin"];
    return routes.filter((item) => routeIsAllowed(item, access, canManage));
  }, [access, canManage]);

  if (!supabaseConfigured) {
    return (
      <main className="portal-access-denied">
        <span><LockKeyhole size={24} /></span>
        <small>CONFIGURACIÓN REQUERIDA</small>
        <h1>El portal no tiene configurada su conexión pública con Supabase.</h1>
        <p>Faltan las variables públicas de entorno necesarias para iniciar autenticación. El sistema se detuvo de forma segura antes de cargar información.</p>
      </main>
    );
  }

  if (!authReady) {
    return <main className="portal-auth-loading"><LoaderCircle className="spin" size={28} /><strong>Verificando acceso seguro...</strong><small>Validando sesión y permisos.</small></main>;
  }

  if (!session || !profile) {
    return <LoginGate busy={loginBusy} error={loginError} onSubmit={handleLogin} />;
  }

  if (profile.is_active === false || !access?.can_access_portal) {
    return (
      <main className="portal-access-denied">
        <span><LockKeyhole size={24} /></span>
        <small>ACCESO CONTROLADO</small>
        <h1>{profile.is_active === false ? "Tu cuenta está inactiva." : "Tu rol aún no tiene acceso al portal."}</h1>
        <p>La sesión es válida, pero la política asignada a <strong>{profile.role.replaceAll("_", " ")}</strong> no autoriza la entrada. Contacta al super admin si necesitas acceso.</p>
        <button type="button" className="secondary-button" onClick={() => void handleLogout()}>Cerrar sesión</button>
      </main>
    );
  }

  const activeTable = ROUTE_TO_TABLE[effectiveRoute];
  const panelKey = effectiveRoute === "noticias" ? "news" : effectiveRoute === "auditorias" ? "audits" : effectiveRoute === "documentos" ? "documents" : effectiveRoute === "publicaciones" ? "publications" : "apps";
  const heroKey = settings.banners.map((banner, index) => `${index}:${banner.id}:${banner.media_url}:${banner.is_active !== false ? 1 : 0}:${banner.sort_order || 0}`).join("|");

  let content: React.ReactNode;
  if (activeTable) {
    content = <CollectionView table={activeTable} records={collections[activeTable]} panel={settings.modulePanels[panelKey] || DEFAULT_SETTINGS.modulePanels[panelKey]} canManage={canManage} onBack={() => navigate("inicio")} onManage={() => navigate("admin")} />;
  } else if (effectiveRoute === "perfil") {
    content = <section className="simple-view"><span className="eyebrow">Perfil institucional</span><h1>{profile.full_name || profile.email}</h1><p>{profile.email}</p><div className="profile-summary"><article><span>Rol</span><strong>{profile.role}</strong></article><article><span>Área</span><strong>{profile.process_area || "Sin área asignada"}</strong></article><article><span>Estado</span><strong>Activo</strong></article></div></section>;
  } else if (effectiveRoute === "admin") {
    content = canManage ? <AdminDashboard profile={profile} collections={collections} settings={settings} onRefresh={refreshData} onSettingsChange={setSettings} /> : <section className="simple-view"><h1>Acceso restringido</h1></section>;
  } else if (!settingsReady) {
    content = <section className="hero-data-loading" aria-live="polite" aria-busy="true"><LoaderCircle className="spin" size={30} /><strong>Cargando el repositorio...</strong><span>Preparando tu experiencia según los permisos del rol.</span></section>;
  } else {
    content = <HomeView key={heroKey} collections={collections} settings={settings} compliments={compliments} profile={profile} allowedRoutes={allowedRoutes} onNavigate={navigate} onComplimentSubmitted={refreshData} />;
  }

  return (
    <div className={settings.visual.reducedMotion ? "portal-shell reduce-motion" : "portal-shell"}>
      <div className={`portal-progress ${loading ? "is-active" : ""}`} aria-hidden="true"><span /></div>
      <IntroExperience />
      <SiteHeader route={effectiveRoute} profile={profile} allowedRoutes={allowedRoutes} onNavigate={navigate} onLogin={() => undefined} onLogout={handleLogout} />
      <main>{content}</main>
      <SiteFooter />
    </div>
  );
}
