export type AssetKind = "image" | "gif" | "video" | "audio";

export interface PortalAsset {
  id: string;
  label: string;
  group: "Marca" | "Fondos" | "Módulos" | "Estados" | "Audio";
  kind: AssetKind;
  path: string;
  width?: number;
  height?: number;
  recommendedUse: string;
}

export const PORTAL_ASSETS: PortalAsset[] = [
  { id: "dream-team", label: "Logo Dream Team", group: "Marca", kind: "image", path: "/assets/brand/dream-team-logo.png", width: 900, height: 300, recommendedUse: "Encabezado y piezas de relación 3:1." },
  { id: "repository", label: "Logo del repositorio", group: "Marca", kind: "image", path: "/assets/brand/repository-logo.png", width: 1672, height: 941, recommendedUse: "Introducción y piezas institucionales 16:9." },
  { id: "banner-motion", label: "Fondo animado para banners", group: "Fondos", kind: "video", path: "/assets/backgrounds/banner-background.mp4", width: 1280, height: 720, recommendedUse: "Ambientación tenue detrás del carrusel; nunca sustituye el banner." },
  { id: "portal-motion", label: "Fondo general del portal", group: "Fondos", kind: "video", path: "/assets/backgrounds/portal-bg.mp4", width: 1280, height: 720, recommendedUse: "Acento ambiental de baja opacidad." },
  { id: "apps", label: "Visual de Apps", group: "Módulos", kind: "image", path: "/assets/modules/gen4-apps.png", width: 832, height: 1104, recommendedUse: "Panel vertical 3:4 del módulo Apps." },
  { id: "documents", label: "Visual de Documentos", group: "Módulos", kind: "video", path: "/assets/modules/gen4-documents.mp4", width: 832, height: 1104, recommendedUse: "Panel vertical 3:4 del módulo Documentos." },
  { id: "news", label: "Visual de Noticias", group: "Módulos", kind: "video", path: "/assets/modules/gen4-news.mp4", width: 832, height: 1104, recommendedUse: "Panel vertical 3:4 del módulo Noticias." },
  { id: "audits", label: "Visual de Auditorías", group: "Módulos", kind: "video", path: "/assets/modules/gen4-audits.mp4", width: 832, height: 1104, recommendedUse: "Panel vertical 3:4 del módulo Auditorías." },
  { id: "publications", label: "Visual de Publicaciones", group: "Módulos", kind: "video", path: "/assets/modules/gen4-publications.mp4", width: 832, height: 1104, recommendedUse: "Panel vertical 3:4 del módulo Publicaciones." },
  { id: "loading", label: "Carga", group: "Estados", kind: "gif", path: "/assets/notifications/loading.gif", width: 500, height: 500, recommendedUse: "Acento pequeño de carga, máximo 64 px." },
  { id: "success", label: "Acción correcta", group: "Estados", kind: "gif", path: "/assets/notifications/success.gif", width: 304, height: 270, recommendedUse: "Confirmación breve, máximo 64 px." },
  { id: "app-notification", label: "Nueva App", group: "Estados", kind: "gif", path: "/assets/notifications/app.gif", width: 494, height: 348, recommendedUse: "Aviso puntual de Apps, máximo un GIF por tarjeta." },
  { id: "document-notification", label: "Nuevo documento", group: "Estados", kind: "gif", path: "/assets/notifications/document.gif", width: 512, height: 512, recommendedUse: "Aviso puntual de Documentos." },
  { id: "news-notification", label: "Nueva noticia", group: "Estados", kind: "gif", path: "/assets/notifications/news.gif", width: 480, height: 270, recommendedUse: "Aviso puntual de Noticias." },
  { id: "audit-notification", label: "Nueva auditoría", group: "Estados", kind: "gif", path: "/assets/notifications/audit.gif", width: 428, height: 480, recommendedUse: "Aviso puntual de Auditorías." },
  { id: "publication-notification", label: "Nueva publicación", group: "Estados", kind: "gif", path: "/assets/notifications/publication.gif", width: 480, height: 480, recommendedUse: "Aviso puntual de Publicaciones." },
  { id: "processing", label: "Procesando", group: "Estados", kind: "gif", path: "/assets/utility/states/processing.gif", width: 480, height: 480, recommendedUse: "Estado contextual; no usar como fondo." },
  { id: "document-processing", label: "Documento en proceso", group: "Estados", kind: "gif", path: "/assets/utility/states/document-processing.gif", width: 480, height: 480, recommendedUse: "Estado contextual de documentación." },
  { id: "working", label: "Trabajo en curso", group: "Estados", kind: "gif", path: "/assets/utility/states/working.gif", width: 480, height: 480, recommendedUse: "Estado contextual de trabajo." },
  { id: "not-found", label: "Sin resultados", group: "Estados", kind: "gif", path: "/assets/utility/states/not-found.gif", width: 450, height: 450, recommendedUse: "Estado vacío en formato pequeño." },
  { id: "brand-sound", label: "Audio de introducción", group: "Audio", kind: "audio", path: "/assets/intro/intro-sound.mp3", recommendedUse: "Audio opcional de bienvenida, siempre activado por el usuario." },
  { id: "notification-sound", label: "Nueva notificación", group: "Audio", kind: "audio", path: "/assets/notifications/new-notification.mp3", recommendedUse: "Avisos que requieren atención." },
  { id: "success-sound", label: "Confirmación", group: "Audio", kind: "audio", path: "/assets/utility/audio/ready.mp3", recommendedUse: "Confirmaciones explícitas." },
];

export const MODULE_ACCENTS: Record<string, string> = {
  apps: "/assets/notifications/app.gif",
  documents: "/assets/notifications/document.gif",
  news: "/assets/notifications/news.gif",
  audits: "/assets/notifications/audit.gif",
  publications: "/assets/notifications/publication.gif",
};
