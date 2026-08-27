"use client";

import { FormEvent, useState } from "react";
import { KeyRound, LoaderCircle, LockKeyhole, ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components/shared/BrandMark";

interface LoginGateProps {
  busy: boolean;
  error: string;
  defaultEmail?: string;
  onSubmit: (email: string, password: string) => Promise<void>;
}

export function LoginGate({ busy, error, defaultEmail = "", onSubmit }: LoginGateProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    await onSubmit(email.trim().toLowerCase(), password);
  }

  return (
    <main className="login-gate">
      <div className="login-gate__ambient login-gate__ambient--one" aria-hidden="true" />
      <div className="login-gate__ambient login-gate__ambient--two" aria-hidden="true" />
      <section className="login-gate__shell" aria-labelledby="portal-login-title">
        <div className="login-gate__brand">
          <BrandMark />
          <div>
            <span>CALIDOSO TEAM</span>
            <strong>Repositorio institucional</strong>
          </div>
        </div>

        <div className="login-gate__copy">
          <span className="login-gate__badge"><ShieldCheck size={15} /> Acceso protegido por rol</span>
          <h1 id="portal-login-title">Tu espacio de calidad empieza aquí.</h1>
          <p>Inicia sesión antes de entrar. El portal mostrará únicamente las Apps, documentos, categorías y etiquetas autorizadas para tu rol.</p>
          <div className="login-gate__security">
            <span><LockKeyhole size={17} /><strong>Acceso privado</strong><small>No se carga contenido del repositorio antes de autenticar.</small></span>
            <span><ShieldCheck size={17} /><strong>RLS en Supabase</strong><small>Los permisos se validan también en la base de datos.</small></span>
          </div>
        </div>

        <form className="login-gate__card" onSubmit={submit}>
          <div className="login-gate__card-head">
            <span className="login-gate__icon"><KeyRound size={22} /></span>
            <div><small>IDENTIFICACIÓN</small><strong>Ingresar al portal</strong></div>
          </div>
          <label>
            <span>Correo corporativo</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="username" maxLength={320} placeholder="nombre@empresa.com" />
          </label>
          <label>
            <span>Contraseña</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" minLength={8} maxLength={128} placeholder="••••••••••••" />
          </label>
          {error ? <div className="form-error" role="alert">{error}</div> : null}
          <button type="submit" className="primary-button primary-button--full" disabled={busy}>
            {busy ? <LoaderCircle className="spin" size={18} /> : <KeyRound size={18} />}
            {busy ? "Validando acceso..." : "Entrar de forma segura"}
          </button>
          <small className="login-gate__fineprint">La identidad y el rol se verifican contra Supabase Auth y las políticas RLS del proyecto.</small>
        </form>
      </section>
    </main>
  );
}
