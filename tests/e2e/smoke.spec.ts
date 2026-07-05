import { expect, test } from "@playwright/test";

test("shows setup screen when Supabase env is missing", async ({ page }) => {
  await page.goto("/dashboard", { waitUntil: "commit" });
  await expect(page.getByText("Supabase setup needed")).toBeVisible();
});

test("login page renders private app sign in", async ({ page }) => {
  await page.goto("/login", { waitUntil: "commit" });
  await expect(page.getByRole("heading", { name: "Adana Designs" })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
});

test("mobile setup page has no horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/dashboard", { waitUntil: "commit" });
  await expect(page.getByText("Supabase setup needed")).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  expect(overflow).toBe(false);
});
