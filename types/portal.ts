export type PortalRoute =
  | "inicio"
  | "apps"
  | "noticias"
  | "auditorias"
  | "documentos"
  | "publicaciones"
  | "perfil"
  | "admin";

export type ContentTable =
  | "app_modules"
  | "news_posts"
  | "audit_reports"
  | "documents"
  | "publications";

export type PortalRole =
  | "super_admin"
  | "admin"
  | "calidad"
  | "auditoria"
  | "consulta"
  | "solicitante"
  | "analista"
  | "jefe_auditoria"
  | "jefe_general"
  | "editor"
  | "viewer";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: PortalRole;
  is_active: boolean;
  process_area: string | null;
  accessible_mode?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ContentRecord {
  id: string;
  title?: string | null;
  name?: string | null;
  description?: string | null;
  content?: string | null;
  status?: string | null;
  visibility?: string | null;
  url?: string | null;
  external_url?: string | null;
  file_url?: string | null;
  image_url?: string | null;
  icon_url?: string | null;
  category_id?: string | null;
  category?: string | null;
  category_name?: string | null;
  tags?: string[] | null;
  allowed_roles?: string[] | null;
  creator_name?: string | null;
  creator_role?: string | null;
  creator_credit?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
  [key: string]: unknown;
}

export interface BannerItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  button_text?: string;
  link_url?: string;
  media_url: string;
  animation?: "fade" | "slide" | "zoom";
  media_fit?: "contain" | "cover";
  media_position?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio?: string;
  photo_url: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface MascotItem {
  id: string;
  name: string;
  description?: string;
  media_url: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface ModulePanel {
  badge: string;
  title: string;
  description: string;
  mediaUrl: string;
  mediaFit?: "contain" | "cover";
  mediaAspect?: "3:4" | "16:9" | "4:3" | "3:2" | "1:1";
  panelScale?: number;
  mediaScale?: number;
}

export interface PortalSettings {
  visual: {
    reducedMotion: boolean;
    backgroundUrl: string;
    backgroundOpacity: number;
    backgroundLoop: boolean;
  };
  banners: BannerItem[];
  mascot: MascotItem[];
  team: TeamMember[];
  modulePanels: Record<string, ModulePanel>;
}

export interface PortalCollections {
  app_modules: ContentRecord[];
  news_posts: ContentRecord[];
  audit_reports: ContentRecord[];
  documents: ContentRecord[];
  publications: ContentRecord[];
}

export interface ManagedUser {
  id: string;
  email: string;
  full_name: string;
  role: PortalRole;
  process_area: string;
  is_active: boolean;
  last_sign_in_at?: string | null;
  created_at?: string | null;
}

export interface Compliment {
  id: string;
  team_member_id: string | null;
  team_member_name: string | null;
  rating: number;
  message: string | null;
  sender_name: string | null;
  sender_email: string | null;
  created_by: string | null;
  created_at: string;
}

export interface RoleAccessPolicy {
  role: PortalRole;
  can_access_portal: boolean;
  can_view_home: boolean;
  can_view_apps: boolean;
  can_view_documents: boolean;
  can_view_news: boolean;
  can_view_audits: boolean;
  can_view_publications: boolean;
  updated_at?: string | null;
}

export interface RoleContentScope {
  role: PortalRole;
  content_type: ContentTable;
  allow_all: boolean;
  allowed_record_ids: string[];
  allowed_category_ids: string[];
  allowed_tags: string[];
  updated_at?: string | null;
}

export interface PortalCategory {
  id: string;
  name: string;
  module: string;
  is_active: boolean;
}

export interface AccessContentOption {
  id: string;
  title?: string | null;
  name?: string | null;
  category_id?: string | null;
  tags?: string[] | null;
  status?: string | null;
  is_active?: boolean | null;
}

export interface AccessMatrix {
  policies: RoleAccessPolicy[];
  scopes: RoleContentScope[];
  categories: PortalCategory[];
  content: Record<ContentTable, AccessContentOption[]>;
}
