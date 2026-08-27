"use client";

import { FormEvent, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    await onSubmit(email.trim().toLowerCase(), password);
  }

  return (
    <main className="login-gate login-gate--premium">
      <div className="login-premium__noise" aria-hidden="true" />
      <div className="login-premium__orb login-premium__orb--one" aria-hidden="true" />
      <div className="login-premium__orb login-premium__orb--two" aria-hidden="true" />
      <div className="login-premium__grid" aria-hidden="true" />

      <section className="login-premium" aria-labelledby="portal-login-title">
        <aside className="login-premium__story">
          <div className="login-premium__brand">
            <span className="login-premium__brand-mark"><BrandMark /></span>
            <div>
              <small>CALIDOSO TEAM</small>
              <strong>Calidad & Mejora Continua</strong>
            </div>
          </div>

          <div className="login-premium__hero-copy">
            <span className="login-premium__eyebrow"><Sparkles size={14} /> Repositorio inteligente de calidad</span>
            <h1 id="portal-login-title">Todo lo que necesitas.<br /><em>Solo para quien debe verlo.</em></h1>
            <p>Apps, documentos, auditorías y conocimiento institucional organizados en una experiencia privada, rápida y personalizada por rol.</p>
          </div>

          <div className="login-premium__trust-row">
            <article>
              <span><ShieldCheck size={18} /></span>
              <div><strong>Acceso por rol</strong><small>Tu sesión define exactamente qué módulos puedes consultar.</small></div>
            </article>
            <article>
              <span><LockKeyhole size={18} /></span>
              <div><strong>Contenido protegido</strong><small>RLS valida el permiso también en la base de datos.</small></div>
            </article>
          </div>

          <div className="login-premium__footer-line">
            <span><i /> Conexión segura</span>
            <span>Electroingeniería S.A.S.</span>
          </div>
        </aside>

        <div className="login-premium__access">
          <div className="login-premium__access-head">
            <span className="login-premium__access-icon"><KeyRound size={22} /></span>
            <div>
              <small>ACCESO PRIVADO</small>
              <h2>Bienvenido de nuevo</h2>
              <p>Ingresa tus credenciales corporativas para continuar.</p>
            </div>
          </div>

          <form className="login-premium__form" onSubmit={submit}>
            <label className="login-premium__field">
              <span>Correo corporativo</span>
              <div className="login-premium__input-wrap">
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="username"
                  maxLength={320}
                  placeholder="nombre@ei.com.co"
                />
                {email.includes("@") ? <CheckCircle2 className="login-premium__valid" size={17} /> : null}
              </div>
            </label>

            <label className="login-premium__field">
              <span>Contraseña</span>
              <div className="login-premium__input-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  autoComplete="current-password"
                  minLength={8}
                  maxLength={128}
                  placeholder="Tu contraseña"
                />
                <button
                  type="button"
                  className="login-premium__reveal"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </label>

            {error ? <div className="login-premium__error form-error" role="alert">{error}</div> : null}

            <button type="submit" className="login-premium__submit" disabled={busy}>
              <span>{busy ? "Validando acceso..." : "Entrar al portal"}</span>
              {busy ? <LoaderCircle className="spin" size={19} /> : <ArrowRight size={19} />}
            </button>
          </form>

          <div className="login-premium__assurance">
            <ShieldCheck size={16} />
            <span>La identidad, el estado de la cuenta y los permisos se verifican antes de cargar el repositorio.</span>
          </div>
        </div>
      </section>
    </main>
  );
}
