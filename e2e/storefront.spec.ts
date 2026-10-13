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
  await expect(page.getByRole("heading", { name: /tu próxima pc empieza/i })).toBeVisible();
  await page.getByRole("button", { name: "Estudio" }).click();
  await expect(page.getByRole("heading", { name: /acompaña tus clases/i })).toBeVisible();
  expect(clientErrors).toEqual([]);
});

test("el armador cambia entre modo guiado y avanzado", async ({ page }) => {
  await page.goto("/arma-tu-pc?modo=guiado&uso=study");
  await expect(page.getByRole("heading", { name: /tu pc, construida/i })).toBeVisible();
  await expect(page.getByText("Presupuesto aproximado")).toBeVisible();
  await page.getByRole("button", { name: /sé qué componentes quiero/i }).click();
  await expect(page.getByText("Presupuesto aproximado")).toBeHidden();
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
  await page.goto("/confirmacion?numero=E2E-001&metodo=bacs");
  await expect(page.getByRole("heading", { name: /tu solicitud está en marcha/i })).toBeVisible();
  await expect(page.getByText("#E2E-001")).toBeVisible();
});
