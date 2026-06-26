import { test, expect } from "@playwright/test";

test("register, create board, add card", async ({ page }) => {
  const email = `e2e-${Date.now()}@example.com`;
  const password = "testpassword123";

  await page.goto("/register");

  await page.getByLabel("Имя").fill("E2E User");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Пароль").fill(password);
  await page.getByRole("button", { name: "Создать аккаунт" }).click();

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole("heading", { name: "Мои доски" })).toBeVisible();

  await page.getByLabel("Название доски").fill("E2E Board");
  await page.getByRole("button", { name: "+ Новая доска" }).click();

  await expect(page).toHaveURL(/\/boards\//);
  await expect(page.getByRole("heading", { name: "E2E Board" })).toBeVisible();

  const toDoColumn = page
    .locator("div.rounded-xl")
    .filter({ has: page.getByRole("heading", { name: "To Do", exact: true }) });

  await toDoColumn.getByRole("button", { name: "+ Добавить карточку" }).click();
  await toDoColumn.getByPlaceholder("Название").fill("Test task");
  await toDoColumn.getByRole("button", { name: "Добавить" }).click();

  await expect(page.getByText("Test task")).toBeVisible();
});
