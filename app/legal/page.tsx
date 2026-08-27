import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  ExternalLink,
  FileText,
  Mail,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { BrandMark } from "@/components/shared/BrandMark";
import { DESIGNER_CONTACT, LEGAL_LAST_UPDATED, LEGAL_POLICIES } from "@/lib/legal/sitePolicies";

export const metadata = {
  title: "Centro Legal | Calidoso Team",
  description: "Políticas de privacidad, tratamiento de datos, cookies, términos, seguridad, propiedad intelectual y accesibilidad del portal.",
};

export default function LegalPage() {
  return (
    <main className="legal-center">
      <header className="legal-center__hero">
        <div className="legal-center__brand"><BrandMark /></div>
        <Link className="legal-center__back" href="/"><ArrowLeft size={16} /> Volver al portal</Link>
        <div className="legal-center__hero-copy">
          <span><ShieldCheck size={16} /> Gobierno digital & transparencia</span>
          <h1>Centro Legal<br /><em>del portal.</em></h1>
          <p>Información pública sobre privacidad, datos personales, cookies, seguridad, uso autorizado, propiedad intelectual y accesibilidad.</p>
        </div>
        <div className="legal-center__meta">
          <article><small>Última actualización</small><strong>{LEGAL_LAST_UPDATED}</strong></article>
          <article><small>Ámbito</small><strong>Portal institucional privado</strong></article>
          <article><small>Responsable operativo</small><strong>Electroingeniería S.A.S.</strong></article>
        </div>
      </header>

      <section className="legal-center__content">
        <aside className="legal-center__index" aria-label="Índice de políticas">
          <span>POLÍTICAS PUBLICADAS</span>
          {LEGAL_POLICIES.map((policy, index) => (
            <a key={policy.id} href={`#${policy.id}`}><b>{String(index + 1).padStart(2, "0")}</b><span>{policy.shortTitle}</span></a>
          ))}
        </aside>

        <div className="legal-center__policies">
          <div className="legal-center__notice">
            <FileText size={20} />
            <div>
              <strong>Información clara y verificable</strong>
              <p>Estas políticas describen el funcionamiento actual del portal. Complementan las políticas corporativas generales y deben actualizarse si cambian las finalidades, proveedores, tecnologías o requisitos normativos.</p>
            </div>
          </div>

          {LEGAL_POLICIES.map((policy, index) => (
            <article className="legal-policy" id={policy.id} key={policy.id}>
              <header>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><small>{policy.shortTitle}</small><h2>{policy.title}</h2><p>{policy.summary}</p></div>
              </header>
              <div className="legal-policy__sections">
                {policy.sections.map((section) => (
                  <section key={section.title}>
                    <h3>{section.title}</h3>
                    {section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  </section>
                ))}
              </div>
              {policy.references?.length ? (
                <footer>
                  <strong>Referencias oficiales</strong>
                  <div>{policy.references.map((reference) => (
                    <a key={reference.href} href={reference.href} target="_blank" rel="noreferrer">{reference.label}<ExternalLink size={13} /></a>
                  ))}</div>
                </footer>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="legal-center__contact" aria-labelledby="designer-contact-title">
        <div>
          <span><BadgeCheck size={16} /> DISEÑO & DESARROLLO</span>
          <h2 id="designer-contact-title">¿Necesitas contactar al creador del portal?</h2>
          <p>Canal para asuntos de experiencia digital, funcionamiento del portal, accesibilidad, mejoras o soporte relacionado con esta interfaz.</p>
        </div>
        <article>
          <strong>{DESIGNER_CONTACT.name}</strong>
          <small>{DESIGNER_CONTACT.role} · {DESIGNER_CONTACT.organization}</small>
          <a href={`tel:${DESIGNER_CONTACT.phoneDial}`}><Phone size={15} /> {DESIGNER_CONTACT.phone}</a>
          <a href={`mailto:${DESIGNER_CONTACT.corporateEmail}`}><Mail size={15} /> {DESIGNER_CONTACT.corporateEmail}</a>
          {DESIGNER_CONTACT.personalEmails.map((email) => <a key={email} href={`mailto:${email}`}><Mail size={15} /> {email}</a>)}
        </article>
      </section>

      <footer className="legal-center__footer">
        <span>© 2026 Electroingeniería S.A.S. · Todos los derechos reservados.</span>
        <span>Diseño y desarrollo: Juan Esteban Pérez · Analista de Calidad</span>
      </footer>
    </main>
  );
}
