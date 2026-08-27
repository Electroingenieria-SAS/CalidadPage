"use client";

import { FormEvent, useState } from "react";
import { Fingerprint, LoaderCircle, LockKeyhole, ShieldCheck, X } from "lucide-react";
import { invokeIdentityAccess } from "@/lib/supabase/identity";
import type { ContentRecord, ContentTable } from "@/types/portal";
import { recordTitle } from "@/lib/utils/format";

interface IdentityUnlockDialogProps {
  table: ContentTable;
  record: ContentRecord;
  onClose: () => void;
}

export function IdentityUnlockDialog({ table, record, onClose }: IdentityUnlockDialogProps) {
  const [documentNumber, setDocumentNumber] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function unlock(event: FormEvent) {
    event.preventDefault();
    if (busy || !documentNumber.trim()) return;
    setBusy(true);
    setError("");

    const destination = window.open("about:blank", "_blank");
    try {
      const result = await invokeIdentityAccess("unlock", {
        content_type: table,
        record_id: record.id,
        document_number: documentNumber,
      });
      if (!result.target_url) throw new Error("El recurso no tiene un enlace protegido configurado.");
      if (destination) {
        destination.opener = null;
        destination.location.replace(result.target_url);
      } else {
        window.location.assign(result.target_url);
      }
      setDocumentNumber("");
      onClose();
    } catch (caught) {
      destination?.close();
      setError(caught instanceof Error ? caught.message : "No fue posible desbloquear el recurso.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="identity-unlock" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}>
      <section className="identity-unlock__dialog" role="dialog" aria-modal="true" aria-labelledby="identity-unlock-title">
        <button type="button" className="identity-unlock__close" onClick={onClose} disabled={busy} aria-label="Cerrar"><X size={18} /></button>
        <div className="identity-unlock__lock">
          <span><LockKeyhole size={25} /></span>
          <i aria-hidden="true" />
        </div>
        <span className="identity-unlock__eyebrow"><ShieldCheck size={14} /> CONTENIDO PROTEGIDO</span>
        <h2 id="identity-unlock-title">Verifica tu cédula para continuar</h2>
        <p><strong>{recordTitle(record)}</strong> tiene un nivel adicional de protección. El enlace real permanece oculto hasta que tu identificación coincida con la configurada para tu cuenta.</p>

        <form onSubmit={unlock}>
          <label>
            <span>Número de cédula</span>
            <div className="identity-unlock__input">
              <Fingerprint size={19} />
              <input
                type="password"
                inputMode="numeric"
                autoComplete="off"
                value={documentNumber}
                onChange={(event) => setDocumentNumber(event.target.value.replace(/\D/g, ""))}
                maxLength={20}
                placeholder="Ingresa tu identificación"
                autoFocus
                required
              />
            </div>
          </label>
          {error ? <div className="identity-unlock__error" role="alert">{error}</div> : null}
          <button type="submit" className="identity-unlock__submit" disabled={busy || !documentNumber.trim()}>
            {busy ? <LoaderCircle className="spin" size={18} /> : <LockKeyhole size={18} />}
            <span>{busy ? "Validando identidad..." : "Desbloquear recurso"}</span>
          </button>
        </form>

        <small className="identity-unlock__privacy">El número se usa únicamente para la validación y no se guarda en el navegador. Tras 5 intentos fallidos se aplica un bloqueo temporal de 15 minutos.</small>
      </section>
    </div>
  );
}
