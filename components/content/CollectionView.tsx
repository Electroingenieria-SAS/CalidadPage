"use client";

import {
  ArrowLeft,
  ArrowUpRight,
  Boxes,
  ChevronLeft,
  ChevronRight,
  FileCheck2,
  FileText,
  Layers3,
  LockKeyhole,
  Megaphone,
  Newspaper,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Media } from "@/components/shared/Media";
import { IdentityUnlockDialog } from "@/components/content/IdentityUnlockDialog";
import { CONTENT_LABELS } from "@/lib/config/portal";
import { formatDate, recordDescription, recordLink, recordTitle } from "@/lib/utils/format";
import type { ContentRecord, ContentTable, ModulePanel } from "@/types/portal";

interface CollectionViewProps {
  table: ContentTable;
  records: ContentRecord[];
  panel: ModulePanel;
  canManage: boolean;
  onBack: () => void;
  onManage: () => void;
}

const TABLE_META = {
  app_modules: {
    className: "apps",
    kicker: "Herramientas digitales",
    repositoryLabel: "Catálogo de aplicaciones",
    actionLabel: "Abrir App",
    emptyLabel: "App",
    icon: Boxes,
  },
  documents: {
    className: "documents",
    kicker: "Conocimiento controlado",
    repositoryLabel: "Repositorio documental",
    actionLabel: "Abrir documento",
    emptyLabel: "DOC",
    icon: FileCheck2,
  },
  news_posts: {
    className: "news",
    kicker: "Actualización continua",
    repositoryLabel: "Archivo de noticias",
    actionLabel: "Leer noticia",
    emptyLabel: "NEWS",
    icon: Newspaper,
  },
  audit_reports: {
    className: "audits",
    kicker: "Control y seguimiento",
    repositoryLabel: "Repositorio de auditoría",
    actionLabel: "Ver auditoría",
    emptyLabel: "AUD",
    icon: ShieldCheck,
  },
  publications: {
    className: "publications",
    kicker: "Comunidad interna",
    repositoryLabel: "Catálogo de publicaciones",
    actionLabel: "Ver publicación",
    emptyLabel: "POST",
    icon: Megaphone,
  },
} satisfies Record<ContentTable, {
  className: string;
  kicker: string;
  repositoryLabel: string;
  actionLabel: string;
  emptyLabel: string;
  icon: typeof Boxes;
}>;

const HERO_ROTATION_MS = 4600;

function circularRecord(records: ContentRecord[], index: number) {
  if (!records.length) return null;
  return records[(index + records.length) % records.length];
}

function circularOffset(index: number, activeIndex: number, length: number) {
  if (!length) return 0;
  let offset = index - activeIndex;
  const half = length / 2;
  if (offset > half) offset -= length;
  if (offset < -half) offset += length;
  return offset;
}

function heroMedia(record: ContentRecord | null, panel: ModulePanel) {
  if (!record) return panel.mediaUrl;
  return String(record.image_url || record.icon_url || panel.mediaUrl || "");
}

export function CollectionView({ table, records, panel, canManage, onBack, onManage }: CollectionViewProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [catalogPaused, setCatalogPaused] = useState(false);
  const [lockedRecord, setLockedRecord] = useState<ContentRecord | null>(null);
  const pointerStartX = useRef<number | null>(null);
  const catalogDragged = useRef(false);
  const thumbRailRef = useRef<HTMLDivElement | null>(null);

  const meta = TABLE_META[table];
  const Icon = meta.icon;
  const labels = CONTENT_LABELS[table];
  const activeCount = records.filter((record) => record.is_active !== false).length;

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("es");
    if (!needle) return records;
    return records.filter((record) => `${recordTitle(record)} ${recordDescription(record)} ${(record.tags || []).join(" ")}`.toLocaleLowerCase("es").includes(needle));
  }, [records, query]);

  const showcaseRecords = useMemo(() => records
    .filter((record) => record.is_active !== false)
    .slice()
    .sort((a, b) => String(b.updated_at || b.created_at || "").localeCompare(String(a.updated_at || a.created_at || "")))
    .slice(0, 8), [records]);

  const normalizedActiveIndex = showcaseRecords.length
    ? Math.min(activeIndex, showcaseRecords.length - 1)
    : 0;

  useEffect(() => {
    if (catalogPaused || showcaseRecords.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % showcaseRecords.length);
    }, HERO_ROTATION_MS);
    return () => window.clearInterval(timer);
  }, [catalogPaused, showcaseRecords.length]);

  useEffect(() => {
    const rail = thumbRailRef.current;
    const activeThumb = rail?.querySelector<HTMLButtonElement>("button.is-active");
    if (!rail || !activeThumb) return;

    const railRect = rail.getBoundingClientRect();
    const thumbRect = activeThumb.getBoundingClientRect();
    const thumbCenterInsideRail = (thumbRect.left - railRect.left) + rail.scrollLeft + (thumbRect.width / 2);
    const desiredLeft = thumbCenterInsideRail - (rail.clientWidth / 2);
    const maxLeft = Math.max(0, rail.scrollWidth - rail.clientWidth);
    const targetLeft = Math.min(maxLeft, Math.max(0, desiredLeft));

    rail.scrollTo({
      left: targetLeft,
      behavior: catalogPaused ? "auto" : "smooth",
    });
  }, [normalizedActiveIndex, catalogPaused]);

  const activeRecord = circularRecord(showcaseRecords, normalizedActiveIndex);
  const activeLink = activeRecord && !activeRecord.requires_identity_unlock ? recordLink(activeRecord) : "";

  function moveCatalog(direction: -1 | 1) {
    if (showcaseRecords.length <= 1) return;
    setActiveIndex((index) => (Math.min(index, showcaseRecords.length - 1) + direction + showcaseRecords.length) % showcaseRecords.length);
  }

  function beginCatalogDrag(clientX: number) {
    pointerStartX.current = clientX;
    catalogDragged.current = false;
    setCatalogPaused(true);
  }

  function endCatalogDrag(clientX: number, pointerType = "mouse") {
    if (pointerStartX.current === null) return;
    const distance = clientX - pointerStartX.current;
    pointerStartX.current = null;
    if (Math.abs(distance) >= 42) {
      catalogDragged.current = true;
      moveCatalog(distance > 0 ? -1 : 1);
    }
    if (pointerType !== "mouse") window.setTimeout(() => setCatalogPaused(false), 1400);
  }

  function selectCover(index: number) {
    if (catalogDragged.current) {
      catalogDragged.current = false;
      return;
    }
    setActiveIndex(index);
  }

  return (
    <div className={`collection-view collection-view--${meta.className}`} data-catalog-engine="locked-rail-v11">
      <section
        className="collection-hero"
        aria-labelledby={`collection-title-${table}`}
        onMouseEnter={() => setCatalogPaused(true)}
        onMouseLeave={() => setCatalogPaused(false)}
        onFocusCapture={() => setCatalogPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setCatalogPaused(false);
        }}
      >
        <div className="collection-hero__atmosphere" aria-hidden="true">
          <span className="collection-hero__grid" />
          <span className="collection-hero__orb collection-hero__orb--one" />
          <span className="collection-hero__orb collection-hero__orb--two" />
          <span className="collection-hero__line collection-hero__line--one" />
          <span className="collection-hero__line collection-hero__line--two" />
        </div>

        <div className="collection-hero__copy">
          <button type="button" className="back-button collection-hero__back" onClick={onBack}>
            <ArrowLeft size={16} /> Volver al inicio
          </button>
          <span className="eyebrow"><Icon size={14} /> {panel.badge || meta.kicker}</span>
          <h1 id={`collection-title-${table}`}>{panel.title}</h1>
          <p>{panel.description}</p>

          <div className="collection-hero__metrics" aria-label="Resumen del módulo">
            <span><strong>{String(records.length).padStart(2, "0")}</strong><small>totales</small></span>
            <span><strong>{String(activeCount).padStart(2, "0")}</strong><small>activos</small></span>
            <span><strong>{String(showcaseRecords.length).padStart(2, "0")}</strong><small>en catálogo</small></span>
          </div>
        </div>

        <div className="collection-showcase" aria-label={`Catálogo animado de ${labels.plural}`}>
          <div className="collection-showcase__topline">
            <span><Layers3 size={14} /> Explorar {labels.plural}</span>
            <small>{showcaseRecords.length ? `${String(normalizedActiveIndex + 1).padStart(2, "0")} / ${String(showcaseRecords.length).padStart(2, "0")}` : "00 / 00"}</small>
          </div>

          <div
            className="collection-showcase__viewport"
            onPointerDown={(event) => beginCatalogDrag(event.clientX)}
            onPointerUp={(event) => endCatalogDrag(event.clientX, event.pointerType)}
            onPointerCancel={() => { pointerStartX.current = null; }}
            onPointerLeave={(event) => { if (pointerStartX.current !== null) endCatalogDrag(event.clientX, event.pointerType); }}
          >
            <div className="collection-coverflow" role="listbox" aria-label={`Selector visual de ${labels.plural}`}>
              {showcaseRecords.length ? showcaseRecords.map((record, index) => {
                const offset = circularOffset(index, normalizedActiveIndex, showcaseRecords.length);
                if (Math.abs(offset) > 2) return null;
                const media = heroMedia(record, panel);
                const isActive = index === normalizedActiveIndex;
                const isFar = Math.abs(offset) === 2;
                const coverStyle = {
                  "--cover-x": `${offset * (isFar ? 66 : 82)}%`,
                  "--cover-rotate": `${offset * (isFar ? -18 : -13)}deg`,
                } as React.CSSProperties;
                return (
                  <button
                    key={record.id}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    className={`collection-coverflow__item ${isActive ? "is-active" : ""} ${isFar ? "is-far" : ""}`}
                    style={coverStyle}
                    onClick={() => selectCover(index)}
                    tabIndex={isActive ? 0 : -1}
                    aria-label={`Seleccionar ${recordTitle(record)}`}
                  >
                    <span className={`collection-coverflow__media ${media ? "" : "collection-coverflow__media--fallback"}`}>
                      {media ? <Media src={media} alt={recordTitle(record)} fit="contain" eager={isActive} /> : <Icon size={54} strokeWidth={1.35} />}
                      {record.requires_identity_unlock ? <i className="identity-cover-lock" aria-label="Protegido con cédula"><LockKeyhole size={15} /></i> : null}
                    </span>
                    <span className="collection-coverflow__number">{String(index + 1).padStart(2, "0")}</span>
                  </button>
                );
              }) : (
                <div className="collection-coverflow__empty" aria-hidden="true"><Icon size={64} strokeWidth={1.25} /></div>
              )}
            </div>
          </div>

          <div className="collection-showcase__detail" key={activeRecord?.id || `detail-${table}`}>
            <div className="collection-showcase__detail-copy">
              <span>{activeRecord ? formatDate(activeRecord.updated_at || activeRecord.created_at) : meta.repositoryLabel}</span>
              <strong>{activeRecord ? recordTitle(activeRecord) : panel.title}</strong>
              <p>{activeRecord ? recordDescription(activeRecord) : panel.description}</p>
            </div>
            {activeRecord?.requires_identity_unlock ? (
              <button type="button" className="identity-lock-trigger" onClick={() => setLockedRecord(activeRecord)}><span>Desbloquear con cédula</span><LockKeyhole size={16} /></button>
            ) : activeLink ? (
              <a href={activeLink} target="_blank" rel="noopener noreferrer"><span>{meta.actionLabel}</span><ArrowUpRight size={16} /></a>
            ) : null}
          </div>

          <div className="collection-showcase__navigator">
            <button type="button" onClick={() => moveCatalog(-1)} aria-label="Anterior" disabled={showcaseRecords.length <= 1}><ChevronLeft size={18} /></button>
            <div ref={thumbRailRef} className="collection-showcase__thumbs" aria-label="Seleccionar recurso">
              {showcaseRecords.length ? showcaseRecords.map((record, index) => {
                const media = heroMedia(record, panel);
                return (
                  <button key={record.id} type="button" className={index === normalizedActiveIndex ? "is-active" : ""} onClick={() => setActiveIndex(index)} aria-label={`Mostrar ${recordTitle(record)}`}>
                    <span>{media ? <Media src={media} alt="" fit="contain" /> : <Icon size={18} strokeWidth={1.4} />}{record.requires_identity_unlock ? <i className="identity-thumb-lock"><LockKeyhole size={10} /></i> : null}</span>
                    <small>{String(index + 1).padStart(2, "0")}</small>
                  </button>
                );
              }) : <i />}
            </div>
            <button type="button" onClick={() => moveCatalog(1)} aria-label="Siguiente" disabled={showcaseRecords.length <= 1}><ChevronRight size={18} /></button>
          </div>
        </div>
      </section>

      <section className="collection-library" aria-labelledby={`repository-title-${table}`}>
        <header className="collection-library__bar">
          <div>
            <span className="eyebrow"><FileText size={14} /> {meta.repositoryLabel}</span>
            <h2 id={`repository-title-${table}`}>{labels.plural}</h2>
            <p>Consulta, filtra y abre cada recurso sin perder la navegación principal.</p>
          </div>
          <div className="collection-library__actions">
            <label className="compact-search">
              <Search size={18} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Buscar ${labels.plural.toLocaleLowerCase("es")}...`} />
              <span>{filtered.length}</span>
            </label>
            {canManage ? <button type="button" className="secondary-button" onClick={onManage}><SlidersHorizontal size={16} /> Administrar</button> : null}
          </div>
        </header>

        <div className="resource-grid">
          {filtered.length ? filtered.map((record, index) => {
            const link = record.requires_identity_unlock ? "" : recordLink(record);
            const media = String(record.image_url || record.icon_url || "");
            const title = recordTitle(record);
            return (
              <article key={record.id} className={`resource-card ${record.requires_identity_unlock ? "resource-card--identity-locked" : ""}`} style={{ "--delay": `${Math.min(index, 12) * 45}ms` } as React.CSSProperties}>
                <div className={`resource-card__media ${media ? "" : "resource-card__media--empty"}`}>
                  {media ? <Media src={media} alt={title} fit="contain" /> : (
                    <span className="resource-card__fallback" aria-hidden="true"><Icon size={34} strokeWidth={1.45} /><small>{meta.emptyLabel}</small></span>
                  )}
                  <small className="resource-card__index">{String(index + 1).padStart(2, "0")}</small>
                  {record.requires_identity_unlock ? <span className="resource-card__identity-badge"><LockKeyhole size={13} /> Solo con cédula</span> : null}
                  <span className="resource-card__shine" aria-hidden="true" />
                </div>
                <div className="resource-card__body">
                  <div className="resource-card__meta">
                    <span><i /> {String(record.status || "vigente")}</span>
                    <time>{formatDate(record.updated_at || record.created_at)}</time>
                  </div>
                  {Array.isArray(record.tags) && record.tags.length ? <div className="resource-card__tags">{record.tags.slice(0, 5).map((tag) => <span key={tag}>#{tag}</span>)}</div> : null}
                  <h3>{title}</h3>
                  <p>{recordDescription(record)}</p>
                  {table === "app_modules" ? (
                    <div className="resource-card__credit">
                      <small>Creado por</small>
                      <strong>{String(record.creator_name || "Juan Esteban Pérez")}</strong>
                      <span>{String(record.creator_role || "Analista de Calidad")}</span>
                    </div>
                  ) : null}
                  {record.requires_identity_unlock ? (
                    <button type="button" className="identity-lock-trigger identity-lock-trigger--card" onClick={() => setLockedRecord(record)}><span>Desbloquear con cédula</span><LockKeyhole size={16} /></button>
                  ) : link ? (
                    <a href={link} target="_blank" rel="noopener noreferrer"><span>{meta.actionLabel}</span><ArrowUpRight size={16} /></a>
                  ) : <span className="resource-card__unavailable">Sin enlace publicado</span>}
                </div>
              </article>
            );
          }) : (
            <article className="empty-state empty-state--wide">
              <Sparkles size={22} />
              <h3>{query ? "No encontramos coincidencias." : `Aún no se han publicado ${labels.plural.toLocaleLowerCase("es")}.`}</h3>
              <p>{query ? "Prueba con otra palabra o limpia la búsqueda." : "El contenido aparecerá aquí cuando se publique."}</p>
            </article>
          )}
        </div>
      </section>

      {lockedRecord ? <IdentityUnlockDialog table={table} record={lockedRecord} onClose={() => setLockedRecord(null)} /> : null}
    </div>
  );
}
