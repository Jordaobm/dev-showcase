import { test, expect } from "@/testing/playwright-fixtures";
import type { Page } from "@playwright/test";
import { runAxeCheck } from "@/testing/a11y";

const BREAKPOINTS = [375, 430, 768, 1024, 1280];

const LS_ACCESS = "jwt_demo_access_token";

const base64url = (value: unknown) => {
  const json = typeof value === "string" ? value : JSON.stringify(value);
  return Buffer.from(json).toString("base64url");
};

const fakeJWT = (payload: Record<string, unknown>) =>
  `${base64url({ alg: "HS256", typ: "JWT" })}.${base64url(payload)}.fake-signature`;

const isBrowserGeneratedNetworkFailureNoise = (text: string) =>
  /Failed to load resource: the server responded with a status of \d+/.test(
    text,
  );

const expectCleanConsole = (entries: string[]) => {
  expect(
    entries.filter((text) => !isBrowserGeneratedNetworkFailureNoise(text)),
  ).toEqual([]);
};

const seedActiveJwtSession = async (page: Page) => {
  const token = fakeJWT({
    id: 1,
    name: "Ana Tester",
    email: "ana@test.dev",
    createdAt: new Date().toISOString(),
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 300,
  });
  await page.addInitScript(
    (values) => localStorage.setItem(values.key, values.token),
    { key: LS_ACCESS, token },
  );
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (!navigator.serviceWorker) return;
    Object.defineProperty(navigator.serviceWorker, "register", {
      configurable: true,
      value: async () => ({
        scope: "/",
        installing: null,
        waiting: null,
        active: null,
        addEventListener() {},
        update: async () => {},
      }),
    });
  });
});

test.describe("Autenticação — genéricos", () => {
  test("carrega sem erro de console e renderiza os elementos principais", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.goto("/showcase/auth");

    await expect(
      page.getByRole("heading", { level: 1, name: "Autenticação" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 3, name: "JWT (JSON Web Token)" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 3, name: "OAuth 2.0" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 3, name: "TOTP" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 3, name: "Magic Link" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        level: 3,
        name: "Web Authentication API (WebAuthn)",
      }),
    ).toBeVisible();

    expectCleanConsole(consoleErrors);
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

    await page.goto("/showcase/auth");
    await page.waitForLoadState("networkidle");

    expectCleanConsole(messages);
  });

  test("nenhuma resposta de rede falha (status >= 400) durante o load, exceto o refresh silencioso esperado", async ({
    page,
  }) => {
    const failedResponses: string[] = [];
    page.on("response", (response) => {
      if (response.status() >= 400) {
        failedResponses.push(`${response.status()} ${response.url()}`);
      }
    });

    await page.goto("/showcase/auth");
    await page.waitForLoadState("networkidle");

    const unexpected = failedResponses.filter(
      (entry) =>
        !entry.startsWith("401") || !entry.includes("/api/jwt/refresh"),
    );
    expect(unexpected).toEqual([]);
  });

  test("existe exatamente um <h1> na página", async ({ page }) => {
    await page.goto("/showcase/auth");

    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBe(1);
  });

  test("sem violações de acessibilidade (axe)", async ({ page }) => {
    await page.goto("/showcase/auth");
    expect(await runAxeCheck(page)).toEqual([]);
  });

  test("sem scroll horizontal nos breakpoints de referência", async ({
    page,
  }) => {
    for (const width of BREAKPOINTS) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/showcase/auth");

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
    await page.goto("/showcase/auth");

    await expect(page.locator("section").nth(1)).toMatchAriaSnapshot();
  });

  test("navegação por teclado alcança o link Home do navbar e Enter navega para a Home", async ({
    page,
    browserName,
  }) => {
    await page.goto("/showcase/auth");

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
    await page.goto("/showcase/auth");

    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    await expect(
      page.getByRole("button", { name: "Criar acessos" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Mudar idioma" }).click();
    await page.getByRole("button", { name: "English" }).click();

    await expect(
      page.getByRole("button", { name: "Create account" }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.locator("html")).toHaveAttribute("lang", "en-US");

    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toMatch(/\b(shared|auth)\.[a-zA-Z]+\./);
  });

  test("link de navegação para a próxima demo (3D & Animações Avançadas) aponta para a rota correta", async ({
    page,
  }) => {
    await page.goto("/showcase/auth");

    await expect(
      page.getByRole("link", { name: /3D & Animações Avançadas/ }),
    ).toHaveAttribute("href", "/showcase/demo3d");
  });
});

test.describe("Autenticação — JWT", () => {
  test("caminho feliz: registro e login mockados aplicam a sessão e decodificam o JWT", async ({
    page,
  }) => {
    await page.route("**/api/jwt/register", async (route) => {
      await route.fulfill({ status: 200, json: { ok: true } });
    });

    const accessToken = fakeJWT({
      id: 7,
      name: "Ana Tester",
      email: "ana@test.dev",
      createdAt: new Date().toISOString(),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 300,
    });
    await page.route("**/api/jwt/auth", async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          user: {
            id: 7,
            name: "Ana Tester",
            email: "ana@test.dev",
            createdAt: new Date().toISOString(),
          },
          accessToken,
        },
      });
    });
    await page.route("**/api/jwt/logout", async (route) => {
      await route.fulfill({ status: 200, json: { ok: true } });
    });

    await page.goto("/showcase/auth");

    await page.getByLabel("Nome completo").pressSequentially("Ana Tester");
    await page
      .getByLabel("E-mail para registro")
      .pressSequentially("ana@test.dev");
    await page
      .getByLabel("Senha", { exact: true })
      .pressSequentially("senha1!");
    await page.getByRole("button", { name: "Criar acessos" }).click();
    await expect(
      page.getByText("Usuário criado com sucesso! Agora faça o login."),
    ).toBeVisible();

    await page
      .getByLabel("E-mail para login")
      .pressSequentially("ana@test.dev");
    await page.getByLabel("Senha para login").pressSequentially("senha1!");
    await page.getByRole("button", { name: "Autenticar e obter JWT" }).click();

    await expect(page.getByText("✅ Você está autenticado!")).toBeVisible();
    await expect(page.getByText("ana@test.dev").first()).toBeVisible();

    await page.getByRole("button", { name: "Sair (logout)" }).click();
    await expect(page.getByText("✅ Você está autenticado!")).not.toBeVisible();
    await expect(
      page.getByRole("button", { name: "Autenticar e obter JWT" }),
    ).toBeVisible();
  });

  test("caso de erro: credenciais inválidas degradam com mensagem clara em vez de travar", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.route("**/api/jwt/auth", async (route) => {
      await route.fulfill({
        status: 400,
        json: { error: "invalid_credentials" },
      });
    });

    await page.goto("/showcase/auth");

    await page
      .getByLabel("E-mail para login")
      .pressSequentially("ana@test.dev");
    await page.getByLabel("Senha para login").pressSequentially("senha1!");
    await page.getByRole("button", { name: "Autenticar e obter JWT" }).click();

    await expect(
      page.getByText("E-mail ou senha inválidos.", { exact: true }),
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { level: 3, name: "TOTP" }),
    ).toBeVisible();
    expectCleanConsole(consoleErrors);
  });

  test("caso de erro: falha interna do backend nunca vaza texto cru para a interface", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.route("**/api/jwt/auth", async (route) => {
      await route.fulfill({
        status: 500,
        json: { error: "internal_error" },
      });
    });

    await page.goto("/showcase/auth");

    await page
      .getByLabel("E-mail para login")
      .pressSequentially("ana@test.dev");
    await page.getByLabel("Senha para login").pressSequentially("senha1!");
    await page.getByRole("button", { name: "Autenticar e obter JWT" }).click();

    await expect(
      page.getByText(
        "Ops, parece que algo não saiu como o planejado. Tente novamente mais tarde.",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(page.getByText("internal_error")).not.toBeVisible();

    expectCleanConsole(consoleErrors);
  });
});

test.describe("Autenticação — OAuth 2.0", () => {
  test("caminho feliz: sessão NextAuth mockada hidrata credenciais e ID Token decodificado", async ({
    page,
  }) => {
    const idToken = fakeJWT({
      sub: "google-uid-123",
      email: "ana@test.dev",
      name: "Ana Tester",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 300,
    });

    await page.route("**/api/auth/session", async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          user: {
            name: "Ana Tester",
            email: "ana@test.dev",
            image: "https://example.com/avatar.png",
          },
          expires: new Date(Date.now() + 3600_000).toISOString(),
          accessToken: "fake-google-access-token",
          idToken,
        },
      });
    });

    await page.goto("/showcase/auth");

    await expect(page.getByText("✅ Você está autenticado!")).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText("ana@test.dev").first()).toBeVisible();
  });

  test("caso de erro: ID Token do Google expirado degrada com aviso em vez de travar a sessão", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    const expiredIdToken = fakeJWT({
      sub: "google-uid-123",
      email: "ana@test.dev",
      name: "Ana Tester",
      iat: Math.floor(Date.now() / 1000) - 400,
      exp: Math.floor(Date.now() / 1000) - 10,
    });

    await page.route("**/api/auth/session", async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          user: { name: "Ana Tester", email: "ana@test.dev", image: null },
          expires: new Date(Date.now() + 3600_000).toISOString(),
          accessToken: "fake-google-access-token",
          idToken: expiredIdToken,
        },
      });
    });

    await page.goto("/showcase/auth");

    await expect(page.getByText("ID Token do Google expirado.")).toBeVisible({
      timeout: 10_000,
    });
    expectCleanConsole(consoleErrors);
  });
});

test.describe("Autenticação — TOTP", () => {
  test("caminho feliz: gerar QR Code e validar o código funcionam ponta a ponta", async ({
    page,
  }) => {
    await seedActiveJwtSession(page);

    await page.route("**/api/totp/generate", async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          id: 42,
          qrCode:
            "otpauth://totp/DevShowcase:ana%40test.dev?secret=JBSWY3DPEHPK3PXP&issuer=DevShowcase",
          backupCodes: [
            "AAAA-1111",
            "BBBB-2222",
            "CCCC-3333",
            "DDDD-4444",
            "EEEE-5555",
            "FFFF-6666",
            "GGGG-7777",
            "HHHH-8888",
          ],
        },
      });
    });
    await page.route("**/api/totp/validate", async (route) => {
      await route.fulfill({ status: 200, json: { valid: true } });
    });

    await page.goto("/showcase/auth");

    await expect(
      page.getByRole("button", { name: "Ativar 2FA" }),
    ).toBeEnabled();
    await page.getByRole("button", { name: "Ativar 2FA" }).click();

    await expect(page.getByText("JBSWY3DPEHPK3PXP")).toBeVisible();
    await expect(page.getByText("AAAA-1111")).toBeVisible();

    await page
      .getByLabel("Código do app (6 dígitos)")
      .pressSequentially("123456");
    await page.getByRole("button", { name: "Verificar código" }).click();

    await expect(page.getByText("Código válido!")).toBeVisible();
  });

  test("caso de erro: código incorreto degrada com mensagem clara em vez de travar", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await seedActiveJwtSession(page);

    await page.route("**/api/totp/generate", async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          id: 42,
          qrCode:
            "otpauth://totp/DevShowcase:ana%40test.dev?secret=JBSWY3DPEHPK3PXP&issuer=DevShowcase",
          backupCodes: ["AAAA-1111"],
        },
      });
    });
    await page.route("**/api/totp/validate", async (route) => {
      await route.fulfill({ status: 400, json: { error: "Código inválido" } });
    });

    await page.goto("/showcase/auth");

    await page.getByRole("button", { name: "Ativar 2FA" }).click();
    await expect(page.getByText("JBSWY3DPEHPK3PXP")).toBeVisible();

    await page
      .getByLabel("Código do app (6 dígitos)")
      .pressSequentially("000000");
    await page.getByRole("button", { name: "Verificar código" }).click();

    await expect(
      page.getByText("Código inválido", { exact: true }),
    ).toBeVisible();
    expectCleanConsole(consoleErrors);
  });

  test("backup codes: copiar, baixar .txt e reconfigurar 2FA (modo backup) funcionam ponta a ponta", async ({
    page,
    context,
    browserName,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    if (browserName === "chromium") {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    }

    await seedActiveJwtSession(page);

    await page.route("**/api/totp/generate", async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          id: 42,
          qrCode:
            "otpauth://totp/DevShowcase:ana%40test.dev?secret=JBSWY3DPEHPK3PXP&issuer=DevShowcase",
          backupCodes: ["AAAA-1111", "BBBB-2222"],
        },
      });
    });
    await page.route("**/api/totp/validate", async (route) => {
      await route.fulfill({ status: 200, json: { valid: true } });
    });
    await page.route("**/api/totp/reset", async (route) => {
      await route.fulfill({ status: 200, json: {} });
    });

    await page.goto("/showcase/auth");

    await page.getByRole("button", { name: "Ativar 2FA" }).click();
    await expect(page.getByText("AAAA-1111")).toBeVisible();

    if (browserName === "chromium") {
      await page.getByTitle("Clique para copiar").first().click();
      await page.getByRole("button", { name: "Copiar todos" }).click();
      await expect(page.getByText("Copiado!")).toBeVisible();
    }

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Baixar .txt" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("backup-codes-2fa.txt");

    await page.getByRole("button", { name: "Backup code" }).click();
    await page.getByLabel("Backup code").pressSequentially("BBBB2222");
    await page.getByRole("button", { name: "Verificar código" }).click();
    await expect(page.getByText("Backup code aceito!")).toBeVisible();

    await page.getByRole("button", { name: "Reconfigurar 2FA" }).click();
    await expect(page.getByText("AAAA-1111")).toBeVisible();

    expectCleanConsole(consoleErrors);
  });
});

test.describe("Autenticação — Magic Link", () => {
  test("caminho feliz: envio do Magic Link mockado confirma o feedback de sucesso", async ({
    page,
  }) => {
    await page.route("**/api/magiclink/send", async (route) => {
      await route.fulfill({ status: 200, json: { ok: true } });
    });

    await page.goto("/showcase/auth");

    await page
      .getByLabel("E-mail para receber o magic link")
      .pressSequentially("ana@test.dev");
    await page.getByRole("button", { name: "Enviar Magic Link" }).click();

    await expect(page.getByText("Confira seu e-mail")).toBeVisible();
  });

  test("caso de erro: link expirado ou já utilizado degrada com mensagem clara", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.route("**/api/magiclink/login", async (route) => {
      await route.fulfill({
        status: 401,
        json: { error: "Token expirado ou já utilizado" },
      });
    });

    await page.goto("/showcase/auth?token=expired-token-123");

    await expect(
      page
        .getByText(
          "Este link já foi utilizado ou expirou. Solicite um novo Magic Link acima.",
        )
        .first(),
    ).toBeVisible();
    expectCleanConsole(consoleErrors);
  });
});

test.describe("Autenticação — WebAuthn", () => {
  test("WebAuthn indisponível no navegador desabilita os botões e mostra mensagem clara em vez de travar", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.addInitScript(() => {
      Object.defineProperty(window, "PublicKeyCredential", {
        configurable: true,
        get: () => undefined,
      });
    });

    await page.goto("/showcase/auth");

    await expect(
      page.getByRole("button", { name: "Criar Passkey" }),
    ).toBeDisabled();
    await expect(
      page.getByText(
        "WebAuthn não é suportado neste navegador ou este contexto não é seguro (HTTPS é obrigatório).",
      ),
    ).toBeVisible();
    expectCleanConsole(consoleErrors);
  });

  test("caso de erro: usuário cancela o prompt biométrico do SO durante o registro", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.route("**/api/credentials/init", async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          challenge: base64url("challenge-bytes"),
          rp: { name: "Dev Showcase", id: "localhost" },
          user: {
            id: base64url("user-id-bytes"),
            name: "ana",
            displayName: "ana",
          },
          pubKeyCredParams: [{ type: "public-key", alg: -7 }],
          timeout: 60000,
        },
      });
    });

    await page.addInitScript(() => {
      Object.defineProperty(navigator, "credentials", {
        configurable: true,
        value: {
          create: () =>
            Promise.reject(
              new DOMException(
                "The operation either timed out or was not allowed.",
                "NotAllowedError",
              ),
            ),
          get: () =>
            Promise.reject(
              new DOMException(
                "The operation either timed out or was not allowed.",
                "NotAllowedError",
              ),
            ),
        },
      });
    });

    await page.goto("/showcase/auth");

    await page
      .getByLabel("Nome de usuário para registrar a passkey")
      .pressSequentially("ana");
    await page.getByRole("button", { name: "Criar Passkey" }).click();

    await expect(
      page.getByText("Operação cancelada ou não suportada"),
    ).toBeVisible();
    expectCleanConsole(consoleErrors);
  });

  test("caminho feliz: registrar e autenticar uma passkey de verdade via autenticador virtual do CDP", async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName !== "chromium",
      "Domínio WebAuthn do CDP só existe em Chromium",
    );

    const client = await page.context().newCDPSession(page);
    await client.send("WebAuthn.enable");
    const { authenticatorId } = await client.send(
      "WebAuthn.addVirtualAuthenticator",
      {
        options: {
          protocol: "ctap2",
          transport: "internal",
          hasResidentKey: true,
          hasUserVerification: true,
          isUserVerified: true,
        },
      },
    );

    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.goto("/showcase/auth");

    const webAuthnSection = page.locator("#pwa-web-authn-api");

    await webAuthnSection
      .getByLabel("Nome de usuário para registrar a passkey")
      .pressSequentially("ana-cdp");
    await webAuthnSection
      .getByRole("button", { name: "Criar Passkey" })
      .click();
    await expect(
      webAuthnSection.getByText("Credencial registrada com sucesso"),
    ).toBeVisible({ timeout: 10_000 });

    await webAuthnSection
      .getByRole("button", { name: "Autenticar", exact: true })
      .click();
    await expect(
      webAuthnSection.getByText("Autenticado com sucesso"),
    ).toBeVisible({ timeout: 10_000 });

    expectCleanConsole(consoleErrors);

    await client.send("WebAuthn.removeVirtualAuthenticator", {
      authenticatorId,
    });
  });
});
