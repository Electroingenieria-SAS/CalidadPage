"use client";

import { useState } from "react";
import { Boxes, FolderArchive, Image as ImageIcon, LayoutDashboard, ShieldCheck, SlidersHorizontal, Users } from "lucide-react";
import { AccessControlManager } from "@/components/admin/AccessControlManager";
import { SecurityCenter } from "@/components/admin/SecurityCenter";
import { AssetLibrary } from "@/components/admin/AssetLibrary";
import { ContentManager } from "@/components/admin/ContentManager";
import { IdentityManager } from "@/components/admin/IdentityManager";
import { UserManager } from "@/components/admin/UserManager";
import type { PortalCollections, PortalSettings, Profile } from "@/types/portal";

type AdminTab = "overview" | "content" | "identity" | "assets" | "users" | "access" | "security";

interface AdminDashboardProps {
  profile: Profile;
  collections: PortalCollections;
  settings: PortalSettings;
  onRefresh: () => Promise<void>;
  onSettingsChange: (settings: PortalSettings) => void;
}

export function AdminDashboard({ profile, collections, settings, onRefresh, onSettingsChange }: AdminDashboardProps) {
  const [tab, setTab] = useState<AdminTab>("overview");
  const isSuperAdmin = profile.role === "super_admin";
  const isAdmin = profile.role === "admin";
  const canManageIdentity = isSuperAdmin || isAdmin;
  const canManageUsers = isSuperAdmin || isAdmin;
  const totalContent = Object.values(collections).reduce((total, rows) => total + rows.length, 0);

  const tabs = [
    { key: "overview" as const, label: "Resumen", icon: LayoutDashboard },
    { key: "content" as const, label: "Contenidos", icon: Boxes },
    ...(canManageIdentity ? [{ key: "identity" as const, label: "Identidad", icon: ImageIcon }] : []),
    ...(canManageIdentity ? [{ key: "assets" as const, label: "Assets", icon: FolderArchive }] : []),
    ...(canManageUsers ? [{ key: "users" as const, label: "Usuarios", icon: Users }] : []),
    ...(isSuperAdmin ? [{ key: "access" as const, label: "Accesos", icon: SlidersHorizontal }, { key: "security" as const, label: "Seguridad", icon: ShieldCheck }] : []),
  ];

  return (
    <section className="admin-dashboard">
      <header className="admin-dashboard__hero">
        <div>
          <span className="eyebrow"><ShieldCheck size={16} /> Centro de control</span>
          <h1>Administración clara, sin mezclar procesos.</h1>
          <p>Contenido, identidad y usuarios viven en espacios separados para que cada cambio sea fácil de encontrar, revisar y mantener.</p>
        </div>
        <aside><span>Sesión activa</span><strong>{profile.full_name || profile.email}</strong><small>{profile.role.replaceAll("_", " ")}</small></aside>
      </header>

      <nav className="admin-tabs" aria-label="Secciones de administración">
        {tabs.map(({ key, label, icon: Icon }) => <button key={key} type="button" className={tab === key ? "is-active" : ""} onClick={() => setTab(key)}><Icon size={18} />{label}</button>)}
      </nav>

      {tab === "overview" && (
        <div className="admin-overview">
          <div className="admin-kpis">
            <article><span>Contenido total</span><strong>{totalContent}</strong><small>Registros publicados</small></article>
            <article><span>Apps</span><strong>{collections.app_modules.length}</strong><small>Herramientas disponibles</small></article>
            <article><span>Documentos</span><strong>{collections.documents.length}</strong><small>Recursos documentales</small></article>
            <article><span>Rol actual</span><strong className="admin-kpis__role">{profile.role.replaceAll("_", " ")}</strong><small>Permisos efectivos</small></article>
          </div>
          <div className="admin-quick-grid">
            <button type="button" onClick={() => setTab("content")}><Boxes size={25} /><span><strong>Gestionar contenidos</strong><small>Crear, editar, publicar o eliminar Apps y recursos.</small></span></button>
            {canManageIdentity && <button type="button" onClick={() => setTab("identity")}><ImageIcon size={25} /><span><strong>Editar la experiencia</strong><small>Portada, equipo, mascota y paneles visuales.</small></span></button>}
            {canManageIdentity && <button type="button" onClick={() => setTab("assets")}><FolderArchive size={25} /><span><strong>Consultar assets</strong><small>GIF, videos, imágenes, audio y proporciones recomendadas.</small></span></button>}
            {canManageUsers && <button type="button" onClick={() => setTab("users")}><Users size={25} /><span><strong>Administrar usuarios</strong><small>Gestiona únicamente cuentas de nivel inferior al tuyo.</small></span></button>}
            {isSuperAdmin && <button type="button" onClick={() => setTab("access")}><SlidersHorizontal size={25} /><span><strong>Matriz de accesos</strong><small>Define Apps, documentos, categorías y etiquetas visibles por rol.</small></span></button>}
          </div>
        </div>
      )}
      {tab === "content" && <ContentManager collections={collections} onRefresh={onRefresh} />}
      {tab === "identity" && canManageIdentity && <IdentityManager settings={settings} onChange={onSettingsChange} />}
      {tab === "assets" && canManageIdentity && <AssetLibrary />}
      {tab === "users" && canManageUsers && <UserManager currentUserId={profile.id} currentUserRole={profile.role} />}
      {tab === "access" && isSuperAdmin && <AccessControlManager />}
      {tab === "security" && isSuperAdmin && <SecurityCenter />}
    </section>
  );
}
