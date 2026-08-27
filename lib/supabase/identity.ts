"use client";

import { getSupabaseBrowserClient, repairSupabaseBrowserSession } from "@/lib/supabase/client";
import type { ContentTable, PortalCategory } from "@/types/portal";

export type IdentityAccessAction =
  | "unlock"
  | "set_document"
  | "clear_document"
  | "status"
  | "save_target"
  | "get_target"
  | "delete_target";

export interface IdentityAccessResponse {
  success?: boolean;
  configured?: boolean;
  target_url?: string;
  error?: string;
  code?: string;
}

export async function loadPortalCategories(): Promise<PortalCategory[]> {
  const { data, error } = await getSupabaseBrowserClient()
    .from("categories")
    .select("id,name,slug,module,is_active")
    .eq("is_active", true)
    .order("name");
  if (error) throw error;
  return (data || []) as PortalCategory[];
}

export async function invokeIdentityAccess(
  action: IdentityAccessAction,
  payload: Record<string, unknown> = {},
): Promise<IdentityAccessResponse> {
  const supabase = getSupabaseBrowserClient();
  await repairSupabaseBrowserSession();
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const accessToken = data.session?.access_token;
  if (!accessToken) throw new Error("Debes iniciar sesión nuevamente.");

  const response = await fetch("/api/portal-identity-access", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ action, ...payload }),
    cache: "no-store",
  });

  const raw = await response.text();
  let result: IdentityAccessResponse = {};
  if (raw) {
    try {
      result = JSON.parse(raw) as IdentityAccessResponse;
    } catch {
      if (!response.ok) throw new Error(`La validación de identidad respondió HTTP ${response.status}.`);
    }
  }

  if (!response.ok) {
    const error = new Error(result.error || `No fue posible validar el acceso (${response.status}).`) as Error & { code?: string };
    error.code = result.code;
    throw error;
  }
  if (result.error) throw new Error(result.error);
  return result;
}

export function isIdentityLocked(record: { requires_identity_unlock?: boolean | null }) {
  return record.requires_identity_unlock === true;
}

export function protectedContentPayload(contentType: ContentTable, recordId: string, targetUrl: string) {
  return { content_type: contentType, record_id: recordId, target_url: targetUrl };
}
