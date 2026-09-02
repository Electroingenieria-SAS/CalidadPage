import E from"next/link";import{ArrowLeft as L,BadgeCheck as N,ExternalLink as S,FileText as A,Mail as _,Phone as C,ShieldCheck as P}from"lucide-react";import{BrandMark as T}from"@/x/0k";import{DESIGNER_CONTACT as a,LEGAL_LAST_UPDATED as y,LEGAL_POLICIES as b}from"@/x/0q";const G={title:"Centro Legal | Calidoso Team",description:"Pol\xEDticas de privacidad, tratamiento de datos, cookies, t\xE9rminos, seguridad, propiedad intelectual y accesibilidad del portal."};function D(){return<main className="legal-center">
      <header className="legal-center__hero">
        <div className="legal-center__brand"><T/></div>
        <E className="legal-center__back"href="/"><L size={16}/> Volver al portal</E>
        <div className="legal-center__hero-copy">
          <span><P size={16}/> Gobierno digital & transparencia</span>
          <h1>Centro Legal<br/><em>del portal.</em></h1>
          <p>Información pública sobre privacidad, datos personales, cookies, seguridad, uso autorizado, propiedad intelectual y accesibilidad.</p>
        </div>
        <div className="legal-center__meta">
          <article><small>Última actualización</small><strong>{y}</strong></article>
          <article><small>Ámbito</small><strong>Portal institucional privado</strong></article>
          <article><small>Responsable operativo</small><strong>Electroingeniería S.A.S.</strong></article>
        </div>
      </header>

      <section className="legal-center__content">
        <aside className="legal-center__index"aria-label="Índice de políticas">
          <span>POLÍTICAS PUBLICADAS</span>
          {b.map((e,l)=><a key={e.id}href={`#${e.id}`}><b>{String(l+1).padStart(2,"0")}</b><span>{e.shortTitle}</span></a>)}
        </aside>

        <div className="legal-center__policies">
          <div className="legal-center__notice">
            <A size={20}/>
            <div>
              <strong>Información clara y verificable</strong>
              <p>Estas políticas describen el funcionamiento actual del portal. Complementan las políticas corporativas generales y deben actualizarse si cambian las finalidades, proveedores, tecnologías o requisitos normativos.</p>
            </div>
          </div>

          {b.map((e,l)=><article className="legal-policy"id={e.id}key={e.id}>
              <header>
                <span>{String(l+1).padStart(2,"0")}</span>
                <div><small>{e.shortTitle}</small><h2>{e.title}</h2><p>{e.summary}</p></div>
              </header>
              <div className="legal-policy__sections">
                {e.sections.map(i=><section key={i.title}>
                    <h3>{i.title}</h3>
                    {i.body.map(t=><p key={t}>{t}</p>)}
                  </section>)}
              </div>
              {e.references?.length?<footer>
                  <strong>Referencias oficiales</strong>
                  <div>{e.references.map(i=><a key={i.href}href={i.href}target="_blank"rel="noreferrer">{i.label}<S size={13}/></a>)}</div>
                </footer>:null}
            </article>)}
        </div>
      </section>

      <section className="legal-center__contact"aria-labelledby="designer-contact-title">
        <div>
          <span><N size={16}/> DISEÑO & DESARROLLO</span>
          <h2 id="designer-contact-title">¿Necesitas contactar al creador del portal?</h2>
          <p>Canal para asuntos de experiencia digital, funcionamiento del portal, accesibilidad, mejoras o soporte relacionado con esta interfaz.</p>
        </div>
        <article>
          <strong>{a.name}</strong>
          <small>{a.role} · {a.organization}</small>
          <a href={`tel:${a.phoneDial}`}><C size={15}/> {a.phone}</a>
          <a href={`mailto:${a.corporateEmail}`}><_ size={15}/> {a.corporateEmail}</a>
          {a.personalEmails.map(e=><a key={e}href={`mailto:${e}`}><_ size={15}/> {e}</a>)}
        </article>
      </section>

      <footer className="legal-center__footer">
        <span>© 2026 Juan Esteban Pérez · Electroingeniería S.A.S. · Todos los derechos reservados.</span>
        <span>Diseño y desarrollo: Juan Esteban Pérez · Analista de Calidad</span>
      </footer>
    </main>}export{D as default,G as metadata};