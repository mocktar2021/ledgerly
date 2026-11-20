// End-to-end test (Chapter 37): exercises the critical flow exactly as a
// real user would, through the actual interface. Slower and more
// expensive than a unit or integration test, reserved for the handful of
// truly critical paths; this is one of them.

import { test, expect } from "@playwright/test";

test("a new provider can sign up, log in, and create a booking", async ({ page }) => {
  const email = `e2e-${Date.now()}@example.com`;
  const password = "a-strong-test-password-123";

  await page.goto("/signup");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign up" }).click();

  await expect(page).toHaveURL(/\/dashboard/);

  await page.goto("/dashboard/clients/new");
  await page.getByLabel("Client name").fill("Playwright Test Client");
  await page.getByLabel("Client email").fill("client@example.com");
  await page.getByRole("button", { name: "Add client" }).click();

  await page.goto("/dashboard/bookings/new");
  await page.getByLabel("Client").selectOption({ label: "Playwright Test Client" });
  await page.getByLabel("Date").fill("2026-12-01");
  await page.getByLabel("Start time").fill("10:00");
  await page.getByRole("button", { name: "Create booking" }).click();

  await expect(page.getByText("Booking confirmed")).toBeVisible();
  await page.goto("/dashboard");
  await expect(page.getByText("Playwright Test Client")).toBeVisible();
});
