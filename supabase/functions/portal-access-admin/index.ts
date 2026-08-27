import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.105.0";

type Role = "super_admin" | "admin" | "calidad" | "auditoria" | "consulta" | "solicitante" | "analista" | "jefe_auditoria" | "jefe_general" | "editor" | "viewer";
type ContentType = "app_modules" | "documents" | "news_posts" | "audit_reports" | "publications";

const VALID_ROLES = new Set<Role>(["super_admin","admin","calidad","auditoria","consulta","solicitante","analista","jefe_auditoria","jefe_general","editor","viewer"]);
const CONTENT_TYPES = new Set<ContentType>(["app_modules","documents","news_posts","audit_reports","publications"]);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Faltan secretos de Supabase.");

const service = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }

function allowedOrigins() {
  return (Deno.env.get("PORTAL_ALLOWED_ORIGINS") ?? "https://calidadei-gamma.vercel.app")
    .split(",").map((v) => v.trim()).filter(Boolean);
}
function originAllowed(req: Request) { const origin = req.headers.get("origin"); return !origin || allowedOrigins().includes(origin); }
function headers(req: Request) {
  const origin = req.headers.get("origin");
  return {
    ...(origin && originAllowed(req) ? { "Access-Control-Allow-Origin": origin } : {}),
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "no-store",
    "Vary": "Origin",
  };
}
function json(req: Request, data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...headers(req), "Content-Type": "application/json; charset=utf-8" } });
}
function clean(value: unknown, max = 120) { return typeof value === "string" ? value.trim().slice(0, max) : ""; }
function bool(value: unknown, fallback = false) { return typeof value === "boolean" ? value : fallback; }
function uuidArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  const out = value.filter((v): v is string => typeof v === "string" && UUID_RE.test(v)).slice(0, 250);
  return [...new Set(out)];
}
function tagArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  const out = value
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim().toLocaleLowerCase("es").replace(/\s+/g, " ").slice(0, 60))
    .filter((v) => v.length >= 1)
    .slice(0, 100);
  return [...new Set(out)];
}

async function requireSuperAdmin(req: Request) {
  const authorization = req.headers.get("authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) throw new HttpError(401, "Sesión requerida.");
  const token = authorization.slice(7).trim();
  const { data, error } = await service.auth.getUser(token);
  if (error || !data.user) throw new HttpError(401, "Sesión inválida o expirada.");
  const { data: profile, error: profileError } = await service
    .from("profiles").select("id,role,is_active").eq("id", data.user.id).maybeSingle();
  if (profileError) throw new HttpError(500, "No fue posible validar el perfil.");
  if (!profile || profile.is_active !== true || profile.role !== "super_admin") throw new HttpError(403, "Solo el super admin puede cambiar la matriz de accesos.");
  return data.user.id;
}

async function getMatrix() {
  const [policies, scopes, categories, apps, docs, news, audits, publications] = await Promise.all([
    service.from("role_access_policies").select("*").order("role"),
    service.from("role_content_scopes").select("*").order("role").order("content_type"),
    service.from("categories").select("id,name,module,is_active").eq("is_active", true).order("module").order("name"),
    service.from("app_modules").select("id,title,name,category_id,tags,is_active,status").order("sort_order"),
    service.from("documents").select("id,title,name,category_id,tags,status").order("created_at", { ascending: false }),
    service.from("news_posts").select("id,title,name,category_id,tags,status").order("created_at", { ascending: false }),
    service.from("audit_reports").select("id,title,name,tags,status").order("created_at", { ascending: false }),
    service.from("publications").select("id,title,name,tags,status").order("created_at", { ascending: false }),
  ]);
  const errors = [policies.error, scopes.error, categories.error, apps.error, docs.error, news.error, audits.error, publications.error].filter(Boolean);
  if (errors.length) throw new HttpError(500, "No fue posible cargar la matriz completa de accesos.");
  return {
    policies: policies.data ?? [], scopes: scopes.data ?? [], categories: categories.data ?? [],
    content: { app_modules: apps.data ?? [], documents: docs.data ?? [], news_posts: news.data ?? [], audit_reports: audits.data ?? [], publications: publications.data ?? [] },
  };
}

async function saveRole(body: Record<string, unknown>, userId: string) {
  const role = clean(body.role, 40) as Role;
  if (!VALID_ROLES.has(role)) throw new HttpError(400, "Rol no válido.");
  if (role === "super_admin") throw new HttpError(400, "El acceso del super admin es permanente y no se puede limitar.");
  const policy = body.policy && typeof body.policy === "object" ? body.policy as Record<string, unknown> : {};
  const scopes = Array.isArray(body.scopes) ? body.scopes : [];
  const now = new Date().toISOString();

  const { error: policyError } = await service.from("role_access_policies").upsert({
    role,
    can_access_portal: bool(policy.can_access_portal, true),
    can_view_home: bool(policy.can_view_home, true),
    can_view_apps: bool(policy.can_view_apps, false),
    can_view_documents: bool(policy.can_view_documents, false),
    can_view_news: bool(policy.can_view_news, false),
    can_view_audits: bool(policy.can_view_audits, false),
    can_view_publications: bool(policy.can_view_publications, false),
    updated_by: userId,
    updated_at: now,
  }, { onConflict: "role" });
  if (policyError) throw new HttpError(500, `No fue posible guardar el acceso del rol: ${policyError.message}`);

  for (const raw of scopes) {
    if (!raw || typeof raw !== "object") continue;
    const scope = raw as Record<string, unknown>;
    const contentType = clean(scope.content_type, 40) as ContentType;
    if (!CONTENT_TYPES.has(contentType)) continue;
    const { error } = await service.from("role_content_scopes").upsert({
      role,
      content_type: contentType,
      allow_all: bool(scope.allow_all, true),
      allowed_record_ids: uuidArray(scope.allowed_record_ids),
      allowed_category_ids: uuidArray(scope.allowed_category_ids),
      allowed_tags: tagArray(scope.allowed_tags),
      updated_by: userId,
      updated_at: now,
    }, { onConflict: "role,content_type" });
    if (error) throw new HttpError(500, `No fue posible guardar el alcance de ${contentType}: ${error.message}`);
  }
  return { success: true };
}

Deno.serve(async (req) => {
  if (!originAllowed(req)) return json(req, { error: "Origen no permitido." }, 403);
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: headers(req) });
  if (req.method !== "POST") return json(req, { error: "Método no permitido." }, 405);
  const length = Number(req.headers.get("content-length") || 0);
  if (length > 128 * 1024) return json(req, { error: "Solicitud demasiado grande." }, 413);
  try {
    const callerId = await requireSuperAdmin(req);
    let body: Record<string, unknown>;
    try { body = await req.json() as Record<string, unknown>; } catch { throw new HttpError(400, "JSON inválido."); }
    const action = clean(body.action, 30);
    if (action === "get") return json(req, await getMatrix());
    if (action === "save_role") return json(req, await saveRole(body, callerId));
    throw new HttpError(400, "Acción no reconocida.");
  } catch (error) {
    if (error instanceof HttpError) return json(req, { error: error.message }, error.status);
    console.error("portal-access-admin", error instanceof Error ? error.name : "UnknownError");
    return json(req, { error: "Error interno en la matriz de accesos." }, 500);
  }
});
