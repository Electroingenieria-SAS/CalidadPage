"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { PORTAL_CONFIG } from "@/lib/config/portal";

let browserClient: SupabaseClient | null = null;
let sessionRepairPromise: Promise<"valid" | "anonymous"> | null = null;

export function getSupabaseBrowserClient() {
  if (!PORTAL_CONFIG.supabaseUrl || !PORTAL_CONFIG.supabasePublishableKey) {
    throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Configura las variables del entorno antes de iniciar el portal.");
  }
  if (!browserClient) {
    browserClient = createClient(
      PORTAL_CONFIG.supabaseUrl,
      PORTAL_CONFIG.supabasePublishableKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      },
    );
  }
  return browserClient;
}

function errorMessage(error: unknown) {
  if (!error || typeof error !== "object") return String(error || "");
  const value = error as { message?: unknown; code?: unknown; name?: unknown; status?: unknown };
  return [value.name, value.code, value.status, value.message]
    .filter((part) => part != null)
    .join(" ")
    .toLowerCase();
}

/**
 * Only identifies errors that clearly describe a broken/expired Supabase auth
 * session. Permission/RLS errors are deliberately NOT treated as session
 * corruption, because signing the user out would hide a real authorization
 * problem.
 */
export function isSupabaseSessionError(error: unknown) {
  const message = errorMessage(error);
  return (
    message.includes("refresh_token") ||
    message.includes("refresh token") ||
    message.includes("invalid jwt") ||
    message.includes("jwt expired") ||
    message.includes("token has expired") ||
    message.includes("invalid token") ||
    message.includes("bad_jwt") ||
    message.includes("session_not_found") ||
    message.includes("auth session missing") ||
    message.includes("user from sub claim in jwt does not exist") ||
    message.includes("pgrst301")
  );
}

function removeCurrentProjectAuthStorage() {
  if (typeof window === "undefined") return;
  try {
    const projectRef = new URL(PORTAL_CONFIG.supabaseUrl).hostname.split(".")[0];
    if (!projectRef) return;
    const prefix = `sb-${projectRef}-auth-token`;
    const keys: string[] = [];
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (key && (key === prefix || key.startsWith(`${prefix}-`))) keys.push(key);
    }
    keys.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // Storage can be unavailable in strict/private browser contexts. Supabase's
    // own local sign-out remains the primary cleanup path in that case.
  }
}

async function clearOnlyLocalSupabaseSession() {
  const supabase = getSupabaseBrowserClient();
  // scope=local removes this browser's Supabase auth state without touching
  // leaderboard/campaign data or signing out other devices.
  await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
  // If GoTrue could not complete cleanup because the token itself is corrupt,
  // remove ONLY this Supabase project's auth keys. Never clear the whole site.
  removeCurrentProjectAuthStorage();
}

/**
 * Repairs a persisted Supabase session without clearing the site's Storage.
 * A healthy session is kept. An expired session gets one refresh attempt. Only
 * if the refresh token is truly invalid do we clear Supabase's local auth data
 * and continue as an anonymous visitor.
 */
export async function repairSupabaseBrowserSession(): Promise<"valid" | "anonymous"> {
  if (sessionRepairPromise) return sessionRepairPromise;

  sessionRepairPromise = (async () => {
    const supabase = getSupabaseBrowserClient();

    let sessionResult;
    try {
      sessionResult = await supabase.auth.getSession();
    } catch (error) {
      if (!isSupabaseSessionError(error)) throw error;
      await clearOnlyLocalSupabaseSession();
      return "anonymous" as const;
    }

    if (sessionResult.error) {
      if (!isSupabaseSessionError(sessionResult.error)) throw sessionResult.error;
      await clearOnlyLocalSupabaseSession();
      return "anonymous" as const;
    }

    if (!sessionResult.data.session) return "anonymous" as const;

    const userResult = await supabase.auth.getUser();
    if (!userResult.error && userResult.data.user) return "valid" as const;
    if (userResult.error && !isSupabaseSessionError(userResult.error)) throw userResult.error;

    const refreshResult = await supabase.auth.refreshSession();
    if (!refreshResult.error && refreshResult.data.session) return "valid" as const;
    if (refreshResult.error && !isSupabaseSessionError(refreshResult.error)) throw refreshResult.error;

    await clearOnlyLocalSupabaseSession();
    return "anonymous" as const;
  })().finally(() => {
    sessionRepairPromise = null;
  });

  return sessionRepairPromise;
}
