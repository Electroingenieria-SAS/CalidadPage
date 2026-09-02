"use client";import{useEffect as L,useMemo as O,useState as m}from"react";import{ImagePlus as T,LoaderCircle as D,Palette as G,Plus as V,Save as N,Trash2 as $,Upload as K}from"lucide-react";import{Media as U}from"@/x/0m";import{savePortalSettings as H,uploadPortalAsset as J}from"@/x/0t";import{validatePortalFile as Q}from"@/x/0u";function ta({settings:_,onChange:S}){const[e,i]=m(structuredClone(_)),[t,x]=m("banners"),[o,u]=m(_.banners[0]?.id||""),[r,g]=m(null),[p,C]=m(!1),[I,P]=m(""),[w,M]=m(""),b=O(()=>r?URL.createObjectURL(r):"",[r]),E=t==="banners"?e.banners:t==="team"?e.team:t==="mascot"?e.mascot:[],v=E.find(a=>a.id===o),l=t==="banners"?v:void 0,c=t==="team"?v:void 0,f=t==="mascot"?v:void 0;L(()=>()=>{b&&URL.revokeObjectURL(b)},[b]);function B(a){x(a);const s=a==="banners"?e.banners:a==="team"?e.team:a==="mascot"?e.mascot:[];u(s[0]?.id||""),g(null)}function d(a){if(!o||!["banners","team","mascot"].includes(t))return;const s=t;i({...e,[s]:e[s].map(n=>n.id===o?{...n,...a}:n)})}function R(){const a=crypto.randomUUID();t==="banners"?i({...e,banners:[...e.banners,{id:a,title:"Nuevo banner",subtitle:"",description:"",button_text:"Abrir",link_url:"apps",media_url:"/assets/placeholders/banner.svg",animation:"fade",media_fit:"contain",media_position:"center",is_active:!0,sort_order:e.banners.length+1}]}):t==="team"?i({...e,team:[...e.team,{id:a,name:"Nuevo integrante",role:"Calidad y mejoramiento continuo",bio:"",photo_url:"/assets/placeholders/team.svg",is_active:!0,sort_order:e.team.length+1}]}):t==="mascot"&&i({...e,mascot:[...e.mascot,{id:a,name:"Nueva pieza",description:"",media_url:"/assets/placeholders/mascot.svg",is_active:!0,sort_order:e.mascot.length+1}]}),u(a)}function A(){if(!o||!window.confirm("\xBFEliminar este elemento de la portada?"))return;const a=t,s=e[a].filter(n=>n.id!==o);i({...e,[a]:s}),u(s[0]?.id||"")}async function h(a){a?.preventDefault(),C(!0),P(""),M("");try{let s=e;if(r&&o&&["banners","team","mascot"].includes(t)){await Q(r,t==="banners"?"banner":"identity");const n=await J(r,`identity-${t}`),k=t,F=t==="banners"?"media_url":t==="team"?"photo_url":"media_url";s={...e,[k]:e[k].map(y=>y.id===o?{...y,[F]:n}:y)},i(s)}await H(s),S(s),g(null),P("La identidad del portal qued\xF3 guardada para todos los usuarios.")}catch(s){M(s instanceof Error?s.message:"No fue posible guardar la configuraci\xF3n.")}finally{C(!1)}}return<div className="identity-manager">
      <aside className="admin-subnav">
        <span>Identidad y portada</span>
        {[["banners","Banners"],["team","Equipo"],["mascot","Mascota"],["modules","Paneles de m\xF3dulos"],["visual","Accesibilidad visual"]].map(([a,s])=><button key={a}type="button"className={t===a?"is-active":""}onClick={()=>B(a)}><span>{s}</span></button>)}
      </aside>

      <div className="admin-main-column">
        {["banners","team","mascot"].includes(t)&&<div className="identity-editor-grid">
            <section className="admin-list-card identity-list">
              <div className="admin-list-card__head"><div><span className="eyebrow">Elementos</span><h2>{t==="banners"?"Banners":t==="team"?"Equipo":"Mascota"}</h2></div><button type="button"className="icon-button"onClick={R}aria-label="Agregar"><V size={18}/></button></div>
              {E.map(a=><button key={a.id}type="button"className={o===a.id?"is-selected":""}onClick={()=>u(a.id)}>
                  <span className="admin-record-list__monogram">{String("title"in a?a.title:a.name).slice(0,2).toUpperCase()}</span>
                  <span><strong>{"title"in a?a.title:a.name}</strong><small>{"role"in a?a.role:a.description||"Sin descripci\xF3n"}</small></span>
                </button>)}
            </section>

            {v?<form className="admin-form-card"onSubmit={h}>
                <div className="admin-form-card__head"><div><span className="eyebrow">Edición de portada</span><h2>Editar elemento</h2></div><T size={24}/></div>
                <div className={`identity-media-preview ${t==="banners"?"identity-media-preview--banner":""}`}>
                  <U src={b||c?.photo_url||l?.media_url||f?.media_url||""}alt="Vista previa del asset"fit="contain"eager/>
                  <span>{t==="banners"?"Vista completa 4:1 \xB7 m\xEDnimo 1200 \xD7 300 px \xB7 m\xE1ximo 15 MB":"La vista previa conserva la proporci\xF3n original"}</span>
                </div>
                <div className="form-grid">
                  <label className="span-2"><span>{t==="team"?"Nombre":"T\xEDtulo"}</span><input value={l?.title||c?.name||f?.name||""}onChange={a=>d(t==="team"||t==="mascot"?{name:a.target.value}:{title:a.target.value})}/></label>
                  {t==="banners"&&l&&<label className="span-2"><span>Subtítulo</span><input value={l.subtitle||""}onChange={a=>d({subtitle:a.target.value})}/></label>}
                  {t==="team"&&c&&<label className="span-2"><span>Cargo o rol</span><input value={c.role||""}onChange={a=>d({role:a.target.value})}/></label>}
                  <label className="span-2"><span>{t==="team"?"Biograf\xEDa":"Descripci\xF3n"}</span><textarea rows={5}value={c?.bio||l?.description||f?.description||""}onChange={a=>d(t==="team"?{bio:a.target.value}:{description:a.target.value})}/></label>
                  {t==="banners"&&l&&<><label><span>Texto del botón</span><input value={l.button_text||""}onChange={a=>d({button_text:a.target.value})}/></label><label><span>Destino</span><input value={l.link_url||""}onChange={a=>d({link_url:a.target.value})}/></label></>}
                  {t==="banners"&&l&&<><label><span>Transición del hero</span><input value="Papel arrugado y descarte"readOnly aria-label="Transición global del hero"/></label><label><span>Orden</span><input type="number"min="1"value={l.sort_order||1}onChange={a=>d({sort_order:Number(a.target.value)})}/></label><label className="span-2 toggle-row"><span><strong>Banner activo</strong><small>Se mostrará en la libreta pública.</small></span><input type="checkbox"checked={l.is_active!==!1}onChange={a=>d({is_active:a.target.checked})}/></label></>}
                  <label className="span-2 upload-field"><K size={18}/><span>{r?r.name:"Reemplazar imagen, GIF o video"}</span><input type="file"accept="image/*,video/mp4,video/webm"onChange={a=>g(a.target.files?.[0]||null)}/></label>
                </div>
                <div className="form-actions"><button type="submit"className="primary-button"disabled={p}>{p?<D className="spin"size={18}/>:<N size={18}/>} Guardar para todos</button><button type="button"className="secondary-button danger-text"onClick={A}><$ size={17}/> Eliminar</button></div>
              </form>:<div className="admin-empty admin-empty--panel">Agrega un elemento para comenzar.</div>}
          </div>}

        {t==="modules"&&<form className="admin-form-card"onSubmit={h}>
            <div className="admin-form-card__head"><div><span className="eyebrow">Experiencias por sección</span><h2>Paneles de módulos</h2></div><T size={25}/></div>
            <div className="module-settings-grid">
              {Object.entries(e.modulePanels).map(([a,s])=><article key={a}>
                  <span>{a}</span>
                  <div className="module-settings-preview"><U src={s.mediaUrl}alt={`Vista de ${a}`}fit={s.mediaFit||"contain"}/></div>
                  <label><small>Título</small><input value={s.title}onChange={n=>i({...e,modulePanels:{...e.modulePanels,[a]:{...s,title:n.target.value}}})}/></label>
                  <label><small>Descripción</small><textarea rows={3}value={s.description}onChange={n=>i({...e,modulePanels:{...e.modulePanels,[a]:{...s,description:n.target.value}}})}/></label>
                  <label><small>URL del visual</small><input value={s.mediaUrl}onChange={n=>i({...e,modulePanels:{...e.modulePanels,[a]:{...s,mediaUrl:n.target.value}}})}/></label>
                  <label><small>Ajuste</small><select value={s.mediaFit||"contain"}onChange={n=>i({...e,modulePanels:{...e.modulePanels,[a]:{...s,mediaFit:n.target.value}}})}><option value="contain">Mostrar completa</option><option value="cover">Cubrir marco</option></select></label>
                  <label><small>Proporción</small><select value={s.mediaAspect||"3:4"}onChange={n=>i({...e,modulePanels:{...e.modulePanels,[a]:{...s,mediaAspect:n.target.value}}})}><option value="3:4">3:4 vertical</option><option value="16:9">16:9 horizontal</option><option value="4:3">4:3</option><option value="3:2">3:2</option><option value="1:1">1:1 cuadrado</option></select></label>
                </article>)}
            </div>
            <button type="submit"className="primary-button"disabled={p}><N size={18}/> Guardar paneles</button>
          </form>}

        {t==="visual"&&<form className="admin-form-card visual-settings"onSubmit={h}>
            <div className="admin-form-card__head"><div><span className="eyebrow">Preferencias globales</span><h2>Accesibilidad visual</h2></div><G size={25}/></div>
            <label className="toggle-row"><span><strong>Movimiento reducido</strong><small>Minimiza transiciones y animaciones para personas sensibles al movimiento.</small></span><input type="checkbox"checked={e.visual.reducedMotion}onChange={a=>i({...e,visual:{...e.visual,reducedMotion:a.target.checked}})}/></label>
            <label className="range-row"><span><strong>Opacidad del fondo</strong><small>Intensidad de los fondos decorativos administrables.</small></span><input type="range"min="0"max="40"value={e.visual.backgroundOpacity}onChange={a=>i({...e,visual:{...e.visual,backgroundOpacity:Number(a.target.value)}})}/><output>{e.visual.backgroundOpacity}%</output></label>
            <label><span>URL de fondo personalizado</span><input value={e.visual.backgroundUrl}onChange={a=>i({...e,visual:{...e.visual,backgroundUrl:a.target.value}})}placeholder="https://..."/></label>
            <button type="submit"className="primary-button"disabled={p}><N size={18}/> Guardar preferencias</button>
          </form>}

        {I&&<div className="form-success">{I}</div>}
        {w&&<div className="form-error">{w}</div>}
      </div>
    </div>}export{ta as IdentityManager};