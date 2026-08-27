"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, KeyRound, LoaderCircle, RefreshCw, Save, ShieldCheck, Tags } from "lucide-react";
import { invokeAccessAdmin } from "@/lib/supabase/repository";
import type { AccessMatrix, ContentTable, PortalRole, RoleAccessPolicy, RoleContentScope } from "@/types/portal";

const ROLES: PortalRole[] = [
  "super_admin", "admin", "editor", "calidad", "auditoria", "analista",
  "jefe_auditoria", "jefe_general", "consulta", "solicitante", "viewer",
];

const CONTENT_META: Array<{ table: ContentTable; label: string; moduleKey: keyof RoleAccessPolicy }> = [
  { table: "app_modules", label: "Apps", moduleKey: "can_view_apps" },
  { table: "documents", label: "Documentos", moduleKey: "can_view_documents" },
  { table: "news_posts", label: "Noticias", moduleKey: "can_view_news" },
  { table: "audit_reports", label: "Auditorías", moduleKey: "can_view_audits" },
  { table: "publications", label: "Publicaciones", moduleKey: "can_view_publications" },
];

function labelRole(role: PortalRole) {
  return role.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function emptyPolicy(role: PortalRole): RoleAccessPolicy {
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

function emptyScope(role: PortalRole, contentType: ContentTable): RoleContentScope {
  return { role, content_type: contentType, allow_all: true, allowed_record_ids: [], allowed_category_ids: [], allowed_tags: [] };
}

function policyForRole(matrix: AccessMatrix, role: PortalRole): RoleAccessPolicy {
  return matrix.policies.find((item) => item.role === role) || emptyPolicy(role);
}

function scopesForRole(matrix: AccessMatrix, role: PortalRole): RoleContentScope[] {
  return CONTENT_META.map(({ table }) =>
    matrix.scopes.find((item) => item.role === role && item.content_type === table) || emptyScope(role, table),
  );
}

export function AccessControlManager() {
  const [matrix, setMatrix] = useState<AccessMatrix | null>(null);
  const [selectedRole, setSelectedRole] = useState<PortalRole>("admin");
  const [policy, setPolicy] = useState<RoleAccessPolicy>(emptyPolicy("admin"));
  const [scopes, setScopes] = useState<RoleContentScope[]>([]);
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setBusy(true);
    setError("");
    try {
      const data = await invokeAccessAdmin("get");
      setMatrix(data);
      setPolicy(policyForRole(data, selectedRole));
      setScopes(scopesForRole(data, selectedRole));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No fue posible cargar la matriz de permisos.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadInitialMatrix() {
      try {
        const data = await invokeAccessAdmin("get");
        if (cancelled) return;
        setMatrix(data);
        setPolicy(policyForRole(data, "admin"));
        setScopes(scopesForRole(data, "admin"));
      } catch (caught) {
        if (!cancelled) setError(caught instanceof Error ? caught.message : "No fue posible cargar la matriz de permisos.");
      } finally {
        if (!cancelled) setBusy(false);
      }
    }

    void loadInitialMatrix();
    return () => { cancelled = true; };
  }, []);

  function changeRole(role: PortalRole) {
    setSelectedRole(role);
    if (matrix) {
      setPolicy(policyForRole(matrix, role));
      setScopes(scopesForRole(matrix, role));
    } else {
      setPolicy(emptyPolicy(role));
      setScopes(CONTENT_META.map(({ table }) => emptyScope(role, table)));
    }
    setMessage("");
    setError("");
  }

  const allTags = useMemo(() => {
    if (!matrix) return [];
    const tags = Object.values(matrix.content).flatMap((rows) => rows.flatMap((row) => row.tags || []));
    return [...new Set(tags.map((tag) => tag.trim().toLocaleLowerCase("es")).filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));
  }, [matrix]);

  function updatePolicy(key: keyof RoleAccessPolicy, value: boolean) {
    setPolicy((current) => ({ ...current, [key]: value }));
  }

  function updateScope(contentType: ContentTable, patch: Partial<RoleContentScope>) {
    setScopes((current) => current.map((scope) => scope.content_type === contentType ? { ...scope, ...patch } : scope));
  }

  function toggleList(contentType: ContentTable, field: "allowed_record_ids" | "allowed_category_ids" | "allowed_tags", value: string) {
    const scope = scopes.find((item) => item.content_type === contentType) || emptyScope(selectedRole, contentType);
    const list = scope[field];
    const next = list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
    updateScope(contentType, { [field]: next });
  }

  async function save() {
    if (selectedRole === "super_admin") return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await invokeAccessAdmin("save_role", { role: selectedRole, policy, scopes });
      setMessage(`Permisos de ${labelRole(selectedRole)} guardados. Los cambios se aplican por RLS en la próxima consulta.`);
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No fue posible guardar los permisos.");
    } finally {
      setSaving(false);
    }
  }

  if (busy && !matrix) return <div className="admin-panel-loading"><LoaderCircle className="spin" size={24} /><strong>Cargando matriz de accesos...</strong></div>;

  return (
    <div className="access-manager">
      <header className="access-manager__head">
        <div>
          <span className="eyebrow"><ShieldCheck size={16} /> Control de acceso exacto</span>
          <h2>Qué puede ver cada rol.</h2>
          <p>Define módulos completos y, cuando necesites precisión, limita por recurso, categoría o etiqueta. El control se aplica también en Supabase RLS.</p>
        </div>
        <button type="button" className="secondary-button" onClick={() => void load()} disabled={busy}><RefreshCw size={16} /> Actualizar</button>
      </header>

      <div className="access-manager__rolebar">
        <label><span>Rol a configurar</span><select value={selectedRole} onChange={(event) => changeRole(event.target.value as PortalRole)}>{ROLES.map((role) => <option key={role} value={role}>{labelRole(role)}</option>)}</select></label>
        {selectedRole === "super_admin" ? <div className="access-manager__locked"><KeyRound size={18} /><span><strong>Acceso total permanente</strong><small>El super admin no puede bloquearse a sí mismo.</small></span></div> : null}
      </div>

      <section className="access-manager__modules">
        <div className="access-manager__section-title"><span>1</span><div><strong>Acceso general</strong><small>Controla si el rol entra al portal y qué módulos aparecen.</small></div></div>
        <div className="access-toggle-grid">
          {[
            ["can_access_portal", "Entrar al portal"], ["can_view_home", "Inicio"], ["can_view_apps", "Apps"],
            ["can_view_documents", "Documentos"], ["can_view_news", "Noticias"], ["can_view_audits", "Auditorías"], ["can_view_publications", "Publicaciones"],
          ].map(([key, label]) => {
            const typedKey = key as keyof RoleAccessPolicy;
            const checked = Boolean(policy[typedKey]);
            return <button key={key} type="button" disabled={selectedRole === "super_admin"} className={checked ? "is-on" : ""} onClick={() => updatePolicy(typedKey, !checked)}><span className="access-toggle-grid__check">{checked ? <Check size={15} /> : null}</span><strong>{label}</strong><small>{checked ? "Permitido" : "Bloqueado"}</small></button>;
          })}
        </div>
      </section>

      <section className="access-manager__scopes">
        <div className="access-manager__section-title"><span>2</span><div><strong>Alcance de contenido</strong><small>Si desactivas “ver todo”, autoriza elementos por nombre, categoría o etiqueta.</small></div></div>
        {CONTENT_META.map(({ table, label, moduleKey }) => {
          const scope = scopes.find((item) => item.content_type === table) || emptyScope(selectedRole, table);
          const records = matrix?.content[table] || [];
          const categories = (matrix?.categories || []).filter((category) => records.some((record) => record.category_id === category.id));
          const enabled = Boolean(policy[moduleKey]);
          return (
            <article key={table} className={`access-scope ${enabled ? "" : "is-disabled"}`}>
              <header>
                <div><strong>{label}</strong><small>{records.length} recursos registrados</small></div>
                <label className="access-switch"><input type="checkbox" checked={scope.allow_all} disabled={!enabled || selectedRole === "super_admin"} onChange={(event) => updateScope(table, { allow_all: event.target.checked })} /><span /> Ver todo el módulo</label>
              </header>
              {!scope.allow_all && enabled ? (
                <div className="access-scope__filters">
                  <div><span>Recursos concretos</span><div className="access-choice-list">{records.length ? records.map((record) => <label key={record.id}><input type="checkbox" checked={scope.allowed_record_ids.includes(record.id)} onChange={() => toggleList(table, "allowed_record_ids", record.id)} /><span>{record.title || record.name || record.id}<small>{(record.tags || []).join(" · ") || "sin etiqueta"}</small></span></label>) : <small>No hay recursos en este módulo.</small>}</div></div>
                  {categories.length ? <div><span>Categorías</span><div className="access-chip-list">{categories.map((category) => <button key={category.id} type="button" className={scope.allowed_category_ids.includes(category.id) ? "is-selected" : ""} onClick={() => toggleList(table, "allowed_category_ids", category.id)}>{category.name}</button>)}</div></div> : null}
                  <div><span><Tags size={14} /> Etiquetas enlazadas</span><div className="access-chip-list">{allTags.length ? allTags.map((tag) => <button key={tag} type="button" className={scope.allowed_tags.includes(tag) ? "is-selected" : ""} onClick={() => toggleList(table, "allowed_tags", tag)}>#{tag}</button>) : <small>Aún no hay etiquetas disponibles.</small>}</div></div>
                </div>
              ) : null}
            </article>
          );
        })}
      </section>

      {message ? <div className="form-success">{message}</div> : null}
      {error ? <div className="form-error">{error}</div> : null}
      <div className="access-manager__actions">
        <button type="button" className="primary-button" disabled={saving || selectedRole === "super_admin"} onClick={() => void save()}>{saving ? <LoaderCircle className="spin" size={18} /> : <Save size={18} />}{saving ? "Guardando..." : "Guardar permisos del rol"}</button>
      </div>
    </div>
  );
}
