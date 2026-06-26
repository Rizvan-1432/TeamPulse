import { test, expect } from "@playwright/test";

test("landing page shows product title and CTA", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("TeamPulse").first()).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Создать доску" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Войти" })).toBeVisible();
});
