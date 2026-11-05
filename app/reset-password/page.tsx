"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { createRecoveryClient } from "@/lib/supabase/recovery";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type Status = "checking" | "ready" | "invalid" | "done";

const MIN_LENGTH = 8;

const inputClass =
  "w-full rounded-xl border border-line bg-panel-2 px-3 py-2 text-sm text-text font-sans font-normal outline-none focus:border-line-2";

function saveErrorMessage(code: string | undefined, message: string) {
  if (code === "same_password") return "La contraseña nueva tiene que ser distinta de la actual.";
  if (code === "weak_password") return "Esa contraseña es muy débil. Probá con una más larga.";
  if (code === "session_expired" || code === "session_not_found") {
    return "El link venció. Pedí uno nuevo desde el inicio de sesión.";
  }
  return `No se pudo guardar la contraseña: ${message}`;
}

export default function ResetPasswordPage() {
  const clientRef = useRef<ReturnType<typeof createRecoveryClient> | null>(null);
  const [status, setStatus] = useState<Status>("checking");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    async function openRecoverySession() {
      const params = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const client = createRecoveryClient();

      const { data, error: sessionError } =
        accessToken && refreshToken && params.get("type") === "recovery"
          ? await client.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
          : { data: null, error: new Error("missing recovery token") };

      if (!active) return;
      if (sessionError || !data?.user) {
        setStatus("invalid");
        return;
      }

      clientRef.current = client;
      setEmail(data.user.email ?? "");
      setStatus("ready");
      // The tokens should not stay in the address bar or browser history.
      window.history.replaceState(null, "", window.location.pathname);
    }

    void openRecoverySession();
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmation) {
      setError("Las dos contraseñas no coinciden.");
      return;
    }
    const client = clientRef.current;
    if (!client) return;

    setSubmitting(true);
    const { error: updateError } = await client.auth.updateUser({ password });
    setSubmitting(false);

    if (updateError) {
      setError(saveErrorMessage(updateError.code, updateError.message));
      return;
    }
    await client.auth.signOut({ scope: "local" });
    setStatus("done");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-sm flex flex-col gap-5">
        <div>
          <p className="text-[12px] font-bold text-muted">Plataforma TM</p>
          <h1 className="text-xl font-extrabold mt-1">
            {status === "done"
              ? "Contraseña guardada"
              : status === "invalid"
                ? "El link no sirve"
                : "Nueva contraseña"}
          </h1>
        </div>

        {status === "checking" && <p className="text-sm text-soft">Revisando el link…</p>}

        {status === "invalid" && (
          <>
            <p className="text-sm text-soft">
              Venció o ya se usó. Pedí uno nuevo desde «¿Olvidaste tu contraseña?».
            </p>
            <Link href="/login" className="text-xs font-bold text-cyan self-center hover:underline">
              Volver a iniciar sesión
            </Link>
          </>
        )}

        {status === "done" && (
          <>
            <p className="text-sm text-soft">Ya podés entrar con tu contraseña nueva.</p>
            <Link href="/login" className="text-xs font-bold text-cyan self-center hover:underline">
              Ir a iniciar sesión
            </Link>
          </>
        )}

        {status === "ready" && (
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {email && <p className="text-sm text-soft break-all">{email}</p>}
            <label className="flex flex-col gap-1.5 text-xs font-bold text-soft">
              Contraseña nueva
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={MIN_LENGTH}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-bold text-soft">
              Repetila
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={MIN_LENGTH}
                autoComplete="new-password"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="flex items-center gap-2 text-xs font-bold text-soft cursor-pointer">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
              />
              Mostrar contraseña
            </label>

            {error && (
              <p role="alert" className="text-xs font-bold text-coral">
                {error}
              </p>
            )}

            <Button type="submit" variant="primary" disabled={submitting} className="w-full justify-center">
              {submitting ? "Guardando…" : "Guardar contraseña"}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
