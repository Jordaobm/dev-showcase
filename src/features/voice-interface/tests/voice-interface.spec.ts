import { test, expect } from "@/testing/playwright-fixtures";
import { runAxeCheck } from "@/testing/a11y";

const BREAKPOINTS = [375, 430, 768, 1024, 1280];

const fakeSpeechRecognitionScript = ({
  behavior,
  transcript,
  autoEnd,
}: {
  behavior: string;
  transcript: string;
  autoEnd?: boolean;
}) => {
  class FakeSpeechRecognition {
    continuous = false;
    lang = "";
    interimResults = false;
    onresult: ((event: unknown) => void) | null = null;
    onerror: (() => void) | null = null;
    onend: (() => void) | null = null;

    start() {
      setTimeout(() => {
        if (behavior === "error") {
          this.onerror?.();
          return;
        }
        const resultItem = Object.assign([{ transcript }], {
          isFinal: true,
        });
        this.onresult?.({ resultIndex: 0, results: [resultItem] });
        if (autoEnd) {
          setTimeout(() => this.onend?.(), 300);
        }
      }, 50);
    }

    stop() {
      this.onend?.();
    }
  }

  Object.defineProperty(window, "SpeechRecognition", {
    configurable: true,
    value: FakeSpeechRecognition,
  });
};

const fakeSpeechSynthesisScript = () => {
  class FakeUtterance {
    text: string;
    voice: unknown = null;
    lang = "";
    onstart: (() => void) | null = null;
    onend: (() => void) | null = null;
    onerror: (() => void) | null = null;
    constructor(text: string) {
      this.text = text;
    }
  }

  const fakeSynthesis = {
    getVoices: () => [{ voiceURI: "v1", name: "Voice One", lang: "pt-BR" }],
    addEventListener: () => {},
    removeEventListener: () => {},
    cancel: () => {},
    speak: (utterance: FakeUtterance) => {
      setTimeout(() => utterance.onstart?.(), 10);
      setTimeout(() => utterance.onend?.(), 1000);
    },
  };

  Object.defineProperty(window, "speechSynthesis", {
    configurable: true,
    value: fakeSynthesis,
  });
  Object.defineProperty(window, "SpeechSynthesisUtterance", {
    configurable: true,
    value: FakeUtterance,
  });
};

test.describe("Voice Interface", () => {
  test("carrega sem erro de console e renderiza os elementos principais", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.goto("/showcase/voice-interface");

    await expect(
      page.getByRole("heading", { level: 1, name: "Interface de Voz" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        level: 3,
        name: "Speech Recognition API & Text-to-Speech API",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Clique para capturar áudio" }),
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

    await page.goto("/showcase/voice-interface");
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

    await page.goto("/showcase/voice-interface");
    await page.waitForLoadState("networkidle");

    expect(failedResponses).toEqual([]);
  });

  test("existe exatamente um <h1> na página", async ({ page }) => {
    await page.goto("/showcase/voice-interface");

    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBe(1);
  });

  test("sem violações de acessibilidade (axe)", async ({ page }) => {
    await page.goto("/showcase/voice-interface");
    expect(await runAxeCheck(page)).toEqual([]);
  });

  test("sem scroll horizontal nos breakpoints de referência", async ({
    page,
  }) => {
    for (const width of BREAKPOINTS) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/showcase/voice-interface");

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
    await page.goto("/showcase/voice-interface");

    await expect(page.locator("section").nth(1)).toMatchAriaSnapshot();
  });

  test("navegação por teclado alcança o link Home do navbar e Enter navega para a Home", async ({
    page,
    browserName,
  }) => {
    await page.goto("/showcase/voice-interface");

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
    await page.goto("/showcase/voice-interface");

    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    await expect(
      page.getByRole("button", { name: "Clique para capturar áudio" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Mudar idioma" }).click();
    await page.getByRole("button", { name: "English" }).click();

    await expect(
      page.getByRole("button", { name: "Click to capture audio" }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.locator("html")).toHaveAttribute("lang", "en-US");

    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toMatch(/\b(shared|voiceInterface)\.[a-zA-Z]+\./);
  });

  test("caminho feliz: capturar áudio transcreve o texto e a sessão encerra sozinha", async ({
    page,
  }) => {
    await page.addInitScript(fakeSpeechRecognitionScript, {
      behavior: "result",
      transcript: "teste de reconhecimento de voz",
      autoEnd: true,
    });

    await page.goto("/showcase/voice-interface");

    await page
      .getByRole("button", { name: "Clique para capturar áudio" })
      .click();

    await expect(
      page.getByRole("button", { name: "Capturando áudio..." }),
    ).toBeVisible();
    await expect(page.locator("textarea")).toHaveValue(
      /teste de reconhecimento de voz/,
      { timeout: 10_000 },
    );

    await expect(
      page.getByRole("button", { name: "Clique para capturar áudio" }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("caso de erro: permissão de microfone negada degrada com mensagem clara em vez de travar", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.addInitScript(fakeSpeechRecognitionScript, {
      behavior: "error",
      transcript: "",
    });

    await page.goto("/showcase/voice-interface");

    await page
      .getByRole("button", { name: "Clique para capturar áudio" })
      .click();

    await expect(
      page.getByText(
        "Não foi possível acessar o microfone. Verifique se a permissão foi concedida e tente novamente.",
      ),
    ).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });

  test("caso de erro: Speech Recognition indisponível neste navegador desabilita a captura sem travar", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.addInitScript(() => {
      Object.defineProperty(window, "SpeechRecognition", {
        configurable: true,
        value: undefined,
      });
      Object.defineProperty(window, "webkitSpeechRecognition", {
        configurable: true,
        value: undefined,
      });
    });

    await page.goto("/showcase/voice-interface");

    await expect(
      page.getByRole("button", { name: "Clique para capturar áudio" }),
    ).toBeDisabled();
    await expect(
      page.getByText(
        "Speech Recognition API não é suportada neste navegador ou plataforma.",
      ),
    ).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });

  test("caminho feliz: reproduzir o texto transcrito aciona a síntese de voz", async ({
    page,
  }) => {
    await page.addInitScript(fakeSpeechRecognitionScript, {
      behavior: "result",
      transcript: "texto para testar a fala",
    });
    await page.addInitScript(fakeSpeechSynthesisScript);

    await page.goto("/showcase/voice-interface");

    await page
      .getByRole("button", { name: "Clique para capturar áudio" })
      .click();
    await expect(page.locator("textarea")).toHaveValue(
      /texto para testar a fala/,
      { timeout: 10_000 },
    );

    await page.getByRole("button", { name: "Reproduzir" }).click();

    await expect(
      page.getByRole("button", { name: "Reproduzindo..." }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Reproduzir" })).toBeVisible(
      { timeout: 10_000 },
    );

    await page.getByRole("button", { name: "Limpar" }).click();
    await expect(page.locator("textarea")).toHaveValue("");
  });

  test("caso de erro: Text-to-Speech indisponível neste navegador degrada com mensagem clara em vez de travar", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.addInitScript(() => {
      Object.defineProperty(window, "speechSynthesis", {
        configurable: true,
        value: undefined,
      });
    });

    await page.goto("/showcase/voice-interface");

    await expect(
      page.getByText(
        "Text-to-Speech não é suportada neste navegador ou plataforma.",
      ),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Reproduzir" }),
    ).toBeDisabled();
    expect(consoleErrors).toEqual([]);
  });

  test("navegação para a próxima demo (Offline Data Layer) funciona", async ({
    page,
  }) => {
    await page.goto("/showcase/voice-interface");

    await page.getByRole("link", { name: /Dados Offline \+ Sincronização/ }).click();

    await expect(page).toHaveURL("/showcase/offline-data-layer");
  });
});
