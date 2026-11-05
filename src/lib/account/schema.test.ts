import { describe, expect, it } from "vitest";
import { registerSchema } from "./schema";

const valid = {
  firstName: "María José",
  lastName: "Ñique Ruiz",
  email: "Maria@Example.com ",
  phone: "+51 987 654 321",
  dni: "12345678",
  password: "clave1234",
  acceptTerms: true,
};

describe("registerSchema", () => {
  it("acepta datos válidos y normaliza correo y celular", () => {
    const parsed = registerSchema.parse(valid);
    expect(parsed.email).toBe("maria@example.com");
    expect(parsed.phone).toBe("987654321");
  });

  it.each([
    ["dni", "1234567"],
    ["dni", "1234567a"],
    ["phone", "812345678"],
    ["phone", "98765432"],
    ["firstName", "M"],
    ["lastName", "Ruiz123"],
    ["email", "no-es-correo"],
    ["password", "corta1"],
    ["password", "solamenteletras"],
    ["password", "1234567890"],
  ])("rechaza %s inválido (%s)", (field, value) => {
    const result = registerSchema.safeParse({ ...valid, [field]: value });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path[0]).toBe(field);
  });

  it("exige aceptar los términos", () => {
    expect(registerSchema.safeParse({ ...valid, acceptTerms: false }).success).toBe(false);
  });
});
