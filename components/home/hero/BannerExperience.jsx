"use client";import{ArrowDown as J,ArrowUpRight as K,ChevronLeft as Q,ChevronRight as X,Pause as Y,Play as Z}from"lucide-react";import{useCallback as E,useEffect as N,useMemo as ee,useRef as f,useState as g}from"react";import{Media as _e}from"@/components/shared/Media";import{PaperBurnTransition as Ne}from"./PaperBurnTransition";const L=1e4,R=2050,Pe=6,Se=["inicio","apps","documentos","noticias","auditorias","publicaciones","perfil","admin"],C=Array.from({length:10},(i,h)=>({id:h,y:7.5+h*(85/9)})),Te={"--notebook-cycle-duration":`${L}ms`,"--notebook-burn-duration":`${R}ms`};function I(i){return{"--binding-y":`${i}%`}}function P(i){return/\.(mp4|webm|ogg)(\?|$)/i.test(i)}function Ee({src:i}){return P(i)?<video src={i}muted playsInline preload="auto"aria-hidden="true"tabIndex={-1}/>:<img src={i}alt=""loading="eager"decoding="async"/>}function Ae({banners:i,onNavigate:h}){const n=ee(()=>i.filter(e=>e.is_active!==!1).sort((e,t)=>(e.sort_order||0)-(t.sort_order||0)),[i]),[x,F]=g(0),[c,$]=g(null),[o,b]=g("idle"),[z,V]=g(1),[v,H]=g(0),[_,O]=g(!1),u=f([]),A=f([]),M=f(null),B=f(null),y=f(!1),k=E(()=>{for(const e of u.current)window.cancelAnimationFrame(e);u.current=[]},[]);N(()=>k,[k]);const S=_,r=n.length?x%n.length:0,l=n[r],q=c===null?null:n[c];N(()=>{if(n.length<=1)return;const e=[(r+1)%n.length,(r-1+n.length)%n.length],t=n.map(a=>a.media_url).filter(a=>!!a&&!P(a)),d=e.map(a=>n[a]?.media_url).filter(a=>!!a&&P(a)),m=Array.from(new Set([...t,...d])),p=[];for(const a of m)if(P(a)){const s=document.createElement("video");s.preload="auto",s.muted=!0,s.playsInline=!0,s.src=a,s.load(),p.push(s)}else{const s=new Image;s.decoding="async",s.src=a,s.decode?.().catch(()=>{}),p.push(s)}return A.current=p,()=>{for(const a of p)a instanceof HTMLVideoElement&&(a.removeAttribute("src"),a.load());A.current=[]}},[n,r]);const w=E((e,t=1)=>{if(y.current||o!=="idle"||n.length<=1||e===r)return;y.current=!0,k(),V(t),H(m=>m+1),$(e),b("preparing");const d=window.requestAnimationFrame(()=>{const m=window.requestAnimationFrame(()=>{M.current?.querySelectorAll("video").forEach(p=>p.pause()),b("burning")});u.current=[m]});u.current=[d]},[n.length,k,o,r]),T=E(()=>{if(c===null){y.current=!1,b("idle");return}F(c),b("settling");let e=0;const t=()=>{if(e+=1,e<Pe){const m=window.requestAnimationFrame(t);u.current=[m];return}$(null),b("idle"),y.current=!1,u.current=[]},d=window.requestAnimationFrame(t);u.current=[d]},[c]);if(N(()=>{if(o!=="idle"||n.length<=1||S)return;const e=window.setTimeout(()=>{w((r+1)%n.length,1)},L);return()=>window.clearTimeout(e)},[n.length,S,o,r,w]),N(()=>{if(o!=="burning")return;const e=window.setTimeout(()=>{T()},R+450);return()=>window.clearTimeout(e)},[o,v,T]),!l)return null;function D(e){const t=(r+e+n.length)%n.length;w(t,e)}function U(e){if(e===r)return;const t=(e-r+n.length)%n.length,d=(r-e+n.length)%n.length;w(e,t<=d?1:-1)}function j(){const e=l.link_url||"apps";Se.includes(e)?h(e):window.open(e,"_blank","noopener,noreferrer")}function W(){document.getElementById("paco-game")?.scrollIntoView({behavior:"smooth",block:"start"})}const G=o==="burning"?`is-burning ${z>0?"is-forward":"is-backward"}`:o==="preparing"?"is-preparing":"";return<section className={`banner-experience banner-experience--reference ${G}`}style={Te}aria-roledescription="carrusel"aria-label="Destacados del repositorio"data-hero-engine="paper-burn-zero-frame-flash-120hz-v10">
      <div className="reference-hero-bg"aria-hidden="true">
        <video className="reference-hero-bg__video"autoPlay muted loop playsInline preload="metadata"tabIndex={-1}>
          <source src="/assets/backgrounds/banner-background.mp4"type="video/mp4"/>
        </video>
        <span className="reference-hero-bg__veil"/>
        <span className="reference-hero-bg__wave reference-hero-bg__wave--one"/>
        <span className="reference-hero-bg__wave reference-hero-bg__wave--two"/>
        <span className="reference-hero-bg__square reference-hero-bg__square--one"/>
        <span className="reference-hero-bg__square reference-hero-bg__square--two"/>
        <span className="reference-hero-bg__square reference-hero-bg__square--three"/>
      </div>

      <div className="reference-hero__content">
        <header className="reference-hero__heading"aria-live="polite">
          <span className="reference-hero__eyebrow">Calidad y mejoramiento continuo</span>
          <h1>{l.title}</h1>
          {l.description?<p>{l.description}</p>:null}
          <div className="reference-hero__actions">
            <button type="button"className="primary-button primary-button--gold"onClick={j}>
              {l.button_text||"Explorar"}
              <K size={17}/>
            </button>
            <button type="button"className="reference-hero__paco-link"onClick={W}>
              Conoce a Paco
              <J size={16}/>
            </button>
          </div>
        </header>

        <div className="notebook-shell">
          <div className="notebook-stage"ref={M}>
            <div className="notebook-binding"aria-hidden="true">
              {C.map(e=><span key={e.id}style={I(e.y)}/>)}
            </div>

            {q?<article key={`incoming-${v}-${c??r}`}className="notebook-page notebook-page--incoming"aria-hidden="true"style={{opacity:1,transform:"translate3d(0,0,0) scale3d(1,1,1)"}}>
                <div className="notebook-page__punches"aria-hidden="true">
                  {C.map(e=><span key={e.id}style={I(e.y)}/>)}
                </div>
                <div className="notebook-page__media">
                  <Ee src={q.media_url}/>
                </div>
              </article>:null}

            <article ref={B}className="notebook-page notebook-page--current"key={`current-${l.id}-${r}-${v}`}aria-live="polite"style={o==="settling"?{opacity:0,pointerEvents:"none"}:void 0}>
              <div className="notebook-page__punches"aria-hidden="true">
                {C.map(e=><span key={e.id}style={I(e.y)}/>)}
              </div>
              <div className="notebook-page__media">
                <_e src={l.media_url}alt={l.title}fit="contain"eager/>
              </div>
            </article>

            <Ne key={`paper-burn-${v}-${r}-${c??"idle"}`}active={o==="burning"}durationMs={R}pageRef={B}onComplete={T}/>

            <button type="button"className="notebook-control notebook-control--prev"onClick={()=>D(-1)}aria-label="Banner anterior"disabled={n.length<=1||o!=="idle"}>
              <Q size={21}/>
            </button>
            <button type="button"className="notebook-control notebook-control--next"onClick={()=>D(1)}aria-label="Banner siguiente"disabled={n.length<=1||o!=="idle"}>
              <X size={21}/>
            </button>
          </div>
        </div>

        <div className="reference-hero__footer">
          <div className="reference-hero__counter"aria-label={`Banner ${r+1} de ${n.length}`}>
            <span>{String(r+1).padStart(2,"0")}</span>
            <i/>
            <small>{String(n.length).padStart(2,"0")}</small>
          </div>

          {n.length>1?<div className="banner-timeline"aria-label="Seleccionar banner">
              {n.map((e,t)=><button key={`${e.id}-${t}`}type="button"className={t===r?"is-active":""}onClick={()=>U(t)}aria-label={`Mostrar banner ${t+1}: ${e.title}`}disabled={o!=="idle"}>
                  <span>{String(t+1).padStart(2,"0")}</span>
                  {t===r?<i key={r}className={S||o!=="idle"?"is-paused":""}/>:null}
                </button>)}
            </div>:<span/>}

          {n.length>1?<button type="button"className="banner-pause"onClick={()=>O(e=>!e)}aria-label={_?"Reanudar carrusel":"Pausar carrusel"}>
              {_?<Z size={15}/>:<Y size={15}/>}
              {_?"Reanudar":"Pausar"}
            </button>:<span/>}
        </div>
      </div>
    </section>}export{Ae as BannerExperience};