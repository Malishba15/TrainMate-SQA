// __tests__/e2e/public-pages.spec.js
import { test, expect } from "@playwright/test";

test.describe("TrainMate public user flows", () => {
  test("home page loads the hero section", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("button", { name: "Learn More" })
    ).toBeVisible();

    await expect(
      page.getByText("AI-Powered Training Assistant")
    ).toBeVisible();

    await expect(
      page.getByText("Smarter Onboarding")
    ).toBeVisible();

    await expect(
      page.getByText("TrainMate", { exact: true }).first()
    ).toBeVisible();
  });

  test("learn more modal opens from the hero section", async ({
    page,
  }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Learn More" }).click();

    await expect(
      page.getByRole("heading", {
        name: /How TrainMate Works/i,
      })
    ).toBeVisible();

    await expect(page.getByText("Upload Files")).toBeVisible();
    await expect(page.getByText("Track Growth")).toBeVisible();
  });

  test("get started opens the signup modal", async ({ page }) => {
    await page.goto("/");

    // Click the Hero section Get Started button
    await page
      .locator("section")
      .first()
      .getByRole("button", { name: "Get Started" })
      .click();

    await expect(
      page.getByRole("heading", {
        name: /Create Account/i,
      })
    ).toBeVisible();

    await expect(
      page.getByText("trainmate01@gmail.com")
    ).toBeVisible();
  });

  test("license page shows the plan overview and comparison link", async ({
    page,
  }) => {
    await page.goto("/license");

    // Licensing Plans is a span, not a heading
    await expect(
      page.getByText("Licensing Plans")
    ).toBeVisible();

    await expect(
      page.getByRole("heading", {
        name: /Built for/i,
      })
    ).toBeVisible();

    await expect(
      page.getByRole("link", {
        name: "Compare Plans",
      })
    ).toBeVisible();
  });

  test("compare plans page shows the feature comparison table", async ({
    page,
  }) => {
    await page.goto("/compare-plans");

    await expect(
      page.getByRole("heading", {
        name: /Compare what/i,
      })
    ).toBeVisible();

    await expect(
      page.getByRole("heading", {
        name: /Feature-by-feature comparison/i,
      })
    ).toBeVisible();

    // Table headers are unique
    await expect(
      page.getByText("Capability")
    ).toBeVisible();

    await expect(
      page.locator("div").filter({ hasText: /^Basic$/ }).first()
    ).toBeVisible();

    await expect(
      page.locator("div").filter({ hasText: /^Pro$/ }).first()
    ).toBeVisible();
  });
});