import _ from"next/link";import{BadgeCheck as N,FileText as T,Sparkles as C}from"lucide-react";import{InstitutionalDock as E}from"@/components/shared/InstitutionalDock";import{PORTAL_CONFIG as e}from"@/lib/config/portal";function x(){return<footer className="site-footer">
      <div className="site-footer__top">
        <span className="site-footer__index">CT / DREAM TEAM / 2026</span>
        <C size={22}/>
      </div>
      <div className="site-footer__main">
        <div>
          <span className="site-footer__eyebrow">{e.organization}</span>
          <h2>Construir mejor,<br/><em>una versión a la vez.</em></h2>
          <p>{e.teamName}. Un repositorio institucional para conectar herramientas, conocimiento y mejora continua.</p>
        </div>
        <div className="site-footer__principles"aria-label="Principios del repositorio">
          <article><span>01</span><strong>Claridad</strong><small>Todo es fácil de encontrar.</small></article>
          <article><span>02</span><strong>Trazabilidad</strong><small>Cada recurso tiene propósito.</small></article>
          <article><span>03</span><strong>Mejora</strong><small>El sistema permanece vivo.</small></article>
        </div>
      </div>
      <div className="site-footer__bottom">
        <span>© 2026 Juan Esteban Pérez · Electroingeniería S.A.S. · Todos los derechos reservados.</span>
        <_ href="/legal"className="site-footer__legal"><T size={14}/> Políticas web & privacidad</_>
        <div className="creator-signature">
          <N size={22}/>
          <span>Diseño y desarrollo</span>
          <strong>{e.creator}</strong>
          <small>{e.creatorRole}</small>
        </div>
      </div>
      <E/>
    </footer>}export{x as SiteFooter};