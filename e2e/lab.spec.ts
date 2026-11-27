import { expect, test } from "@playwright/test";

const SECTIONS = [
  "Tipografía",
  "Color y estados",
  "Bankroll",
  "Salud del modelo",
  "Stake y fecha",
  "Partidos del día",
  "Navegación",
  "Vacío y carga",
  "Movimiento",
];

test("design lab renders every section, both themes, no overflow", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

  await page.goto("/lab");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Lab");
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(page.getByRole("heading", { name: /Colo-Colo/i, level: 2 })).toBeVisible();
  for (const name of SECTIONS) {
    await expect(page.getByRole("heading", { name, level: 2 })).toBeAttached();
  }

  const width = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(width, "horizontal overflow").toBeLessThanOrEqual(0);

  await page.getByRole("button", { name: "Cambiar tema" }).click();
  await expect(page.locator("html")).toHaveClass(/light/);
  await expect(page.locator("html")).not.toHaveClass(/dark/);

  expect(errors).toEqual([]);
});
