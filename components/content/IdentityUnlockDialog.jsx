"use client";import{useState as r}from"react";import{Fingerprint as C,LoaderCircle as D,LockKeyhole as _,ShieldCheck as E,X as I}from"lucide-react";import{invokeIdentityAccess as T}from"@/lib/supabase/identity";import{recordTitle as z}from"@/lib/utils/format";function R({table:v,record:l,onClose:i}){const[a,c]=r(""),[e,s]=r(!1),[u,d]=r("");async function N(t){if(t.preventDefault(),e||!a.trim())return;s(!0),d("");const o=window.open("about:blank","_blank");try{const n=await T("unlock",{content_type:v,record_id:l.id,document_number:a});if(!n.target_url)throw new Error("El recurso no tiene un enlace protegido configurado.");o?(o.opener=null,o.location.replace(n.target_url)):window.location.assign(n.target_url),c(""),i()}catch(n){o?.close(),d(n instanceof Error?n.message:"No fue posible desbloquear el recurso.")}finally{s(!1)}}return<div className="identity-unlock"role="presentation"onMouseDown={t=>{t.target===t.currentTarget&&!e&&i()}}>
      <section className="identity-unlock__dialog"role="dialog"aria-modal="true"aria-labelledby="identity-unlock-title">
        <button type="button"className="identity-unlock__close"onClick={i}disabled={e}aria-label="Cerrar"><I size={18}/></button>
        <div className="identity-unlock__lock">
          <span><_ size={25}/></span>
          <i aria-hidden="true"/>
        </div>
        <span className="identity-unlock__eyebrow"><E size={14}/> CONTENIDO PROTEGIDO</span>
        <h2 id="identity-unlock-title">Verifica tu cédula para continuar</h2>
        <p><strong>{z(l)}</strong> tiene un nivel adicional de protección. El enlace real permanece oculto hasta que tu identificación coincida con la configurada para tu cuenta.</p>

        <form onSubmit={N}>
          <label>
            <span>Número de cédula</span>
            <div className="identity-unlock__input">
              <C size={19}/>
              <input type="password"inputMode="numeric"autoComplete="off"value={a}onChange={t=>c(t.target.value.replace(/\D/g,""))}maxLength={20}placeholder="Ingresa tu identificación"autoFocus required/>
            </div>
          </label>
          {u?<div className="identity-unlock__error"role="alert">{u}</div>:null}
          <button type="submit"className="identity-unlock__submit"disabled={e||!a.trim()}>
            {e?<D className="spin"size={18}/>:<_ size={18}/>}
            <span>{e?"Validando identidad...":"Desbloquear recurso"}</span>
          </button>
        </form>

        <small className="identity-unlock__privacy">El número se usa únicamente para la validación y no se guarda en el navegador. Tras 5 intentos fallidos se aplica un bloqueo temporal de 15 minutos.</small>
      </section>
    </div>}export{R as IdentityUnlockDialog};