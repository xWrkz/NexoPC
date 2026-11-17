"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Eye, EyeOff, LoaderCircle, LogIn } from "lucide-react";
import type { LoginResponse } from "@/lib/account/schema";

type Props = { next: string; expired?: boolean };

export default function LoginForm({ next, expired = false }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const cleanup = useRef<Promise<unknown>>(Promise.resolve());

  // Sesión vencida o revocada: borra las cookies viejas para que el menú no muestre "Mi cuenta".
  useEffect(() => {
    if (expired) cleanup.current = fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
  }, [expired]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    setErrors({});
    setLoading(true);
    let leaving = false;
    try {
      await cleanup.current; // que la limpieza no borre la sesión nueva
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const data = (await response.json()) as LoginResponse;
      if (!response.ok || !data.ok) {
        setMessage((!data.ok && data.message) || "No pudimos iniciar sesión. Inténtalo nuevamente.");
        if (!data.ok) setErrors(data.errors ?? {});
        return;
      }
      leaving = true;
      router.replace(next);
      router.refresh();
    } catch {
      setMessage("No pudimos conectarnos con el servidor. Inténtalo nuevamente.");
    } finally {
      if (!leaving) setLoading(false);
    }
  };

  const registerHref = next === "/cuenta" ? "/registro" : `/registro?siguiente=${encodeURIComponent(next)}`;

  return <form onSubmit={submit} className="auth-card" noValidate>
    {expired ? <div className="commerce-note mb-5" role="status"><AlertCircle size={17}/>Tu sesión expiró. Vuelve a ingresar para continuar.</div> : null}
    <div className="grid gap-4">
      <label className="checkout-field" htmlFor="email">
        <span>Correo electrónico<em aria-hidden="true">*</em></span>
        <input id="email" name="email" type="email" required autoComplete="email" inputMode="email" maxLength={120} placeholder="tucorreo@ejemplo.com" value={email} onChange={(event) => setEmail(event.target.value)} className={`field ${errors.email ? "border-rose-400" : ""}`} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined}/>
        {errors.email?.[0] ? <small id="email-error" role="alert">{errors.email[0]}</small> : null}
      </label>
      <label className="checkout-field" htmlFor="password">
        <span>Contraseña<em aria-hidden="true">*</em></span>
        <span className="relative block">
          <input id="password" name="password" required type={showPassword ? "text" : "password"} autoComplete="current-password" maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} className={`field pr-11 ${errors.password ? "border-rose-400" : ""}`} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "password-error" : undefined}/>
          <button type="button" onClick={() => setShowPassword((value) => !value)} className="focus-ring absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-slate-400 hover:text-white" aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button>
        </span>
        {errors.password?.[0] ? <small id="password-error" role="alert">{errors.password[0]}</small> : null}
      </label>
    </div>
    {message ? <div className="commerce-warning" role="alert"><AlertCircle size={17}/>{message}</div> : null}
    <button type="submit" disabled={loading} className="btn-primary focus-ring mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60">{loading ? <><LoaderCircle className="animate-spin" size={18}/>Ingresando…</> : <><LogIn size={18}/>Ingresar</>}</button>
    <p className="mt-4 text-center text-xs leading-5 text-slate-500">¿Olvidaste tu contraseña? Escríbenos a contacto.nexopc@gmail.com y te ayudamos a recuperarla.</p>
    <p className="mt-5 border-t border-white/8 pt-5 text-center text-sm text-slate-400">¿Aún no tienes cuenta? <Link href={registerHref} className="font-bold text-white underline underline-offset-4 hover:text-orange-300">Créala aquí</Link></p>
  </form>;
}
