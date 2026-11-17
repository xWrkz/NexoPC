import { NextResponse } from "next/server";
import { endSession, readSession } from "@/lib/account/session";
import { callStore } from "@/lib/checkout/backend";
import { isForeignOrigin } from "@/lib/http/request";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (isForeignOrigin(request)) return NextResponse.json({ ok: false, message: "Solicitud no válida." }, { status: 403 });

  const session = await readSession();
  if (session) {
    // Revoca el token en WordPress; aunque falle, la cookie se borra igual.
    try {
      await callStore("customers/logout", { method: "POST", session });
    } catch (cause) {
      console.error("[Logout API] No se pudo revocar la sesión:", cause);
    }
  }
  await endSession();
  return NextResponse.json({ ok: true });
}
