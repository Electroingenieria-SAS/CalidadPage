"use client";import{useEffect as i,useRef as r,useState as u}from"react";function m({mascot:c}){const e=r(null),t=r(null),[n,s]=u(!1);return i(()=>{let a=!1;async function o(){if(!e.current)return;const{createPacoGame:l}=await import("@/src/game/0");a||!e.current||(t.current?.(),t.current=l(e.current),s(!0))}return o(),()=>{a=!0,t.current?.(),t.current=null}},[]),<section id="paco-game"className="paco-phaser-section"aria-label="Paco Runner"data-mascot-items={c.length}>
      <div className="paco-phaser-frame">
        <div ref={e}className="paco-phaser-host"/>
        {n?null:<div className="paco-phaser-loading"aria-live="polite">
            <span>ENERGIZANDO PACO</span>
            <i/>
          </div>}
      </div>
    </section>}export{m as PacoGame};