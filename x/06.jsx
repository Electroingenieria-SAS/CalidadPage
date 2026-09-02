"use client";import{useEffect as ca,useMemo as I,useState as r}from"react";import{Fingerprint as $,KeyRound as _a,LoaderCircle as T,Pencil as Na,Power as Ca,Search as Ea,ShieldAlert as Pa,ShieldCheck as Ma,Trash2 as O,UserPlus2 as G}from"lucide-react";import{invokeUserAdmin as y}from"@/x/0t";import{invokeIdentityAccess as P}from"@/x/0s";const H=[{value:"admin",label:"Administrador"},{value:"editor",label:"Editor"},{value:"calidad",label:"Calidad"},{value:"auditoria",label:"Auditor\xEDa"},{value:"viewer",label:"Consulta"},{value:"super_admin",label:"Superadministrador"}],Sa={viewer:10,auditoria:30,calidad:40,editor:50,admin:80,super_admin:100},K={email:"",password:"",full_name:"",role:"viewer",process_area:"Calidad y Mejoramiento Continuo",document_number:""};function u(p){return Sa[p]??10}function Ba({currentUserId:p,currentUserRole:i}){const[k,Q]=r([]),[e,M]=r(null),[n,m]=r(K),[o,f]=r({full_name:"",role:"viewer",process_area:"",password:""}),[C,E]=r(""),[h,N]=r(null),[S,J]=r(""),[V,R]=r(!0),[b,c]=r(!1),[L,g]=r(!1),[A,s]=r(""),[D,l]=r(""),B=i==="super_admin",F=I(()=>H.filter(a=>a.value!=="super_admin"&&(B||u(a.value)<u(i))),[i,B]);async function w(){R(!0),s("");try{const a=await y("list");Q(a.users||[])}catch(a){s(a instanceof Error?a.message:"No fue posible cargar los usuarios.")}finally{R(!1)}}ca(()=>{const a=window.setTimeout(()=>void w(),0);return()=>window.clearTimeout(a)},[]);const W=I(()=>{const a=S.toLocaleLowerCase("es").trim();return a?k.filter(t=>`${t.full_name} ${t.email} ${t.role} ${t.process_area}`.toLocaleLowerCase("es").includes(a)):k},[S,k]),v=e?.id===p,z=e?u(e.role)<u(i):!1,_=!!(e&&!v&&z),d=!!(e&&(v||z)),U=!!(e&&(i==="super_admin"&&(v||z)||i==="admin"&&z)),X=e&&!_?H.filter(a=>a.value===e.role):F;function Y(a){return i==="super_admin"?a.id===p||u(a.role)<u(i):i==="admin"&&a.id!==p&&u(a.role)<u(i)}async function Z(a){g(!0);try{const t=await P("status",{user_id:a});N(!!t.configured)}catch(t){N(null),s(t instanceof Error?t.message:"No fue posible consultar la c\xE9dula configurada.")}finally{g(!1)}}function aa(a){M(a),f({full_name:a.full_name,role:a.role,process_area:a.process_area,password:""}),E(""),N(null),l(""),s(""),Y(a)&&Z(a.id)}async function ea(a){a.preventDefault(),c(!0),s(""),l("");try{const{document_number:t,...ia}=n,x=await y("create",ia);t.trim()&&x.user?.id&&await P("set_document",{user_id:x.user.id,document_number:t}),m(K),await w(),l(t.trim()?"Usuario creado con c\xE9dula protegida configurada.":"Usuario creado y confirmado correctamente.")}catch(t){s(t instanceof Error?t.message:"No fue posible crear el usuario.")}finally{c(!1)}}async function sa(){if(!(!e||!d)){c(!0),s(""),l("");try{const a=v?{user_id:e.id,full_name:o.full_name,process_area:o.process_area}:{user_id:e.id,full_name:o.full_name,role:o.role,process_area:o.process_area};await y("update",a),await w(),l(v?"Perfil actualizado.":"Perfil y permisos actualizados.")}catch(a){s(a instanceof Error?a.message:"No fue posible actualizar el usuario.")}finally{c(!1)}}}async function ta(){if(!e||!d||o.password.length<12){s("La nueva contrase\xF1a debe tener al menos 12 caracteres.");return}c(!0),s(""),l("");try{await y("set_password",{user_id:e.id,password:o.password}),f({...o,password:""}),l("Contrase\xF1a actualizada correctamente.")}catch(a){s(a instanceof Error?a.message:"No fue posible cambiar la contrase\xF1a.")}finally{c(!1)}}async function oa(){if(!(!e||!U||!C.trim())){g(!0),s(""),l("");try{await P("set_document",{user_id:e.id,document_number:C}),E(""),N(!0),l("C\xE9dula configurada. El n\xFAmero no se guarda en texto plano.")}catch(a){s(a instanceof Error?a.message:"No fue posible configurar la c\xE9dula.")}finally{g(!1)}}}async function la(){if(!(!e||!U||!window.confirm("\xBFRetirar la c\xE9dula configurada para este usuario? Los recursos protegidos dejar\xE1n de abrirse hasta configurar una nueva."))){g(!0),s(""),l("");try{await P("clear_document",{user_id:e.id}),N(!1),E(""),l("C\xE9dula protegida retirada de la cuenta.")}catch(a){s(a instanceof Error?a.message:"No fue posible retirar la c\xE9dula.")}finally{g(!1)}}}async function na(){if(!(!e||!_)){c(!0),s(""),l("");try{await y("toggle",{user_id:e.id,is_active:!e.is_active}),await w(),M({...e,is_active:!e.is_active}),l(e.is_active?"Usuario desactivado.":"Usuario reactivado.")}catch(a){s(a instanceof Error?a.message:"No fue posible cambiar el estado.")}finally{c(!1)}}}async function ra(){if(!(!e||!_||!window.confirm(`\xBFEliminar definitivamente a ${e.full_name||e.email}?`))){c(!0),s(""),l("");try{await y("delete",{user_id:e.id}),M(null),await w(),l("Usuario eliminado definitivamente.")}catch(a){s(a instanceof Error?a.message:"No fue posible eliminar el usuario.")}finally{c(!1)}}}return<div className="users-workspace">
      <form className="admin-form-card user-create-card"onSubmit={ea}>
        <div className="admin-form-card__head"><div><span className="eyebrow">Alta segura</span><h2>Crear usuario</h2></div><G size={26}/></div>
        <div className="form-grid">
          <label className="span-2"><span>Nombre completo</span><input value={n.full_name}onChange={a=>m({...n,full_name:a.target.value})}required/></label>
          <label className="span-2"><span>Correo</span><input type="email"value={n.email}onChange={a=>m({...n,email:a.target.value})}required/></label>
          <label><span>Contraseña inicial</span><input type="password"minLength={12}maxLength={128}value={n.password}onChange={a=>m({...n,password:a.target.value})}placeholder="12+ caracteres"required/></label>
          <label><span>Rol</span><select value={n.role}onChange={a=>m({...n,role:a.target.value})}>{F.map(a=><option key={a.value}value={a.value}>{a.label}</option>)}</select></label>
          <label className="span-2"><span>Área o proceso</span><input value={n.process_area}onChange={a=>m({...n,process_area:a.target.value})}/></label>
          <label className="span-2 identity-user-field"><span>Cédula para contenidos con candado <small>Opcional</small></span><input type="password"inputMode="numeric"autoComplete="off"maxLength={20}value={n.document_number}onChange={a=>m({...n,document_number:a.target.value.replace(/\D/g,"")})}placeholder="Se transforma en una huella protegida"/><small>El número no se almacena en texto plano ni se incluye en el perfil visible.</small></label>
        </div>
        <button type="submit"className="primary-button primary-button--full"disabled={b}>{b?<T className="spin"size={18}/>:<G size={18}/>} Crear usuario</button>
      </form>

      <section className="admin-list-card users-list-card">
        <div className="admin-list-card__head">
          <div><span className="eyebrow">Directorio de acceso</span><h2>Usuarios</h2></div>
          <label className="compact-search"><Ea size={18}/><input value={S}onChange={a=>J(a.target.value)}placeholder="Buscar usuario..."/></label>
        </div>
        {V?<div className="admin-empty"><T className="spin"size={22}/> Cargando usuarios...</div>:<div className="user-table">
            {W.map(a=>{const t=a.id===p||u(a.role)<u(i);return<button key={a.id}type="button"className={e?.id===a.id?"is-selected":""}onClick={()=>aa(a)}>
                  <span className="user-avatar">{(a.full_name||a.email).slice(0,2).toUpperCase()}</span>
                  <span><strong>{a.full_name||"Sin nombre"}</strong><small>{a.email}</small></span>
                  <em>{a.role.replaceAll("_"," ")}</em>
                  <i className={a.is_active?"is-online":""}>{a.is_active?"Activo":"Inactivo"}</i>
                  {t?<Na size={16}/>:<Pa size={16}aria-label="Nivel protegido"/>}
                </button>})}
          </div>}
      </section>

      {e&&<aside className="user-editor">
          <div className="user-editor__head"><div className="user-avatar user-avatar--large">{(e.full_name||e.email).slice(0,2).toUpperCase()}</div><div><strong>{e.full_name}</strong><span>{e.email}</span></div></div>
          {!d&&<small className="user-editor__note">Esta cuenta tiene un nivel igual o superior al tuyo y está protegida contra cambios.</small>}
          <label><span>Nombre completo</span><input value={o.full_name}onChange={a=>f({...o,full_name:a.target.value})}disabled={!d}/></label>
          <label><span>Rol</span><select value={o.role}onChange={a=>f({...o,role:a.target.value})}disabled={!_}>{X.map(a=><option key={a.value}value={a.value}>{a.label}</option>)}</select></label>
          <label><span>Área o proceso</span><input value={o.process_area}onChange={a=>f({...o,process_area:a.target.value})}disabled={!d}/></label>
          <button type="button"className="primary-button primary-button--full"onClick={sa}disabled={b||!d}>Guardar perfil y rol</button>

          {U?<section className="identity-user-panel">
              <div className="identity-user-panel__head">
                <span><$ size={21}/></span>
                <div><strong>Acceso con cédula</strong><small>{L?"Consultando...":h===!0?"C\xE9dula configurada":h===!1?"Sin c\xE9dula configurada":"Estado no consultado"}</small></div>
                {h?<Ma size={19}/>:null}
              </div>
              <label><span>Nueva cédula</span><input type="password"inputMode="numeric"autoComplete="off"maxLength={20}value={C}onChange={a=>E(a.target.value.replace(/\D/g,""))}placeholder="Escribe el número para configurar o reemplazar"/></label>
              <small className="identity-user-panel__note">Solo se conserva una huella HMAC. El número real no puede recuperarse desde la base de datos.</small>
              <button type="button"className="secondary-button user-editor__action"onClick={()=>void oa()}disabled={L||!C.trim()}><$ size={17}/> {h?"Reemplazar c\xE9dula":"Configurar c\xE9dula"}</button>
              {h?<button type="button"className="secondary-button user-editor__action user-editor__action--danger"onClick={()=>void la()}disabled={L}><O size={17}/> Retirar cédula</button>:null}
            </section>:null}

          <hr/>
          <label><span>Nueva contraseña</span><input type="password"minLength={12}maxLength={128}value={o.password}onChange={a=>f({...o,password:a.target.value})}placeholder="Mínimo 12 caracteres"disabled={!d}/></label>
          <button type="button"className="secondary-button user-editor__action"onClick={ta}disabled={b||!d}><_a size={17}/> Cambiar contraseña</button>
          <button type="button"className="secondary-button user-editor__action"onClick={na}disabled={b||!_}><Ca size={17}/> {e.is_active?"Desactivar acceso":"Reactivar acceso"}</button>
          <button type="button"className="secondary-button user-editor__action user-editor__action--danger"onClick={ra}disabled={b||!_}><O size={17}/> Eliminar usuario</button>
          {v&&<small className="user-editor__note">Tu propia cuenta puede actualizar su información y contraseña, pero está protegida contra cambios de rol, desactivación y eliminación.</small>}
        </aside>}

      {(D||A)&&<div className={`admin-toast ${A?"admin-toast--error":""}`}>{A||D}</div>}
    </div>}export{Ba as UserManager};