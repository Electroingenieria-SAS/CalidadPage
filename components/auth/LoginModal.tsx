"use client";

import { FormEvent, useState } from "react";
import { KeyRound, LoaderCircle, LockKeyhole, X } from "lucide-react";

interface LoginModalProps {
  open: boolean;
  busy: boolean;
  error: string;
  defaultEmail: string;
  onClose: () => void;
  onSubmit: (email: string, password: string) => Promise<void>;
}

export function LoginModal({ open, busy, error, defaultEmail, onClose, onSubmit }: LoginModalProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  if (!open) return null;

  async function submit(event: FormEvent) {
    event.preventDefault();
    await onSubmit(email.trim(), password);
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form className="login-card" onSubmit={submit}>
        <button type="button" className="icon-button login-card__close" onClick={onClose} aria-label="Cerrar"><X size={19} /></button>
        <div className="login-card__icon"><LockKeyhole size={25} /></div>
        <span className="eyebrow">Acceso institucional</span>
        <h2>Bienvenido de nuevo</h2>
        <p>Ingresa con tu cuenta del repositorio. Los permisos se leen directamente desde tu perfil.</p>
        <label><span>Correo corporativo</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label>
        <label><span>Contraseña</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" /></label>
        {error && <div className="form-error">{error}</div>}
        <button type="submit" className="primary-button primary-button--full" disabled={busy}>
          {busy ? <LoaderCircle className="spin" size={18} /> : <KeyRound size={18} />} {busy ? "Ingresando..." : "Ingresar"}
        </button>
        <small className="login-card__security">La administración nunca expone credenciales privilegiadas en el navegador.</small>
      </form>
    </div>
  );
}
