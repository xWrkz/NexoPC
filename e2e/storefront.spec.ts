import { expect, test } from "@playwright/test";

test("busca por nombre parcial y conserva el filtro en la URL", async ({ page }) => {
  await page.goto("/tienda");
  await expect(page.getByRole("heading", { name: /la pieza correcta/i })).toBeVisible();
  const search = page.getByLabel("Buscar en catálogo");
  await search.fill("tes");
  await expect(page).toHaveURL(/q=tes/, { timeout: 5_000 });
  await expect(page.getByText(/componentes? encontrados?/i)).toBeVisible();
});

test("el catálogo mantiene filtros en escritorio y los abre en móvil", async ({ page }, testInfo) => {
  await page.goto("/tienda");
  if (testInfo.project.name === "mobile") {
    await page.getByRole("button", { name: /filtros/i }).click();
    await expect(page.getByRole("heading", { name: /filtros del catálogo/i })).toBeVisible();
  } else {
    await expect(page.getByRole("heading", { name: "Filtros" })).toBeVisible();
    await expect(page.getByRole("button", { name: /^filtros/i })).toBeHidden();
  }
});

test("busca categorías y etiquetas sin alterar la búsqueda de productos", async ({ page }, testInfo) => {
  await page.goto("/tienda?q=tes");
  if (testInfo.project.name === "mobile") await page.getByRole("button", { name: /filtros/i }).click();
  const filterSearch = page.locator('input[aria-label="Buscar categoría o etiqueta"]:visible');
  await filterSearch.fill("tarjetas graficas");
  await expect(page).toHaveURL(/q=tes/);
  await expect(filterSearch).toHaveValue("tarjetas graficas");
  await filterSearch.fill("categoria-inexistente");
  await expect(page.getByText("Sin coincidencias").last()).toBeVisible();
});

test("el panel móvil conserva su acción principal", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Interacción exclusiva del panel móvil");
  await page.goto("/tienda");
  await page.getByRole("button", { name: /filtros/i }).click();
  await expect(page.getByRole("button", { name: /ver resultados/i })).toBeVisible();
  await page.getByRole("button", { name: /ver resultados/i }).click();
  await expect(page.getByRole("heading", { name: /filtros del catálogo/i })).toBeHidden();
});

test("la home ofrece rutas para públicos diferentes", async ({ page }) => {
  const clientErrors: string[] = [];
  page.on("pageerror", (error) => clientErrors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /tu próxima pc/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /estudiar/i })).toHaveAttribute("href", /uso=study/);
  await expect(page.getByTestId("hero-stage").locator("img")).toHaveCount(8);
  await expect(page.getByRole("list", { name: /compatibilidad/i }).locator("[data-ok='true']")).toHaveCount(6);
  await expect(page.getByRole("link", { name: /armar configuración de estudio/i })).toHaveAttribute("href", /uso=study/);
  expect(clientErrors).toEqual([]);
});

test("la home respeta la preferencia de menos movimiento", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const piece = page.locator(".hero-piece").first();
  await expect(piece).toHaveCSS("opacity", "1", { timeout: 1500 });
  await expect(page.getByRole("list", { name: /compatibilidad/i }).getByText("~210 W")).toBeVisible();
});

test("el registro muestra errores por campo sin crear la cuenta", async ({ page }) => {
  await page.goto("/registro");
  await expect(page.getByRole("heading", { name: "Crea tu cuenta" })).toBeVisible();
  await page.getByLabel("DNI").fill("12ab34");
  await expect(page.getByLabel("DNI")).toHaveValue("1234");
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page.getByText("El DNI debe tener 8 dígitos.")).toBeVisible();
  await expect(page.getByText(/debes aceptar los términos/i)).toBeVisible();
});

test("el armador cambia entre modo guiado y avanzado", async ({ page }) => {
  await page.goto("/arma-tu-pc?modo=guiado&uso=study");
  await expect(page.getByRole("heading", { name: /tu pc, construida/i })).toBeVisible();
  await expect(page.getByText("Presupuesto aproximado")).toBeVisible();
  await page.getByRole("button", { name: /sé qué componentes quiero/i }).click();
  await expect(page.getByText("Presupuesto aproximado")).toBeHidden();
});

test("las páginas principales no se desbordan en horizontal", async ({ page }) => {
  await page.goto("/tienda");
  const product = await page.locator("article.product-card a").first().getAttribute("href");
  for (const path of ["/", "/tienda", "/arma-tu-pc", product ?? "/tienda"]) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, path).toBeLessThanOrEqual(0);
    const clipped = await page.locator("main h1").evaluate((heading) => heading.getBoundingClientRect().right > window.innerWidth);
    expect(clipped, path).toBe(false);
  }
});

test("el checkout protege el flujo sin productos", async ({ page }) => {
  await page.goto("/checkout");
  await expect(page.getByText(/no hay productos por confirmar/i)).toBeVisible();
});

test("recorre inicio, catálogo, detalle, carrito, checkout y confirmación", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /ver toda la tienda/i }).click();
  const firstProduct = page.locator("article.product-card a").first();
  await expect(firstProduct).toBeVisible();
  await firstProduct.click();
  await expect(page.locator("h1")).toBeVisible();

  await page.evaluate(() => localStorage.setItem("nexopc-cart", JSON.stringify({ state: { items: [{ id: "e2e-item", productId: 1, name: "Componente de prueba", price: 499, quantity: 1, category: "Procesadores" }] }, version: 0 })));
  await page.goto("/carrito");
  await expect(page.getByRole("heading", { name: "Tu carrito" })).toBeVisible();
  await page.getByRole("link", { name: /continuar con mis datos/i }).click();
  await expect(page.getByRole("heading", { name: /confirma tu pedido/i })).toBeVisible();
  await expect(page.getByLabel("Nombres*")).toBeVisible();
  await page.goto("/confirmacion?numero=1001&metodo=bacs");
  await expect(page.getByRole("heading", { name: /tu solicitud está en marcha/i })).toBeVisible();
  await expect(page.getByText("#1001")).toBeVisible();
});
