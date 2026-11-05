import { z } from "zod";

const name = (label: string) =>
  z
    .string()
    .trim()
    .min(2, `Ingresa tus ${label}.`)
    .max(60, `Tus ${label} son demasiado largos.`)
    .regex(/^[\p{L}'’ .-]+$/u, `Usa solo letras en tus ${label}.`);

/** Celular peruano: 9 dígitos que empiezan en 9, con o sin +51 y espacios. */
export const normalizePhone = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return digits.length === 11 && digits.startsWith("51") ? digits.slice(2) : digits;
};

export const registerSchema = z.object({
  firstName: name("nombres"),
  lastName: name("apellidos"),
  email: z.string().trim().toLowerCase().max(120, "El correo es demasiado largo.").email("Ingresa un correo válido."),
  phone: z
    .string()
    .trim()
    .transform(normalizePhone)
    .pipe(z.string().regex(/^9\d{8}$/, "Ingresa un celular de 9 dígitos que empiece con 9.")),
  dni: z.string().trim().regex(/^\d{8}$/, "El DNI debe tener 8 dígitos."),
  password: z
    .string()
    .min(8, "Usa al menos 8 caracteres.")
    .max(128, "La contraseña es demasiado larga.")
    .regex(/\p{L}/u, "Incluye al menos una letra.")
    .regex(/\d/, "Incluye al menos un número."),
  acceptTerms: z.literal(true, { error: "Debes aceptar los términos y la política de privacidad." }),
});

export type RegisterRequest = z.input<typeof registerSchema>;
export type RegisterResponse =
  | { ok: true; message: string }
  | { ok: false; message: string; errors?: Record<string, string[]> };
