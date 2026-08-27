"use client";

import { AlertTriangle, CheckCircle2, FileKey2, LockKeyhole, ScanSearch, ServerCog, ShieldCheck } from "lucide-react";

const controls = [
  ["Claves API fuera del código", "ok", "Las claves se leen exclusivamente desde variables de entorno."],
  ["Secretos Git", "ok", "El repositorio incluye scanner y reglas de exclusión para .env y credenciales."],
  ["Publishable key moderna", "manual", "El cliente usa NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY; crea una nueva clave en Supabase y reemplázala en Vercel antes de revocar la anterior."],
  ["RLS y acceso por rol", "ok", "RLS activo y matriz por módulo, registro, categoría y etiqueta."],
  ["Datos sensibles", "ok", "No se almacenan contraseñas ni secretos en tablas públicas; Supabase Auth gestiona hashes bcrypt."],
  ["Operaciones privilegiadas", "ok", "Usuarios y permisos pasan por Route Handler + Edge Function con JWT."],
  ["Restricción de registros", "ok", "La base filtra contenido mediante private.portal_can_read_scoped()."],
  ["Campos administrativos", "ok", "Role/is_active no son editables directamente por usuarios normales."],
  ["Sesión", "ok", "No existen cookies propias inseguras; la sesión Supabase se valida contra Auth antes de cargar el portal."],
  ["Contraseñas", "ok", "Supabase Auth almacena únicamente hashes; administración exige contraseña fuerte."],
  ["5 intentos / 15 minutos", "manual", "La función/hook está preparada en Supabase; debe habilitarse en Authentication > Hooks para que el bloqueo sea global."],
  ["Protección contra bots", "manual", "Activar Turnstile/hCaptcha en Supabase Auth cuando se disponga de las claves del proveedor."],
  ["Monitoreo DB", "ok", "Se incluyen consultas pg_stat_statements, logs y guía de operación."],
  ["Validación de entradas", "ok", "Route Handlers, Edge Functions y formularios aplican límites y validaciones."],
  ["XSS / contenido", "ok", "No se usa dangerouslySetInnerHTML/eval y se añaden cabeceras CSP."],
  ["Subida de archivos", "ok", "MIME, firma, extensión y tamaño se validan antes de Storage."],
  ["Respuesta API", "ok", "Bodies, acciones, tiempos de espera y cache no-store están limitados."],
  ["Cabeceras", "ok", "CSP, HSTS, nosniff, frame-ancestors, referrer y permissions policy."],
  ["HTTPS", "ok", "Vercel fuerza HTTPS y se publica HSTS."],
  ["Dependencias", "ok", "GitHub Actions, Dependabot, npm audit y scanner de secretos incluidos."],
] as const;

export function SecurityCenter() {
  const complete = controls.filter(([, status]) => status === "ok").length;
  return (
    <div className="security-center">
      <header className="security-center__hero">
        <div><span className="eyebrow"><ShieldCheck size={16} /> Seguridad y operación</span><h2>Controles de producción.</h2><p>Vista ejecutiva de las capas aplicadas al repositorio y de las dos configuraciones externas que dependen de credenciales del proveedor.</p></div>
        <aside><strong>{complete}/{controls.length}</strong><span>controles automatizados o implementados</span></aside>
      </header>
      <div className="security-center__architecture">
        <article><LockKeyhole size={20} /><span><strong>Identidad</strong><small>Supabase Auth + rol activo</small></span></article>
        <article><ServerCog size={20} /><span><strong>Servidor</strong><small>Vercel Route Handlers + Edge Functions</small></span></article>
        <article><FileKey2 size={20} /><span><strong>Datos</strong><small>RLS + scopes + permisos de columnas</small></span></article>
        <article><ScanSearch size={20} /><span><strong>Supply chain</strong><small>CI, audit, Dependabot y scanner</small></span></article>
      </div>
      <div className="security-control-grid">
        {controls.map(([title, status, description], index) => (
          <article key={title} className={status === "ok" ? "is-ok" : "is-manual"}>
            <span className="security-control-grid__number">{String(index + 1).padStart(2, "0")}</span>
            {status === "ok" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <div><strong>{title}</strong><p>{description}</p></div>
            <small>{status === "ok" ? "Implementado" : "Configuración externa"}</small>
          </article>
        ))}
      </div>
    </div>
  );
}
