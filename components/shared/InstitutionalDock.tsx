"use client";

import Link from "next/link";
import { useState } from "react";
import {
  BadgeCheck,
  BriefcaseBusiness,
  ChevronDown,
  FileText,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { DESIGNER_CONTACT } from "@/lib/legal/sitePolicies";

interface InstitutionalDockProps {
  variant?: "login" | "portal";
}

const vcard = [
  "BEGIN:VCARD",
  "VERSION:3.0",
  "N:Pérez;Juan Esteban;;;",
  "FN:Juan Esteban Pérez",
  "ORG:Electroingeniería S.A.S.",
  "TITLE:Analista de Calidad",
  `TEL;TYPE=CELL:${DESIGNER_CONTACT.phoneDial}`,
  `EMAIL;TYPE=WORK:${DESIGNER_CONTACT.corporateEmail}`,
  `EMAIL;TYPE=INTERNET:${DESIGNER_CONTACT.personalEmails[0]}`,
  `EMAIL;TYPE=INTERNET:${DESIGNER_CONTACT.personalEmails[1]}`,
  "END:VCARD",
].join("\n");

const vcardHref = `data:text/vcard;charset=utf-8,${encodeURIComponent(vcard)}`;

export function InstitutionalDock({ variant = "portal" }: InstitutionalDockProps) {
  const [open, setOpen] = useState(false);

  return (
    <aside className={`institutional-dock institutional-dock--${variant}`} aria-label="Información legal y de contacto">
      {open ? (
        <section className="institutional-dock__card" aria-label="Contacto del diseñador">
          <header>
            <span className="institutional-dock__avatar"><UserRound size={22} /></span>
            <div>
              <small>DISEÑO & DESARROLLO</small>
              <strong>{DESIGNER_CONTACT.name}</strong>
              <em><BadgeCheck size={13} /> {DESIGNER_CONTACT.role}</em>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar información de contacto"><X size={17} /></button>
          </header>

          <div className="institutional-dock__org"><BriefcaseBusiness size={15} /> {DESIGNER_CONTACT.organization}</div>

          <div className="institutional-dock__contacts">
            <a href={`tel:${DESIGNER_CONTACT.phoneDial}`}><Phone size={15} /><span><small>Teléfono</small><strong>{DESIGNER_CONTACT.phone}</strong></span></a>
            <a href={`mailto:${DESIGNER_CONTACT.corporateEmail}`}><Mail size={15} /><span><small>Correo corporativo</small><strong>{DESIGNER_CONTACT.corporateEmail}</strong></span></a>
            {DESIGNER_CONTACT.personalEmails.map((email) => (
              <a key={email} href={`mailto:${email}`}><Mail size={15} /><span><small>Correo de contacto</small><strong>{email}</strong></span></a>
            ))}
          </div>

          <footer>
            <a href={vcardHref} download="Juan-Esteban-Perez.vcf">Guardar contacto</a>
            <Link href="/legal"><ShieldCheck size={14} /> Centro legal</Link>
          </footer>
        </section>
      ) : null}

      <div className="institutional-dock__bar">
        <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
          <BadgeCheck size={16} />
          <span>Diseñador</span>
          <ChevronDown className={open ? "is-open" : ""} size={14} />
        </button>
        <Link href="/legal"><FileText size={15} /><span>Políticas</span></Link>
        <small>© 2026</small>
      </div>
    </aside>
  );
}
