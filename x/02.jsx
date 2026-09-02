"use client";import{Check as M,Copy as A,Film as T,Image as I,Music2 as _}from"lucide-react";import{useMemo as S,useState as k}from"react";import{Media as E}from"@/x/0m";import{PORTAL_ASSETS as e}from"@/x/0o";const F=["Marca","Fondos","M\xF3dulos","Estados","Audio"];function B(){const[i,N]=k("Marca"),[o,t]=k(""),w=S(()=>e.filter(a=>a.group===i),[i]);async function z(a){await navigator.clipboard.writeText(a).catch(()=>{}),t(a),window.setTimeout(()=>t(""),1500)}return<section className="asset-library">
      <header className="asset-library__head">
        <div>
          <span className="eyebrow">Inventario organizado</span>
          <h2>Biblioteca de assets</h2>
          <p>Cada archivo conserva su formato, proporción recomendada y función dentro del portal.</p>
        </div>
        <strong>{e.length} recursos catalogados</strong>
      </header>

      <nav className="asset-library__tabs"aria-label="Tipos de assets">
        {F.map(a=><button key={a}type="button"className={a===i?"is-active":""}onClick={()=>N(a)}>
            {a}
            <span>{e.filter(C=>C.group===a).length}</span>
          </button>)}
      </nav>

      <div className="asset-library__grid">
        {w.map(a=><article key={a.id}className={`asset-tile asset-tile--${a.kind}`}>
            <div className="asset-tile__preview">
              {a.kind==="audio"?<div className="asset-tile__audio"><_ size={25}/><audio controls preload="none"src={a.path}/></div>:<E src={a.path}alt={a.label}fit="contain"/>}
              <span>{a.kind==="video"?<T size={14}/>:a.kind==="audio"?<_ size={14}/>:<I size={14}/>}{a.kind}</span>
            </div>
            <div className="asset-tile__body">
              <div><strong>{a.label}</strong>{a.width&&a.height?<small>{a.width} × {a.height}px</small>:null}</div>
              <p>{a.recommendedUse}</p>
              <button type="button"onClick={()=>z(a.path)}>
                {o===a.path?<M size={15}/>:<A size={15}/>}
                {o===a.path?"Ruta copiada":"Copiar ruta"}
              </button>
            </div>
          </article>)}
      </div>
    </section>}export{B as AssetLibrary};