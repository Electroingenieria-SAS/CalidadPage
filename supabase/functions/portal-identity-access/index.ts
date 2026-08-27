import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type User } from "npm:@supabase/supabase-js@2.105.0";

type ContentType = "app_modules" | "documents" | "news_posts" | "audit_reports" | "publications";
type PortalRole = "super_admin" | "admin" | "editor" | "calidad" | "auditoria" | "consulta" | "solicitante" | "analista" | "jefe_auditoria" | "jefe_general" | "viewer";
type ProfileRow = { id: string; role: PortalRole | string | null; is_active: boolean | null };

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
if (!SUPABASE_URL || !SERVICE_KEY || !ANON_KEY) throw new Error("Faltan secretos requeridos de Supabase.");

const service = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const encoder = new TextEncoder();
const CONTENT_TYPES = new Set<ContentType>(["app_modules", "documents", "news_posts", "audit_reports", "publications"]);
const CONTENT_MANAGERS = new Set<PortalRole>(["super_admin", "admin", "editor"]);
const IDENTITY_ADMINS = new Set<PortalRole>(["super_admin", "admin"]);
const ROLE_RANK: Record<PortalRole, number> = {
  viewer: 10, consulta: 10, solicitante: 10, analista: 20, auditoria: 30, calidad: 40,
  editor: 50, jefe_auditoria: 60, jefe_general: 70, admin: 80, super_admin: 100,
};
const MAX_BODY_BYTES = 24 * 1024;
const MAX_FAILURES = 5;
const FAILURE_WINDOW_MINUTES = 15;

class HttpError extends Error {
  status: number;
  code?: string;
  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function clean(value: unknown, max = 2048) {
  return typeof value === "string" ? value.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, max) : "";
}
function normalizeRole(value: unknown): PortalRole {
  const role = clean(value, 40) as PortalRole;
  return role in ROLE_RANK ? role : "viewer";
}
function normalizeContentType(value: unknown): ContentType {
  const type = clean(value, 40) as ContentType;
  if (!CONTENT_TYPES.has(type)) throw new HttpError(400, "Tipo de contenido no válido.");
  return type;
}
function normalizeDocument(value: unknown) {
  const digits = clean(value, 32).replace(/\D/g, "");
  if (digits.length < 5 || digits.length > 15) throw new HttpError(400, "Ingresa una cédula válida.");
  return digits;
}
function normalizeUuid(value: unknown) {
  const id = clean(value, 64);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) throw new HttpError(400, "Identificador no válido.");
  return id;
}
function normalizeUrl(value: unknown) {
  const raw = clean(value, 2048);
  let parsed: URL;
  try { parsed = new URL(raw); } catch { throw new HttpError(400, "El enlace protegido no es válido."); }
  if (!["https:", "http:"].includes(parsed.protocol)) throw new HttpError(400, "El enlace protegido debe usar HTTP o HTTPS.");
  return parsed.toString();
}
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
      "Pragma": "no-cache",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
    },
  });
}

async function documentHmac(userId: string, document: string) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(SERVICE_KEY), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(`calidoso-cedula:v1:${userId}:${document}`));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function getProfile(userId: string): Promise<ProfileRow> {
  const { data, error } = await service.from("profiles").select("id,role,is_active").eq("id", userId).maybeSingle();
  if (error || !data) throw new HttpError(403, "No existe un perfil activo para esta cuenta.");
  return data as ProfileRow;
}

async function requireCaller(req: Request) {
  const authorization = req.headers.get("authorization") ?? "";
  if (!authorization.startsWith("Bearer ") || authorization.length > 8192) throw new HttpError(401, "Sesión requerida.");
  const token = authorization.slice(7).trim();
  const { data, error } = await service.auth.getUser(token);
  if (error || !data.user) throw new HttpError(401, "La sesión no es válida o expiró.");
  const profile = await getProfile(data.user.id);
  if (profile.is_active === false) throw new HttpError(403, "La cuenta está inactiva.");
  return { user: data.user, profile, role: normalizeRole(profile.role), token };
}

function ensureCanManageIdentity(caller: { user: User; role: PortalRole }, targetId: string, targetRole: PortalRole) {
  if (!IDENTITY_ADMINS.has(caller.role)) throw new HttpError(403, "No tienes permisos para configurar cédulas.");
  if (caller.user.id === targetId) {
    if (caller.role === "super_admin") return;
    throw new HttpError(403, "Un administrador no puede configurar su propia cédula.");
  }
  if ((ROLE_RANK[targetRole] ?? 0) >= (ROLE_RANK[caller.role] ?? 0)) throw new HttpError(403, "Solo puedes configurar usuarios de nivel inferior.");
}

async function rpcVoid(name: string, params: Record<string, unknown>) {
  const { error } = await service.rpc(name, params);
  if (error) throw new HttpError(500, "No fue posible completar la operación privada.");
}

async function recentFailureCount(userId: string) {
  const since = new Date(Date.now() - FAILURE_WINDOW_MINUTES * 60_000).toISOString();
  const { data, error } = await service.rpc("portal_identity_failure_count", { p_user_id: userId, p_since: since });
  if (error) throw new HttpError(500, "No fue posible validar el control de intentos.");
  return Number(data ?? 0);
}

async function verifyDocumentForUser(userId: string, rawDocument: unknown) {
  if (await recentFailureCount(userId) >= MAX_FAILURES) throw new HttpError(429, "Demasiados intentos. Intenta nuevamente en 15 minutos.", "identity_rate_limited");
  const document = normalizeDocument(rawDocument);
  const { data, error } = await service.rpc("portal_identity_secret_get", { p_user_id: userId });
  if (error) throw new HttpError(500, "No fue posible validar la identidad.");
  const stored = typeof data === "string" ? data : "";
  if (!stored) throw new HttpError(409, "Tu cuenta todavía no tiene una cédula configurada por un administrador.", "document_not_configured");
  const computed = await documentHmac(userId, document);
  if (!safeEqual(computed, stored)) {
    await rpcVoid("portal_identity_failure_add", { p_user_id: userId });
    throw new HttpError(403, "La cédula ingresada no coincide con la registrada.", "document_mismatch");
  }
  await rpcVoid("portal_identity_failure_clear", { p_user_id: userId });
}

async function ensureReadableProtectedTarget(caller: { token: string }, contentType: ContentType, recordId: string) {
  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${caller.token}` } },
  });
  const { data, error } = await userClient.from(contentType).select("id,requires_identity_unlock,category_id").eq("id", recordId).maybeSingle();
  if (error || !data) throw new HttpError(404, "El recurso no existe o tu rol no puede verlo.");
  if (data.requires_identity_unlock !== true) throw new HttpError(400, "Este recurso no requiere desbloqueo por cédula.");
  return data;
}

async function protectedTarget(contentType: ContentType, recordId: string) {
  const { data, error } = await service.rpc("portal_protected_target_get", { p_content_type: contentType, p_record_id: recordId });
  if (error) throw new HttpError(500, "No fue posible consultar el enlace protegido.");
  return typeof data === "string" ? data : "";
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json({ error: "Método no permitido." }, 405);
  try {
    const declared = Number(req.headers.get("content-length") ?? 0);
    if (declared > MAX_BODY_BYTES) throw new HttpError(413, "Solicitud demasiado grande.");
    const callerData = await requireCaller(req);
    const caller = { user: callerData.user, role: callerData.role };
    const raw = await req.text();
    if (encoder.encode(raw).byteLength > MAX_BODY_BYTES) throw new HttpError(413, "Solicitud demasiado grande.");
    let body: Record<string, unknown>;
    try { body = JSON.parse(raw) as Record<string, unknown>; } catch { throw new HttpError(400, "El cuerpo debe ser JSON válido."); }
    const action = clean(body.action, 40);

    if (action === "unlock") {
      const contentType = normalizeContentType(body.content_type);
      const recordId = normalizeUuid(body.record_id);
      await ensureReadableProtectedTarget({ token: callerData.token }, contentType, recordId);
      await verifyDocumentForUser(callerData.user.id, body.document_number);
      const target = await protectedTarget(contentType, recordId);
      if (!target) throw new HttpError(404, "El recurso protegido todavía no tiene un enlace configurado.");
      return json({ success: true, target_url: target });
    }

    if (action === "set_document" || action === "clear_document" || action === "status") {
      const targetId = normalizeUuid(body.user_id);
      const targetProfile = await getProfile(targetId);
      const targetRole = normalizeRole(targetProfile.role);
      ensureCanManageIdentity(caller, targetId, targetRole);

      if (action === "status") {
        const { data, error } = await service.rpc("portal_identity_secret_get", { p_user_id: targetId });
        if (error) throw new HttpError(500, "No fue posible consultar el estado de la cédula.");
        return json({ configured: typeof data === "string" && data.length > 0 });
      }

      if (action === "clear_document") {
        await rpcVoid("portal_identity_secret_delete", { p_user_id: targetId });
        await rpcVoid("portal_identity_failure_clear", { p_user_id: targetId });
        return json({ success: true, configured: false });
      }

      const document = normalizeDocument(body.document_number);
      const documentHmacValue = await documentHmac(targetId, document);
      await rpcVoid("portal_identity_secret_set", { p_user_id: targetId, p_hmac: documentHmacValue, p_updated_by: callerData.user.id });
      await rpcVoid("portal_identity_failure_clear", { p_user_id: targetId });
      return json({ success: true, configured: true });
    }

    if (["save_target", "get_target", "delete_target"].includes(action)) {
      if (!CONTENT_MANAGERS.has(callerData.role)) throw new HttpError(403, "No tienes permisos para administrar enlaces protegidos.");
      const contentType = normalizeContentType(body.content_type);
      const recordId = normalizeUuid(body.record_id);

      if (action === "delete_target") {
        await rpcVoid("portal_protected_target_delete", { p_content_type: contentType, p_record_id: recordId });
        return json({ success: true });
      }

      if (action === "get_target") return json({ target_url: await protectedTarget(contentType, recordId) });

      const targetUrl = normalizeUrl(body.target_url);
      const { data: record, error: recordError } = await service.from(contentType).select("id,requires_identity_unlock").eq("id", recordId).maybeSingle();
      if (recordError || !record) throw new HttpError(404, "El recurso no existe.");
      if (record.requires_identity_unlock !== true) throw new HttpError(400, "Selecciona la categoría Solo con cédula antes de proteger el enlace.");
      await rpcVoid("portal_protected_target_set", { p_content_type: contentType, p_record_id: recordId, p_target_url: targetUrl, p_updated_by: callerData.user.id });
      return json({ success: true });
    }

    throw new HttpError(400, "Acción no reconocida.");
  } catch (error) {
    if (error instanceof HttpError) return json({ error: error.message, code: error.code }, error.status);
    console.error("portal_identity_access_unexpected", error instanceof Error ? error.name : "UnknownError");
    return json({ error: "Error interno al validar el acceso protegido." }, 500);
  }
});
