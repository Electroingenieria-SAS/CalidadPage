"use client";

import { Check, Copy, Film, Image as ImageIcon, Music2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Media } from "@/components/shared/Media";
import { PORTAL_ASSETS } from "@/lib/config/assets";

const groups = ["Marca", "Fondos", "Módulos", "Estados", "Audio"] as const;

export function AssetLibrary() {
  const [activeGroup, setActiveGroup] = useState<(typeof groups)[number]>("Marca");
  const [copied, setCopied] = useState("");
  const assets = useMemo(() => PORTAL_ASSETS.filter((asset) => asset.group === activeGroup), [activeGroup]);

  async function copyPath(path: string) {
    await navigator.clipboard.writeText(path).catch(() => undefined);
    setCopied(path);
    window.setTimeout(() => setCopied(""), 1500);
  }

  return (
    <section className="asset-library">
      <header className="asset-library__head">
        <div>
          <span className="eyebrow">Inventario organizado</span>
          <h2>Biblioteca de assets</h2>
          <p>Cada archivo conserva su formato, proporción recomendada y función dentro del portal.</p>
        </div>
        <strong>{PORTAL_ASSETS.length} recursos catalogados</strong>
      </header>

      <nav className="asset-library__tabs" aria-label="Tipos de assets">
        {groups.map((group) => (
          <button key={group} type="button" className={group === activeGroup ? "is-active" : ""} onClick={() => setActiveGroup(group)}>
            {group}
            <span>{PORTAL_ASSETS.filter((asset) => asset.group === group).length}</span>
          </button>
        ))}
      </nav>

      <div className="asset-library__grid">
        {assets.map((asset) => (
          <article key={asset.id} className={`asset-tile asset-tile--${asset.kind}`}>
            <div className="asset-tile__preview">
              {asset.kind === "audio" ? (
                <div className="asset-tile__audio"><Music2 size={25} /><audio controls preload="none" src={asset.path} /></div>
              ) : (
                <Media src={asset.path} alt={asset.label} fit="contain" />
              )}
              <span>{asset.kind === "video" ? <Film size={14} /> : asset.kind === "audio" ? <Music2 size={14} /> : <ImageIcon size={14} />}{asset.kind}</span>
            </div>
            <div className="asset-tile__body">
              <div><strong>{asset.label}</strong>{asset.width && asset.height ? <small>{asset.width} × {asset.height}px</small> : null}</div>
              <p>{asset.recommendedUse}</p>
              <button type="button" onClick={() => copyPath(asset.path)}>
                {copied === asset.path ? <Check size={15} /> : <Copy size={15} />}
                {copied === asset.path ? "Ruta copiada" : "Copiar ruta"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
