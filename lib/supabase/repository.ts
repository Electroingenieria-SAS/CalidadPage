"use client";

import type { Session } from "@supabase/supabase-js";
import { DEFAULT_SETTINGS, PORTAL_CONFIG } from "@/lib/config/portal";
import {
  getSupabaseBrowserClient,
  isSupabaseSessionError,
  repairSupabaseBrowserSession,
} from "@/lib/supabase/client";
import { mergePortalSettings } from "@/lib/utils/format";
import type {
  ContentRecord,
  ContentTable,
  Compliment,
  AccessMatrix,
  ManagedUser,
  PortalCategory,
  PortalCollections,
  PortalSettings,
  Profile,
  RoleAccessPolicy,
} from "@/types/portal";

const EMPTY_COLLECTIONS: PortalCollections = {
  app_modules: [],
  news_posts: [],
  audit_reports: [],
  documents: [],
  publications: [],
};

const PORTAL_SETTINGS_CACHE_VERSION = 2;
const PORTAL_SETTINGS_CACHE_KEY = `calidoso:${PORTAL_CONFIG.homeSettingKey}:last-good:v${PORTAL_SETTINGS_CACHE_VERSION}`;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isPlaceholderBanner(settings: PortalSettings) {
  const active = settings.banners.filter((banner) => banner.is_active !== false);
  if (active.length !== 1) return false;
  const banner = active[0];
  return (
    banner.id === "banner-1" &&
    banner.media_url === "/assets/placeholders/banner.svg"
  );
}

export function isFallbackOnlyPortalSettings(settings: PortalSettings) {
  return isPlaceholderBanner(settings);
}

function isUsablePortalSettings(settings: PortalSettings) {
  const active = settings.banners.filter((banner) => banner.is_active !== false);
  if (active.length === 0 || isPlaceholderBanner(settings)) return false;
  return active.every((banner) => typeof banner.media_url === "string" && banner.media_url.trim().length > 0);
}

export function readCachedPortalSettings(): PortalSettings | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PORTAL_SETTINGS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { settings?: unknown };
    if (!parsed || !isPlainObject(parsed.settings)) return null;
    const merged = mergePortalSettings(DEFAULT_SETTINGS, parsed.settings as Partial<PortalSettings>);
    return isUsablePortalSettings(merged) ? merged : null;
  } catch {
    return null;
  }
}

function cachePortalSettings(settings: PortalSettings) {
  if (typeof window === "undefined" || !isUsablePortalSettings(settings)) return;
  try {
    window.localStorage.setItem(
      PORTAL_SETTINGS_CACHE_KEY,
      JSON.stringify({
        savedAt: new Date().toISOString(),
        settings,
      }),
    );
  } catch {
    // The portal must continue even if storage is unavailable.
  }
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

type SupabaseResult<T> = PromiseLike<{ data: T; error: unknown }>;

async function queryWithSessionRecovery<T>(operation: () => SupabaseResult<T>): Promise<T> {
  let result = await operation();
  if (result.error && isSupabaseSessionError(result.error)) {
    await repairSupabaseBrowserSession();
    result = await operation();
  }
  if (result.error) throw result.error;
  return result.data;
}

export async function getSessionAndProfile(): Promise<{ session: Session | null; profile: Profile | null }> {
  const supabase = getSupabaseBrowserClient();
  await repairSupabaseBrowserSession();

  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const session = data.session;
  if (!session?.user) return { session: null, profile: null };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .maybeSingle();

  // A profile read can be blocked by RLS without invalidating authentication.
  // Keep the authenticated session and use metadata as a safe viewer fallback.
  if (profileError) console.warn("No fue posible leer el perfil de Supabase:", profileError.message);

  const fallbackRole = session.user.email?.toLowerCase() === PORTAL_CONFIG.superAdminEmail ? "super_admin" : "viewer";
  return {
    session,
    profile: (profile as Profile | null) || {
      id: session.user.id,
      email: session.user.email || "",
      full_name: String(session.user.user_metadata?.full_name || session.user.email || "Usuario"),
      role: fallbackRole,
      is_active: true,
      process_area: null,
    },
  };
}

export async function signIn(email: string, password: string) {
  return getSupabaseBrowserClient().auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return getSupabaseBrowserClient().auth.signOut({ scope: "local" });
}

export async function loadMyAccess(role: Profile["role"]): Promise<RoleAccessPolicy> {
  if (role === "super_admin") {
    return {
      role,
      can_access_portal: true,
      can_view_home: true,
      can_view_apps: true,
      can_view_documents: true,
      can_view_news: true,
      can_view_audits: true,
      can_view_publications: true,
    };
  }
  const data = await queryWithSessionRecovery(() =>
    getSupabaseBrowserClient()
      .from("role_access_policies")
      .select("role,can_access_portal,can_view_home,can_view_apps,can_view_documents,can_view_news,can_view_audits,can_view_publications,updated_at")
      .eq("role", role)
      .maybeSingle(),
  );
  if (!data) {
    return {
      role,
      can_access_portal: false,
      can_view_home: false,
      can_view_apps: false,
      can_view_documents: false,
      can_view_news: false,
      can_view_audits: false,
      can_view_publications: false,
    };
  }
  return data as RoleAccessPolicy;
}

export async function loadPortalSettings(): Promise<PortalSettings> {
  const supabase = getSupabaseBrowserClient();
  const cached = readCachedPortalSettings();
  let lastError: unknown = null;

  // A deployment can hydrate before the browser/auth state is completely ready.
  // Retry the small settings query instead of accepting the one-banner placeholder.
  const delays = [0, 320, 900];

  for (const delay of delays) {
    if (delay) await sleep(delay);

    let rpcResult = await supabase.rpc("portal_get_home_settings");
    if (rpcResult.error && isSupabaseSessionError(rpcResult.error)) {
      await repairSupabaseBrowserSession();
      rpcResult = await supabase.rpc("portal_get_home_settings");
    }

    if (rpcResult.error) {
      lastError = rpcResult.error;
    } else if (isPlainObject(rpcResult.data) && Object.keys(rpcResult.data).length > 0) {
      const settings = mergePortalSettings(DEFAULT_SETTINGS, rpcResult.data as Partial<PortalSettings>);
      if (isUsablePortalSettings(settings)) {
        cachePortalSettings(settings);
        return settings;
      }
    }

    // Important: an RPC response of {} is NOT accepted as success. Read the
    // historical row directly before falling back to defaults.
    try {
      const data = await queryWithSessionRecovery(() =>
        supabase
          .from("system_settings")
          .select("setting_value")
          .eq("setting_key", PORTAL_CONFIG.homeSettingKey)
          .maybeSingle(),
      );
      if (data?.setting_value && isPlainObject(data.setting_value)) {
        const settings = mergePortalSettings(
          DEFAULT_SETTINGS,
          data.setting_value as Partial<PortalSettings>,
        );
        if (isUsablePortalSettings(settings)) {
          cachePortalSettings(settings);
          return settings;
        }
      }
    } catch (error) {
      lastError = error;
    }
  }

  // Never manufacture a working carousel from the embedded one-banner
  // placeholder. A cached real configuration is safe; otherwise surface the
  // failure so PortalApp can keep the hero unmounted and retry cleanly.
  if (cached) return cached;

  const reason = lastError instanceof Error
    ? lastError
    : new Error("Supabase no devolvió una configuración válida del hero.");
  console.error("No fue posible recuperar la configuración real del hero después de reintentos:", reason);
  throw reason;
}

export async function savePortalSettings(settings: PortalSettings) {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.rpc("portal_save_home_settings", { payload: settings });
  if (error) throw error;
  cachePortalSettings(settings);
}

export async function loadCategories(): Promise<PortalCategory[]> {
  const data = await queryWithSessionRecovery(() =>
    getSupabaseBrowserClient()
      .from("categories")
      .select("id,name,module,is_active")
      .eq("is_active", true)
      .order("module")
      .order("name"),
  );
  return (data || []) as PortalCategory[];
}

export async function loadCollections(): Promise<PortalCollections> {
  const supabase = getSupabaseBrowserClient();
  const tables = Object.keys(EMPTY_COLLECTIONS) as ContentTable[];

  const results = await Promise.all(
    tables.map(async (table) => {
      const data = await queryWithSessionRecovery(() => supabase.from(table).select("*").limit(200));
      if (!Array.isArray(data)) throw new Error(`Supabase devolvió una respuesta inválida para ${table}.`);
      return [table, data] as const;
    }),
  );

  return Object.fromEntries(results) as unknown as PortalCollections;
}

export async function loadCompliments(limit = 80): Promise<Compliment[]> {
  const data = await queryWithSessionRecovery(() =>
    getSupabaseBrowserClient()
      .from("compliments")
      .select("id,team_member_id,team_member_name,rating,message,sender_name,sender_email,created_by,created_at")
      .order("created_at", { ascending: false })
      .limit(limit),
  );
  return (data || []) as Compliment[];
}

export async function submitCompliment(payload: Omit<Compliment, "id" | "created_at">) {
  const { data, error } = await getSupabaseBrowserClient()
    .from("compliments")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as Compliment;
}

export async function upsertContent(table: ContentTable, payload: Partial<ContentRecord>) {
  const supabase = getSupabaseBrowserClient();
  const normalized = {
    ...payload,
    id: payload.id || crypto.randomUUID(),
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase.from(table).upsert(normalized).select().maybeSingle();
  if (error) throw error;
  return data as ContentRecord;
}

export async function removeContent(table: ContentTable, id: string) {
  const { error } = await getSupabaseBrowserClient().from(table).delete().eq("id", id);
  if (error) throw error;
}

export async function uploadPortalAsset(file: File, area: string) {
  const supabase = getSupabaseBrowserClient();
  const safeName = file.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-");
  const path = `${area}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
  const { error } = await supabase.storage.from(PORTAL_CONFIG.assetBucket).upload(path, file, {
    cacheControl: "3600",
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (error) throw error;
  return supabase.storage.from(PORTAL_CONFIG.assetBucket).getPublicUrl(path).data.publicUrl;
}

export async function invokeUserAdmin(
  action: "list" | "create" | "update" | "set_password" | "toggle" | "delete",
  payload: Record<string, unknown> = {},
) {
  const supabase = getSupabaseBrowserClient();
  await repairSupabaseBrowserSession();

  let { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError && isSupabaseSessionError(sessionError)) {
    await repairSupabaseBrowserSession();
    ({ data: sessionData, error: sessionError } = await supabase.auth.getSession());
  }
  if (sessionError) throw sessionError;

  const accessToken = sessionData.session?.access_token;
  if (!accessToken) throw new Error("Debes iniciar sesión nuevamente para administrar usuarios.");

  // Same-origin proxy: the browser talks only to Vercel, so there is no CORS
  // preflight against Supabase. The Vercel route forwards the user's JWT to
  // the existing Edge Function without exposing privileged credentials.
  const response = await fetch("/api/portal-user-admin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ action, ...payload }),
    cache: "no-store",
  });

  const raw = await response.text();
  let data: { users?: ManagedUser[]; user?: ManagedUser; success?: boolean; error?: string } = {};
  if (raw) {
    try {
      data = JSON.parse(raw) as typeof data;
    } catch {
      if (!response.ok) throw new Error(`La administración de usuarios respondió HTTP ${response.status}.`);
    }
  }

  if (!response.ok) throw new Error(data.error || `No fue posible ejecutar la acción (${response.status}).`);
  if (data.error) throw new Error(data.error);
  return data;
}

export async function invokeAccessAdmin(
  action: "get" | "save_role",
  payload: Record<string, unknown> = {},
): Promise<AccessMatrix & { success?: boolean; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  await repairSupabaseBrowserSession();
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) throw new Error("Debes iniciar sesión nuevamente para administrar accesos.");

  const response = await fetch("/api/portal-access-admin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ action, ...payload }),
    cache: "no-store",
  });

  const raw = await response.text();
  let data: Record<string, unknown> = {};
  if (raw) {
    try { data = JSON.parse(raw) as Record<string, unknown>; }
    catch { if (!response.ok) throw new Error(`La matriz de accesos respondió HTTP ${response.status}.`); }
  }
  if (!response.ok) throw new Error(String(data.error || `No fue posible ejecutar la acción (${response.status}).`));
  if (data.error) throw new Error(String(data.error));
  return data as unknown as AccessMatrix & { success?: boolean; error?: string };
}

export function subscribeToAuth(callback: () => void) {
  return getSupabaseBrowserClient().auth.onAuthStateChange(() => callback()).data.subscription;
}
