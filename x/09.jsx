"use client";import{ArrowLeft as _e,ArrowUpRight as O,Boxes as ge,ChevronLeft as Ne,ChevronRight as Ce,FileCheck2 as Le,FileText as Se,Layers3 as Re,LockKeyhole as C,Megaphone as Me,Newspaper as $e,Search as Ae,ShieldCheck as Te,SlidersHorizontal as Pe,Sparkles as Ee}from"lucide-react";import{useEffect as U,useMemo as V,useRef as P,useState as M}from"react";import{Media as E}from"@/x/0m";import{IdentityUnlockDialog as De}from"@/x/0a";import{CONTENT_LABELS as Ie}from"@/x/0p";import{formatDate as H,recordDescription as D,recordLink as F,recordTitle as h}from"@/x/0v";const Be={app_modules:{className:"apps",kicker:"Herramientas digitales",repositoryLabel:"Cat\xE1logo de aplicaciones",actionLabel:"Abrir App",emptyLabel:"App",icon:ge},documents:{className:"documents",kicker:"Conocimiento controlado",repositoryLabel:"Repositorio documental",actionLabel:"Abrir documento",emptyLabel:"DOC",icon:Le},news_posts:{className:"news",kicker:"Actualizaci\xF3n continua",repositoryLabel:"Archivo de noticias",actionLabel:"Leer noticia",emptyLabel:"NEWS",icon:$e},audit_reports:{className:"audits",kicker:"Control y seguimiento",repositoryLabel:"Repositorio de auditor\xEDa",actionLabel:"Ver auditor\xEDa",emptyLabel:"AUD",icon:Te},publications:{className:"publications",kicker:"Comunidad interna",repositoryLabel:"Cat\xE1logo de publicaciones",actionLabel:"Ver publicaci\xF3n",emptyLabel:"POST",icon:Me}},xe=4600;function We(a,i){return a.length?a[(i+a.length)%a.length]:null}function Oe(a,i,s){if(!s)return 0;let p=a-i;const L=s/2;return p>L&&(p-=s),p<-L&&(p+=s),p}function X(a,i){return a?String(a.image_url||a.icon_url||i.mediaUrl||""):i.mediaUrl}function Je({table:a,records:i,panel:s,canManage:p,onBack:L,onManage:j}){const[v,J]=M(""),[K,S]=M(0),[w,m]=M(!1),[I,$]=M(null),b=P(null),R=P(!1),B=P(null),c=Be[a],N=c.icon,_=Ie[a],Q=i.filter(e=>e.is_active!==!1).length,z=V(()=>{const e=v.trim().toLocaleLowerCase("es");return e?i.filter(t=>`${h(t)} ${D(t)} ${(t.tags||[]).join(" ")}`.toLocaleLowerCase("es").includes(e)):i},[i,v]),n=V(()=>i.filter(e=>e.is_active!==!1).slice().sort((e,t)=>String(t.updated_at||t.created_at||"").localeCompare(String(e.updated_at||e.created_at||""))).slice(0,8),[i]),g=n.length?Math.min(K,n.length-1):0;U(()=>{if(w||n.length<=1)return;const e=window.setInterval(()=>{S(t=>(t+1)%n.length)},xe);return()=>window.clearInterval(e)},[w,n.length]),U(()=>{const e=B.current,t=e?.querySelector("button.is-active");if(!e||!t)return;const o=e.getBoundingClientRect(),r=t.getBoundingClientRect(),d=r.left-o.left+e.scrollLeft+r.width/2-e.clientWidth/2,T=Math.max(0,e.scrollWidth-e.clientWidth),Z=Math.min(T,Math.max(0,d));e.scrollTo({left:Z,behavior:w?"auto":"smooth"})},[g,w]);const l=We(n,g),x=l&&!l.requires_identity_unlock?F(l):"";function A(e){n.length<=1||S(t=>(Math.min(t,n.length-1)+e+n.length)%n.length)}function G(e){b.current=e,R.current=!1,m(!0)}function W(e,t="mouse"){if(b.current===null)return;const o=e-b.current;b.current=null,Math.abs(o)>=42&&(R.current=!0,A(o>0?-1:1)),t!=="mouse"&&window.setTimeout(()=>m(!1),1400)}function Y(e){if(R.current){R.current=!1;return}S(e)}return<div className={`collection-view collection-view--${c.className}`}data-catalog-engine="locked-rail-v11">
      <section className="collection-hero"aria-labelledby={`collection-title-${a}`}onMouseEnter={()=>m(!0)}onMouseLeave={()=>m(!1)}onFocusCapture={()=>m(!0)}onBlurCapture={e=>{e.currentTarget.contains(e.relatedTarget)||m(!1)}}>
        <div className="collection-hero__atmosphere"aria-hidden="true">
          <span className="collection-hero__grid"/>
          <span className="collection-hero__orb collection-hero__orb--one"/>
          <span className="collection-hero__orb collection-hero__orb--two"/>
          <span className="collection-hero__line collection-hero__line--one"/>
          <span className="collection-hero__line collection-hero__line--two"/>
        </div>

        <div className="collection-hero__copy">
          <button type="button"className="back-button collection-hero__back"onClick={L}>
            <_e size={16}/> Volver al inicio
          </button>
          <span className="eyebrow"><N size={14}/> {s.badge||c.kicker}</span>
          <h1 id={`collection-title-${a}`}>{s.title}</h1>
          <p>{s.description}</p>

          <div className="collection-hero__metrics"aria-label="Resumen del módulo">
            <span><strong>{String(i.length).padStart(2,"0")}</strong><small>totales</small></span>
            <span><strong>{String(Q).padStart(2,"0")}</strong><small>activos</small></span>
            <span><strong>{String(n.length).padStart(2,"0")}</strong><small>en catálogo</small></span>
          </div>
        </div>

        <div className="collection-showcase"aria-label={`Cat\xE1logo animado de ${_.plural}`}>
          <div className="collection-showcase__topline">
            <span><Re size={14}/> Explorar {_.plural}</span>
            <small>{n.length?`${String(g+1).padStart(2,"0")} / ${String(n.length).padStart(2,"0")}`:"00 / 00"}</small>
          </div>

          <div className="collection-showcase__viewport"onPointerDown={e=>G(e.clientX)}onPointerUp={e=>W(e.clientX,e.pointerType)}onPointerCancel={()=>{b.current=null}}onPointerLeave={e=>{b.current!==null&&W(e.clientX,e.pointerType)}}>
            <div className="collection-coverflow"role="listbox"aria-label={`Selector visual de ${_.plural}`}>
              {n.length?n.map((e,t)=>{const o=Oe(t,g,n.length);if(Math.abs(o)>2)return null;const r=X(e,s),u=t===g,d=Math.abs(o)===2,T={"--cover-x":`${o*(d?66:82)}%`,"--cover-rotate":`${o*(d?-18:-13)}deg`};return<button key={e.id}type="button"role="option"aria-selected={u}className={`collection-coverflow__item ${u?"is-active":""} ${d?"is-far":""}`}style={T}onClick={()=>Y(t)}tabIndex={u?0:-1}aria-label={`Seleccionar ${h(e)}`}>
                    <span className={`collection-coverflow__media ${r?"":"collection-coverflow__media--fallback"}`}>
                      {r?<E src={r}alt={h(e)}fit="contain"eager={u}/>:<N size={54}strokeWidth={1.35}/>}
                      {e.requires_identity_unlock?<i className="identity-cover-lock"aria-label="Protegido con cédula"><C size={15}/></i>:null}
                    </span>
                    <span className="collection-coverflow__number">{String(t+1).padStart(2,"0")}</span>
                  </button>}):<div className="collection-coverflow__empty"aria-hidden="true"><N size={64}strokeWidth={1.25}/></div>}
            </div>
          </div>

          <div className="collection-showcase__detail"key={l?.id||`detail-${a}`}>
            <div className="collection-showcase__detail-copy">
              <span>{l?H(l.updated_at||l.created_at):c.repositoryLabel}</span>
              <strong>{l?h(l):s.title}</strong>
              <p>{l?D(l):s.description}</p>
            </div>
            {l?.requires_identity_unlock?<button type="button"className="identity-lock-trigger"onClick={()=>$(l)}><span>Desbloquear con cédula</span><C size={16}/></button>:x?<a href={x}target="_blank"rel="noopener noreferrer"><span>{c.actionLabel}</span><O size={16}/></a>:null}
          </div>

          <div className="collection-showcase__navigator">
            <button type="button"onClick={()=>A(-1)}aria-label="Anterior"disabled={n.length<=1}><Ne size={18}/></button>
            <div ref={B}className="collection-showcase__thumbs"aria-label="Seleccionar recurso">
              {n.length?n.map((e,t)=>{const o=X(e,s);return<button key={e.id}type="button"className={t===g?"is-active":""}onClick={()=>S(t)}aria-label={`Mostrar ${h(e)}`}>
                    <span>{o?<E src={o}alt=""fit="contain"/>:<N size={18}strokeWidth={1.4}/>}{e.requires_identity_unlock?<i className="identity-thumb-lock"><C size={10}/></i>:null}</span>
                    <small>{String(t+1).padStart(2,"0")}</small>
                  </button>}):<i/>}
            </div>
            <button type="button"onClick={()=>A(1)}aria-label="Siguiente"disabled={n.length<=1}><Ce size={18}/></button>
          </div>
        </div>
      </section>

      <section className="collection-library"aria-labelledby={`repository-title-${a}`}>
        <header className="collection-library__bar">
          <div>
            <span className="eyebrow"><Se size={14}/> {c.repositoryLabel}</span>
            <h2 id={`repository-title-${a}`}>{_.plural}</h2>
            <p>Consulta, filtra y abre cada recurso sin perder la navegación principal.</p>
          </div>
          <div className="collection-library__actions">
            <label className="compact-search">
              <Ae size={18}/>
              <input value={v}onChange={e=>J(e.target.value)}placeholder={`Buscar ${_.plural.toLocaleLowerCase("es")}...`}/>
              <span>{z.length}</span>
            </label>
            {p?<button type="button"className="secondary-button"onClick={j}><Pe size={16}/> Administrar</button>:null}
          </div>
        </header>

        <div className="resource-grid">
          {z.length?z.map((e,t)=>{const o=e.requires_identity_unlock?"":F(e),r=String(e.image_url||e.icon_url||""),u=h(e);return<article key={e.id}className={`resource-card ${e.requires_identity_unlock?"resource-card--identity-locked":""}`}style={{"--delay":`${Math.min(t,12)*45}ms`}}>
                <div className={`resource-card__media ${r?"":"resource-card__media--empty"}`}>
                  {r?<E src={r}alt={u}fit="contain"/>:<span className="resource-card__fallback"aria-hidden="true"><N size={34}strokeWidth={1.45}/><small>{c.emptyLabel}</small></span>}
                  <small className="resource-card__index">{String(t+1).padStart(2,"0")}</small>
                  {e.requires_identity_unlock?<span className="resource-card__identity-badge"><C size={13}/> Solo con cédula</span>:null}
                  <span className="resource-card__shine"aria-hidden="true"/>
                </div>
                <div className="resource-card__body">
                  <div className="resource-card__meta">
                    <span><i/> {String(e.status||"vigente")}</span>
                    <time>{H(e.updated_at||e.created_at)}</time>
                  </div>
                  {Array.isArray(e.tags)&&e.tags.length?<div className="resource-card__tags">{e.tags.slice(0,5).map(d=><span key={d}>#{d}</span>)}</div>:null}
                  <h3>{u}</h3>
                  <p>{D(e)}</p>
                  {a==="app_modules"?<div className="resource-card__credit">
                      <small>Creado por</small>
                      <strong>{String(e.creator_name||"Juan Esteban P\xE9rez")}</strong>
                      <span>{String(e.creator_role||"Analista de Calidad")}</span>
                    </div>:null}
                  {e.requires_identity_unlock?<button type="button"className="identity-lock-trigger identity-lock-trigger--card"onClick={()=>$(e)}><span>Desbloquear con cédula</span><C size={16}/></button>:o?<a href={o}target="_blank"rel="noopener noreferrer"><span>{c.actionLabel}</span><O size={16}/></a>:<span className="resource-card__unavailable">Sin enlace publicado</span>}
                </div>
              </article>}):<article className="empty-state empty-state--wide">
              <Ee size={22}/>
              <h3>{v?"No encontramos coincidencias.":`A\xFAn no se han publicado ${_.plural.toLocaleLowerCase("es")}.`}</h3>
              <p>{v?"Prueba con otra palabra o limpia la b\xFAsqueda.":"El contenido aparecer\xE1 aqu\xED cuando se publique."}</p>
            </article>}
        </div>
      </section>

      {I?<De table={a}record={I}onClose={()=>$(null)}/>:null}
    </div>}export{Je as CollectionView};