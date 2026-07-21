import { test, expect } from "@/testing/playwright-fixtures";
import { runAxeCheck } from "@/testing/a11y";

test.describe("3D & Animações Avançadas", () => {
  test("carrega sem erro de console e renderiza os elementos principais", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.goto("/showcase/demo3d");

    await expect(
      page
        .getByRole("heading", {
          level: 1,
          name: "3D & Animações Avançadas",
        })
        .first(),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Sistema Solar Interativo" }),
    ).toBeVisible();
    await expect(
      page
        .locator("#tech-stack-solar-system")
        .getByText("Como interagir com a cena"),
    ).toBeVisible();

    await expect(page.locator("#tech-stack-solar-system canvas")).toBeVisible({
      timeout: 15_000,
    });

    await page.waitForTimeout(3000);

    expect(consoleErrors).toEqual([]);
  });

  test("sem violações de acessibilidade (axe)", async ({ page }) => {
    await page.goto("/showcase/demo3d");
    await expect(page.locator("#tech-stack-solar-system canvas")).toBeVisible({
      timeout: 15_000,
    });

    expect(await runAxeCheck(page)).toEqual([]);
  });
});
