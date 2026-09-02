"use client";import{useCallback as p,useEffect as l,useRef as f,useState as r}from"react";import{ArrowRight as _,Volume2 as N,VolumeX as S}from"lucide-react";function y(){const[i,a]=r(!1),[n,u]=r(!1),[o,c]=r(!1),t=f(null),s=p(()=>{n||(window.sessionStorage.setItem("calidoso-intro-seen-v3","true"),u(!0),t.current?.pause(),window.setTimeout(()=>a(!1),520))},[n]);l(()=>{const e=window.sessionStorage.getItem("calidoso-intro-seen-v3"),m=window.setTimeout(()=>{e||a(!0)},0);return()=>window.clearTimeout(m)},[]),l(()=>{if(!i)return;const e=window.setTimeout(()=>s(),3e3);return()=>window.clearTimeout(e)},[s,i]);async function d(){const e=t.current;if(e){if(o){e.pause(),c(!1);return}await e.play().catch(()=>{}),c(!0)}}return i?<section className={`intro-experience ${n?"is-closing":""}`}aria-label="Bienvenida al repositorio">
      <video className="intro-experience__video"src="/assets/intro/intro-video.mp4"muted autoPlay playsInline/>
      <div className="intro-experience__veil"aria-hidden="true"/>

      <div className="intro-experience__content">
        <span className="intro-experience__code"><i/> CALIDOSO TEAM · REPOSITORIO 2026</span>
        <div className="intro-experience__logo">
          {}
          {}
          <img src="/assets/brand/repository-logo.png"alt="Repositorio de Apps Calidad"width={1680}height={939}/>
        </div>
        <div className="intro-experience__title">
          <span>Calidad y mejoramiento continuo</span>
          <h1>Todo el conocimiento.<br/>En un solo lugar.</h1>
        </div>
      </div>

      <div className="intro-experience__footer">
        <div className="intro-experience__progress"><span/></div>
        <small>Electroingeniería S.A.S.</small>
      </div>

      <div className="intro-experience__actions">
        <button type="button"className="icon-button icon-button--glass"onClick={d}aria-label={o?"Silenciar":"Activar sonido"}>
          {o?<N size={18}/>:<S size={18}/>}
        </button>
        <button type="button"className="intro-enter"onClick={s}>Entrar ahora <_ size={18}/></button>
      </div>
      <audio ref={t}src="/assets/intro/intro-sound.mp3"preload="metadata"/>
    </section>:null}export{y as IntroExperience};