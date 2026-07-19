import { test, expect } from "@/testing/playwright-fixtures";
import { runAxeCheck } from "@/testing/a11y";

test.describe("Offline fallback page", () => {
  test("carrega sem erro de console e mostra o status de conexão", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.goto("/offline");

    await expect(
      page.getByRole("heading", { name: "Você está online" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Continuar" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Home" })).toBeVisible();

    expect(consoleErrors).toEqual([]);
  });

  test("sem violações de acessibilidade (axe)", async ({ page }) => {
    await page.goto("/offline");
    expect(await runAxeCheck(page)).toEqual([]);
  });
});
