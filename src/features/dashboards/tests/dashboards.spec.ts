import { test, expect } from "@/testing/playwright-fixtures";
import { runAxeCheck } from "@/testing/a11y";

const BREAKPOINTS = [375, 430, 768, 1024, 1280];

const mockMetric = (overrides: Record<string, number> = {}) => ({
  cpu: 5,
  mem: 30,
  lat: 75,
  success: 99.5,
  error: 0.5,
  reqsPerMinute: 150,
  availability: 99.98,
  timestamp: Date.now(),
  date: new Date().toISOString(),
  ...overrides,
});

test.describe("Dashboards", () => {
  test("carrega sem erro de console e renderiza os elementos principais", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.goto("/showcase/dashboards");

    await expect(
      page.getByRole("heading", { level: 1, name: "Dashboards" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 3, name: "UI/UX" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 3, name: "Dashboard", exact: true }),
    ).toBeVisible();
    // Escopado a #dashboard e exato: "AO VIVO" também aparece como substring em "Ao vivo" (badge
    // de status da página) e em "...feed de eventos ao vivo..." (descrição da próxima demo).
    await expect(
      page.locator("#dashboard").getByText("AO VIVO", { exact: true }),
    ).toBeVisible();

    expect(consoleErrors).toEqual([]);
  });

  test("console permanece limpo (log/warning/error/pageerror) durante o load", async ({
    page,
  }) => {
    const messages: string[] = [];
    page.on("console", (msg) => {
      if (["log", "warning", "error"].includes(msg.type())) {
        messages.push(`[${msg.type()}] ${msg.text()}`);
      }
    });
    page.on("pageerror", (err) => messages.push(`[pageerror] ${err.message}`));

    await page.goto("/showcase/dashboards");
    await page.waitForLoadState("networkidle");

    expect(messages).toEqual([]);
  });

  test("nenhuma resposta de rede falha (status >= 400) durante o load", async ({
    page,
  }) => {
    const failedResponses: string[] = [];
    page.on("response", (response) => {
      if (response.status() >= 400) {
        failedResponses.push(`${response.status()} ${response.url()}`);
      }
    });

    await page.goto("/showcase/dashboards");
    await page.waitForLoadState("networkidle");

    expect(failedResponses).toEqual([]);
  });

  test("existe exatamente um <h1> na página", async ({ page }) => {
    await page.goto("/showcase/dashboards");

    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBe(1);
  });

  test("sem violações de acessibilidade (axe)", async ({ page }) => {
    await page.goto("/showcase/dashboards");
    expect(await runAxeCheck(page)).toEqual([]);
  });

  test("sem scroll horizontal nos breakpoints de referência", async ({
    page,
  }) => {
    for (const width of BREAKPOINTS) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/showcase/dashboards");

      const hasHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      );
      expect(
        hasHorizontalOverflow,
        `overflow horizontal detectado em ${width}px`,
      ).toBe(false);
    }
  });

  test("estrutura da seção de detalhes técnicos corresponde ao snapshot estrutural", async ({
    page,
  }) => {
    await page.goto("/showcase/dashboards");

    await expect(page.locator("section").nth(1)).toMatchAriaSnapshot();
  });

  test("navegação por teclado alcança o link Home do navbar e Enter navega para a Home", async ({
    page,
    browserName,
  }) => {
    await page.goto("/showcase/dashboards");

    const homeLink = page.getByRole("link", { name: "Home" });
    await expect(homeLink).toBeVisible();

    if (browserName === "webkit") {
      await homeLink.focus();
    } else {
      let reached = false;
      for (let i = 0; i < 50; i++) {
        await page.keyboard.press("Tab");
        if (await homeLink.evaluate((el) => el === document.activeElement)) {
          reached = true;
          break;
        }
      }
      expect(
        reached,
        "Tab não alcançou o link Home dentro do limite esperado de passos",
      ).toBe(true);
    }

    await page.keyboard.press("Enter");
    await expect(page).toHaveURL("/");
  });

  test("troca de idioma altera a copy, o <html lang>, sem chave de i18n crua", async ({
    page,
  }) => {
    await page.goto("/showcase/dashboards");

    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    await expect(
      page.getByRole("button", { name: "Sobrecarga de CPU" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Mudar idioma" }).click();
    await page.getByRole("button", { name: "English" }).click();

    await expect(
      page.getByRole("button", { name: "CPU overload" }),
    ).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.locator("html")).toHaveAttribute("lang", "en-US");

    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toMatch(/\b(shared|dashboards)\.[a-zA-Z]+\./);
  });

  test("caminho feliz: um incidente crítico simulado reflete nos indicadores e na linha de disponibilidade", async ({
    page,
  }) => {
    await page.route("**/api/dashboard/data", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          mockMetric({
            cpu: 92.4,
            lat: 913,
            error: 61.8,
            success: 38.2,
            reqsPerMinute: 14,
            availability: 97.6,
          }),
        ]),
      });
    });

    await page.goto("/showcase/dashboards");

    // Os mesmos valores formatados aparecem duas vezes (no card de KPI e no badge do
    // mini-gráfico) — .first() evita ambiguidade de strict mode, já que o objetivo aqui é só
    // confirmar que o incidente simulado chegou até a UI, não localizar um card específico.
    const dashboardSection = page.locator("#dashboard");
    await expect(dashboardSection.getByText("92.4").first()).toBeVisible();
    await expect(dashboardSection.getByText("Crítico").first()).toBeVisible();
    await expect(dashboardSection.getByText("913").first()).toBeVisible();
    await expect(dashboardSection.getByText("38.20").first()).toBeVisible();
  });

  test("caso de erro: falha na API de métricas degrada com mensagem clara em vez de travar", async ({
    page,
  }) => {
    // Só rastreia pageerror (exceção não tratada no app) — o próprio 500 mockado já gera um
    // "Failed to load resource" no console por conta do navegador, não da aplicação; não é o
    // que este teste quer pegar.
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await page.route("**/api/dashboard/data", async (route) => {
      await route.fulfill({ status: 500, contentType: "application/json", body: "{}" });
    });

    await page.goto("/showcase/dashboards");

    await expect(
      page.getByText(
        "Não foi possível carregar as métricas agora. Tente novamente em instantes.",
      ),
    ).toBeVisible();
    expect(pageErrors).toEqual([]);
  });

  test("navegação para a próxima demo (Real-time & Comunicação) funciona", async ({
    page,
  }) => {
    await page.goto("/showcase/dashboards");

    await page.getByRole("link", { name: /próxima demo/i }).click();

    await expect(page).toHaveURL("/showcase/realtime");
  });
});
