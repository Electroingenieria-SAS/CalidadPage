import { NextRequest, NextResponse } from "next/server";
import { PORTAL_CONFIG } from "@/lib/config/portal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_ACTIONS = new Set([
  "unlock",
  "set_document",
  "clear_document",
  "status",
  "save_target",
  "get_target",
  "delete_target",
]);
const MAX_BODY_BYTES = 24 * 1024;
const FUNCTION_NAME = "portal-identity-access";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function POST(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return jsonError("Sesión de usuario requerida.", 401);
  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > MAX_BODY_BYTES) return jsonError("Solicitud demasiado grande.", 413);

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return jsonError("Solicitud JSON inválida.", 400);
  }

  const action = typeof body.action === "string" ? body.action : "";
  if (!ALLOWED_ACTIONS.has(action)) return jsonError("Acción no permitida.", 400);
  if (!PORTAL_CONFIG.supabaseUrl || !PORTAL_CONFIG.supabasePublishableKey) return jsonError("Supabase no está configurado.", 500);

  const upstreamUrl = `${PORTAL_CONFIG.supabaseUrl.replace(/\/$/, "")}/functions/v1/${FUNCTION_NAME}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);

  try {
    const upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authorization,
        apikey: PORTAL_CONFIG.supabasePublishableKey,
      },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: controller.signal,
    });
    const responseText = await upstream.text();
    return new NextResponse(responseText || JSON.stringify({ success: upstream.ok }), {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "application/json; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("portal-identity-access proxy failed:", error instanceof Error ? error.name : "UnknownError");
    return jsonError("No fue posible conectar con la validación de identidad.", 502);
  } finally {
    clearTimeout(timeout);
  }
}
