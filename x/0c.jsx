"use client";import{useMemo as f,useState as s}from"react";import{ChevronLeft as H,ChevronRight as U,Heart as D,LoaderCircle as $,MessageCircleHeart as E,Quote as B,Star as I,X as G}from"lucide-react";import{Media as _}from"@/x/0m";import{submitCompliment as Q}from"@/x/0t";import{formatDate as X}from"@/x/0v";function ae({team:h,mascot:i,compliments:r,profile:l,onSubmitted:A}){const[P,N]=s(0),[t,m]=s(null),[y,R]=s(5),[C,w]=s(l?.full_name||""),[M,S]=s(""),[L,k]=s(!1),[T,v]=s(""),o=f(()=>[...h].filter(e=>e.is_active!==!1).sort((e,a)=>(e.sort_order??999)-(a.sort_order??999)),[h]),q=r.slice(0,3),z=f(()=>{const e=new Map;for(const a of r)if(a.team_member_id&&e.set(a.team_member_id,(e.get(a.team_member_id)||0)+1),a.team_member_name){const p=a.team_member_name.toLocaleLowerCase("es");e.set(p,(e.get(p)||0)+1)}return e},[r]),c=o.length?Math.min(P,o.length-1):0,n=o[c]||null,x=n&&(z.get(n.id)||z.get(n.name.toLocaleLowerCase("es")))||0,d=f(()=>t?r.filter(e=>e.team_member_id===t.id||e.team_member_name?.toLocaleLowerCase("es")===t.name.toLocaleLowerCase("es")):[],[r,t]);function u(e){o.length&&N(a=>(Math.min(a,o.length-1)+e+o.length)%o.length)}function j(e){e.key==="ArrowLeft"&&(e.preventDefault(),u(-1)),e.key==="ArrowRight"&&(e.preventDefault(),u(1))}function F(e){m(e),w(l?.full_name||""),v("")}async function K(e){if(e.preventDefault(),!!t){k(!0),v("");try{await Q({team_member_id:t.id,team_member_name:t.name,rating:y,message:M.trim(),sender_name:C.trim()||"An\xF3nimo",sender_email:l?.email||null,created_by:l?.id||null}),S(""),await A(),m(null)}catch(a){v(a instanceof Error?a.message:"No fue posible enviar el reconocimiento.")}finally{k(!1)}}}return<section className="home-section culture-section">
      <div className="section-heading section-heading--editorial">
        <span className="section-number">03</span>
        <div><span className="eyebrow"><D size={15}/> Cultura de mejora</span><h2>El equipo que hace que todo avance.</h2></div>
        <p>Explora el equipo como un catálogo: selecciona un perfil para conocer a la persona y su aporte.</p>
      </div>

      {n?<div className="team-catalog"tabIndex={0}onKeyDown={j}aria-label="Catálogo del Dream Team">
          <div className="team-catalog__stage">
            <button type="button"className="team-catalog__nav"onClick={()=>u(-1)}aria-label="Perfil anterior"><H size={22}/></button>

            <article className="team-catalog__focus"key={n.id}>
              <div className="team-catalog__image">
                <_ src={n.photo_url}alt={n.name}eager/>
                <span className="team-catalog__index">{String(c+1).padStart(2,"0")} / {String(o.length).padStart(2,"0")}</span>
              </div>
              <div className="team-catalog__copy">
                <span className="eyebrow">Perfil seleccionado</span>
                <h3>{n.name}</h3>
                <strong>{n.role}</strong>
                <p>{n.bio||"Parte del equipo que impulsa la calidad, el aprendizaje y la mejora continua."}</p>
                <div className="team-catalog__actions">
                  <span><E size={15}/> {x} reconocimientos</span>
                  <button type="button"onClick={()=>F(n)}><D size={15}/> Reconocer su trabajo</button>
                </div>
              </div>
            </article>

            <button type="button"className="team-catalog__nav"onClick={()=>u(1)}aria-label="Perfil siguiente"><U size={22}/></button>
          </div>

          <div className="team-catalog__rail"role="tablist"aria-label="Seleccionar integrante">
            {o.map((e,a)=><button key={e.id}type="button"role="tab"aria-selected={a===c}className={`team-catalog__thumb ${a===c?"is-active":""}`}onClick={()=>N(a)}>
                <span className="team-catalog__thumb-media"><_ src={e.photo_url}alt=""/></span>
                <span className="team-catalog__thumb-copy"><small>{String(a+1).padStart(2,"0")}</small><strong>{e.name}</strong></span>
              </button>)}
          </div>
        </div>:<div className="admin-empty">El equipo se administra desde Identidad.</div>}

      <div className="culture-grid">
        <aside className="culture-mascot">
          <div className="culture-mascot__media"><_ src={i[0]?.media_url||"/assets/placeholders/mascot.svg"}alt={i[0]?.name||"Identidad del equipo"}/></div>
          <div className="culture-mascot__copy"><span>Identidad Dream Team</span><strong>{i[0]?.name||"Nuestra cultura"}</strong><p>{i[0]?.description||"Un espacio para representar la energ\xEDa del equipo."}</p></div>
          <span className="culture-mascot__stamp">CALIDAD / CULTURA / 2026</span>
        </aside>

        <div className="compliment-wall">
          <div className="compliment-wall__head"><span className="eyebrow">Reconocimientos recientes</span><B size={25}/></div>
          {q.length?q.map(e=><article key={e.id}>
              <div className="compliment-wall__stars">{Array.from({length:Math.max(1,Math.min(5,e.rating))}).map((a,p)=><I key={p}size={13}fill="currentColor"/>)}</div>
              <p>“{e.message||"Gran trabajo."}”</p>
              <small>{e.sender_name||"An\xF3nimo"} para <strong>{e.team_member_name||"el equipo"}</strong> · {X(e.created_at)}</small>
            </article>):<div className="admin-empty">Aún no hay reconocimientos publicados.</div>}
        </div>
      </div>

      {t?<div className="modal-backdrop"role="presentation"onMouseDown={e=>e.target===e.currentTarget&&m(null)}>
          <form className="team-modal"onSubmit={K}>
            <button type="button"className="icon-button team-modal__close"onClick={()=>m(null)}aria-label="Cerrar"><G size={18}/></button>
            <div className="team-modal__person"><_ src={t.photo_url}alt={t.name}eager/><div><span className="eyebrow">Integrante del equipo</span><h2>{t.name}</h2><strong>{t.role}</strong><p>{t.bio}</p></div></div>
            <div className="team-modal__summary"><article><strong>{d.length}</strong><span>Reconocimientos</span></article><article><strong>{d.length?(d.reduce((e,a)=>e+a.rating,0)/d.length).toFixed(1):"\u2014"}</strong><span>Calificación media</span></article></div>
            <div className="team-modal__form">
              <h3>Dejar un reconocimiento</h3>
              <label><span>Tu nombre</span><input value={C}onChange={e=>w(e.target.value)}placeholder="Nombre de quien envía"/></label>
              <label><span>Calificación</span><div className="rating-input">{[1,2,3,4,5].map(e=><button key={e}type="button"className={e<=y?"is-active":""}onClick={()=>R(e)}aria-label={`${e} estrellas`}><I size={23}fill="currentColor"/></button>)}</div></label>
              <label><span>Mensaje</span><textarea rows={4}maxLength={1e3}value={M}onChange={e=>S(e.target.value)}required placeholder="Escribe un reconocimiento breve..."/></label>
              {T?<div className="form-error">{T}</div>:null}
              <button type="submit"className="primary-button primary-button--full"disabled={L}>{L?<$ className="spin"size={18}/>:<E size={18}/>} Enviar reconocimiento</button>
            </div>
          </form>
        </div>:null}
    </section>}export{ae as TeamCultureSection};