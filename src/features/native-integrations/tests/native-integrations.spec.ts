import { test, expect } from "@/testing/playwright-fixtures";

const BREAKPOINTS = [375, 430, 768, 1024, 1280];

test.describe("Integrações Nativas do Navegador", () => {
  test("carrega sem erro de console e renderiza os elementos principais", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.goto("/showcase/native-integrations");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Integrações Nativas do Navegador",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Compartilhar este conteúdo" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        level: 3,
        name: "API de Compartilhamento WEB",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        level: 3,
        name: "API de Copiar/Colar Texto",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 3, name: "API de Bloqueio de Tela" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 3, name: "API de Tela Cheia" }),
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

    await page.goto("/showcase/native-integrations");
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

    await page.goto("/showcase/native-integrations");
    await page.waitForLoadState("networkidle");

    expect(failedResponses).toEqual([]);
  });

  test("existe exatamente um <h1> na página", async ({ page }) => {
    await page.goto("/showcase/native-integrations");

    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBe(1);
  });

  test("sem scroll horizontal nos breakpoints de referência", async ({
    page,
  }) => {
    for (const width of BREAKPOINTS) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/showcase/native-integrations");

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
    await page.goto("/showcase/native-integrations");

    await expect(page.locator("section").nth(1)).toMatchAriaSnapshot();
  });

  test("navegação por teclado alcança o link Home do navbar e Enter navega para a Home", async ({
    page,
    browserName,
  }) => {
    await page.goto("/showcase/native-integrations");

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
    await page.goto("/showcase/native-integrations");

    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    await expect(
      page.getByRole("button", { name: "Compartilhar este conteúdo" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Mudar idioma" }).click();
    await page.getByRole("button", { name: "English" }).click();

    await expect(
      page.getByRole("button", { name: "Share this content" }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.locator("html")).toHaveAttribute("lang", "en-US");

    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toMatch(/\b(shared|nativeIntegrations)\.[a-zA-Z]+\./);
  });

  test("caminho feliz: copiar e colar via Clipboard API funciona ponta a ponta", async ({
    page,
    context,
    browserName,
  }) => {
    if (browserName === "chromium") {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    }

    await page.goto("/showcase/native-integrations");

    const sourceTextarea = page.locator("textarea").first();
    const targetTextarea = page.locator("textarea").nth(1);

    await expect(async () => {
      await sourceTextarea.evaluate(
        (el: HTMLTextAreaElement, value: string) => {
          const nativeSetter = Object.getOwnPropertyDescriptor(
            window.HTMLTextAreaElement.prototype,
            "value",
          )!.set!;
          nativeSetter.call(el, value);
          el.dispatchEvent(new Event("input", { bubbles: true }));
        },
        "conteúdo de teste via clipboard",
      );
      await expect(sourceTextarea).toHaveValue(
        "conteúdo de teste via clipboard",
        {
          timeout: 500,
        },
      );
    }).toPass({ timeout: 10_000 });

    await page.getByRole("button", { name: "Copiar", exact: true }).click();

    await expect(page.getByRole("button", { name: "Copiado!" })).toBeVisible();

    await page.getByRole("button", { name: "Colar", exact: true }).click();

    if (browserName === "webkit") {
      await expect(
        page.getByText(
          "Não foi possível acessar a área de transferência agora — a API não está disponível ou foi negada pelo navegador.",
        ),
      ).toBeVisible();
      return;
    }

    await expect(page.getByRole("button", { name: "Colado!" })).toBeVisible();
    await expect(targetTextarea).toHaveValue("conteúdo de teste via clipboard");
  });

  test("caso de erro: Wake Lock negado degrada com mensagem clara em vez de travar a tela", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.addInitScript(() => {
      Object.defineProperty(navigator, "wakeLock", {
        configurable: true,
        value: {
          request: () =>
            Promise.reject(
              new DOMException(
                "Wake Lock permission request denied",
                "NotAllowedError",
              ),
            ),
        },
      });
    });

    await page.goto("/showcase/native-integrations");

    await page.getByRole("button", { name: "Manter tela ligada" }).click();

    await expect(
      page.getByText(
        "Não foi possível manter a tela ligada agora — a API não está disponível ou foi negada pelo navegador.",
      ),
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { level: 3, name: "API de Tela Cheia" }),
    ).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });

  test("Fullscreen API indisponível (ex.: iPhone Safari) degrada com mensagem em vez de travar", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.addInitScript(() => {
      Object.defineProperty(document, "fullscreenEnabled", {
        get: () => false,
        configurable: true,
      });
    });

    await page.goto("/showcase/native-integrations");

    const button = page.getByRole("button", { name: "Ativar tela cheia" });
    await expect(button).toBeDisabled();
    await expect(
      page.getByText(
        "API de Tela Cheia não é suportada neste navegador (é o caso do Safari no iPhone, por exemplo).",
      ),
    ).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });

  test("caminho feliz: ativar/sair da tela cheia não trava a aplicação", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.goto("/showcase/native-integrations");

    const button = page.getByRole("button", { name: "Ativar tela cheia" });
    await expect(button).toBeEnabled();
    await button.click();

    await expect(
      page
        .getByRole("button", { name: "Sair da tela cheia" })
        .or(
          page.getByText(
            "API de Tela Cheia não é suportada neste navegador (é o caso do Safari no iPhone, por exemplo).",
          ),
        ),
    ).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });

  test("navegação para a próxima demo (Sensores e Hardware do Dispositivo) funciona", async ({
    page,
  }) => {
    await page.goto("/showcase/native-integrations");

    await page
      .getByRole("link", { name: /Sensores e Hardware do Dispositivo/ })
      .click();

    await expect(page).toHaveURL("/showcase/device-sensors");
  });
});
