"use client";import E from"next/link";import{useState as z}from"react";import{BadgeCheck as N,BriefcaseBusiness as I,ChevronDown as T,FileText as D,Mail as C,Phone as L,ShieldCheck as R,UserRound as P,X as _}from"lucide-react";import{DESIGNER_CONTACT as a}from"@/lib/legal/sitePolicies";const A=["BEGIN:VCARD","VERSION:3.0","N:P\xE9rez;Juan Esteban;;;","FN:Juan Esteban P\xE9rez","ORG:Electroingenier\xEDa S.A.S.","TITLE:Analista de Calidad",`TEL;TYPE=CELL:${a.phoneDial}`,`EMAIL;TYPE=WORK:${a.corporateEmail}`,`EMAIL;TYPE=INTERNET:${a.personalEmails[0]}`,`EMAIL;TYPE=INTERNET:${a.personalEmails[1]}`,"END:VCARD"].join(`
`),$=`data:text/vcard;charset=utf-8,${encodeURIComponent(A)}`;function B({variant:v="portal"}){const[e,n]=z(!1);return<aside className={`institutional-dock institutional-dock--${v}`}aria-label="Información legal y de contacto">
      {e?<section className="institutional-dock__card"aria-label="Contacto del diseñador">
          <header>
            <span className="institutional-dock__avatar"><P size={22}/></span>
            <div>
              <small>DISEÑO & DESARROLLO</small>
              <strong>{a.name}</strong>
              <em><N size={13}/> {a.role}</em>
            </div>
            <button type="button"onClick={()=>n(!1)}aria-label="Cerrar información de contacto"><_ size={17}/></button>
          </header>

          <div className="institutional-dock__org"><I size={15}/> {a.organization}</div>

          <div className="institutional-dock__contacts">
            <a href={`tel:${a.phoneDial}`}><L size={15}/><span><small>Teléfono</small><strong>{a.phone}</strong></span></a>
            <a href={`mailto:${a.corporateEmail}`}><C size={15}/><span><small>Correo corporativo</small><strong>{a.corporateEmail}</strong></span></a>
            {a.personalEmails.map(o=><a key={o}href={`mailto:${o}`}><C size={15}/><span><small>Correo de contacto</small><strong>{o}</strong></span></a>)}
          </div>

          <footer>
            <a href={$}download="Juan-Esteban-Perez.vcf">Guardar contacto</a>
            <E href="/legal"><R size={14}/> Centro legal</E>
          </footer>
        </section>:null}

      <div className="institutional-dock__bar">
        <button type="button"onClick={()=>n(o=>!o)}aria-expanded={e}>
          <N size={16}/>
          <span>Diseñador</span>
          <T className={e?"is-open":""}size={14}/>
        </button>
        <E href="/legal"><D size={15}/><span>Políticas</span></E>
        <small>© 2026</small>
      </div>
    </aside>}export{B as InstitutionalDock};