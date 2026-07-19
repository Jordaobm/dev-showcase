import { test, expect } from "@/testing/playwright-fixtures";
import { runAxeCheck } from "@/testing/a11y";

const BREAKPOINTS = [375, 430, 768, 1024, 1280];

test.describe("PWA Core", () => {
  test("carrega sem erro de console e renderiza os elementos principais", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.goto("/showcase/pwa-core");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "PWA & Cache Inteligente",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /PWA — Progressive Web App/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        level: 3,
        name: "PWA — Progressive Web App",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 3, name: "Service Worker + Cache" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 3, name: "Status Online/Offline" }),
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

    await page.goto("/showcase/pwa-core");
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

    await page.goto("/showcase/pwa-core");
    await page.waitForLoadState("networkidle");

    expect(failedResponses).toEqual([]);
  });

  test("existe exatamente um <h1> na página", async ({ page }) => {
    await page.goto("/showcase/pwa-core");

    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBe(1);
  });

  test("sem violações de acessibilidade (axe)", async ({ page }) => {
    await page.goto("/showcase/pwa-core");
    expect(await runAxeCheck(page)).toEqual([]);
  });

  test("sem scroll horizontal nos breakpoints de referência", async ({
    page,
  }) => {
    for (const width of BREAKPOINTS) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/showcase/pwa-core");

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
    await page.goto("/showcase/pwa-core");

    await expect(page.locator("section").nth(1)).toMatchAriaSnapshot();
  });

  test("navegação por teclado alcança o botão Home da seção de status e Enter navega para a Home", async ({
    page,
  }) => {
    await page.goto("/showcase/pwa-core");

    const homeButton = page.getByRole("button", { name: "Home" });
    await expect(homeButton).toBeVisible();

    let reached = false;
    for (let i = 0; i < 50; i++) {
      await page.keyboard.press("Tab");
      if (await homeButton.evaluate((el) => el === document.activeElement)) {
        reached = true;
        break;
      }
    }
    expect(
      reached,
      "Tab não alcançou o botão Home dentro do limite esperado de passos",
    ).toBe(true);

    await page.keyboard.press("Enter");
    await expect(page).toHaveURL("/");
  });

  test("troca de idioma altera a copy, o <html lang>, sem chave de i18n crua", async ({
    page,
  }) => {
    await page.goto("/showcase/pwa-core");

    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    await expect(
      page.getByRole("button", { name: "Indisponível" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Mudar idioma" }).click();
    await page.getByRole("button", { name: "English" }).click();

    await expect(
      page.getByRole("button", { name: "Unavailable" }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.locator("html")).toHaveAttribute("lang", "en-US");

    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toMatch(/\b(shared|pwaCore)\.[a-zA-Z]+\./);
  });

  test("instalação do PWA funciona ponta a ponta quando o navegador oferece o prompt (beforeinstallprompt mockado)", async ({
    page,
  }) => {
    await page.goto("/showcase/pwa-core");
    await page.waitForLoadState("networkidle");

    const unavailableButton = page.getByRole("button", {
      name: "Indisponível",
    });
    await expect(unavailableButton).toBeVisible();

    const installButton = page.getByRole("button", { name: "Instalar app" });
    await expect(async () => {
      await page.evaluate(() => {
        const evt = new Event("beforeinstallprompt", {
          cancelable: true,
        }) as Event & {
          prompt?: () => Promise<void>;
          userChoice?: Promise<{ outcome: "accepted" | "dismissed" }>;
        };
        evt.prompt = () => Promise.resolve();
        evt.userChoice = Promise.resolve({ outcome: "accepted" });
        window.dispatchEvent(evt);
      });
      await expect(installButton).toBeVisible({ timeout: 500 });
    }).toPass({ timeout: 10_000 });

    await installButton.click();

    await expect(unavailableButton).toBeVisible();
  });

  test("evento appinstalled zera o estado do prompt de instalação", async ({
    page,
  }) => {
    await page.goto("/showcase/pwa-core");
    await page.waitForLoadState("networkidle");

    const installButton = page.getByRole("button", { name: "Instalar app" });
    await expect(async () => {
      await page.evaluate(() => {
        const evt = new Event("beforeinstallprompt", {
          cancelable: true,
        }) as Event & {
          prompt?: () => Promise<void>;
          userChoice?: Promise<{ outcome: "accepted" | "dismissed" }>;
        };
        evt.prompt = () => Promise.resolve();
        evt.userChoice = Promise.resolve({ outcome: "accepted" });
        window.dispatchEvent(evt);
      });
      await expect(installButton).toBeVisible({ timeout: 500 });
    }).toPass({ timeout: 10_000 });

    await page.evaluate(() => {
      window.dispatchEvent(new Event("appinstalled"));
    });

    await expect(
      page.getByRole("button", { name: "Indisponível" }),
    ).toBeVisible();
  });

  test("sem o evento beforeinstallprompt, o botão de instalação degrada para 'Indisponível' sem travar a tela", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.goto("/showcase/pwa-core");

    const unavailableButton = page.getByRole("button", {
      name: "Indisponível",
    });
    await expect(unavailableButton).toBeVisible();
    await expect(unavailableButton).toBeDisabled();

    await expect(
      page.getByRole("heading", { level: 3, name: "Status Online/Offline" }),
    ).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });

  test("status de conectividade real reporta online (ping bem-sucedido a /api/health)", async ({
    page,
  }) => {
    await page.goto("/showcase/pwa-core");

    await expect(
      page.getByRole("heading", { level: 4, name: "Você está online" }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("Conectado", { exact: true })).toBeVisible();
  });

  test("navegação para a próxima demo (Autenticação) funciona", async ({
    page,
  }) => {
    await page.goto("/showcase/pwa-core");

    await page.getByRole("link", { name: /Autenticação/ }).click();

    await expect(page).toHaveURL("/showcase/auth");
    await expect(
      page.getByRole("heading", { level: 1, name: "Autenticação" }),
    ).toBeVisible();
  });
});
