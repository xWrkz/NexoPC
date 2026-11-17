// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const jar = vi.hoisted(() => ({ current: null as null | ReturnType<typeof import("@/test/cookieJar").createCookieJar> }));
vi.mock("next/headers", async () => {
  const { createCookieJar } = await import("@/test/cookieJar");
  jar.current = createCookieJar();
  return { cookies: jar.current.cookies };
});

const SESSION = `12.${"T".repeat(43)}`;
const logoutRequest = (headers: Record<string, string> = {}) => new Request("http://localhost/api/auth/logout", { method: "POST", headers });

describe("POST /api/auth/logout", () => {
  beforeEach(() => {
    jar.current?.values.clear();
    jar.current?.values.set("nexopc_session", { value: SESSION });
    jar.current?.values.set("nexopc_cuenta", { value: "1" });
    process.env.NEXT_PUBLIC_WORDPRESS_URL = "https://wp.test";
    process.env.NEXOPC_SIGNUP_SECRET = "s".repeat(40);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    delete process.env.NEXT_PUBLIC_WORDPRESS_URL;
    delete process.env.NEXOPC_SIGNUP_SECRET;
  });

  it("revoca la sesión en WordPress y borra las cookies", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const response = await POST(logoutRequest());
    expect(response.status).toBe(200);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://wp.test/wp-json/nexopc/v1/customers/logout");
    expect(init.headers["X-NexoPC-Session"]).toBe(SESSION);
    expect(jar.current!.values.size).toBe(0);
  });

  it("borra las cookies aunque WordPress no responda", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect((await POST(logoutRequest())).status).toBe(200);
    expect(jar.current!.values.size).toBe(0);
  });

  it("rechaza orígenes ajenos sin cerrar la sesión", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect((await POST(logoutRequest({ origin: "https://evil.example" }))).status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(jar.current!.values.has("nexopc_session")).toBe(true);
  });
});
