import { expect, test } from "@playwright/test";

test("busca por nombre parcial y conserva el filtro en la URL", async ({ page }) => {
  await page.goto("/tienda");
  await expect(page.getByRole("heading", { name: /la pieza correcta/i })).toBeVisible();
  const search = page.getByLabel("Buscar en catálogo");
  await search.fill("tes");
  await expect(page).toHaveURL(/q=tes/, { timeout: 5_000 });
  await expect(page.getByText(/resultados? encontrados/i)).toBeVisible();
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
  await expect(page.getByText(/no hay nada por confirmar/i)).toBeVisible();
});
