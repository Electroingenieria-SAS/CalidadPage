"use client";

import { useState } from "react";
import { LogIn, LogOut, Menu, Settings2, UserRound, X } from "lucide-react";
import { NAV_ITEMS } from "@/lib/config/portal";
import type { PortalRoute, Profile } from "@/types/portal";
import { BrandMark } from "@/components/shared/BrandMark";

interface SiteHeaderProps {
  route: PortalRoute;
  profile: Profile | null;
  allowedRoutes: PortalRoute[];
  onNavigate: (route: PortalRoute) => void;
  onLogin: () => void;
  onLogout: () => void;
}

export function SiteHeader({ route, profile, allowedRoutes, onNavigate, onLogin, onLogout }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);
  const canManage = profile?.is_active !== false && ["super_admin", "admin", "editor"].includes(profile?.role || "");

  function navigate(next: PortalRoute) {
    onNavigate(next);
    setOpen(false);
  }

  const floatingPublicRoutes: PortalRoute[] = ["inicio", "apps", "documentos", "noticias", "auditorias", "publicaciones"];
  const floating = floatingPublicRoutes.includes(route);

  return (
    <header className={`site-header ${floating ? "site-header--floating" : ""} ${route === "inicio" ? "site-header--home" : floating ? "site-header--module" : ""}`}>
      <button type="button" className="site-header__brand" onClick={() => navigate("inicio")} aria-label="Ir al inicio">
        <BrandMark compact />
      </button>

      <nav className={`site-nav ${open ? "site-nav--open" : ""}`} aria-label="Navegación principal">
        <div className="site-nav__mobile-head">
          <span>Navegación</span>
          <button type="button" className="icon-button" onClick={() => setOpen(false)} aria-label="Cerrar menú"><X size={19} /></button>
        </div>
        {NAV_ITEMS.filter((item) => allowedRoutes.includes(item.route)).map((item) => (
          <button
            key={item.route}
            type="button"
            className={route === item.route ? "is-active" : ""}
            onClick={() => navigate(item.route)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="site-header__actions">
        {canManage && (
          <button type="button" className="icon-button" onClick={() => navigate("admin")} aria-label="Abrir administración" title="Administración">
            <Settings2 size={19} />
          </button>
        )}
        {profile && (
          <button type="button" className="profile-pill" onClick={() => navigate("perfil")}>
            <UserRound size={17} />
            <span>{profile.full_name?.split(" ")[0] || "Mi perfil"}</span>
          </button>
        )}
        <button type="button" className="auth-button" onClick={profile ? onLogout : onLogin}>
          {profile ? <LogOut size={17} /> : <LogIn size={17} />}
          <span>{profile ? "Salir" : "Ingresar"}</span>
        </button>
        <button type="button" className="icon-button site-header__menu" onClick={() => setOpen(true)} aria-label="Abrir menú"><Menu size={20} /></button>
      </div>
    </header>
  );
}
