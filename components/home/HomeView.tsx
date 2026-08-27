"use client";

import {
  ArrowRight,
  ArrowUpRight,
  Boxes,
  FileCheck2,
  Newspaper,
  Search,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { useMemo, useState } from "react";
import { BannerExperience } from "@/components/home/hero/BannerExperience";
import { PacoGame } from "@/components/home/paco/PacoGame";
import { TeamCultureSection } from "@/components/home/TeamCultureSection";
import { Media } from "@/components/shared/Media";
import { Reveal } from "@/components/shared/Reveal";
import { MODULE_ACCENTS } from "@/lib/config/assets";
import { formatDate, recordDescription, recordTitle } from "@/lib/utils/format";
import type { Compliment, ContentRecord, PortalCollections, PortalRoute, PortalSettings, Profile } from "@/types/portal";

interface HomeViewProps {
  collections: PortalCollections;
  settings: PortalSettings;
  compliments: Compliment[];
  profile: Profile | null;
  allowedRoutes: PortalRoute[];
  onNavigate: (route: PortalRoute) => void;
  onComplimentSubmitted: () => Promise<void>;
}

const tableRoutes: Record<string, PortalRoute> = {
  app_modules: "apps",
  news_posts: "noticias",
  audit_reports: "auditorias",
  documents: "documentos",
  publications: "publicaciones",
};

const moduleDefinitions = [
  { key: "apps", route: "apps" as const, table: "app_modules" as const, label: "Apps", icon: Boxes },
  { key: "documents", route: "documentos" as const, table: "documents" as const, label: "Documentos", icon: FileCheck2 },
  { key: "news", route: "noticias" as const, table: "news_posts" as const, label: "Noticias", icon: Newspaper },
  { key: "audits", route: "auditorias" as const, table: "audit_reports" as const, label: "Auditorías", icon: ShieldCheck },
  { key: "publications", route: "publicaciones" as const, table: "publications" as const, label: "Publicaciones", icon: UsersRound },
];

export function HomeView({ collections, settings, compliments, profile, allowedRoutes, onNavigate, onComplimentSubmitted }: HomeViewProps) {
  const [query, setQuery] = useState("");
  const collectionEntries = Object.entries(collections) as Array<[keyof PortalCollections, ContentRecord[]]>;
  const modules = useMemo(() => moduleDefinitions
    .filter((definition) => allowedRoutes.includes(definition.route))
    .map((definition) => ({
      ...definition,
      count: collections[definition.table].length,
      panel: settings.modulePanels[definition.key],
    })), [allowedRoutes, collections, settings.modulePanels]);

  const latest = useMemo(() => collectionEntries
    .flatMap(([table, records]) => records.map((record) => ({ table, record })))
    .sort((a, b) => String(b.record.updated_at || b.record.created_at || "").localeCompare(String(a.record.updated_at || a.record.created_at || "")))
    .slice(0, 6), [collections]);

  const results = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("es");
    if (!needle) return [];
    return collectionEntries
      .flatMap(([table, records]) => records.map((record) => ({ table, record })))
      .filter(({ record }) => `${recordTitle(record)} ${recordDescription(record)} ${(record.tags || []).join(" ")}`.toLocaleLowerCase("es").includes(needle))
      .slice(0, 7);
  }, [collections, query]);

  const total = Object.values(collections).reduce((sum, rows) => sum + rows.length, 0);

  return (
    <div className="home-view home-view--asset-led">
      <BannerExperience banners={settings.banners} onNavigate={onNavigate} />

      <PacoGame mascot={settings.mascot} />

      <section className="repository-access" aria-labelledby="repository-title">
        <header className="repository-access__head">
          <div>
            <span className="eyebrow"><Sparkles size={14} /> Acceso inmediato</span>
            <h2 id="repository-title">Encuentra lo que necesitas.</h2>
          </div>
          <div className="repository-search">
            <Search size={19} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar una App, documento o publicación..." aria-label="Buscar en todo el repositorio" />
            <span>{query ? results.length : total}</span>
            {query ? (
              <div className="repository-search__results">
                {results.length ? results.map(({ table, record }) => (
                  <button key={`${table}-${record.id}`} type="button" onClick={() => onNavigate(tableRoutes[table] || "inicio")}>
                    <span><strong>{recordTitle(record)}</strong><small>{tableRoutes[table]}</small></span><ArrowRight size={16} />
                  </button>
                )) : <p>No hay coincidencias con “{query}”.</p>}
              </div>
            ) : null}
          </div>
        </header>

        <div className="module-ribbon">
          {modules.map(({ key, route, label, icon: Icon, count, panel }, index) => (
            <button key={key} type="button" className="module-entry" onClick={() => onNavigate(route)}>
              <span className="module-entry__number">0{index + 1}</span>
              <span className={`module-entry__media module-entry__media--${key}`} aria-hidden="true">
                <span className="module-entry__media-orbit" />
                <span className="module-entry__media-icon"><Icon size={30} strokeWidth={1.75} /></span>
              </span>
              <span className="module-entry__copy">
                <small><Icon size={14} /> {panel.badge}</small>
                <strong>{label}</strong>
                <em>{count} {count === 1 ? "recurso" : "recursos"}</em>
              </span>
              <span className="module-entry__accent" aria-hidden="true"><Media src={MODULE_ACCENTS[key]} alt="" fit="contain" /></span>
              <ArrowUpRight className="module-entry__arrow" size={17} />
            </button>
          ))}
        </div>
      </section>

      <Reveal as="section" className="home-section editorial-feed">
        <div className="section-heading section-heading--compact">
          <div><span className="eyebrow">Actualización continua</span><h2>Lo último del Dream Team.</h2></div>
          <p>Contenido reciente, organizado por fecha y conservando el formato original de cada pieza.</p>
        </div>

        {latest.length ? (
          <div className="editorial-feed__grid">
            {latest.map(({ table, record }) => {
              const media = String(record.image_url || record.icon_url || "");
              return (
                <button key={`${table}-${record.id}`} type="button" className="editorial-card" onClick={() => onNavigate(tableRoutes[table] || "inicio")}>
                  {media ? <span className="editorial-card__media"><Media src={media} alt={recordTitle(record)} fit="contain" /></span> : null}
                  <span className="editorial-card__body">
                    <small>{tableRoutes[table]} · {formatDate(record.updated_at || record.created_at)}</small>
                    <strong>{recordTitle(record)}</strong>
                    <p>{recordDescription(record)}</p>
                    <em>Ver recurso <ArrowUpRight size={15} /></em>
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <article className="empty-state empty-state--wide">
            <Sparkles size={22} />
            <h3>El repositorio está preparado.</h3>
            <p>El contenido aparecerá aquí cuando responda la conexión de datos.</p>
          </article>
        )}
      </Reveal>

      <Reveal>
        <TeamCultureSection
          team={settings.team}
          mascot={settings.mascot}
          compliments={compliments}
          profile={profile}
          onSubmitted={onComplimentSubmitted}
        />
      </Reveal>
    </div>
  );
}
