import { test, expect } from "@/testing/playwright-fixtures";
import type { Page } from "@playwright/test";
import { runAxeCheck } from "@/testing/a11y";

const BREAKPOINTS = [375, 430, 768, 1024, 1280];

const mockFakeMediaDevices = async (page: Page) => {
  await page.addInitScript(() => {
    const makeFakeVideoStream = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "red";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      setInterval(() => {
        ctx.fillStyle = `hsl(${Date.now() % 360}, 70%, 50%)`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }, 200);
      return canvas.captureStream(10);
    };

    const makeFakeAudioStream = () => {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const dest = ctx.createMediaStreamDestination();
      osc.connect(dest);
      osc.start();
      return dest.stream;
    };

    // Redefine navigator.mediaDevices as a fixed own object instead of mutating
    // whatever instance the engine returns: some WebKit builds don't hand back a
    // stable singleton from the native accessor, so patching individual methods
    // on it can silently fail to affect the object the app later reads.
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: async (constraints?: MediaStreamConstraints) =>
          constraints?.audio ? makeFakeAudioStream() : makeFakeVideoStream(),
        getDisplayMedia: async () => makeFakeVideoStream(),
      },
    });
  });
};

const mockRejectingGetUserMedia = async (page: Page) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: async () =>
          Promise.reject(
            new DOMException("Permission denied", "NotAllowedError"),
          ),
      },
    });
  });
};

const mockRejectingGetDisplayMedia = async (page: Page) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getDisplayMedia: async () =>
          Promise.reject(
            new DOMException("Permission denied", "NotAllowedError"),
          ),
      },
    });
  });
};

test.describe("Media Capture Studio — genéricos", () => {
  test("carrega sem erro de console e renderiza os elementos principais", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.goto("/showcase/media-capture");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "API's de Câmera, Tela & Audio",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 3, name: "Câmera API" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 3, name: "Tela API" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 3, name: "Áudio API" }),
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

    await page.goto("/showcase/media-capture");
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

    await page.goto("/showcase/media-capture");
    await page.waitForLoadState("networkidle");

    expect(failedResponses).toEqual([]);
  });

  test("existe exatamente um <h1> na página", async ({ page }) => {
    await page.goto("/showcase/media-capture");

    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBe(1);
  });

  test("sem violações de acessibilidade (axe)", async ({ page }) => {
    await page.goto("/showcase/media-capture");
    expect(await runAxeCheck(page)).toEqual([]);
  });

  test("sem scroll horizontal nos breakpoints de referência", async ({
    page,
  }) => {
    for (const width of BREAKPOINTS) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/showcase/media-capture");

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
    await page.goto("/showcase/media-capture");

    await expect(page.locator("section").nth(1)).toMatchAriaSnapshot();
  });

  test("navegação por teclado alcança o link Home do navbar e Enter navega para a Home", async ({
    page,
    browserName,
  }) => {
    await page.goto("/showcase/media-capture");

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
    await page.goto("/showcase/media-capture");

    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    await expect(
      page.getByRole("button", { name: "Capturar câmera" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Mudar idioma" }).click();
    await page.getByRole("button", { name: "English" }).click();

    await expect(
      page.getByRole("button", { name: "Capture camera" }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.locator("html")).toHaveAttribute("lang", "en-US");

    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toMatch(/\b(shared|mediaCapture)\.[a-zA-Z]+\./);
  });

  test("link de navegação para a próxima demo (Web Push Notifications) aponta para a rota correta", async ({
    page,
  }) => {
    await page.goto("/showcase/media-capture");

    await expect(
      page.getByRole("link", { name: /API de Notificações/ }),
    ).toHaveAttribute("href", "/showcase/push-notifications");
  });
});

test.describe("Media Capture Studio — Camera API", () => {
  test("caminho feliz: capturar, parar, baixar e reproduzir a gravação da câmera funcionam ponta a ponta", async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName === "webkit",
      "WebKit deste ambiente não implementa canvas.captureStream()",
    );

    await mockFakeMediaDevices(page);
    await page.goto("/showcase/media-capture");

    const section = page.locator("#pwa-camera-api");

    await section.getByRole("button", { name: "Capturar câmera" }).click();
    await expect(section.getByText("Gravando", { exact: true })).toBeVisible();

    await page.waitForTimeout(600);

    await section
      .getByRole("button", { name: "Parar de capturar câmera..." })
      .click();

    await expect(section.getByRole("button", { name: "Baixar" })).toBeEnabled();
    await expect(section.getByText("Gravação de vídeo")).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await section.getByRole("button", { name: "Baixar" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(
      /^dev_showcase_media_recorder_video_api_\d+\.webm$/,
    );

    const playButton = section.getByRole("button", { name: "Reproduzir" });
    await expect(playButton).toBeEnabled();
    await playButton.click();
    await expect(section.getByRole("button", { name: "Pausar" })).toBeVisible();

    const seekBar = section.getByRole("slider", {
      name: "Barra de progresso da reprodução",
    });
    await expect
      .poll(async () => {
        const value = await seekBar.getAttribute("aria-valuemax");
        return value ? parseFloat(value) > 0 : false;
      })
      .toBe(true);

    await seekBar.focus();
    await page.keyboard.press("ArrowRight");
    await expect(seekBar).not.toHaveAttribute("aria-valuenow", "0");
  });

  test("regressão: câmera continua habilitada mesmo sem suporte a getDisplayMedia", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "mediaDevices", {
        configurable: true,
        value: {
          getUserMedia: async () => new MediaStream(),
          getDisplayMedia: undefined,
        },
      });
    });

    await page.goto("/showcase/media-capture");

    await expect(
      page
        .locator("#pwa-camera-api")
        .getByRole("button", { name: "Capturar câmera" }),
    ).toBeEnabled();
  });

  test("caso de erro: permissão de câmera negada degrada com mensagem clara em vez de travar", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await mockRejectingGetUserMedia(page);
    await page.goto("/showcase/media-capture");

    const section = page.locator("#pwa-camera-api");
    await section.getByRole("button", { name: "Capturar câmera" }).click();

    await expect(section.getByText("Permission denied")).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });
});

test.describe("Media Capture Studio — MediaRecorder (tela)", () => {
  test("caminho feliz: compartilhar, parar e baixar a gravação de tela funcionam ponta a ponta", async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName === "webkit",
      "WebKit deste ambiente não implementa canvas.captureStream()",
    );

    await mockFakeMediaDevices(page);
    await page.goto("/showcase/media-capture");

    const section = page.locator("#pwa-media-recorder-video-api");

    await section.getByRole("button", { name: "Compartilhar a tela" }).click();
    await expect(section.getByText("Gravando", { exact: true })).toBeVisible();

    await page.waitForTimeout(600);

    await section
      .getByRole("button", { name: "Parar de compartilhar tela..." })
      .click();

    await expect(section.getByRole("button", { name: "Baixar" })).toBeEnabled();
    await expect(section.getByText("Gravação de vídeo")).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await section.getByRole("button", { name: "Baixar" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(
      /^dev_showcase_media_recorder_video_api_\d+\.webm$/,
    );

    const playButton = section.getByRole("button", { name: "Reproduzir" });
    await expect(playButton).toBeEnabled();
    await playButton.click();
    await expect(section.getByRole("button", { name: "Pausar" })).toBeVisible();

    const seekBar = section.getByRole("slider", {
      name: "Barra de progresso da reprodução",
    });
    await expect
      .poll(async () => {
        const value = await seekBar.getAttribute("aria-valuemax");
        return value ? parseFloat(value) > 0 : false;
      })
      .toBe(true);

    await seekBar.focus();
    await page.keyboard.press("ArrowRight");
    await expect(seekBar).not.toHaveAttribute("aria-valuenow", "0");
  });

  test("caso de erro: permissão de compartilhamento de tela negada degrada com mensagem clara", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await mockRejectingGetDisplayMedia(page);
    await page.goto("/showcase/media-capture");

    const section = page.locator("#pwa-media-recorder-video-api");
    await section.getByRole("button", { name: "Compartilhar a tela" }).click();

    await expect(section.getByText("Permission denied")).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });
});

test.describe("Media Capture Studio — MediaRecorder (áudio)", () => {
  test("caminho feliz: gravar, parar e baixar o áudio funcionam ponta a ponta", async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName === "webkit",
      "WebKit deste ambiente não expõe o global AudioContext",
    );

    await mockFakeMediaDevices(page);
    await page.goto("/showcase/media-capture");

    const section = page.locator("#pwa-media-recorder-audio-api");

    await section.getByRole("button", { name: "Gravar" }).click();
    await expect(
      section.getByRole("button", { name: "Gravando" }),
    ).toBeVisible();

    await page.waitForTimeout(600);

    await section.getByRole("button", { name: "Gravando" }).click();

    await expect(section.getByRole("button", { name: "Baixar" })).toBeEnabled();

    const downloadPromise = page.waitForEvent("download");
    await section.getByRole("button", { name: "Baixar" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(
      /^dev_showcase_media_recorder_audio_api_\d+(\.ogg)?$/,
    );

    const playButton = section.getByRole("button", { name: "Reproduzir" });
    await expect(playButton).toBeEnabled();
    await playButton.click();
    await expect(section.getByRole("button", { name: "Pausar" })).toBeVisible();

    const seekBar = section.getByRole("slider", {
      name: "Barra de progresso da reprodução",
    });
    await expect
      .poll(async () => {
        const value = await seekBar.getAttribute("aria-valuemax");
        return value ? parseFloat(value) > 0 : false;
      })
      .toBe(true);

    await seekBar.focus();
    await page.keyboard.press("ArrowRight");
    await expect(seekBar).not.toHaveAttribute("aria-valuenow", "0");
  });

  test("indisponível no navegador: botão desabilita e mostra mensagem clara em vez de travar", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.addInitScript(() => {
      Object.defineProperty(navigator, "mediaDevices", {
        configurable: true,
        value: { getUserMedia: undefined },
      });
    });

    await page.goto("/showcase/media-capture");

    const section = page.locator("#pwa-media-recorder-audio-api");
    await expect(
      section.getByRole("button", { name: "Gravar" }),
    ).toBeDisabled();
    await expect(
      section.getByText(
        "Gravação de áudio não é suportada neste navegador. Use um navegador atualizado para acessar essa funcionalidade.",
      ),
    ).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });
});
