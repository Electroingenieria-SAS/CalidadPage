"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { FilePlus2, LoaderCircle, LockKeyhole, Pencil, Search, ShieldCheck, Trash2, Upload } from "lucide-react";
import { Media } from "@/components/shared/Media";
import { CONTENT_LABELS } from "@/lib/config/portal";
import { recordDescription, recordLink, recordTitle } from "@/lib/utils/format";
import { removeContent, upsertContent, uploadPortalAsset } from "@/lib/supabase/repository";
import { invokeIdentityAccess, loadPortalCategories, protectedContentPayload } from "@/lib/supabase/identity";
import { validatePortalFile } from "@/lib/utils/assets";
import type { ContentRecord, ContentTable, PortalCategory, PortalCollections } from "@/types/portal";

const TABLES = Object.keys(CONTENT_LABELS) as ContentTable[];

interface ContentManagerProps {
  collections: PortalCollections;
  onRefresh: () => Promise<void>;
}

const emptyRecord: Partial<ContentRecord> = {
  title: "",
  description: "",
  status: "publicado",
  external_url: "",
  image_url: "",
  creator_name: "Juan Esteban Pérez",
  creator_role: "Analista de Calidad",
  tags: [],
  category_id: null,
};

function baseTag(table: ContentTable) {
  return ({
    app_modules: "app",
    documents: "documento",
    news_posts: "noticia",
    audit_reports: "auditoria",
    publications: "publicacion",
  } as const)[table];
}

function freshRecord(table: ContentTable): Partial<ContentRecord> {
  return { ...emptyRecord, status: table === "app_modules" ? "activa" : "publicado", tags: [baseTag(table)] };
}

function normalizeTags(value: string) {
  return [...new Set(value.split(",").map((tag) => tag.trim().toLocaleLowerCase("es").replace(/\s+/g, " ")).filter(Boolean))].slice(0, 30);
}

export function ContentManager({ collections, onRefresh }: ContentManagerProps) {
  const [table, setTable] = useState<ContentTable>("app_modules");
  const [record, setRecord] = useState<Partial<ContentRecord>>(freshRecord("app_modules"));
  const [categories, setCategories] = useState<PortalCategory[]>([]);
  const [query, setQuery] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const previewUrl = useMemo(() => file ? URL.createObjectURL(file) : "", [file]);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === record.category_id) || null,
    [categories, record.category_id],
  );
  const requiresIdentityUnlock = selectedCategory?.slug === "solo-con-cedula";

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  useEffect(() => {
    loadPortalCategories().then(setCategories).catch((caught) => console.error("No fue posible cargar categorías:", caught));
  }, []);

  const rows = useMemo(() => {
    const needle = query.toLocaleLowerCase("es").trim();
    if (!needle) return collections[table];
    return collections[table].filter((item) => `${recordTitle(item)} ${recordDescription(item)} ${(item.tags || []).join(" ")}`.toLocaleLowerCase("es").includes(needle));
  }, [collections, query, table]);

  function switchTable(next: ContentTable) {
    setTable(next);
    setRecord(freshRecord(next));
    setFile(null);
    setMessage("");
    setError("");
  }

  async function edit(item: ContentRecord) {
    setRecord({
      ...item,
      title: recordTitle(item),
      description: recordDescription(item),
      external_url: item.requires_identity_unlock ? "" : recordLink(item),
    });
    setFile(null);
    setMessage("");
    setError("");
    document.getElementById("content-form")?.scrollIntoView({ behavior: "smooth", block: "start" });

    if (item.requires_identity_unlock) {
      setBusy(true);
      try {
        const result = await invokeIdentityAccess("get_target", { content_type: table, record_id: item.id });
        setRecord((current) => current.id === item.id ? { ...current, external_url: result.target_url || "" } : current);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "No fue posible recuperar el enlace protegido.");
      } finally {
        setBusy(false);
      }
    }
  }

  function clear() {
    setRecord(freshRecord(table));
    setFile(null);
  }

  function changeCategory(categoryId: string) {
    const category = categories.find((item) => item.id === categoryId);
    const currentTags = Array.isArray(record.tags) ? record.tags.map(String) : [];
    const withoutIdentityTag = currentTags.filter((tag) => tag !== "solo-con-cedula");
    const tags = category?.slug === "solo-con-cedula"
      ? [...new Set([...withoutIdentityTag, "solo-con-cedula"])]
      : withoutIdentityTag;
    setRecord({ ...record, category_id: categoryId || null, tags });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");
    try {
      let imageUrl = String(record.image_url || "");
      if (file) {
        await validatePortalFile(file, "content");
        imageUrl = await uploadPortalAsset(file, table);
      }

      const category = categories.find((item) => item.id === record.category_id) || null;
      const identityLocked = category?.slug === "solo-con-cedula";
      const rawLink = String(record.external_url || "").trim();
      if (identityLocked && !rawLink) throw new Error("El contenido Solo con cédula necesita un enlace para proteger.");

      const normalized = Array.isArray(record.tags)
        ? record.tags.map(String).map((tag) => tag.trim().toLocaleLowerCase("es")).filter(Boolean)
        : [];
      const tags = [...new Set([baseTag(table), ...normalized, ...(category?.slug ? [category.slug] : [])])].slice(0, 30);
      if (!tags.length) throw new Error("Agrega al menos una etiqueta para enlazar y controlar este contenido.");

      const publicLink = identityLocked ? "#" : rawLink || "#";
      const base = {
        id: record.id,
        title: record.title,
        name: record.title,
        description: record.description,
        status: table === "app_modules" ? record.status || "activa" : record.status || "publicado",
        visibility: record.visibility || "interna",
        is_active: record.is_active ?? true,
        is_featured: record.is_featured ?? true,
        image_url: imageUrl || undefined,
        tags,
        category_id: record.category_id || null,
        requires_identity_unlock: identityLocked,
      };

      const payload = table === "app_modules"
        ? {
            ...base,
            url: publicLink,
            external_url: publicLink,
            creator_name: record.creator_name || "Juan Esteban Pérez",
            creator_role: record.creator_role || "Analista de Calidad",
            creator_credit: `Creado por ${record.creator_name || "Juan Esteban Pérez"} · ${record.creator_role || "Analista de Calidad"}`,
          }
        : table === "publications"
          ? { ...base, content: record.description, file_url: publicLink, external_url: publicLink, publication_type: "novedad" }
          : { ...base, file_url: publicLink, external_url: publicLink };

      const saved = await upsertContent(table, payload);
      if (!saved?.id) throw new Error("El registro se guardó sin un identificador válido.");

      if (identityLocked) {
        await invokeIdentityAccess("save_target", protectedContentPayload(table, saved.id, rawLink));
      } else {
        await invokeIdentityAccess("delete_target", { content_type: table, record_id: saved.id });
      }

      await onRefresh();
      setMessage(record.id ? "Registro actualizado correctamente." : identityLocked ? "Contenido publicado y protegido con cédula." : "Nuevo registro publicado correctamente.");
      clear();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No fue posible guardar el registro.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(item: ContentRecord) {
    if (!window.confirm(`¿Eliminar “${recordTitle(item)}”? Esta acción no se puede deshacer.`)) return;
    setBusy(true);
    setError("");
    try {
      if (item.requires_identity_unlock) {
        await invokeIdentityAccess("delete_target", { content_type: table, record_id: item.id });
      }
      await removeContent(table, item.id);
      await onRefresh();
      if (record.id === item.id) clear();
      setMessage("Registro eliminado correctamente.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No fue posible eliminar el registro.");
    } finally {
      setBusy(false);
    }
  }

  const labels = CONTENT_LABELS[table];

  return (
    <div className="admin-workspace">
      <aside className="admin-subnav">
        <span>Tipo de contenido</span>
        {TABLES.map((item) => (
          <button key={item} type="button" className={table === item ? "is-active" : ""} onClick={() => switchTable(item)}>
            <span>{CONTENT_LABELS[item].plural}</span>
            <strong>{collections[item].length}</strong>
          </button>
        ))}
      </aside>

      <div className="admin-main-column">
        <form id="content-form" className="admin-form-card" onSubmit={submit}>
          <div className="admin-form-card__head">
            <div>
              <span className="eyebrow">{record.id ? "Edición" : "Nuevo registro"}</span>
              <h2>{record.id ? `Editar ${labels.singular}` : `Crear ${labels.singular}`}</h2>
            </div>
            {record.id && <button type="button" className="secondary-button" onClick={clear}>Crear otro</button>}
          </div>
          <div className="form-grid">
            {(previewUrl || record.image_url) ? <div className="content-media-preview span-2"><Media src={previewUrl || String(record.image_url)} alt="Vista previa del contenido" fit="contain" eager /><span>Se publicará sin recortes ni deformación.</span></div> : null}
            <label className="span-2"><span>Título o nombre</span><input value={String(record.title || "")} onChange={(event) => setRecord({ ...record, title: event.target.value })} required /></label>
            <label><span>Estado</span><input value={String(record.status || "")} onChange={(event) => setRecord({ ...record, status: event.target.value })} /></label>
            <label><span>Visibilidad</span><select value={String(record.visibility || "interna")} onChange={(event) => setRecord({ ...record, visibility: event.target.value })}><option value="interna">Interna</option><option value="publica">Pública</option><option value="restringida">Restringida</option></select></label>
            <label className="span-2"><span>Categoría</span><select value={String(record.category_id || "")} onChange={(event) => changeCategory(event.target.value)}><option value="">Sin categoría</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
            {requiresIdentityUnlock ? (
              <div className="identity-admin-notice span-2">
                <span><LockKeyhole size={19} /></span>
                <div><strong>Candado por cédula activado</strong><p>El enlace real quedará fuera de las tablas públicas. Para abrirlo, el usuario deberá escribir la cédula configurada en su cuenta.</p></div>
                <ShieldCheck size={18} />
              </div>
            ) : null}
            <label className="span-2"><span>Etiquetas de acceso y búsqueda</span><input value={(Array.isArray(record.tags) ? record.tags : []).join(", ")} onChange={(event) => setRecord({ ...record, tags: normalizeTags(event.target.value) })} placeholder="logistica, compras, indicadores..." required /><small>Separa con comas. La categoría elegida también se agrega automáticamente como etiqueta.</small></label>
            <label className="span-2"><span>Descripción</span><textarea rows={5} value={String(record.description || "")} onChange={(event) => setRecord({ ...record, description: event.target.value })} /></label>
            <label className="span-2"><span>{requiresIdentityUnlock ? "Enlace que quedará protegido" : "Enlace directo"}</span><input type="url" placeholder="https://..." value={String(record.external_url || "")} onChange={(event) => setRecord({ ...record, external_url: event.target.value })} required={requiresIdentityUnlock} /><small>{requiresIdentityUnlock ? "Este enlace no se enviará al navegador hasta validar la cédula." : "Puedes dejarlo vacío si el recurso aún no tiene destino."}</small></label>
            {table === "app_modules" && (
              <>
                <label><span>Creador</span><input value={String(record.creator_name || "")} onChange={(event) => setRecord({ ...record, creator_name: event.target.value })} /></label>
                <label><span>Cargo del creador</span><input value={String(record.creator_role || "")} onChange={(event) => setRecord({ ...record, creator_role: event.target.value })} /></label>
              </>
            )}
            <label className="span-2 upload-field">
              <Upload size={18} />
              <span>{file ? file.name : "Subir imagen, GIF o video"}</span>
              <input type="file" accept="image/*,video/mp4,video/webm" onChange={(event) => setFile(event.target.files?.[0] || null)} />
            </label>
          </div>
          {message && <div className="form-success">{message}</div>}
          {error && <div className="form-error">{error}</div>}
          <div className="form-actions">
            <button type="submit" className="primary-button" disabled={busy}>{busy ? <LoaderCircle className="spin" size={18} /> : requiresIdentityUnlock ? <LockKeyhole size={18} /> : <FilePlus2 size={18} />}{busy ? "Guardando..." : record.id ? "Guardar cambios" : requiresIdentityUnlock ? "Publicar con candado" : "Publicar"}</button>
            <button type="button" className="secondary-button" onClick={clear}>Limpiar</button>
          </div>
        </form>

        <section className="admin-list-card">
          <div className="admin-list-card__head">
            <div><span className="eyebrow">Biblioteca</span><h2>{labels.plural}</h2></div>
            <label className="compact-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar..." /></label>
          </div>
          <div className="admin-record-list">
            {rows.length ? rows.map((item) => (
              <article key={item.id}>
                <div className="admin-record-list__monogram">{item.requires_identity_unlock ? <LockKeyhole size={18} /> : recordTitle(item).slice(0, 2).toUpperCase()}</div>
                <div><strong>{recordTitle(item)}</strong><p>{recordDescription(item)}</p></div>
                <span className="admin-status">{item.requires_identity_unlock ? "Con cédula" : String(item.status || "vigente")}</span>
                <div className="admin-record-list__actions">
                  <button type="button" className="icon-button" onClick={() => void edit(item)} aria-label="Editar"><Pencil size={17} /></button>
                  <button type="button" className="icon-button danger-button" onClick={() => void remove(item)} aria-label="Eliminar"><Trash2 size={17} /></button>
                </div>
              </article>
            )) : <div className="admin-empty">No hay registros para mostrar.</div>}
          </div>
        </section>
      </div>
    </div>
  );
}
