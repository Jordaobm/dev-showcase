import { test, expect } from "@/testing/playwright-fixtures";

const BREAKPOINTS = [375, 430, 768, 1024, 1280];

const isBrowserGeneratedNetworkFailureNoise = (text: string) =>
  /Failed to load resource: the server responded with a status of \d+/.test(
    text,
  );

const fakeNotificationScript = ({ result }: { result: string }) => {
  class FakeNotification {
    static permission = "default";
    static requestPermission() {
      FakeNotification.permission = result;
      return Promise.resolve(result);
    }
  }

  Object.defineProperty(window, "Notification", {
    configurable: true,
    value: FakeNotification,
  });
};

const fakePushManagerScript = ({
  subscribeBehavior,
  existingSubscription,
}: {
  subscribeBehavior: string;
  existingSubscription: boolean;
}) => {
  const fakeSubscription = {
    endpoint: "https://fake.test/push/abc123",
    toJSON() {
      return {
        endpoint: this.endpoint,
        keys: { p256dh: "fake-p256dh", auth: "fake-auth" },
      };
    },
  };

  const fakeRegistration = {
    pushManager: {
      subscribe: () =>
        subscribeBehavior === "reject"
          ? Promise.reject(
              new DOMException(
                "The user denied permission to use the Push API.",
                "NotAllowedError",
              ),
            )
          : Promise.resolve(fakeSubscription),
      getSubscription: () =>
        Promise.resolve(existingSubscription ? fakeSubscription : null),
    },
  };

  Object.defineProperty(navigator, "serviceWorker", {
    configurable: true,
    value: {
      ready: Promise.resolve(fakeRegistration),
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
  Object.defineProperty(window, "PushManager", {
    configurable: true,
    value: function PushManager() {},
  });
};

test.describe("Web Push Notifications", () => {
  test("carrega sem erro de console e renderiza os elementos principais", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.goto("/showcase/push-notifications");

    await expect(
      page.getByRole("heading", { level: 1, name: "Web Push Notifications" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        level: 3,
        name: "Push Notifications",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Habilitar Notificações" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Ativar Push Notifications" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Enviar notificação de teste" }),
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

    await page.goto("/showcase/push-notifications");
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

    await page.goto("/showcase/push-notifications");
    await page.waitForLoadState("networkidle");

    expect(failedResponses).toEqual([]);
  });

  test("existe exatamente um <h1> na página", async ({ page }) => {
    await page.goto("/showcase/push-notifications");

    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBe(1);
  });

  test("sem scroll horizontal nos breakpoints de referência", async ({
    page,
  }) => {
    for (const width of BREAKPOINTS) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/showcase/push-notifications");

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
    await page.goto("/showcase/push-notifications");

    await expect(page.locator("section").nth(1)).toMatchAriaSnapshot();
  });

  test("navegação por teclado alcança o link Home do navbar e Enter navega para a Home", async ({
    page,
    browserName,
  }) => {
    await page.goto("/showcase/push-notifications");

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
    await page.goto("/showcase/push-notifications");

    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    await expect(
      page.getByRole("button", { name: "Habilitar Notificações" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Mudar idioma" }).click();
    await page.getByRole("button", { name: "English" }).click();

    await expect(
      page.getByRole("button", { name: "Enable Notifications" }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.locator("html")).toHaveAttribute("lang", "en-US");

    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toMatch(/\b(shared|pushNotifications)\.[a-zA-Z]+\./);
  });

  test("caso de erro: Push API/Service Worker indisponível neste navegador degrada com mensagem clara em vez de travar", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.addInitScript(() => {
      delete (Navigator.prototype as unknown as Record<string, unknown>)
        .serviceWorker;
      delete (window as unknown as Record<string, unknown>).PushManager;
    });

    await page.goto("/showcase/push-notifications");

    await expect(
      page.getByText(
        "Push Notifications não são suportadas neste navegador. Use um navegador desktop ou mobile atualizado, com suporte a Service Worker e Push API.",
      ),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Habilitar Notificações" }),
    ).toBeDisabled();
    await expect(
      page.getByRole("button", { name: "Ativar Push Notifications" }),
    ).toBeDisabled();
    expect(consoleErrors).toEqual([]);
  });

  test("caminho feliz: permitir notificações, registrar o dispositivo e enviar uma notificação de teste funcionam ponta a ponta", async ({
    page,
  }) => {
    await page.addInitScript(fakeNotificationScript, { result: "granted" });
    await page.addInitScript(fakePushManagerScript, {
      subscribeBehavior: "resolve",
      existingSubscription: false,
    });

    await page.goto("/showcase/push-notifications");

    await page.getByRole("button", { name: "Habilitar Notificações" }).click();
    await expect(
      page.getByRole("button", { name: "Notificações Permitidas" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Notificações Permitidas" }),
    ).toBeDisabled();

    await page
      .getByRole("button", { name: "Ativar Push Notifications" })
      .click();
    await expect(
      page.getByRole("button", { name: "Ativar Push Notifications" }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      page.getByText(
        "Não foi possível registrar este dispositivo para notificações.",
      ),
    ).not.toBeVisible();

    await page.route("**/api/push/send", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      }),
    );
    await page
      .getByRole("button", { name: "Enviar notificação de teste" })
      .click();
    await expect(
      page.getByRole("button", { name: "Enviar notificação de teste" }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      page.getByText("Não foi possível enviar a notificação de teste."),
    ).not.toBeVisible();
  });

  test("caso de erro: permissão de notificação negada degrada com mensagem clara", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.addInitScript(fakeNotificationScript, { result: "denied" });
    await page.addInitScript(fakePushManagerScript, {
      subscribeBehavior: "resolve",
      existingSubscription: false,
    });

    await page.goto("/showcase/push-notifications");

    await page.getByRole("button", { name: "Habilitar Notificações" }).click();

    await expect(
      page.getByText(
        "Permissão de notificações negada. Para usar esta demo, habilite as notificações para este site nas configurações do navegador e recarregue a página.",
      ),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Habilitar Notificações" }),
    ).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });

  test("caso de erro: registrar dispositivo (subscribe) falha degrada com mensagem clara", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.addInitScript(fakePushManagerScript, {
      subscribeBehavior: "reject",
      existingSubscription: false,
    });

    await page.goto("/showcase/push-notifications");

    await page
      .getByRole("button", { name: "Ativar Push Notifications" })
      .click();

    await expect(
      page.getByText(
        "Não foi possível registrar este dispositivo para notificações. Tente novamente.",
      ),
    ).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });

  test("caso de erro: enviar notificação de teste falha degrada com mensagem clara", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.addInitScript(fakePushManagerScript, {
      subscribeBehavior: "resolve",
      existingSubscription: true,
    });
    await page.route("**/api/push/send", (route) =>
      route.fulfill({ status: 500 }),
    );

    await page.goto("/showcase/push-notifications");

    await page
      .getByRole("button", { name: "Enviar notificação de teste" })
      .click();

    await expect(
      page.getByText(
        "Não foi possível enviar a notificação de teste. Tente novamente.",
      ),
    ).toBeVisible();
    expect(
      consoleErrors.filter(
        (text) => !isBrowserGeneratedNetworkFailureNoise(text),
      ),
    ).toEqual([]);
  });

  test("navegação para a próxima demo (Voice Interface) funciona", async ({
    page,
  }) => {
    await page.goto("/showcase/push-notifications");

    await page.getByRole("link", { name: /Voice Interface/ }).click();

    await expect(page).toHaveURL("/showcase/voice-interface");
  });
});
