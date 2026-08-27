"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ImagePlus, LoaderCircle, Palette, Plus, Save, Trash2, Upload } from "lucide-react";
import { Media } from "@/components/shared/Media";
import { savePortalSettings, uploadPortalAsset } from "@/lib/supabase/repository";
import { validatePortalFile } from "@/lib/utils/assets";
import type { BannerItem, MascotItem, PortalSettings, TeamMember } from "@/types/portal";

type IdentityTab = "banners" | "team" | "mascot" | "modules" | "visual";
type EditableItem = BannerItem | TeamMember | MascotItem;

interface IdentityManagerProps {
  settings: PortalSettings;
  onChange: (settings: PortalSettings) => void;
}

export function IdentityManager({ settings, onChange }: IdentityManagerProps) {
  const [draft, setDraft] = useState<PortalSettings>(structuredClone(settings));
  const [tab, setTab] = useState<IdentityTab>("banners");
  const [selectedId, setSelectedId] = useState<string>(settings.banners[0]?.id || "");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const previewUrl = useMemo(() => file ? URL.createObjectURL(file) : "", [file]);

  const rows = tab === "banners" ? draft.banners : tab === "team" ? draft.team : tab === "mascot" ? draft.mascot : [];
  const selected = rows.find((item) => item.id === selectedId) as EditableItem | undefined;
  const selectedBanner = tab === "banners" ? selected as BannerItem | undefined : undefined;
  const selectedTeam = tab === "team" ? selected as TeamMember | undefined : undefined;
  const selectedMascot = tab === "mascot" ? selected as MascotItem | undefined : undefined;

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function changeTab(next: IdentityTab) {
    setTab(next);
    const nextRows = next === "banners" ? draft.banners : next === "team" ? draft.team : next === "mascot" ? draft.mascot : [];
    setSelectedId(nextRows[0]?.id || "");
    setFile(null);
  }

  function patchItem(patch: Record<string, unknown>) {
    if (!selectedId || !["banners", "team", "mascot"].includes(tab)) return;
    const key = tab as "banners" | "team" | "mascot";
    setDraft({ ...draft, [key]: (draft[key] as EditableItem[]).map((item) => item.id === selectedId ? { ...item, ...patch } : item) });
  }

  function addItem() {
    const id = crypto.randomUUID();
    if (tab === "banners") {
      setDraft({ ...draft, banners: [...draft.banners, { id, title: "Nuevo banner", subtitle: "", description: "", button_text: "Abrir", link_url: "apps", media_url: "/assets/placeholders/banner.svg", animation: "fade", media_fit: "contain", media_position: "center", is_active: true, sort_order: draft.banners.length + 1 }] });
    } else if (tab === "team") {
      setDraft({ ...draft, team: [...draft.team, { id, name: "Nuevo integrante", role: "Calidad y mejoramiento continuo", bio: "", photo_url: "/assets/placeholders/team.svg", is_active: true, sort_order: draft.team.length + 1 }] });
    } else if (tab === "mascot") {
      setDraft({ ...draft, mascot: [...draft.mascot, { id, name: "Nueva pieza", description: "", media_url: "/assets/placeholders/mascot.svg", is_active: true, sort_order: draft.mascot.length + 1 }] });
    }
    setSelectedId(id);
  }

  function removeItem() {
    if (!selectedId || !window.confirm("¿Eliminar este elemento de la portada?")) return;
    const key = tab as "banners" | "team" | "mascot";
    const nextRows = (draft[key] as EditableItem[]).filter((item) => item.id !== selectedId);
    setDraft({ ...draft, [key]: nextRows });
    setSelectedId(nextRows[0]?.id || "");
  }

  async function save(event?: FormEvent) {
    event?.preventDefault();
    setBusy(true); setMessage(""); setError("");
    try {
      let next = draft;
      if (file && selectedId && ["banners", "team", "mascot"].includes(tab)) {
        await validatePortalFile(file, tab === "banners" ? "banner" : "identity");
        const url = await uploadPortalAsset(file, `identity-${tab}`);
        const key = tab as "banners" | "team" | "mascot";
        const mediaKey = tab === "banners" ? "media_url" : tab === "team" ? "photo_url" : "media_url";
        next = { ...draft, [key]: (draft[key] as EditableItem[]).map((item) => item.id === selectedId ? { ...item, [mediaKey]: url } : item) };
        setDraft(next);
      }
      await savePortalSettings(next);
      onChange(next);
      setFile(null);
      setMessage("La identidad del portal quedó guardada para todos los usuarios.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No fue posible guardar la configuración.");
    } finally { setBusy(false); }
  }

  return (
    <div className="identity-manager">
      <aside className="admin-subnav">
        <span>Identidad y portada</span>
        {[
          ["banners", "Banners"],
          ["team", "Equipo"],
          ["mascot", "Mascota"],
          ["modules", "Paneles de módulos"],
          ["visual", "Accesibilidad visual"],
        ].map(([key, label]) => <button key={key} type="button" className={tab === key ? "is-active" : ""} onClick={() => changeTab(key as IdentityTab)}><span>{label}</span></button>)}
      </aside>

      <div className="admin-main-column">
        {["banners", "team", "mascot"].includes(tab) && (
          <div className="identity-editor-grid">
            <section className="admin-list-card identity-list">
              <div className="admin-list-card__head"><div><span className="eyebrow">Elementos</span><h2>{tab === "banners" ? "Banners" : tab === "team" ? "Equipo" : "Mascota"}</h2></div><button type="button" className="icon-button" onClick={addItem} aria-label="Agregar"><Plus size={18} /></button></div>
              {rows.map((item) => (
                <button key={item.id} type="button" className={selectedId === item.id ? "is-selected" : ""} onClick={() => setSelectedId(item.id)}>
                  <span className="admin-record-list__monogram">{String("title" in item ? item.title : item.name).slice(0, 2).toUpperCase()}</span>
                  <span><strong>{"title" in item ? item.title : item.name}</strong><small>{"role" in item ? item.role : item.description || "Sin descripción"}</small></span>
                </button>
              ))}
            </section>

            {selected ? (
              <form className="admin-form-card" onSubmit={save}>
                <div className="admin-form-card__head"><div><span className="eyebrow">Edición de portada</span><h2>Editar elemento</h2></div><ImagePlus size={24} /></div>
                <div className={`identity-media-preview ${tab === "banners" ? "identity-media-preview--banner" : ""}`}>
                  <Media src={previewUrl || selectedTeam?.photo_url || selectedBanner?.media_url || selectedMascot?.media_url || ""} alt="Vista previa del asset" fit="contain" eager />
                  <span>{tab === "banners" ? "Vista completa 4:1 · mínimo 1200 × 300 px · máximo 15 MB" : "La vista previa conserva la proporción original"}</span>
                </div>
                <div className="form-grid">
                  <label className="span-2"><span>{tab === "team" ? "Nombre" : "Título"}</span><input value={selectedBanner?.title || selectedTeam?.name || selectedMascot?.name || ""} onChange={(event) => patchItem(tab === "team" || tab === "mascot" ? { name: event.target.value } : { title: event.target.value })} /></label>
                  {tab === "banners" && selectedBanner && <label className="span-2"><span>Subtítulo</span><input value={selectedBanner.subtitle || ""} onChange={(event) => patchItem({ subtitle: event.target.value })} /></label>}
                  {tab === "team" && selectedTeam && <label className="span-2"><span>Cargo o rol</span><input value={selectedTeam.role || ""} onChange={(event) => patchItem({ role: event.target.value })} /></label>}
                  <label className="span-2"><span>{tab === "team" ? "Biografía" : "Descripción"}</span><textarea rows={5} value={selectedTeam?.bio || selectedBanner?.description || selectedMascot?.description || ""} onChange={(event) => patchItem(tab === "team" ? { bio: event.target.value } : { description: event.target.value })} /></label>
                  {tab === "banners" && selectedBanner && <><label><span>Texto del botón</span><input value={selectedBanner.button_text || ""} onChange={(event) => patchItem({ button_text: event.target.value })} /></label><label><span>Destino</span><input value={selectedBanner.link_url || ""} onChange={(event) => patchItem({ link_url: event.target.value })} /></label></>}
                  {tab === "banners" && selectedBanner && <><label><span>Transición del hero</span><input value="Papel arrugado y descarte" readOnly aria-label="Transición global del hero" /></label><label><span>Orden</span><input type="number" min="1" value={selectedBanner.sort_order || 1} onChange={(event) => patchItem({ sort_order: Number(event.target.value) })} /></label><label className="span-2 toggle-row"><span><strong>Banner activo</strong><small>Se mostrará en la libreta pública.</small></span><input type="checkbox" checked={selectedBanner.is_active !== false} onChange={(event) => patchItem({ is_active: event.target.checked })} /></label></>}
                  <label className="span-2 upload-field"><Upload size={18} /><span>{file ? file.name : "Reemplazar imagen, GIF o video"}</span><input type="file" accept="image/*,video/mp4,video/webm" onChange={(event) => setFile(event.target.files?.[0] || null)} /></label>
                </div>
                <div className="form-actions"><button type="submit" className="primary-button" disabled={busy}>{busy ? <LoaderCircle className="spin" size={18} /> : <Save size={18} />} Guardar para todos</button><button type="button" className="secondary-button danger-text" onClick={removeItem}><Trash2 size={17} /> Eliminar</button></div>
              </form>
            ) : <div className="admin-empty admin-empty--panel">Agrega un elemento para comenzar.</div>}
          </div>
        )}

        {tab === "modules" && (
          <form className="admin-form-card" onSubmit={save}>
            <div className="admin-form-card__head"><div><span className="eyebrow">Experiencias por sección</span><h2>Paneles de módulos</h2></div><ImagePlus size={25} /></div>
            <div className="module-settings-grid">
              {Object.entries(draft.modulePanels).map(([key, panel]) => (
                <article key={key}>
                  <span>{key}</span>
                  <div className="module-settings-preview"><Media src={panel.mediaUrl} alt={`Vista de ${key}`} fit={panel.mediaFit || "contain"} /></div>
                  <label><small>Título</small><input value={panel.title} onChange={(event) => setDraft({ ...draft, modulePanels: { ...draft.modulePanels, [key]: { ...panel, title: event.target.value } } })} /></label>
                  <label><small>Descripción</small><textarea rows={3} value={panel.description} onChange={(event) => setDraft({ ...draft, modulePanels: { ...draft.modulePanels, [key]: { ...panel, description: event.target.value } } })} /></label>
                  <label><small>URL del visual</small><input value={panel.mediaUrl} onChange={(event) => setDraft({ ...draft, modulePanels: { ...draft.modulePanels, [key]: { ...panel, mediaUrl: event.target.value } } })} /></label>
                  <label><small>Ajuste</small><select value={panel.mediaFit || "contain"} onChange={(event) => setDraft({ ...draft, modulePanels: { ...draft.modulePanels, [key]: { ...panel, mediaFit: event.target.value as "contain" | "cover" } } })}><option value="contain">Mostrar completa</option><option value="cover">Cubrir marco</option></select></label>
                  <label><small>Proporción</small><select value={panel.mediaAspect || "3:4"} onChange={(event) => setDraft({ ...draft, modulePanels: { ...draft.modulePanels, [key]: { ...panel, mediaAspect: event.target.value as "3:4" | "16:9" | "4:3" | "3:2" | "1:1" } } })}><option value="3:4">3:4 vertical</option><option value="16:9">16:9 horizontal</option><option value="4:3">4:3</option><option value="3:2">3:2</option><option value="1:1">1:1 cuadrado</option></select></label>
                </article>
              ))}
            </div>
            <button type="submit" className="primary-button" disabled={busy}><Save size={18} /> Guardar paneles</button>
          </form>
        )}

        {tab === "visual" && (
          <form className="admin-form-card visual-settings" onSubmit={save}>
            <div className="admin-form-card__head"><div><span className="eyebrow">Preferencias globales</span><h2>Accesibilidad visual</h2></div><Palette size={25} /></div>
            <label className="toggle-row"><span><strong>Movimiento reducido</strong><small>Minimiza transiciones y animaciones para personas sensibles al movimiento.</small></span><input type="checkbox" checked={draft.visual.reducedMotion} onChange={(event) => setDraft({ ...draft, visual: { ...draft.visual, reducedMotion: event.target.checked } })} /></label>
            <label className="range-row"><span><strong>Opacidad del fondo</strong><small>Intensidad de los fondos decorativos administrables.</small></span><input type="range" min="0" max="40" value={draft.visual.backgroundOpacity} onChange={(event) => setDraft({ ...draft, visual: { ...draft.visual, backgroundOpacity: Number(event.target.value) } })} /><output>{draft.visual.backgroundOpacity}%</output></label>
            <label><span>URL de fondo personalizado</span><input value={draft.visual.backgroundUrl} onChange={(event) => setDraft({ ...draft, visual: { ...draft.visual, backgroundUrl: event.target.value } })} placeholder="https://..." /></label>
            <button type="submit" className="primary-button" disabled={busy}><Save size={18} /> Guardar preferencias</button>
          </form>
        )}

        {message && <div className="form-success">{message}</div>}
        {error && <div className="form-error">{error}</div>}
      </div>
    </div>
  );
}
