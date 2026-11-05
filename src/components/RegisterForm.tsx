"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { AlertCircle, CheckCircle2, Eye, EyeOff, LoaderCircle, UserPlus } from "lucide-react";
import type { RegisterResponse } from "@/lib/account/schema";

type Form = { firstName: string; lastName: string; email: string; phone: string; dni: string; password: string };
type Field = keyof Form;

const initial: Form = { firstName: "", lastName: "", email: "", phone: "", dni: "", password: "" };

const fields: Record<Field, { label: string; type: string; autoComplete: string; inputMode?: "numeric" | "tel" | "email"; maxLength?: number; placeholder?: string; hint?: string }> = {
  firstName: { label: "Nombres", type: "text", autoComplete: "given-name", maxLength: 60 },
  lastName: { label: "Apellidos", type: "text", autoComplete: "family-name", maxLength: 60 },
  email: { label: "Correo electrónico", type: "email", autoComplete: "email", inputMode: "email", maxLength: 120, placeholder: "tucorreo@ejemplo.com" },
  phone: { label: "Celular", type: "tel", autoComplete: "tel-national", inputMode: "tel", maxLength: 16, placeholder: "987 654 321" },
  dni: { label: "DNI", type: "text", autoComplete: "off", inputMode: "numeric", maxLength: 8, placeholder: "8 dígitos" },
  password: { label: "Contraseña", type: "password", autoComplete: "new-password", maxLength: 128, hint: "Mínimo 8 caracteres, con letras y números." },
};

export default function RegisterForm() {
  const [form, setForm] = useState(initial);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [website, setWebsite] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [done, setDone] = useState(false);

  const clearError = (key: string) => {
    if (!errors[key]) return;
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const update = (key: Field, value: string) => {
    setForm((current) => ({ ...current, [key]: key === "dni" ? value.replace(/\D/g, "").slice(0, 8) : value }));
    clearError(key);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    setErrors({});
    setLoading(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, acceptTerms, website }),
      });
      const data = (await response.json()) as RegisterResponse;
      if (!response.ok || !data.ok) {
        setMessage(data.message || "No pudimos crear tu cuenta. Revisa los datos e inténtalo de nuevo.");
        if (!data.ok) setErrors(data.errors ?? {});
        return;
      }
      setDone(true);
    } catch {
      setMessage("No pudimos conectarnos con el servidor. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return <div className="auth-card text-center" role="status">
      <CheckCircle2 className="mx-auto text-emerald-400" size={40}/>
      <h2 className="font-display mt-4 text-2xl font-bold">¡Listo, {form.firstName.trim().split(" ")[0]}!</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">Tu cuenta quedó registrada con {form.email.trim().toLowerCase()}. Ya puedes seguir explorando la tienda.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3"><Link href="/tienda" className="btn-primary focus-ring">Ver componentes</Link><Link href="/arma-tu-pc" className="btn-secondary focus-ring">Arma tu PC</Link></div>
    </div>;
  }

  const input = (key: Field) => {
    const meta = fields[key];
    const errorId = `${key}-error`;
    const hintId = `${key}-hint`;
    const error = errors[key]?.[0];
    const isPassword = key === "password";
    return <label className="checkout-field" htmlFor={key}>
      <span>{meta.label}<em aria-hidden="true">*</em></span>
      <span className="relative block">
        <input id={key} name={key} required type={isPassword && showPassword ? "text" : meta.type} autoComplete={meta.autoComplete} inputMode={meta.inputMode} maxLength={meta.maxLength} placeholder={meta.placeholder} value={form[key]} onChange={(event) => update(key, event.target.value)} className={`field ${isPassword ? "pr-11" : ""} ${error ? "border-rose-400" : ""}`} aria-invalid={Boolean(error)} aria-describedby={[error ? errorId : "", meta.hint ? hintId : ""].filter(Boolean).join(" ") || undefined}/>
        {isPassword ? <button type="button" onClick={() => setShowPassword((value) => !value)} className="focus-ring absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-slate-400 hover:text-white" aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button> : null}
      </span>
      {error ? <small id={errorId} role="alert">{error}</small> : meta.hint ? <i id={hintId} className="!ml-0">{meta.hint}</i> : null}
    </label>;
  };

  return <form onSubmit={submit} className="auth-card" noValidate>
    <div className="grid gap-4 sm:grid-cols-2">
      {input("firstName")}
      {input("lastName")}
      <div className="sm:col-span-2">{input("email")}</div>
      {input("phone")}
      {input("dni")}
      <div className="sm:col-span-2">{input("password")}</div>
    </div>
    {/* Campo trampa: oculto para personas y lectores de pantalla. */}
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden"><label>Sitio web<input tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)}/></label></div>
    <label className="auth-consent mt-5" htmlFor="acceptTerms">
      <input id="acceptTerms" type="checkbox" checked={acceptTerms} onChange={(event) => { setAcceptTerms(event.target.checked); clearError("acceptTerms"); }} aria-invalid={Boolean(errors.acceptTerms)}/>
      <span>Acepto los <Link href="/terminos" className="underline underline-offset-2 hover:text-white">términos y condiciones</Link> y la <Link href="/privacidad" className="underline underline-offset-2 hover:text-white">política de privacidad</Link>.</span>
    </label>
    {errors.acceptTerms?.[0] ? <small className="mt-1 block text-xs text-rose-300" role="alert">{errors.acceptTerms[0]}</small> : null}
    {message ? <div className="commerce-warning" role="alert"><AlertCircle size={17}/>{message}</div> : null}
    <button type="submit" disabled={loading} className="btn-primary focus-ring mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60">{loading ? <><LoaderCircle className="animate-spin" size={18}/>Creando cuenta…</> : <><UserPlus size={18}/>Crear cuenta</>}</button>
  </form>;
}
