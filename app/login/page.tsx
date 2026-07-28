"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [signupDone, setSignupDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const supabase = createClient();

    if (mode === "login") {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
      } else {
        router.push("/");
        router.refresh();
      }
    } else {
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        setError(signUpError.message);
      } else {
        setSignupDone(true);
      }
    }
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-sm flex flex-col gap-5">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-wide text-muted">Plataforma TM</p>
          <h1 className="text-xl font-extrabold mt-1">Meta Ads + Contenido CM</h1>
        </div>

        {signupDone && mode === "signup" ? (
          <p className="text-sm text-soft">
            Cuenta creada. Revisá tu email para confirmar y después iniciá sesión.
          </p>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-1.5 text-xs font-bold text-soft">
              Email
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border border-line bg-panel-2 px-3 py-2 text-sm text-text font-sans font-normal outline-none focus:border-line-2"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-bold text-soft">
              Contraseña
              <span className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-line bg-panel-2 px-3 py-2 pr-10 text-sm text-text font-sans font-normal outline-none focus:border-line-2"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-3 text-muted hover:text-soft cursor-pointer"
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </span>
            </label>

            {error && <p className="text-xs font-bold text-coral">{error}</p>}

            <Button type="submit" variant="primary" disabled={submitting} className="w-full justify-center">
              {submitting ? "Un momento…" : mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
            </Button>
          </form>
        )}

        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setSignupDone(false);
          }}
          className="text-xs font-bold text-cyan self-center hover:underline cursor-pointer"
        >
          {mode === "login" ? "¿No tenés cuenta? Creá una" : "¿Ya tenés cuenta? Iniciá sesión"}
        </button>
      </Card>
    </div>
  );
}
