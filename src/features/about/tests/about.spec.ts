import { test, expect, openMobileMenu } from "@/testing/playwright-fixtures";
import { runAxeCheck } from "@/testing/a11y";

const BREAKPOINTS = [375, 430, 768, 1024, 1280];

test.describe("Sobre", () => {
  test("carrega sem erro de console e renderiza os elementos principais", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.goto("/sobre");

    await expect(page.getByTestId("hero-heading")).toContainText(
      "Jordão Beghetto Massariol",
    );
    await expect(page.getByTestId("cv-download-link")).toBeVisible();
    await expect(page.getByTestId("timeline-item").first()).toBeVisible();

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

    await page.goto("/sobre");
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

    await page.goto("/sobre");
    await page.waitForLoadState("networkidle");

    expect(failedResponses).toEqual([]);
  });

  test("existe exatamente um <h1> na página", async ({ page }) => {
    await page.goto("/sobre");

    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBe(1);
  });

  test("sem violações de acessibilidade (axe)", async ({ page }) => {
    await page.goto("/sobre");
    expect(await runAxeCheck(page)).toEqual([]);
  });

  test("sem scroll horizontal nos breakpoints de referência", async ({
    page,
  }) => {
    for (const width of BREAKPOINTS) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/sobre");

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
  }) => {
    await page.goto("/sobre");

    await expect(page.locator("section").first()).toMatchAriaSnapshot();
  });

  test("navegação por teclado alcança o link de download do currículo e Enter aciona o download", async ({
    page,
    browserName,
  }) => {
    await page.goto("/sobre");

    const cvLink = page.getByTestId("cv-download-link");
    await expect(cvLink).toBeVisible();

    if (browserName === "webkit") {
      await cvLink.focus();
    } else {
      let reached = false;
      for (let i = 0; i < 15; i++) {
        await page.keyboard.press("Tab");
        if (await cvLink.evaluate((el) => el === document.activeElement)) {
          reached = true;
          break;
        }
      }
      expect(
        reached,
        "Tab não alcançou o link de download do currículo dentro do limite esperado de passos",
      ).toBe(true);
    }

    const downloadPromise = page.waitForEvent("download");
    await page.keyboard.press("Enter");
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe(
      "Jordao_Beghetto_Massariol_CV.pdf",
    );
  });

  test("troca de idioma altera a copy, o <html lang>, sem chave de i18n crua", async ({
    page,
  }) => {
    await page.goto("/sobre");

    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    await expect(
      page.getByText("Desenvolvedor de Software", { exact: true }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Mudar idioma" }).click();
    await page.getByRole("button", { name: "English" }).click();

    await expect(
      page.getByText("Software Developer", { exact: true }),
    ).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.locator("html")).toHaveAttribute("lang", "en-US");

    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toMatch(/\b(shared|about)\.[a-zA-Z]+\./);
  });

  test("timeline mostra experiência profissional e formação (caminho feliz)", async ({
    page,
  }) => {
    await page.goto("/sobre");

    await expect(
      page.getByText("Experiência Profissional", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Formação Contínua", { exact: true }),
    ).toBeVisible();

    const itemCount = await page.getByTestId("timeline-item").count();
    expect(itemCount).toBeGreaterThan(1);
  });

  test("botão de baixar currículo aponta para um PDF real", async ({
    page,
  }) => {
    await page.goto("/sobre");

    const cvLink = page.getByTestId("cv-download-link");
    await expect(cvLink).toHaveAttribute(
      "href",
      "/Jordao_Beghetto_Massariol_CV.pdf",
    );

    const response = await page.request.get(
      "/Jordao_Beghetto_Massariol_CV.pdf",
    );
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/pdf");
  });

  test("busca do navbar (embutido na página) reporta estado vazio para termo sem correspondência, sem travar a tela", async ({
    page,
    isMobile,
  }) => {
    await page.goto("/sobre");
    if (isMobile) await openMobileMenu(page);

    const searchInput = page.getByPlaceholder(
      "Buscar por nome ou tecnologia...",
    );

    await searchInput.click();
    await searchInput.fill("zzz-termo-que-nao-existe");

    await expect(page.getByText("Nenhuma demo encontrada")).toBeVisible();
    await expect(page.getByTestId("hero-heading")).toBeVisible();
  });

  test("navegação de volta para a Home funciona", async ({ page }) => {
    await page.goto("/sobre");

    await page.getByTestId("navbar-logo").click();

    await expect(page).toHaveURL("/");
    await expect(page.getByTestId("demo-grid")).toBeVisible();
  });
});
