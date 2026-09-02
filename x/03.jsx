"use client";import{useEffect as I,useMemo as q,useState as c}from"react";import{FilePlus2 as X,LoaderCircle as Y,LockKeyhole as R,Pencil as Z,Search as _e,ShieldCheck as Ce,Trash2 as Ne,Upload as Ee}from"lucide-react";import{Media as Se}from"@/x/0m";import{CONTENT_LABELS as U}from"@/x/0p";import{recordDescription as A,recordLink as ke,recordTitle as y}from"@/x/0v";import{removeContent as Pe,upsertContent as Le,uploadPortalAsset as Te}from"@/x/0t";import{invokeIdentityAccess as w,loadPortalCategories as qe,protectedContentPayload as ze}from"@/x/0s";import{validatePortalFile as Re}from"@/x/0u";const Ae=Object.keys(U),xe={title:"",description:"",status:"publicado",external_url:"",image_url:"",creator_name:"Juan Esteban P\xE9rez",creator_role:"Analista de Calidad",tags:[],category_id:null};function M(o){return{app_modules:"app",documents:"documento",news_posts:"noticia",audit_reports:"auditoria",publications:"publicacion"}[o]}function x(o){return{...xe,status:o==="app_modules"?"activa":"publicado",tags:[M(o)]}}function Ue(o){return[...new Set(o.split(",").map(C=>C.trim().toLocaleLowerCase("es").replace(/\s+/g," ")).filter(Boolean))].slice(0,30)}function Ve({collections:o,onRefresh:C}){const[n,O]=c("app_modules"),[a,r]=c(x("app_modules")),[m,D]=c([]),[E,G]=c(""),[i,h]=c(null),[S,u]=c(!1),[B,b]=c(""),[$,d]=c(""),v=q(()=>i?URL.createObjectURL(i):"",[i]),p=q(()=>m.find(e=>e.id===a.category_id)||null,[m,a.category_id])?.slug==="solo-con-cedula";I(()=>()=>{v&&URL.revokeObjectURL(v)},[v]),I(()=>{qe().then(D).catch(e=>console.error("No fue posible cargar categor\xEDas:",e))},[]);const F=q(()=>{const e=E.toLocaleLowerCase("es").trim();return e?o[n].filter(t=>`${y(t)} ${A(t)} ${(t.tags||[]).join(" ")}`.toLocaleLowerCase("es").includes(e)):o[n]},[o,E,n]);function J(e){O(e),r(x(e)),h(null),b(""),d("")}async function V(e){if(r({...e,title:y(e),description:A(e),external_url:e.requires_identity_unlock?"":ke(e)}),h(null),b(""),d(""),document.getElementById("content-form")?.scrollIntoView({behavior:"smooth",block:"start"}),e.requires_identity_unlock){u(!0);try{const t=await w("get_target",{content_type:n,record_id:e.id});r(s=>s.id===e.id?{...s,external_url:t.target_url||""}:s)}catch(t){d(t instanceof Error?t.message:"No fue posible recuperar el enlace protegido.")}finally{u(!1)}}}function N(){r(x(n)),h(null)}function K(e){const t=m.find(f=>f.id===e),l=(Array.isArray(a.tags)?a.tags.map(String):[]).filter(f=>f!=="solo-con-cedula"),_=t?.slug==="solo-con-cedula"?[...new Set([...l,"solo-con-cedula"])]:l;r({...a,category_id:e||null,tags:_})}async function Q(e){e.preventDefault(),u(!0),b(""),d("");try{let t=String(a.image_url||"");i&&(await Re(i,"content"),t=await Te(i,n));const s=m.find(T=>T.id===a.category_id)||null,l=s?.slug==="solo-con-cedula",_=String(a.external_url||"").trim();if(l&&!_)throw new Error("El contenido Solo con c\xE9dula necesita un enlace para proteger.");const f=Array.isArray(a.tags)?a.tags.map(String).map(T=>T.trim().toLocaleLowerCase("es")).filter(Boolean):[],j=[...new Set([M(n),...f,...s?.slug?[s.slug]:[]])].slice(0,30);if(!j.length)throw new Error("Agrega al menos una etiqueta para enlazar y controlar este contenido.");const g=l?"#":_||"#",P={id:a.id,title:a.title,name:a.title,description:a.description,status:n==="app_modules"?a.status||"activa":a.status||"publicado",visibility:a.visibility||"interna",is_active:a.is_active??!0,is_featured:a.is_featured??!0,image_url:t||void 0,tags:j,category_id:a.category_id||null,requires_identity_unlock:l},W=n==="app_modules"?{...P,url:g,external_url:g,creator_name:a.creator_name||"Juan Esteban P\xE9rez",creator_role:a.creator_role||"Analista de Calidad",creator_credit:`Creado por ${a.creator_name||"Juan Esteban P\xE9rez"} \xB7 ${a.creator_role||"Analista de Calidad"}`}:n==="publications"?{...P,content:a.description,file_url:g,external_url:g,publication_type:"novedad"}:{...P,file_url:g,external_url:g},L=await Le(n,W);if(!L?.id)throw new Error("El registro se guard\xF3 sin un identificador v\xE1lido.");l?await w("save_target",ze(n,L.id,_)):await w("delete_target",{content_type:n,record_id:L.id}),await C(),b(a.id?"Registro actualizado correctamente.":l?"Contenido publicado y protegido con c\xE9dula.":"Nuevo registro publicado correctamente."),N()}catch(t){d(t instanceof Error?t.message:"No fue posible guardar el registro.")}finally{u(!1)}}async function H(e){if(window.confirm(`\xBFEliminar \u201C${y(e)}\u201D? Esta acci\xF3n no se puede deshacer.`)){u(!0),d("");try{e.requires_identity_unlock&&await w("delete_target",{content_type:n,record_id:e.id}),await Pe(n,e.id),await C(),a.id===e.id&&N(),b("Registro eliminado correctamente.")}catch(t){d(t instanceof Error?t.message:"No fue posible eliminar el registro.")}finally{u(!1)}}}const k=U[n];return<div className="admin-workspace">
      <aside className="admin-subnav">
        <span>Tipo de contenido</span>
        {Ae.map(e=><button key={e}type="button"className={n===e?"is-active":""}onClick={()=>J(e)}>
            <span>{U[e].plural}</span>
            <strong>{o[e].length}</strong>
          </button>)}
      </aside>

      <div className="admin-main-column">
        <form id="content-form"className="admin-form-card"onSubmit={Q}>
          <div className="admin-form-card__head">
            <div>
              <span className="eyebrow">{a.id?"Edici\xF3n":"Nuevo registro"}</span>
              <h2>{a.id?`Editar ${k.singular}`:`Crear ${k.singular}`}</h2>
            </div>
            {a.id&&<button type="button"className="secondary-button"onClick={N}>Crear otro</button>}
          </div>
          <div className="form-grid">
            {v||a.image_url?<div className="content-media-preview span-2"><Se src={v||String(a.image_url)}alt="Vista previa del contenido"fit="contain"eager/><span>Se publicará sin recortes ni deformación.</span></div>:null}
            <label className="span-2"><span>Título o nombre</span><input value={String(a.title||"")}onChange={e=>r({...a,title:e.target.value})}required/></label>
            <label><span>Estado</span><input value={String(a.status||"")}onChange={e=>r({...a,status:e.target.value})}/></label>
            <label><span>Visibilidad</span><select value={String(a.visibility||"interna")}onChange={e=>r({...a,visibility:e.target.value})}><option value="interna">Interna</option><option value="publica">Pública</option><option value="restringida">Restringida</option></select></label>
            <label className="span-2"><span>Categoría</span><select value={String(a.category_id||"")}onChange={e=>K(e.target.value)}><option value="">Sin categoría</option>{m.map(e=><option key={e.id}value={e.id}>{e.name}</option>)}</select></label>
            {p?<div className="identity-admin-notice span-2">
                <span><R size={19}/></span>
                <div><strong>Candado por cédula activado</strong><p>El enlace real quedará fuera de las tablas públicas. Para abrirlo, el usuario deberá escribir la cédula configurada en su cuenta.</p></div>
                <Ce size={18}/>
              </div>:null}
            <label className="span-2"><span>Etiquetas de acceso y búsqueda</span><input value={(Array.isArray(a.tags)?a.tags:[]).join(", ")}onChange={e=>r({...a,tags:Ue(e.target.value)})}placeholder="logistica, compras, indicadores..."required/><small>Separa con comas. La categoría elegida también se agrega automáticamente como etiqueta.</small></label>
            <label className="span-2"><span>Descripción</span><textarea rows={5}value={String(a.description||"")}onChange={e=>r({...a,description:e.target.value})}/></label>
            <label className="span-2"><span>{p?"Enlace que quedar\xE1 protegido":"Enlace directo"}</span><input type="url"placeholder="https://..."value={String(a.external_url||"")}onChange={e=>r({...a,external_url:e.target.value})}required={p}/><small>{p?"Este enlace no se enviar\xE1 al navegador hasta validar la c\xE9dula.":"Puedes dejarlo vac\xEDo si el recurso a\xFAn no tiene destino."}</small></label>
            {n==="app_modules"&&<>
                <label><span>Creador</span><input value={String(a.creator_name||"")}onChange={e=>r({...a,creator_name:e.target.value})}/></label>
                <label><span>Cargo del creador</span><input value={String(a.creator_role||"")}onChange={e=>r({...a,creator_role:e.target.value})}/></label>
              </>}
            <label className="span-2 upload-field">
              <Ee size={18}/>
              <span>{i?i.name:"Subir imagen, GIF o video"}</span>
              <input type="file"accept="image/*,video/mp4,video/webm"onChange={e=>h(e.target.files?.[0]||null)}/>
            </label>
          </div>
          {B&&<div className="form-success">{B}</div>}
          {$&&<div className="form-error">{$}</div>}
          <div className="form-actions">
            <button type="submit"className="primary-button"disabled={S}>{S?<Y className="spin"size={18}/>:p?<R size={18}/>:<X size={18}/>}{S?"Guardando...":a.id?"Guardar cambios":p?"Publicar con candado":"Publicar"}</button>
            <button type="button"className="secondary-button"onClick={N}>Limpiar</button>
          </div>
        </form>

        <section className="admin-list-card">
          <div className="admin-list-card__head">
            <div><span className="eyebrow">Biblioteca</span><h2>{k.plural}</h2></div>
            <label className="compact-search"><_e size={18}/><input value={E}onChange={e=>G(e.target.value)}placeholder="Buscar..."/></label>
          </div>
          <div className="admin-record-list">
            {F.length?F.map(e=><article key={e.id}>
                <div className="admin-record-list__monogram">{e.requires_identity_unlock?<R size={18}/>:y(e).slice(0,2).toUpperCase()}</div>
                <div><strong>{y(e)}</strong><p>{A(e)}</p></div>
                <span className="admin-status">{e.requires_identity_unlock?"Con c\xE9dula":String(e.status||"vigente")}</span>
                <div className="admin-record-list__actions">
                  <button type="button"className="icon-button"onClick={()=>void V(e)}aria-label="Editar"><Z size={17}/></button>
                  <button type="button"className="icon-button danger-button"onClick={()=>void H(e)}aria-label="Eliminar"><Ne size={17}/></button>
                </div>
              </article>):<div className="admin-empty">No hay registros para mostrar.</div>}
          </div>
        </section>
      </div>
    </div>}export{Ve as ContentManager};