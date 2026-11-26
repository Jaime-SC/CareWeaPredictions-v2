import { expect, test } from "@playwright/test";

test("home renders in dark mode by default", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("CareWea");
  await expect(page.locator("html")).toHaveClass(/dark/);
});
