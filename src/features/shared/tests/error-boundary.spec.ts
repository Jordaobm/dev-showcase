import { test, expect } from "@/testing/playwright-fixtures";
import { runAxeCheck } from "@/testing/a11y";

test.describe("Error boundary", () => {
  test("error.tsx captura o throw da rota e o botão de retry funciona", async ({
    page,
  }) => {
    await page.goto("/diagnostics/error-boundary");

    await expect(
      page.getByRole("heading", { name: "Ops! Algo deu errado" }),
    ).toBeVisible();
    await expect(
      page.getByText(
        "Esta demo está suspensa por enquanto, estamos atualizando seu funcionamento.",
        { exact: false },
      ),
    ).toBeVisible();

    await page.getByRole("button", { name: "Tentar novamente" }).click();
    await expect(
      page.getByRole("heading", { name: "Ops! Algo deu errado" }),
    ).toBeVisible();

    await page.getByRole("link", { name: "Voltar para o início" }).click();
    await expect(page).toHaveURL("/");
  });

  test("error.tsx sem violações de acessibilidade (axe)", async ({ page }) => {
    await page.goto("/diagnostics/error-boundary");
    await expect(
      page.getByRole("heading", { name: "Ops! Algo deu errado" }),
    ).toBeVisible();
    expect(await runAxeCheck(page)).toEqual([]);
  });

  test("global-error.tsx captura o erro que escapa do error.tsx e o botão de retry funciona", async ({
    page,
  }) => {
    await page.goto("/diagnostics/global-error-boundary");

    await expect(
      page.getByRole("heading", { name: "Ops! Algo deu errado" }),
    ).toBeVisible();
    await expect(
      page.getByText(
        "Esta demo está suspensa por enquanto, estamos atualizando seu funcionamento.",
        { exact: false },
      ),
    ).toBeVisible();

    await page.getByRole("button", { name: "Tentar novamente" }).click();
    await expect(
      page.getByRole("heading", { name: "Ops! Algo deu errado" }),
    ).toBeVisible();

    await page.getByRole("link", { name: "Voltar para o início" }).click();
    await expect(page).toHaveURL("/");
  });

  test("global-error.tsx sem violações de acessibilidade (axe)", async ({
    page,
  }) => {
    await page.goto("/diagnostics/global-error-boundary");
    await expect(
      page.getByRole("heading", { name: "Ops! Algo deu errado" }),
    ).toBeVisible();
    expect(await runAxeCheck(page)).toEqual([]);
  });
});
