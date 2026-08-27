"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { KeyRound, LoaderCircle, Pencil, Power, Search, ShieldAlert, Trash2, UserPlus2 } from "lucide-react";
import { invokeUserAdmin } from "@/lib/supabase/repository";
import type { ManagedUser, PortalRole } from "@/types/portal";

const roles: Array<{ value: PortalRole; label: string }> = [
  { value: "admin", label: "Administrador" },
  { value: "editor", label: "Editor" },
  { value: "calidad", label: "Calidad" },
  { value: "auditoria", label: "Auditoría" },
  { value: "viewer", label: "Consulta" },
  { value: "super_admin", label: "Superadministrador" },
];

const roleRank: Partial<Record<PortalRole, number>> = {
  viewer: 10,
  auditoria: 30,
  calidad: 40,
  editor: 50,
  admin: 80,
  super_admin: 100,
};

const emptyUser = {
  email: "",
  password: "",
  full_name: "",
  role: "viewer" as PortalRole,
  process_area: "Calidad y Mejoramiento Continuo",
};

interface UserManagerProps {
  currentUserId: string;
  currentUserRole: PortalRole;
}

function rank(role: PortalRole) {
  return roleRank[role] ?? 10;
}

export function UserManager({ currentUserId, currentUserRole }: UserManagerProps) {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [selected, setSelected] = useState<ManagedUser | null>(null);
  const [createForm, setCreateForm] = useState(emptyUser);
  const [editForm, setEditForm] = useState({ full_name: "", role: "viewer" as PortalRole, process_area: "", password: "" });
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const isSuperAdmin = currentUserRole === "super_admin";
  const assignableRoles = useMemo(
    () => roles.filter((role) => role.value !== "super_admin" && (isSuperAdmin || rank(role.value) < rank(currentUserRole))),
    [currentUserRole, isSuperAdmin],
  );

  async function load() {
    setLoading(true);
    setError("");
    try {
      const result = await invokeUserAdmin("list");
      setUsers(result.users || []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No fue posible cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    const needle = query.toLocaleLowerCase("es").trim();
    if (!needle) return users;
    return users.filter((user) => `${user.full_name} ${user.email} ${user.role} ${user.process_area}`.toLocaleLowerCase("es").includes(needle));
  }, [query, users]);

  const selectedIsSelf = selected?.id === currentUserId;
  const selectedIsLower = selected ? rank(selected.role) < rank(currentUserRole) : false;
  const canManageSelected = Boolean(selected && !selectedIsSelf && selectedIsLower);
  const canEditSelected = Boolean(selected && (selectedIsSelf || selectedIsLower));
  const editRoleOptions = selected && !canManageSelected
    ? roles.filter((role) => role.value === selected.role)
    : assignableRoles;

  function choose(user: ManagedUser) {
    setSelected(user);
    setEditForm({ full_name: user.full_name, role: user.role, process_area: user.process_area, password: "" });
    setMessage("");
    setError("");
  }

  async function create(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await invokeUserAdmin("create", createForm);
      setCreateForm(emptyUser);
      await load();
      setMessage("Usuario creado y confirmado correctamente.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No fue posible crear el usuario.");
    } finally {
      setBusy(false);
    }
  }

  async function saveUser() {
    if (!selected || !canEditSelected) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const payload = selectedIsSelf
        ? { user_id: selected.id, full_name: editForm.full_name, process_area: editForm.process_area }
        : { user_id: selected.id, full_name: editForm.full_name, role: editForm.role, process_area: editForm.process_area };
      await invokeUserAdmin("update", payload);
      await load();
      setMessage(selectedIsSelf ? "Perfil actualizado." : "Perfil y permisos actualizados.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No fue posible actualizar el usuario.");
    } finally { setBusy(false); }
  }

  async function setPassword() {
    if (!selected || !canEditSelected || editForm.password.length < 8) {
      setError("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setBusy(true); setError(""); setMessage("");
    try {
      await invokeUserAdmin("set_password", { user_id: selected.id, password: editForm.password });
      setEditForm({ ...editForm, password: "" });
      setMessage("Contraseña actualizada correctamente.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No fue posible cambiar la contraseña.");
    } finally { setBusy(false); }
  }

  async function toggleUser() {
    if (!selected || !canManageSelected) return;
    setBusy(true); setError(""); setMessage("");
    try {
      await invokeUserAdmin("toggle", { user_id: selected.id, is_active: !selected.is_active });
      await load();
      setSelected({ ...selected, is_active: !selected.is_active });
      setMessage(selected.is_active ? "Usuario desactivado." : "Usuario reactivado.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No fue posible cambiar el estado.");
    } finally { setBusy(false); }
  }

  async function deleteUser() {
    if (!selected || !canManageSelected || !window.confirm(`¿Eliminar definitivamente a ${selected.full_name || selected.email}?`)) return;
    setBusy(true); setError(""); setMessage("");
    try {
      await invokeUserAdmin("delete", { user_id: selected.id });
      setSelected(null);
      await load();
      setMessage("Usuario eliminado definitivamente.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No fue posible eliminar el usuario.");
    } finally { setBusy(false); }
  }

  return (
    <div className="users-workspace">
      <form className="admin-form-card user-create-card" onSubmit={create}>
        <div className="admin-form-card__head"><div><span className="eyebrow">Alta segura</span><h2>Crear usuario</h2></div><UserPlus2 size={26} /></div>
        <div className="form-grid">
          <label className="span-2"><span>Nombre completo</span><input value={createForm.full_name} onChange={(event) => setCreateForm({ ...createForm, full_name: event.target.value })} required /></label>
          <label className="span-2"><span>Correo</span><input type="email" value={createForm.email} onChange={(event) => setCreateForm({ ...createForm, email: event.target.value })} required /></label>
          <label><span>Contraseña inicial</span><input type="password" minLength={8} value={createForm.password} onChange={(event) => setCreateForm({ ...createForm, password: event.target.value })} required /></label>
          <label><span>Rol</span><select value={createForm.role} onChange={(event) => setCreateForm({ ...createForm, role: event.target.value as PortalRole })}>{assignableRoles.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}</select></label>
          <label className="span-2"><span>Área o proceso</span><input value={createForm.process_area} onChange={(event) => setCreateForm({ ...createForm, process_area: event.target.value })} /></label>
        </div>
        <button type="submit" className="primary-button primary-button--full" disabled={busy}>{busy ? <LoaderCircle className="spin" size={18} /> : <UserPlus2 size={18} />} Crear usuario</button>
      </form>

      <section className="admin-list-card users-list-card">
        <div className="admin-list-card__head">
          <div><span className="eyebrow">Directorio de acceso</span><h2>Usuarios</h2></div>
          <label className="compact-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar usuario..." /></label>
        </div>
        {loading ? <div className="admin-empty"><LoaderCircle className="spin" size={22} /> Cargando usuarios...</div> : (
          <div className="user-table">
            {filtered.map((user) => {
              const manageable = user.id === currentUserId || rank(user.role) < rank(currentUserRole);
              return (
                <button key={user.id} type="button" className={selected?.id === user.id ? "is-selected" : ""} onClick={() => choose(user)}>
                  <span className="user-avatar">{(user.full_name || user.email).slice(0, 2).toUpperCase()}</span>
                  <span><strong>{user.full_name || "Sin nombre"}</strong><small>{user.email}</small></span>
                  <em>{user.role.replaceAll("_", " ")}</em>
                  <i className={user.is_active ? "is-online" : ""}>{user.is_active ? "Activo" : "Inactivo"}</i>
                  {manageable ? <Pencil size={16} /> : <ShieldAlert size={16} aria-label="Nivel protegido" />}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {selected && (
        <aside className="user-editor">
          <div className="user-editor__head"><div className="user-avatar user-avatar--large">{(selected.full_name || selected.email).slice(0, 2).toUpperCase()}</div><div><strong>{selected.full_name}</strong><span>{selected.email}</span></div></div>
          {!canEditSelected && <small className="user-editor__note">Esta cuenta tiene un nivel igual o superior al tuyo y está protegida contra cambios.</small>}
          <label><span>Nombre completo</span><input value={editForm.full_name} onChange={(event) => setEditForm({ ...editForm, full_name: event.target.value })} disabled={!canEditSelected} /></label>
          <label><span>Rol</span><select value={editForm.role} onChange={(event) => setEditForm({ ...editForm, role: event.target.value as PortalRole })} disabled={!canManageSelected}>{editRoleOptions.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}</select></label>
          <label><span>Área o proceso</span><input value={editForm.process_area} onChange={(event) => setEditForm({ ...editForm, process_area: event.target.value })} disabled={!canEditSelected} /></label>
          <button type="button" className="primary-button primary-button--full" onClick={saveUser} disabled={busy || !canEditSelected}>Guardar perfil y rol</button>
          <hr />
          <label><span>Nueva contraseña</span><input type="password" minLength={8} value={editForm.password} onChange={(event) => setEditForm({ ...editForm, password: event.target.value })} placeholder="Mínimo 8 caracteres" disabled={!canEditSelected} /></label>
          <button type="button" className="secondary-button user-editor__action" onClick={setPassword} disabled={busy || !canEditSelected}><KeyRound size={17} /> Cambiar contraseña</button>
          <button type="button" className="secondary-button user-editor__action" onClick={toggleUser} disabled={busy || !canManageSelected}><Power size={17} /> {selected.is_active ? "Desactivar acceso" : "Reactivar acceso"}</button>
          <button type="button" className="secondary-button user-editor__action user-editor__action--danger" onClick={deleteUser} disabled={busy || !canManageSelected}><Trash2 size={17} /> Eliminar usuario</button>
          {selectedIsSelf && <small className="user-editor__note">Tu propia cuenta puede actualizar su información y contraseña, pero está protegida contra cambios de rol, desactivación y eliminación.</small>}
        </aside>
      )}

      {(message || error) && <div className={`admin-toast ${error ? "admin-toast--error" : ""}`}>{error || message}</div>}
    </div>
  );
}
