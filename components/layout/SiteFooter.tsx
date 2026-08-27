import Link from "next/link";
import { BadgeCheck, FileText, Sparkles } from "lucide-react";
import { InstitutionalDock } from "@/components/shared/InstitutionalDock";
import { PORTAL_CONFIG } from "@/lib/config/portal";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__top">
        <span className="site-footer__index">CT / DREAM TEAM / 2026</span>
        <Sparkles size={22} />
      </div>
      <div className="site-footer__main">
        <div>
          <span className="site-footer__eyebrow">{PORTAL_CONFIG.organization}</span>
          <h2>Construir mejor,<br /><em>una versión a la vez.</em></h2>
          <p>{PORTAL_CONFIG.teamName}. Un repositorio institucional para conectar herramientas, conocimiento y mejora continua.</p>
        </div>
        <div className="site-footer__principles" aria-label="Principios del repositorio">
          <article><span>01</span><strong>Claridad</strong><small>Todo es fácil de encontrar.</small></article>
          <article><span>02</span><strong>Trazabilidad</strong><small>Cada recurso tiene propósito.</small></article>
          <article><span>03</span><strong>Mejora</strong><small>El sistema permanece vivo.</small></article>
        </div>
      </div>
      <div className="site-footer__bottom">
        <span>© 2026 Electroingeniería S.A.S. · Todos los derechos reservados.</span>
        <Link href="/legal" className="site-footer__legal"><FileText size={14} /> Políticas web & privacidad</Link>
        <div className="creator-signature">
          <BadgeCheck size={22} />
          <span>Diseño y desarrollo</span>
          <strong>{PORTAL_CONFIG.creator}</strong>
          <small>{PORTAL_CONFIG.creatorRole}</small>
        </div>
      </div>
      <InstitutionalDock />
    </footer>
  );
}
