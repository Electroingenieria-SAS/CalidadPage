"use client";import{useState as i}from"react";import{KeyRound as C,LoaderCircle as N,LockKeyhole as L,X as _}from"lucide-react";function M({open:s,busy:a,error:o,defaultEmail:l,onClose:n,onSubmit:u}){const[r,c]=i(l),[t,d]=i("");if(!s)return null;async function m(e){e.preventDefault(),await u(r.trim(),t)}return<div className="modal-backdrop"role="presentation"onMouseDown={e=>e.target===e.currentTarget&&n()}>
      <form className="login-card"onSubmit={m}>
        <button type="button"className="icon-button login-card__close"onClick={n}aria-label="Cerrar"><_ size={19}/></button>
        <div className="login-card__icon"><L size={25}/></div>
        <span className="eyebrow">Acceso institucional</span>
        <h2>Bienvenido de nuevo</h2>
        <p>Ingresa con tu cuenta del repositorio. Los permisos se leen directamente desde tu perfil.</p>
        <label><span>Correo corporativo</span><input type="email"value={r}onChange={e=>c(e.target.value)}required autoComplete="email"/></label>
        <label><span>Contraseña</span><input type="password"value={t}onChange={e=>d(e.target.value)}required autoComplete="current-password"/></label>
        {o&&<div className="form-error">{o}</div>}
        <button type="submit"className="primary-button primary-button--full"disabled={a}>
          {a?<N className="spin"size={18}/>:<C size={18}/>} {a?"Ingresando...":"Ingresar"}
        </button>
        <small className="login-card__security">La administración nunca expone credenciales privilegiadas en el navegador.</small>
      </form>
    </div>}export{M as LoginModal};