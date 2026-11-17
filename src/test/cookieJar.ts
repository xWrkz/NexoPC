// Sustituto de `cookies()` de next/headers para probar Route Handlers fuera de una petición real.
export type CookieOptions = Record<string, unknown>;

export function createCookieJar() {
  const values = new Map<string, { value: string; options?: CookieOptions }>();
  const store = {
    get: (name: string) => (values.has(name) ? { name, value: values.get(name)!.value } : undefined),
    set: (name: string, value: string, options?: CookieOptions) => void values.set(name, { value, options }),
    delete: (name: string) => void values.delete(name),
  };
  return { values, cookies: async () => store };
}
