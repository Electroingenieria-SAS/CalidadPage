"use client";import{useState as o}from"react";import{ArrowRight as L,CheckCircle2 as S,Eye as E,EyeOff as A,KeyRound as P,LoaderCircle as O,LockKeyhole as R,ShieldCheck as _,Sparkles as D}from"lucide-react";import{BrandMark as I}from"@/components/shared/BrandMark";import{InstitutionalDock as M}from"@/components/shared/InstitutionalDock";function V({busy:a,error:r,defaultEmail:v="",onSubmit:b}){const[i,N]=o(v),[n,h]=o(""),[s,f]=o(!1);async function C(e){e.preventDefault(),!a&&await b(i.trim().toLowerCase(),n)}return<main className="login-gate login-gate--premium">
      <div className="login-premium__noise"aria-hidden="true"/>
      <div className="login-premium__orb login-premium__orb--one"aria-hidden="true"/>
      <div className="login-premium__orb login-premium__orb--two"aria-hidden="true"/>
      <div className="login-premium__grid"aria-hidden="true"/>

      <section className="login-premium"aria-labelledby="portal-login-title">
        <aside className="login-premium__story">
          <div className="login-premium__brand">
            <span className="login-premium__brand-mark"><I/></span>
            <div>
              <small>CALIDOSO TEAM</small>
              <strong>Calidad & Mejora Continua</strong>
            </div>
          </div>

          <div className="login-premium__hero-copy">
            <span className="login-premium__eyebrow"><D size={14}/> Repositorio inteligente de calidad</span>
            <h1 id="portal-login-title">Todo lo que necesitas.<br/><em>Solo para quien debe verlo.</em></h1>
            <p>Apps, documentos, auditorías y conocimiento institucional organizados en una experiencia privada, rápida y personalizada por rol.</p>
          </div>

          <div className="login-premium__trust-row">
            <article>
              <span><_ size={18}/></span>
              <div><strong>Acceso por rol</strong><small>Tu sesión define exactamente qué módulos puedes consultar.</small></div>
            </article>
            <article>
              <span><R size={18}/></span>
              <div><strong>Contenido protegido</strong><small>RLS valida el permiso también en la base de datos.</small></div>
            </article>
          </div>

          <div className="login-premium__footer-line">
            <span><i/> Conexión segura</span>
            <span>© 2026 Juan Esteban Pérez · Electroingeniería S.A.S.</span>
          </div>
        </aside>

        <div className="login-premium__access">
          <div className="login-premium__access-head">
            <span className="login-premium__access-icon"><P size={22}/></span>
            <div>
              <small>ACCESO PRIVADO</small>
              <h2>Bienvenido de nuevo</h2>
              <p>Ingresa tus credenciales corporativas para continuar.</p>
            </div>
          </div>

          <form className="login-premium__form"onSubmit={C}>
            <label className="login-premium__field">
              <span>Correo corporativo</span>
              <div className="login-premium__input-wrap">
                <input type="email"value={i}onChange={e=>N(e.target.value)}required autoComplete="username"maxLength={320}placeholder="nombre@ei.com.co"/>
                {i.includes("@")?<S className="login-premium__valid"size={17}/>:null}
              </div>
            </label>

            <label className="login-premium__field">
              <span>Contraseña</span>
              <div className="login-premium__input-wrap">
                <input type={s?"text":"password"}value={n}onChange={e=>h(e.target.value)}required autoComplete="current-password"minLength={8}maxLength={128}placeholder="Tu contraseña"/>
                <button type="button"className="login-premium__reveal"onClick={()=>f(e=>!e)}aria-label={s?"Ocultar contrase\xF1a":"Mostrar contrase\xF1a"}>
                  {s?<A size={17}/>:<E size={17}/>}
                </button>
              </div>
            </label>

            {r?<div className="login-premium__error form-error"role="alert">{r}</div>:null}

            <button type="submit"className="login-premium__submit"disabled={a}>
              <span>{a?"Validando acceso...":"Entrar al portal"}</span>
              {a?<O className="spin"size={19}/>:<L size={19}/>}
            </button>
          </form>

          <div className="login-premium__assurance">
            <_ size={16}/>
            <span>La identidad, el estado de la cuenta y los permisos se verifican antes de cargar el repositorio.</span>
          </div>
        </div>
      </section>

      <M variant="login"/>
    </main>}export{V as LoginGate};