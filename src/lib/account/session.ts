// Sesión del cliente. El token lo emite WordPress (WP_Session_Tokens) y solo viaja entre servidores:
// el navegador lo guarda en una cookie HttpOnly que JavaScript no puede leer.
import { cookies } from "next/headers";
import { callStore } from "@/lib/checkout/backend";
import type { AccountOrder, Customer } from "@/lib/account/schema";

export const SESSION_COOKIE = "nexopc_session";
/** Marca sin datos que el menú lee para mostrar "Mi cuenta"; no autoriza nada. */
export const ACCOUNT_HINT_COOKIE = "nexopc_cuenta";
export const SESSION_MAX_AGE = 14 * 24 * 60 * 60;

const SESSION_PATTERN = /^\d{1,12}\.[A-Za-z0-9]{20,64}$/;

export const isSessionValue = (value: unknown): value is string => typeof value === "string" && SESSION_PATTERN.test(value);

export async function readSession() {
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  return isSessionValue(value) ? value : null;
}

/** Solo en Route Handlers o Server Functions. */
export async function startSession(session: string, expiresAt?: string) {
  const store = await cookies();
  const expires = expiresAt ? new Date(expiresAt) : null;
  const maxAge = expires && !Number.isNaN(expires.getTime())
    ? Math.max(0, Math.min(SESSION_MAX_AGE, Math.floor((expires.getTime() - Date.now()) / 1000)))
    : SESSION_MAX_AGE;
  const secure = process.env.NODE_ENV === "production";
  store.set(SESSION_COOKIE, session, { httpOnly: true, secure, sameSite: "lax", path: "/", maxAge });
  store.set(ACCOUNT_HINT_COOKIE, "1", { httpOnly: false, secure, sameSite: "lax", path: "/", maxAge });
}

/** Solo en Route Handlers o Server Functions. */
export async function endSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete(ACCOUNT_HINT_COOKIE);
}

export type AccountData<T> = { status: "ok"; data: T } | { status: "expired" } | { status: "error" };

async function fetchAccount<T>(path: string, session: string): Promise<AccountData<T>> {
  try {
    const reply = await callStore(path, { session });
    if (reply?.status === 200 && reply.data) return { status: "ok", data: reply.data as T };
    if (reply?.status === 401) return { status: "expired" };
    console.error("[Cuenta] Respuesta inesperada del backend:", { path, status: reply?.status ?? "sin configuración" });
  } catch (cause) {
    console.error("[Cuenta] Error al conectar con el backend:", cause);
  }
  return { status: "error" };
}

export const loadCustomer = (session: string) => fetchAccount<Customer>("customers/me", session);
export const loadOrders = (session: string) => fetchAccount<AccountOrder[]>("customers/orders", session);
