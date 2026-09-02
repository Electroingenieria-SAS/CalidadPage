"use client";import{useEffect as F,useMemo as G,useState as r}from"react";import{Check as I,KeyRound as $,LoaderCircle as L,RefreshCw as Q,Save as U,ShieldCheck as V,Tags as H}from"lucide-react";import{invokeAccessAdmin as R}from"@/x/0t";const J=["super_admin","admin","editor","calidad","auditoria","analista","jefe_auditoria","jefe_general","consulta","solicitante","viewer"],P=[{table:"app_modules",label:"Apps",moduleKey:"can_view_apps"},{table:"documents",label:"Documentos",moduleKey:"can_view_documents"},{table:"news_posts",label:"Noticias",moduleKey:"can_view_news"},{table:"audit_reports",label:"Auditor\xEDas",moduleKey:"can_view_audits"},{table:"publications",label:"Publicaciones",moduleKey:"can_view_publications"}];function T(t){return t.replaceAll("_"," ").replace(/\b\w/g,c=>c.toUpperCase())}function k(t){return{role:t,can_access_portal:!0,can_view_home:!0,can_view_apps:!0,can_view_documents:!0,can_view_news:!0,can_view_audits:!0,can_view_publications:!0}}function v(t,c){return{role:t,content_type:c,allow_all:!0,allowed_record_ids:[],allowed_category_ids:[],allowed_tags:[]}}function C(t,c){return t.policies.find(l=>l.role===c)||k(c)}function A(t,c){return P.map(({table:l})=>t.scopes.find(_=>_.role===c&&_.content_type===l)||v(c,l))}function Z(){const[t,c]=r(null),[l,_]=r("admin"),[y,p]=r(k("admin")),[b,m]=r([]),[S,f]=r(!0),[w,z]=r(!1),[x,h]=r(""),[E,u]=r("");async function M(){f(!0),u("");try{const e=await R("get");c(e),p(C(e,l)),m(A(e,l))}catch(e){u(e instanceof Error?e.message:"No fue posible cargar la matriz de permisos.")}finally{f(!1)}}F(()=>{let e=!1;async function o(){try{const a=await R("get");if(e)return;c(a),p(C(a,"admin")),m(A(a,"admin"))}catch(a){e||u(a instanceof Error?a.message:"No fue posible cargar la matriz de permisos.")}finally{e||f(!1)}}return o(),()=>{e=!0}},[]);function B(e){_(e),t?(p(C(t,e)),m(A(t,e))):(p(k(e)),m(P.map(({table:o})=>v(e,o)))),h(""),u("")}const q=G(()=>{if(!t)return[];const e=Object.values(t.content).flatMap(o=>o.flatMap(a=>a.tags||[]));return[...new Set(e.map(o=>o.trim().toLocaleLowerCase("es")).filter(Boolean))].sort((o,a)=>o.localeCompare(a,"es"))},[t]);function j(e,o){p(a=>({...a,[e]:o}))}function K(e,o){m(a=>a.map(n=>n.content_type===e?{...n,...o}:n))}function N(e,o,a){const i=(b.find(d=>d.content_type===e)||v(l,e))[o],g=i.includes(a)?i.filter(d=>d!==a):[...i,a];K(e,{[o]:g})}async function D(){if(l!=="super_admin"){z(!0),u(""),h("");try{await R("save_role",{role:l,policy:y,scopes:b}),h(`Permisos de ${T(l)} guardados. Los cambios se aplican por RLS en la pr\xF3xima consulta.`),await M()}catch(e){u(e instanceof Error?e.message:"No fue posible guardar los permisos.")}finally{z(!1)}}}return S&&!t?<div className="admin-panel-loading"><L className="spin"size={24}/><strong>Cargando matriz de accesos...</strong></div>:<div className="access-manager">
      <header className="access-manager__head">
        <div>
          <span className="eyebrow"><V size={16}/> Control de acceso exacto</span>
          <h2>Qué puede ver cada rol.</h2>
          <p>Define módulos completos y, cuando necesites precisión, limita por recurso, categoría o etiqueta. El control se aplica también en Supabase RLS.</p>
        </div>
        <button type="button"className="secondary-button"onClick={()=>void M()}disabled={S}><Q size={16}/> Actualizar</button>
      </header>

      <div className="access-manager__rolebar">
        <label><span>Rol a configurar</span><select value={l}onChange={e=>B(e.target.value)}>{J.map(e=><option key={e}value={e}>{T(e)}</option>)}</select></label>
        {l==="super_admin"?<div className="access-manager__locked"><$ size={18}/><span><strong>Acceso total permanente</strong><small>El super admin no puede bloquearse a sí mismo.</small></span></div>:null}
      </div>

      <section className="access-manager__modules">
        <div className="access-manager__section-title"><span>1</span><div><strong>Acceso general</strong><small>Controla si el rol entra al portal y qué módulos aparecen.</small></div></div>
        <div className="access-toggle-grid">
          {[["can_access_portal","Entrar al portal"],["can_view_home","Inicio"],["can_view_apps","Apps"],["can_view_documents","Documentos"],["can_view_news","Noticias"],["can_view_audits","Auditor\xEDas"],["can_view_publications","Publicaciones"]].map(([e,o])=>{const a=e,n=!!y[a];return<button key={e}type="button"disabled={l==="super_admin"}className={n?"is-on":""}onClick={()=>j(a,!n)}><span className="access-toggle-grid__check">{n?<I size={15}/>:null}</span><strong>{o}</strong><small>{n?"Permitido":"Bloqueado"}</small></button>})}
        </div>
      </section>

      <section className="access-manager__scopes">
        <div className="access-manager__section-title"><span>2</span><div><strong>Alcance de contenido</strong><small>Si desactivas “ver todo”, autoriza elementos por nombre, categoría o etiqueta.</small></div></div>
        {P.map(({table:e,label:o,moduleKey:a})=>{const n=b.find(s=>s.content_type===e)||v(l,e),i=t?.content[e]||[],g=(t?.categories||[]).filter(s=>i.some(O=>O.category_id===s.id)),d=!!y[a];return<article key={e}className={`access-scope ${d?"":"is-disabled"}`}>
              <header>
                <div><strong>{o}</strong><small>{i.length} recursos registrados</small></div>
                <label className="access-switch"><input type="checkbox"checked={n.allow_all}disabled={!d||l==="super_admin"}onChange={s=>K(e,{allow_all:s.target.checked})}/><span/> Ver todo el módulo</label>
              </header>
              {!n.allow_all&&d?<div className="access-scope__filters">
                  <div><span>Recursos concretos</span><div className="access-choice-list">{i.length?i.map(s=><label key={s.id}><input type="checkbox"checked={n.allowed_record_ids.includes(s.id)}onChange={()=>N(e,"allowed_record_ids",s.id)}/><span>{s.title||s.name||s.id}<small>{(s.tags||[]).join(" \xB7 ")||"sin etiqueta"}</small></span></label>):<small>No hay recursos en este módulo.</small>}</div></div>
                  {g.length?<div><span>Categorías</span><div className="access-chip-list">{g.map(s=><button key={s.id}type="button"className={n.allowed_category_ids.includes(s.id)?"is-selected":""}onClick={()=>N(e,"allowed_category_ids",s.id)}>{s.name}</button>)}</div></div>:null}
                  <div><span><H size={14}/> Etiquetas enlazadas</span><div className="access-chip-list">{q.length?q.map(s=><button key={s}type="button"className={n.allowed_tags.includes(s)?"is-selected":""}onClick={()=>N(e,"allowed_tags",s)}>#{s}</button>):<small>Aún no hay etiquetas disponibles.</small>}</div></div>
                </div>:null}
            </article>})}
      </section>

      {x?<div className="form-success">{x}</div>:null}
      {E?<div className="form-error">{E}</div>:null}
      <div className="access-manager__actions">
        <button type="button"className="primary-button"disabled={w||l==="super_admin"}onClick={()=>void D()}>{w?<L className="spin"size={18}/>:<U size={18}/>}{w?"Guardando...":"Guardar permisos del rol"}</button>
      </div>
    </div>}export{Z as AccessControlManager};