"use client";import{ArrowRight as T,ArrowUpRight as C,Boxes as V,FileCheck2 as j,Newspaper as q,Search as H,ShieldCheck as O,Sparkles as P,UsersRound as U}from"lucide-react";import{useMemo as b,useState as F}from"react";import{BannerExperience as G}from"@/components/home/hero/BannerExperience";import{PacoGame as Q}from"@/components/home/paco/PacoGame";import{TeamCultureSection as W}from"@/components/home/TeamCultureSection";import{Media as R}from"@/components/shared/Media";import{Reveal as S}from"@/components/shared/Reveal";import{MODULE_ACCENTS as J}from"@/lib/config/assets";import{formatDate as K,recordDescription as z,recordTitle as y}from"@/lib/utils/format";const h={app_modules:"apps",news_posts:"noticias",audit_reports:"auditorias",documents:"documentos",publications:"publicaciones"},X=[{key:"apps",route:"apps",table:"app_modules",label:"Apps",icon:V},{key:"documents",route:"documentos",table:"documents",label:"Documentos",icon:j},{key:"news",route:"noticias",table:"news_posts",label:"Noticias",icon:q},{key:"audits",route:"auditorias",table:"audit_reports",label:"Auditor\xEDas",icon:O},{key:"publications",route:"publicaciones",table:"publications",label:"Publicaciones",icon:U}];function ne({collections:i,settings:t,compliments:A,profile:$,allowedRoutes:v,onNavigate:n,onComplimentSubmitted:E}){const[s,D]=F(""),r=b(()=>Object.entries(i),[i]),L=b(()=>X.filter(e=>v.includes(e.route)).map(e=>({...e,count:i[e.table].length,panel:t.modulePanels[e.key]})),[v,i,t.modulePanels]),N=b(()=>r.flatMap(([e,a])=>a.map(o=>({table:e,record:o}))).sort((e,a)=>String(a.record.updated_at||a.record.created_at||"").localeCompare(String(e.record.updated_at||e.record.created_at||""))).slice(0,6),[r]),f=b(()=>{const e=s.trim().toLocaleLowerCase("es");return e?r.flatMap(([a,o])=>o.map(_=>({table:a,record:_}))).filter(({record:a})=>`${y(a)} ${z(a)} ${(a.tags||[]).join(" ")}`.toLocaleLowerCase("es").includes(e)).slice(0,7):[]},[r,s]),M=Object.values(i).reduce((e,a)=>e+a.length,0);return<div className="home-view home-view--asset-led">
      <G banners={t.banners}onNavigate={n}/>

      <Q mascot={t.mascot}/>

      <section className="repository-access"aria-labelledby="repository-title">
        <header className="repository-access__head">
          <div>
            <span className="eyebrow"><P size={14}/> Acceso inmediato</span>
            <h2 id="repository-title">Encuentra lo que necesitas.</h2>
          </div>
          <div className="repository-search">
            <H size={19}/>
            <input value={s}onChange={e=>D(e.target.value)}placeholder="Buscar una App, documento o publicación..."aria-label="Buscar en todo el repositorio"/>
            <span>{s?f.length:M}</span>
            {s?<div className="repository-search__results">
                {f.length?f.map(({table:e,record:a})=><button key={`${e}-${a.id}`}type="button"onClick={()=>n(h[e]||"inicio")}>
                    <span><strong>{y(a)}</strong><small>{h[e]}</small></span><T size={16}/>
                  </button>):<p>No hay coincidencias con “{s}”.</p>}
              </div>:null}
          </div>
        </header>

        <div className="module-ribbon">
          {L.map(({key:e,route:a,label:o,icon:_,count:g,panel:x},B)=><button key={e}type="button"className="module-entry"onClick={()=>n(a)}>
              <span className="module-entry__number">0{B+1}</span>
              <span className={`module-entry__media module-entry__media--${e}`}aria-hidden="true">
                <span className="module-entry__media-orbit"/>
                <span className="module-entry__media-icon"><_ size={30}strokeWidth={1.75}/></span>
              </span>
              <span className="module-entry__copy">
                <small><_ size={14}/> {x.badge}</small>
                <strong>{o}</strong>
                <em>{g} {g===1?"recurso":"recursos"}</em>
              </span>
              <span className="module-entry__accent"aria-hidden="true"><R src={J[e]}alt=""fit="contain"/></span>
              <C className="module-entry__arrow"size={17}/>
            </button>)}
        </div>
      </section>

      <S as="section"className="home-section editorial-feed">
        <div className="section-heading section-heading--compact">
          <div><span className="eyebrow">Actualización continua</span><h2>Lo último del Dream Team.</h2></div>
          <p>Contenido reciente, organizado por fecha y conservando el formato original de cada pieza.</p>
        </div>

        {N.length?<div className="editorial-feed__grid">
            {N.map(({table:e,record:a})=>{const o=String(a.image_url||a.icon_url||"");return<button key={`${e}-${a.id}`}type="button"className="editorial-card"onClick={()=>n(h[e]||"inicio")}>
                  {o?<span className="editorial-card__media"><R src={o}alt={y(a)}fit="contain"/></span>:null}
                  <span className="editorial-card__body">
                    <small>{h[e]} · {K(a.updated_at||a.created_at)}</small>
                    <strong>{y(a)}</strong>
                    <p>{z(a)}</p>
                    <em>Ver recurso <C size={15}/></em>
                  </span>
                </button>})}
          </div>:<article className="empty-state empty-state--wide">
            <P size={22}/>
            <h3>El repositorio está preparado.</h3>
            <p>El contenido aparecerá aquí cuando responda la conexión de datos.</p>
          </article>}
      </S>

      <S>
        <W team={t.team}mascot={t.mascot}compliments={A}profile={$}onSubmitted={E}/>
      </S>
    </div>}export{ne as HomeView};