import { test, expect } from "@/testing/playwright-fixtures";

const BREAKPOINTS = [375, 430, 768, 1024, 1280];

test.describe("Sensores e Hardware do Dispositivo", () => {
  test("carrega sem erro de console e renderiza os elementos principais", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.goto("/showcase/device-sensors");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Sensores e Hardware do Dispositivo",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 3, name: "Network Information API" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 3, name: "Battery Status API" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 3, name: "Vibration API" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Network Information API/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Battery Status API/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Vibration API/ }),
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

    await page.goto("/showcase/device-sensors");
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

    await page.goto("/showcase/device-sensors");
    await page.waitForLoadState("networkidle");

    expect(failedResponses).toEqual([]);
  });

  test("existe exatamente um <h1> na página", async ({ page }) => {
    await page.goto("/showcase/device-sensors");

    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBe(1);
  });

  test("sem scroll horizontal nos breakpoints de referência", async ({
    page,
  }) => {
    for (const width of BREAKPOINTS) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/showcase/device-sensors");

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
    await page.goto("/showcase/device-sensors");

    await expect(page.locator("section").nth(1)).toMatchAriaSnapshot();
  });

  test("navegação por teclado alcança o link Home do navbar e Enter navega para a Home", async ({
    page,
    browserName,
  }) => {
    await page.goto("/showcase/device-sensors");

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
    await page.goto("/showcase/device-sensors");

    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    await expect(
      page.getByRole("button", { name: "Iniciar vibração" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Mudar idioma" }).click();
    await page.getByRole("button", { name: "English" }).click();

    await expect(
      page.getByRole("button", { name: "Start vibration" }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.locator("html")).toHaveAttribute("lang", "en-US");

    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toMatch(/\b(shared|deviceSensors)\.[a-zA-Z]+\./);
  });

  test("caminho feliz: Network Information API exibe os dados reais da conexão", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "connection", {
        configurable: true,
        value: {
          downlink: 10,
          effectiveType: "4g",
          rtt: 50,
          saveData: true,
          addEventListener: () => {},
          removeEventListener: () => {},
        },
      });
    });

    await page.goto("/showcase/device-sensors");

    const section = page.locator("#pwa-network-information-api");
    await expect(section.getByText("10Mbps")).toBeVisible();
    await expect(section.getByText(/effectiveType\):\s*4g/)).toBeVisible();
    await expect(section.getByText("50ms")).toBeVisible();
    await expect(section.getByText(/saveData\):\s*Sim/)).toBeVisible();
  });

  test("caso de erro: Network Information API indisponível degrada com mensagem clara em vez de travar", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.addInitScript(() => {
      Object.defineProperty(navigator, "connection", {
        configurable: true,
        value: undefined,
      });
    });

    await page.goto("/showcase/device-sensors");

    await expect(
      page
        .locator("#pwa-network-information-api")
        .getByText(
          "Network Information API não suportada neste navegador (só o Chromium a implementa; Firefox e Safari não a oferecem).",
        ),
    ).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });

  test("caminho feliz: Battery Status API exibe o estado real da bateria", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "getBattery", {
        configurable: true,
        value: () =>
          Promise.resolve({
            charging: true,
            level: 0.87,
            chargingTime: 1200,
            dischargingTime: 5000,
            addEventListener: () => {},
            removeEventListener: () => {},
          }),
      });
    });

    await page.goto("/showcase/device-sensors");

    const section = page.locator("#pwa-battery-status-api");
    await expect(
      section.getByText("Carregando", { exact: true }),
    ).toBeVisible();
    await expect(section.getByText("1200s")).toBeVisible();
    await expect(section.getByText("5000s")).toBeVisible();
  });

  test("caso de erro: Battery Status API indisponível (Firefox/Safari) degrada com mensagem clara em vez de travar", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.addInitScript(() => {
      Object.defineProperty(navigator, "getBattery", {
        configurable: true,
        value: undefined,
      });
    });

    await page.goto("/showcase/device-sensors");

    await expect(
      page
        .locator("#pwa-battery-status-api")
        .getByText(
          "Battery Status API não suportada neste navegador (removida no Firefox e nunca implementada no Safari, por questões de privacidade e fingerprinting).",
        ),
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { level: 3, name: "Vibration API" }),
    ).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });

  test("caminho feliz: iniciar e parar a vibração funcionam ponta a ponta", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "vibrate", {
        configurable: true,
        value: () => true,
      });
    });

    await page.goto("/showcase/device-sensors");

    await page.getByRole("button", { name: "Iniciar vibração" }).click();

    await expect(
      page.getByText(/chamada aceita pelo navegador/),
    ).toBeVisible();
    const stopButton = page.getByRole("button", { name: "Parar vibração" });
    await expect(stopButton).toBeVisible();

    await stopButton.click();

    await expect(
      page.getByRole("button", { name: "Iniciar vibração" }),
    ).toBeVisible();
    await expect(
      page.getByText(/chamada aceita pelo navegador/),
    ).not.toBeVisible();
  });

  test("caso de erro: chamada de vibração rejeitada pelo navegador degrada com mensagem clara", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.addInitScript(() => {
      Object.defineProperty(navigator, "vibrate", {
        configurable: true,
        value: () => false,
      });
    });

    await page.goto("/showcase/device-sensors");

    await page.getByRole("button", { name: "Iniciar vibração" }).click();

    await expect(
      page.getByText(/chamada rejeitada/),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Iniciar vibração" }),
    ).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });

  test("navegação para a próxima demo (Dashboards) funciona", async ({
    page,
  }) => {
    await page.goto("/showcase/device-sensors");

    await page.getByRole("link", { name: /Dashboards/ }).click();

    await expect(page).toHaveURL("/showcase/dashboards");
  });
});
