"use client";

import { FormEvent, KeyboardEvent, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Heart, LoaderCircle, MessageCircleHeart, Quote, Star, X } from "lucide-react";
import { Media } from "@/components/shared/Media";
import { submitCompliment } from "@/lib/supabase/repository";
import { formatDate } from "@/lib/utils/format";
import type { Compliment, MascotItem, Profile, TeamMember } from "@/types/portal";

interface TeamCultureSectionProps {
  team: TeamMember[];
  mascot: MascotItem[];
  compliments: Compliment[];
  profile: Profile | null;
  onSubmitted: () => Promise<void>;
}

export function TeamCultureSection({ team, mascot, compliments, profile, onSubmitted }: TeamCultureSectionProps) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [selected, setSelected] = useState<TeamMember | null>(null);
  const [rating, setRating] = useState(5);
  const [sender, setSender] = useState(profile?.full_name || "");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const activeTeam = useMemo(() => [...team]
    .filter((member) => member.is_active !== false)
    .sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999)), [team]);
  const recent = compliments.slice(0, 3);
  const recognitionCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of compliments) {
      if (item.team_member_id) counts.set(item.team_member_id, (counts.get(item.team_member_id) || 0) + 1);
      if (item.team_member_name) {
        const nameKey = item.team_member_name.toLocaleLowerCase("es");
        counts.set(nameKey, (counts.get(nameKey) || 0) + 1);
      }
    }
    return counts;
  }, [compliments]);

  useEffect(() => {
    if (!activeTeam.length) {
      setFocusedIndex(0);
      return;
    }
    setFocusedIndex((current) => Math.min(current, activeTeam.length - 1));
  }, [activeTeam.length]);

  const focusedMember = activeTeam[focusedIndex] || null;
  const focusedRecognitionCount = focusedMember
    ? recognitionCounts.get(focusedMember.id) || recognitionCounts.get(focusedMember.name.toLocaleLowerCase("es")) || 0
    : 0;

  const selectedCompliments = useMemo(() => {
    if (!selected) return [];
    return compliments.filter((item) => item.team_member_id === selected.id || item.team_member_name?.toLocaleLowerCase("es") === selected.name.toLocaleLowerCase("es"));
  }, [compliments, selected]);

  function moveFocus(direction: -1 | 1) {
    if (!activeTeam.length) return;
    setFocusedIndex((current) => (current + direction + activeTeam.length) % activeTeam.length);
  }

  function handleCatalogKeys(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveFocus(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      moveFocus(1);
    }
  }

  function openRecognition(member: TeamMember) {
    setSelected(member);
    setSender(profile?.full_name || "");
    setError("");
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!selected) return;
    setBusy(true);
    setError("");
    try {
      await submitCompliment({
        team_member_id: selected.id,
        team_member_name: selected.name,
        rating,
        message: message.trim(),
        sender_name: sender.trim() || "Anónimo",
        sender_email: profile?.email || null,
        created_by: profile?.id || null,
      });
      setMessage("");
      await onSubmitted();
      setSelected(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No fue posible enviar el reconocimiento.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="home-section culture-section">
      <div className="section-heading section-heading--editorial">
        <span className="section-number">03</span>
        <div><span className="eyebrow"><Heart size={15} /> Cultura de mejora</span><h2>El equipo que hace que todo avance.</h2></div>
        <p>Explora el equipo como un catálogo: selecciona un perfil para conocer a la persona y su aporte.</p>
      </div>

      {focusedMember ? (
        <div className="team-catalog" tabIndex={0} onKeyDown={handleCatalogKeys} aria-label="Catálogo del Dream Team">
          <div className="team-catalog__stage">
            <button type="button" className="team-catalog__nav" onClick={() => moveFocus(-1)} aria-label="Perfil anterior"><ChevronLeft size={22} /></button>

            <article className="team-catalog__focus" key={focusedMember.id}>
              <div className="team-catalog__image">
                <Media src={focusedMember.photo_url} alt={focusedMember.name} eager />
                <span className="team-catalog__index">{String(focusedIndex + 1).padStart(2, "0")} / {String(activeTeam.length).padStart(2, "0")}</span>
              </div>
              <div className="team-catalog__copy">
                <span className="eyebrow">Perfil seleccionado</span>
                <h3>{focusedMember.name}</h3>
                <strong>{focusedMember.role}</strong>
                <p>{focusedMember.bio || "Parte del equipo que impulsa la calidad, el aprendizaje y la mejora continua."}</p>
                <div className="team-catalog__actions">
                  <span><MessageCircleHeart size={15} /> {focusedRecognitionCount} reconocimientos</span>
                  <button type="button" onClick={() => openRecognition(focusedMember)}><Heart size={15} /> Reconocer su trabajo</button>
                </div>
              </div>
            </article>

            <button type="button" className="team-catalog__nav" onClick={() => moveFocus(1)} aria-label="Perfil siguiente"><ChevronRight size={22} /></button>
          </div>

          <div className="team-catalog__rail" role="tablist" aria-label="Seleccionar integrante">
            {activeTeam.map((member, index) => (
              <button
                key={member.id}
                type="button"
                role="tab"
                aria-selected={index === focusedIndex}
                className={`team-catalog__thumb ${index === focusedIndex ? "is-active" : ""}`}
                onClick={() => setFocusedIndex(index)}
              >
                <span className="team-catalog__thumb-media"><Media src={member.photo_url} alt="" /></span>
                <span className="team-catalog__thumb-copy"><small>{String(index + 1).padStart(2, "0")}</small><strong>{member.name}</strong></span>
              </button>
            ))}
          </div>
        </div>
      ) : <div className="admin-empty">El equipo se administra desde Identidad.</div>}

      <div className="culture-grid">
        <aside className="culture-mascot">
          <div className="culture-mascot__media"><Media src={mascot[0]?.media_url || "/assets/placeholders/mascot.svg"} alt={mascot[0]?.name || "Identidad del equipo"} /></div>
          <div className="culture-mascot__copy"><span>Identidad Dream Team</span><strong>{mascot[0]?.name || "Nuestra cultura"}</strong><p>{mascot[0]?.description || "Un espacio para representar la energía del equipo."}</p></div>
          <span className="culture-mascot__stamp">CALIDAD / CULTURA / 2026</span>
        </aside>

        <div className="compliment-wall">
          <div className="compliment-wall__head"><span className="eyebrow">Reconocimientos recientes</span><Quote size={25} /></div>
          {recent.length ? recent.map((item) => (
            <article key={item.id}>
              <div className="compliment-wall__stars">{Array.from({ length: Math.max(1, Math.min(5, item.rating)) }).map((_, index) => <Star key={index} size={13} fill="currentColor" />)}</div>
              <p>“{item.message || "Gran trabajo."}”</p>
              <small>{item.sender_name || "Anónimo"} para <strong>{item.team_member_name || "el equipo"}</strong> · {formatDate(item.created_at)}</small>
            </article>
          )) : <div className="admin-empty">Aún no hay reconocimientos publicados.</div>}
        </div>
      </div>

      {selected ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSelected(null)}>
          <form className="team-modal" onSubmit={submit}>
            <button type="button" className="icon-button team-modal__close" onClick={() => setSelected(null)} aria-label="Cerrar"><X size={18} /></button>
            <div className="team-modal__person"><Media src={selected.photo_url} alt={selected.name} eager /><div><span className="eyebrow">Integrante del equipo</span><h2>{selected.name}</h2><strong>{selected.role}</strong><p>{selected.bio}</p></div></div>
            <div className="team-modal__summary"><article><strong>{selectedCompliments.length}</strong><span>Reconocimientos</span></article><article><strong>{selectedCompliments.length ? (selectedCompliments.reduce((sum, item) => sum + item.rating, 0) / selectedCompliments.length).toFixed(1) : "—"}</strong><span>Calificación media</span></article></div>
            <div className="team-modal__form">
              <h3>Dejar un reconocimiento</h3>
              <label><span>Tu nombre</span><input value={sender} onChange={(event) => setSender(event.target.value)} placeholder="Nombre de quien envía" /></label>
              <label><span>Calificación</span><div className="rating-input">{[1,2,3,4,5].map((value) => <button key={value} type="button" className={value <= rating ? "is-active" : ""} onClick={() => setRating(value)} aria-label={`${value} estrellas`}><Star size={23} fill="currentColor" /></button>)}</div></label>
              <label><span>Mensaje</span><textarea rows={4} maxLength={1000} value={message} onChange={(event) => setMessage(event.target.value)} required placeholder="Escribe un reconocimiento breve..." /></label>
              {error ? <div className="form-error">{error}</div> : null}
              <button type="submit" className="primary-button primary-button--full" disabled={busy}>{busy ? <LoaderCircle className="spin" size={18} /> : <MessageCircleHeart size={18} />} Enviar reconocimiento</button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}
