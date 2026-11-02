// @vitest-environment node
import { describe, expect, it } from "vitest";
import { sanitizeProductHtml } from "./sanitizeHtml";

describe("sanitizeProductHtml", () => {
  it.each([
    "<svg/onload=alert(1)>",
    "<img/src=x/onerror=alert(1)>",
    '<a href="java&#115;cript:alert(1)">x</a>',
    "<a href=javascript:alert(1)>x</a>",
    "<script>alert(1)</script>",
  ])("neutraliza %s", (payload) => {
    const clean = sanitizeProductHtml(payload);
    expect(clean).not.toMatch(/onload|onerror|javascript:|java&#|<script|<svg|<img/i);
  });

  it("conserva el formato de las descripciones", () => {
    expect(sanitizeProductHtml('<p>Ryzen <strong>7</strong></p><ul><li>8 núcleos</li></ul>')).toBe("<p>Ryzen <strong>7</strong></p><ul><li>8 núcleos</li></ul>");
  });

  it("conserva enlaces seguros y añade rel", () => {
    expect(sanitizeProductHtml('<a href="https://nexopc.wrkz.net">Ver</a>')).toBe('<a href="https://nexopc.wrkz.net" rel="noopener noreferrer">Ver</a>');
  });
});
