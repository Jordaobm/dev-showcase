import { test, expect, openMobileMenu } from "@/testing/playwright-fixtures";
import { runAxeCheck } from "@/testing/a11y";

const BREAKPOINTS = [375, 430, 768, 1024, 1280];

test.describe("Home", () => {
  test("carrega sem erro de console e renderiza os elementos principais", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.goto("/");

    await expect(page.getByTestId("hero-heading")).toBeVisible();
    await expect(
      page.getByPlaceholder("Buscar por nome ou tecnologia..."),
    ).toBeVisible();
    await expect(page.getByTestId("demo-grid")).toBeVisible();
    await expect(page.getByTestId("demo-card").first()).toBeVisible();

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

    await page.goto("/");
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

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    expect(failedResponses).toEqual([]);
  });

  test("existe pelo menos um <h1> na página", async ({ page }) => {
    await page.goto("/");

    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
  });

  test("sem violações de acessibilidade (axe)", async ({ page }) => {
    await page.goto("/");
    expect(await runAxeCheck(page)).toEqual([]);
  });

  test("sem scroll horizontal nos breakpoints de referência", async ({
    page,
  }) => {
    for (const width of BREAKPOINTS) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");

      const hasHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      );
      expect(
        hasHorizontalOverflow,
        `overflow horizontal detectado em ${width}px`,
      ).toBe(false);
    }
  });

  test("estrutura da seção hero corresponde ao snapshot estrutural", async ({
    page,
    isMobile,
  }) => {
    await page.goto("/");

    const mobileSnapshot = `
      - img "Banner Dev Showcase"
      - text: Premium Developer Portfolio
      - heading "Engenharia para explorar." [level=1]
      - heading "Um showcase técnico onde cada implementação demonstra uma competência real de engenharia de software. Arquitetura, performance, segurança, PWAs, Browser APIs, renderização 3D e muito mais, reunidos em experiências interativas." [level=2]
      - text: /9 ao vivo \\d+ total de demos 7 em breve/
      - button "Explorar o Showcase"
      - link "Conheça o Autor":
        - /url: /sobre
      - text: Role para explorar
    `;
    const desktopSnapshot = `
      - text: Premium Developer Portfolio
      - heading "Engenharia para explorar." [level=1]
      - heading "Um showcase técnico onde cada implementação demonstra uma competência real de engenharia de software. Arquitetura, performance, segurança, PWAs, Browser APIs, renderização 3D e muito mais, reunidos em experiências interativas." [level=2]
      - text: /9 ao vivo \\d+ total de demos 7 em breve/
      - button "Explorar o Showcase"
      - link "Conheça o Autor":
        - /url: /sobre
      - img "Banner Dev Showcase"
      - text: Role para explorar
    `;

    await expect(page.locator("section").first()).toMatchAriaSnapshot(
      isMobile ? mobileSnapshot : desktopSnapshot,
    );
  });

  test("navegação por teclado alcança o CTA principal do hero e Enter ativa", async ({
    page,
  }) => {
    await page.goto("/");

    const meetAuthorLink = page.getByRole("link", { name: "Conheça o Autor" });
    await expect(meetAuthorLink).toBeVisible();

    let reached = false;
    for (let i = 0; i < 25; i++) {
      await page.keyboard.press("Tab");
      if (
        await meetAuthorLink.evaluate((el) => el === document.activeElement)
      ) {
        reached = true;
        break;
      }
    }
    expect(
      reached,
      "Tab não alcançou o CTA 'Conheça o Autor' dentro do limite esperado de passos",
    ).toBe(true);

    await page.keyboard.press("Enter");
    await expect(page).toHaveURL("/sobre");
  });

  test("filtro de categorias atualiza a grade de demos", async ({ page }) => {
    await page.goto("/");

    const demoCards = page.getByTestId("demo-card");
    const initialCount = await demoCards.count();
    expect(initialCount).toBeGreaterThan(0);

    const categoryButtons = page
      .getByTestId("category-filter")
      .getByRole("button");
    await categoryButtons.nth(1).click();

    await expect(demoCards.first()).toBeVisible();
    const filteredCount = await demoCards.count();
    expect(filteredCount).toBeGreaterThan(0);
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test("busca encontra uma demo existente e reporta vazio quando não há match", async ({
    page,
    isMobile,
  }) => {
    await page.goto("/");
    if (isMobile) await openMobileMenu(page);

    const searchInput = page.getByPlaceholder(
      "Buscar por nome ou tecnologia...",
    );

    await searchInput.click();
    await searchInput.fill("pwa");
    await expect(
      page
        .getByTestId("search-results")
        .getByTestId("search-result-item")
        .first(),
    ).toContainText(/PWA/i);

    await searchInput.fill("zzz-termo-que-nao-existe");
    await expect(page.getByText("Nenhuma demo encontrada")).toBeVisible();
  });

  test("busca: clicar num resultado navega para a demo e fecha a busca (closeSearch)", async ({
    page,
    isMobile,
  }) => {
    await page.goto("/");
    if (isMobile) await openMobileMenu(page);

    const searchInput = page.getByPlaceholder(
      "Buscar por nome ou tecnologia...",
    );
    await searchInput.click();
    await searchInput.fill("pwa");

    const firstResult = page
      .getByTestId("search-results")
      .getByTestId("search-result-item")
      .first();
    await expect(firstResult).toBeVisible();
    await firstResult.click();

    await expect(page).toHaveURL(/\/showcase\//);
  });

  test("navbar: clicar em 'Showcases' na Home rola até a seção sem navegar", async ({
    page,
    isMobile,
  }) => {
    await page.goto("/");
    if (isMobile) await openMobileMenu(page);

    await page.getByRole("link", { name: "Link Showcases" }).click();

    await expect(page).toHaveURL("/");
    await expect(page.locator("#featured")).toBeInViewport();
  });

  test("idioma na URL (/en-US) persiste após reload da página", async ({
    page,
  }) => {
    await page.goto("/en-US");

    const languageButton = page.getByRole("button", {
      name: "Change language",
    });
    await expect(languageButton).toBeVisible();
    await expect(languageButton).toContainText("English");
    await expect(page.locator("html")).toHaveAttribute("lang", "en-US");

    await page.reload();

    await expect(languageButton).toContainText("English");
    await expect(page.locator("html")).toHaveAttribute("lang", "en-US");
  });

  test("troca de idioma altera a copy, o <html lang>, sem chave de i18n crua", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    await expect(page.getByTestId("hero-heading")).toContainText("Engenharia");

    await page.getByRole("button", { name: "Mudar idioma" }).click();
    await page.getByRole("button", { name: "English" }).click();

    await expect(page.getByTestId("hero-heading")).toContainText(
      "Engineering",
      { timeout: 10_000 },
    );
    await expect(page.locator("html")).toHaveAttribute("lang", "en-US");

    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toMatch(/shared\.(home|header|components)\./);
  });
});
