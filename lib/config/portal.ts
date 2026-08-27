import type { ContentTable, PortalRoute, PortalSettings } from "@/types/portal";

// These are intentionally PUBLIC Supabase client values. The publishable key is
// designed to be embedded in browser applications; authorization is enforced by
// Supabase Auth + RLS. Environment variables override these fallbacks so the key
// can still be rotated from the hosting platform without changing application code.
const DEFAULT_SUPABASE_URL = "https://zultnmgildejjskwdzgq.supabase.co";
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_w79Smsvw6FK3NPwMpN4zeQ_ZtxULuX_";

export const PORTAL_CONFIG = {
  title: "Repositorio de Apps Calidad",
  organization: "Electroingeniería S.A.S.",
  teamName: "Dream Team de Calidad y Mejoramiento Continuo",
  creator: "Juan Esteban Pérez",
  creatorRole: "Analista de Calidad",
  superAdminEmail: "j.perez@ei.com.co",
  homeSettingKey: "portal_home_settings_v6",
  assetBucket: "portal-assets",
  userAdminFunction: "portal-user-admin",
  accessAdminFunction: "portal-access-admin",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || DEFAULT_SUPABASE_URL,
  supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() || DEFAULT_SUPABASE_PUBLISHABLE_KEY,
} as const;

export const NAV_ITEMS: Array<{ route: PortalRoute; label: string }> = [
  { route: "inicio", label: "Inicio" },
  { route: "apps", label: "Apps" },
  { route: "documentos", label: "Documentos" },
  { route: "noticias", label: "Noticias" },
  { route: "auditorias", label: "Auditorías" },
  { route: "publicaciones", label: "Publicaciones" },
];

export const ROUTE_TO_TABLE: Partial<Record<PortalRoute, ContentTable>> = {
  apps: "app_modules",
  noticias: "news_posts",
  auditorias: "audit_reports",
  documentos: "documents",
  publicaciones: "publications",
};

export const DEFAULT_SETTINGS: PortalSettings = {
  visual: {
    reducedMotion: false,
    backgroundUrl: "",
    backgroundOpacity: 8,
    backgroundLoop: true,
  },
  banners: [
    {
      id: "banner-1",
      title: "Todo el sistema de calidad, en un solo lugar",
      subtitle: "Apps · Documentos · Auditoría · Mejora continua",
      description:
        "Consulta herramientas, conocimiento institucional y novedades del Dream Team con una navegación rápida y clara.",
      button_text: "Explorar Apps",
      link_url: "apps",
      media_url: "/assets/placeholders/banner.svg",
      animation: "fade",
      media_fit: "contain",
      media_position: "center",
      is_active: true,
      sort_order: 1,
    },
  ],
  mascot: [
    {
      id: "mascot-1",
      name: "Identidad del equipo",
      description: "Espacio administrable para la mascota y la cultura del Dream Team.",
      media_url: "/assets/placeholders/mascot.svg",
      is_active: true,
      sort_order: 1,
    },
  ],
  team: [
    {
      id: "team-1",
      name: "Equipo de Calidad",
      role: "Calidad y mejoramiento continuo",
      bio: "Presentación editable de quienes hacen posible la mejora continua.",
      photo_url: "/assets/placeholders/team.svg",
      is_active: true,
      sort_order: 1,
    },
  ],
  modulePanels: {
    apps: {
      badge: "Herramientas digitales",
      title: "Apps del sistema de calidad",
      description: "Accesos directos a soluciones internas y recursos operativos.",
      mediaUrl: "/assets/modules/gen4-apps.png",
      mediaFit: "contain",
      mediaAspect: "3:4",
    },
    news: {
      badge: "Actualidad",
      title: "Noticias del equipo",
      description: "Información reciente y comunicaciones relevantes.",
      mediaUrl: "/assets/modules/gen4-news.mp4",
      mediaFit: "contain",
      mediaAspect: "3:4",
    },
    audits: {
      badge: "Control y seguimiento",
      title: "Auditorías",
      description: "Consulta informes, evidencias y resultados de auditoría.",
      mediaUrl: "/assets/modules/gen4-audits.mp4",
      mediaFit: "contain",
      mediaAspect: "3:4",
    },
    documents: {
      badge: "Conocimiento vigente",
      title: "Documentos institucionales",
      description: "Encuentra procedimientos, formatos y documentos de referencia.",
      mediaUrl: "/assets/modules/gen4-documents.mp4",
      mediaFit: "contain",
      mediaAspect: "3:4",
    },
    publications: {
      badge: "Comunidad interna",
      title: "Publicaciones",
      description: "Contenidos, reconocimientos y novedades de mejora continua.",
      mediaUrl: "/assets/modules/gen4-publications.mp4",
      mediaFit: "contain",
      mediaAspect: "3:4",
    },
  },
};

export const CONTENT_LABELS: Record<ContentTable, { singular: string; plural: string }> = {
  app_modules: { singular: "App", plural: "Apps" },
  news_posts: { singular: "noticia", plural: "Noticias" },
  audit_reports: { singular: "auditoría", plural: "Auditorías" },
  documents: { singular: "documento", plural: "Documentos" },
  publications: { singular: "publicación", plural: "Publicaciones" },
};
