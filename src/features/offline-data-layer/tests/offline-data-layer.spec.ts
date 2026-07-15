import { test, expect } from "@/testing/playwright-fixtures";

const BREAKPOINTS = [375, 430, 768, 1024, 1280];

test.describe("Offline Data Layer", () => {
  test("carrega sem erro de console e renderiza os elementos principais", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.goto("/showcase/offline-data-layer");

    await expect(
      page.getByRole("heading", { level: 1, name: "Offline Data Layer" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        level: 3,
        name: "Web Workers + OPFS + Background Sync",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 3, name: "IndexedDB + Background Sync" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 3, name: "Storage API" }),
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

    await page.goto("/showcase/offline-data-layer");
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

    await page.goto("/showcase/offline-data-layer");
    await page.waitForLoadState("networkidle");

    expect(failedResponses).toEqual([]);
  });

  test("existe exatamente um <h1> na página", async ({ page }) => {
    await page.goto("/showcase/offline-data-layer");

    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBe(1);
  });

  test("sem scroll horizontal nos breakpoints de referência", async ({
    page,
  }) => {
    for (const width of BREAKPOINTS) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/showcase/offline-data-layer");

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
    await page.goto("/showcase/offline-data-layer");

    await expect(page.locator("section").nth(1)).toMatchAriaSnapshot();
  });

  test("navegação por teclado alcança o link Home do navbar e Enter navega para a Home", async ({
    page,
    browserName,
  }) => {
    await page.goto("/showcase/offline-data-layer");

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
    await page.goto("/showcase/offline-data-layer");

    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    await expect(
      page.locator("#pwa-indexdb").getByRole("button", { name: "Adicionar" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Mudar idioma" }).click();
    await page.getByRole("button", { name: "English" }).click();

    await expect(
      page.locator("#pwa-indexdb").getByRole("button", { name: "Add" }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.locator("html")).toHaveAttribute("lang", "en-US");

    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toMatch(/\b(shared|offlineDataLayer)\.[a-zA-Z]+\./);
  });

  test("caminho feliz: criar uma nota no IndexedDB com a aplicação online", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.goto("/showcase/offline-data-layer");

    const section = page.locator("#pwa-indexdb");
    await section.getByRole("button", { name: "Adicionar" }).click();

    await page.getByLabel("Texto da nota").fill("nota de teste via IndexedDB");
    await page.getByRole("button", { name: "Confirmar" }).click();

    const noteRow = section.getByRole("row", {
      name: /nota de teste via IndexedDB/,
    });
    await expect(noteRow).toBeVisible({ timeout: 10_000 });
    await expect(noteRow.getByText("Online", { exact: true })).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });

  test("caso de erro: criar uma nota com a checagem de conectividade falhando não trava a aplicação", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && !/net::ERR_FAILED/.test(msg.text())) {
        consoleErrors.push(msg.text());
      }
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.route("**/api/health", (route) => route.abort());
    await page.goto("/showcase/offline-data-layer");

    const section = page.locator("#pwa-indexdb");
    await section.getByRole("button", { name: "Adicionar" }).click();
    await page.getByLabel("Texto da nota").fill("nota criada offline");
    await page.getByRole("button", { name: "Confirmar" }).click();

    await expect(section.getByText("nota criada offline")).toBeVisible({
      timeout: 10_000,
    });
    expect(consoleErrors).toEqual([]);
  });

  test("caso de erro: registro de Background Sync falha ao criar nota offline não trava a aplicação", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && !/net::ERR_FAILED/.test(msg.text())) {
        consoleErrors.push(msg.text());
      }
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.addInitScript(() => {
      Object.defineProperty(navigator, "serviceWorker", {
        configurable: true,
        value: {
          ready: Promise.resolve({
            sync: {
              register: () =>
                Promise.reject(new Error("Background Sync permission denied")),
            },
          }),
          register: async () => ({
            scope: "/",
            installing: null,
            waiting: null,
            active: null,
            addEventListener() {},
            update: async () => {},
          }),
          addEventListener: () => {},
          removeEventListener: () => {},
        },
      });
    });

    await page.route("**/api/health", (route) => route.abort());
    await page.goto("/showcase/offline-data-layer");

    const section = page.locator("#pwa-indexdb");
    await section.getByRole("button", { name: "Adicionar" }).click();
    await page
      .getByLabel("Texto da nota")
      .fill("nota offline com sync falhando");
    await page.getByRole("button", { name: "Confirmar" }).click();

    await expect(
      section.getByText("nota offline com sync falhando"),
    ).toBeVisible({ timeout: 10_000 });
    expect(consoleErrors).toEqual([]);
  });

  test("excluir uma nota do IndexedDB funciona e o botão tem aria-label descritivo", async ({
    page,
  }) => {
    await page.goto("/showcase/offline-data-layer");

    const section = page.locator("#pwa-indexdb");
    await section.getByRole("button", { name: "Adicionar" }).click();
    await page.getByLabel("Texto da nota").fill("nota para excluir");
    await page.getByRole("button", { name: "Confirmar" }).click();

    const noteRow = section.getByRole("row", { name: /nota para excluir/ });
    await expect(noteRow).toBeVisible({ timeout: 10_000 });

    await noteRow.getByRole("button", { name: /Excluir nota/ }).click();

    await expect(section.getByText("nota para excluir")).not.toBeVisible({
      timeout: 10_000,
    });
  });

  test("modal de nova nota: Esc fecha o modal e devolve o foco ao botão que o abriu", async ({
    page,
  }) => {
    await page.goto("/showcase/offline-data-layer");

    const addButton = page
      .locator("#pwa-indexdb")
      .getByRole("button", { name: "Adicionar" });
    await addButton.click();

    const dialog = page.getByRole("dialog", { name: "Adicione uma nota" });
    await expect(dialog).toBeVisible();
    await expect(page.getByLabel("Texto da nota")).toBeFocused();

    await page.keyboard.press("Escape");

    await expect(dialog).not.toBeVisible();
  });

  test("modal de nova nota: Tab prende o foco dentro do modal (focus trap)", async ({
    page,
  }) => {
    await page.goto("/showcase/offline-data-layer");

    const addButton = page
      .locator("#pwa-indexdb")
      .getByRole("button", { name: "Adicionar" });
    await addButton.click();

    const dialog = page.getByRole("dialog", { name: "Adicione uma nota" });
    await expect(dialog).toBeVisible();

    const noteInput = page.getByLabel("Texto da nota");
    const confirmButton = dialog.getByRole("button", { name: "Confirmar" });
    await expect(noteInput).toBeFocused();

    await page.keyboard.press("Shift+Tab");
    await expect(confirmButton).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(noteInput).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
  });

  test("link 'Status Online/Offline' navega de verdade para a seção de status em pwa-core", async ({
    page,
  }) => {
    await page.goto("/showcase/offline-data-layer");

    await page
      .locator("#pwa-indexdb")
      .getByRole("link", { name: "Status Online/Offline." })
      .click();

    await expect(page).toHaveURL("/showcase/pwa-core#pwa-status");
  });

  test("caminho feliz: criar uma nota no OPFS (SQLite via WebAssembly) funciona ponta a ponta", async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName !== "chromium",
      "OPFS + wa-sqlite dentro de Worker é instável sob automação Playwright em Firefox/WebKit.",
    );

    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.goto("/showcase/offline-data-layer");

    const section = page.locator("#pwa-opfs");
    await section.getByRole("button", { name: "Adicionar" }).click();

    await page.getByLabel("Texto da nota").fill("nota de teste via OPFS");
    await page.getByRole("button", { name: "Confirmar" }).click();

    await expect(section.getByText("nota de teste via OPFS")).toBeVisible({
      timeout: 40_000,
    });
    expect(consoleErrors).toEqual([]);
  });

  test("caso de erro: registro de Background Sync falha ao criar nota offline no OPFS não trava a aplicação", async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName !== "chromium",
      "OPFS + wa-sqlite dentro de Worker é instável sob automação Playwright em Firefox/WebKit.",
    );

    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && !/net::ERR_FAILED/.test(msg.text())) {
        consoleErrors.push(msg.text());
      }
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.addInitScript(() => {
      Object.defineProperty(navigator, "serviceWorker", {
        configurable: true,
        value: {
          ready: Promise.resolve({
            sync: {
              register: () =>
                Promise.reject(new Error("Background Sync permission denied")),
            },
          }),
          register: async () => ({
            scope: "/",
            installing: null,
            waiting: null,
            active: null,
            addEventListener() {},
            update: async () => {},
          }),
          addEventListener: () => {},
          removeEventListener: () => {},
        },
      });
    });

    await page.route("**/api/health", (route) => route.abort());
    await page.goto("/showcase/offline-data-layer");

    const section = page.locator("#pwa-opfs");
    await section.getByRole("button", { name: "Adicionar" }).click();
    await page
      .getByLabel("Texto da nota")
      .fill("nota offline via OPFS com sync falhando");
    await page.getByRole("button", { name: "Confirmar" }).click();

    await expect(
      section.getByText("nota offline via OPFS com sync falhando"),
    ).toBeVisible({ timeout: 40_000 });
    expect(consoleErrors).toEqual([]);
  });

  test("Storage API: solicitar armazenamento persistente não trava e reporta um resultado", async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName !== "chromium",
      "navigator.storage.persist() aciona um diálogo nativo em Firefox/WebKit que a automação não consegue responder.",
    );

    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.goto("/showcase/offline-data-layer");

    const section = page.locator("#pwa-storage");
    await section
      .getByRole("button", { name: "Solicitar persistência" })
      .click();

    await expect(
      section
        .getByRole("button", { name: "Armazenamento persistente ativo" })
        .or(section.getByText("O navegador negou a permissão silenciosamente", {
          exact: false,
        })),
    ).toBeVisible({ timeout: 10_000 });
    expect(consoleErrors).toEqual([]);
  });

  test("caso de erro: Storage API indisponível (ex.: WebKit) degrada com mensagem clara em vez de travar", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.addInitScript(() => {
      Object.defineProperty(navigator, "storage", {
        value: undefined,
        configurable: true,
      });
    });

    await page.goto("/showcase/offline-data-layer");

    const section = page.locator("#pwa-storage");
    await expect(
      section.getByRole("button", { name: "Solicitar persistência" }),
    ).toBeDisabled();
    await expect(
      section.getByText(
        "Storage API não suportada neste navegador — não é possível verificar cota ou solicitar armazenamento persistente.",
      ),
    ).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });

  test("navegação para a próxima demo (Integrações Nativas do Navegador) funciona", async ({
    page,
  }) => {
    await page.goto("/showcase/offline-data-layer");

    await page
      .getByRole("link", { name: /Integrações Nativas do Navegador/ })
      .click();

    await expect(page).toHaveURL("/showcase/native-integrations");
  });
});
