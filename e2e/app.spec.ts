import { expect, test } from "@playwright/test";

test("loads the workbench and checks a proof", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("link", { name: /Star on GitHub/i }),
  ).toHaveAttribute(
    "href",
    "https://github.com/baditaflorin/lean-theorem-playground",
  );
  await expect(page.getByRole("link", { name: /Support/i })).toHaveAttribute(
    "href",
    "https://www.paypal.com/paypalme/florinbadita",
  );
  await expect(page.getByText(/commit/i)).toBeVisible();
  await expect(page.getByText(/v0\.1\.0/i)).toBeVisible();

  await page.getByRole("button", { name: /Check/i }).click();
  await expect(
    page.getByRole("heading", { name: /Proof accepted/i }),
  ).toBeVisible();
});

test("searches Mathlib quick lookup", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel(/Search Mathlib/i).fill("ring");
  await expect(page.getByText("ring", { exact: true })).toBeVisible();
});
