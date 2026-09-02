"use client";import{useState as d}from"react";import{LogIn as N,LogOut as P,Menu as _,Settings2 as R,UserRound as C,X as S}from"lucide-react";import{NAV_ITEMS as z}from"@/x/0p";import{BrandMark as M}from"@/x/0k";function O({route:o,profile:e,allowedRoutes:s,onNavigate:l,onLogin:r,onLogout:u}){const[c,i]=d(!1),b=e?.is_active!==!1&&["super_admin","admin","editor"].includes(e?.role||"");function a(t){l(t),i(!1)}const n=["inicio","apps","documentos","noticias","auditorias","publicaciones"].includes(o);return<header className={`site-header ${n?"site-header--floating":""} ${o==="inicio"?"site-header--home":n?"site-header--module":""}`}>
      <button type="button"className="site-header__brand"onClick={()=>a("inicio")}aria-label="Ir al inicio">
        <M compact/>
      </button>

      <nav className={`site-nav ${c?"site-nav--open":""}`}aria-label="Navegación principal">
        <div className="site-nav__mobile-head">
          <span>Navegación</span>
          <button type="button"className="icon-button"onClick={()=>i(!1)}aria-label="Cerrar menú"><S size={19}/></button>
        </div>
        {z.filter(t=>s.includes(t.route)).map(t=><button key={t.route}type="button"className={o===t.route?"is-active":""}onClick={()=>a(t.route)}>
            {t.label}
          </button>)}
      </nav>

      <div className="site-header__actions">
        {b&&<button type="button"className="icon-button"onClick={()=>a("admin")}aria-label="Abrir administración"title="Administración">
            <R size={19}/>
          </button>}
        {e&&<button type="button"className="profile-pill"onClick={()=>a("perfil")}>
            <C size={17}/>
            <span>{e.full_name?.split(" ")[0]||"Mi perfil"}</span>
          </button>}
        <button type="button"className="auth-button"onClick={e?u:r}>
          {e?<P size={17}/>:<N size={17}/>}
          <span>{e?"Salir":"Ingresar"}</span>
        </button>
        <button type="button"className="icon-button site-header__menu"onClick={()=>i(!0)}aria-label="Abrir menú"><_ size={20}/></button>
      </div>
    </header>}export{O as SiteHeader};