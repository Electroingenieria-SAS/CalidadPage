"use client";import{useState as q}from"react";import{Boxes as C,FolderArchive as A,Image as P,LayoutDashboard as x,ShieldCheck as S,SlidersHorizontal as N,Users as _}from"lucide-react";import{AccessControlManager as G}from"@/components/admin/AccessControlManager";import{SecurityCenter as T}from"@/components/admin/SecurityCenter";import{AssetLibrary as F}from"@/components/admin/AssetLibrary";import{ContentManager as H}from"@/components/admin/ContentManager";import{IdentityManager as L}from"@/components/admin/IdentityManager";import{UserManager as B}from"@/components/admin/UserManager";function Y({profile:s,collections:i,settings:I,onRefresh:M,onSettingsChange:R}){const[e,a]=q("overview"),t=s.role==="super_admin",c=s.role==="admin",n=t||c,r=t||c,w=Object.values(i).reduce((o,l)=>o+l.length,0),D=[{key:"overview",label:"Resumen",icon:x},{key:"content",label:"Contenidos",icon:C},...n?[{key:"identity",label:"Identidad",icon:P}]:[],...n?[{key:"assets",label:"Assets",icon:A}]:[],...r?[{key:"users",label:"Usuarios",icon:_}]:[],...t?[{key:"access",label:"Accesos",icon:N},{key:"security",label:"Seguridad",icon:S}]:[]];return<section className="admin-dashboard">
      <header className="admin-dashboard__hero">
        <div>
          <span className="eyebrow"><S size={16}/> Centro de control</span>
          <h1>Administración clara, sin mezclar procesos.</h1>
          <p>Contenido, identidad y usuarios viven en espacios separados para que cada cambio sea fácil de encontrar, revisar y mantener.</p>
        </div>
        <aside><span>Sesión activa</span><strong>{s.full_name||s.email}</strong><small>{s.role.replaceAll("_"," ")}</small></aside>
      </header>

      <nav className="admin-tabs"aria-label="Secciones de administración">
        {D.map(({key:o,label:l,icon:U})=><button key={o}type="button"className={e===o?"is-active":""}onClick={()=>a(o)}><U size={18}/>{l}</button>)}
      </nav>

      {e==="overview"&&<div className="admin-overview">
          <div className="admin-kpis">
            <article><span>Contenido total</span><strong>{w}</strong><small>Registros publicados</small></article>
            <article><span>Apps</span><strong>{i.app_modules.length}</strong><small>Herramientas disponibles</small></article>
            <article><span>Documentos</span><strong>{i.documents.length}</strong><small>Recursos documentales</small></article>
            <article><span>Rol actual</span><strong className="admin-kpis__role">{s.role.replaceAll("_"," ")}</strong><small>Permisos efectivos</small></article>
          </div>
          <div className="admin-quick-grid">
            <button type="button"onClick={()=>a("content")}><C size={25}/><span><strong>Gestionar contenidos</strong><small>Crear, editar, publicar o eliminar Apps y recursos.</small></span></button>
            {n&&<button type="button"onClick={()=>a("identity")}><P size={25}/><span><strong>Editar la experiencia</strong><small>Portada, equipo, mascota y paneles visuales.</small></span></button>}
            {n&&<button type="button"onClick={()=>a("assets")}><A size={25}/><span><strong>Consultar assets</strong><small>GIF, videos, imágenes, audio y proporciones recomendadas.</small></span></button>}
            {r&&<button type="button"onClick={()=>a("users")}><_ size={25}/><span><strong>Administrar usuarios</strong><small>Gestiona únicamente cuentas de nivel inferior al tuyo.</small></span></button>}
            {t&&<button type="button"onClick={()=>a("access")}><N size={25}/><span><strong>Matriz de accesos</strong><small>Define Apps, documentos, categorías y etiquetas visibles por rol.</small></span></button>}
          </div>
        </div>}
      {e==="content"&&<H collections={i}onRefresh={M}/>}
      {e==="identity"&&n&&<L settings={I}onChange={R}/>}
      {e==="assets"&&n&&<F/>}
      {e==="users"&&r&&<B currentUserId={s.id}currentUserRole={s.role}/>}
      {e==="access"&&t&&<G/>}
      {e==="security"&&t&&<T/>}
    </section>}export{Y as AdminDashboard};