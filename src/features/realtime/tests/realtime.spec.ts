import { test, expect } from "@/testing/playwright-fixtures";
import type { Browser, BrowserContext, Page } from "@playwright/test";

const API_URL = process.env.NEXT_PUBLIC_JAVA_API_URL ?? "https://localhost:8081";
const PAGE_URL = "/showcase/realtime";
const PASSWORD = "Teste@123";

test.describe.configure({ mode: "serial" });

test.use({ ignoreHTTPSErrors: true });

test.beforeAll(async ({ request }) => {
  const reachable = await request
    .get(`${API_URL}/events?token=probe`, { ignoreHTTPSErrors: true, timeout: 5_000 })
    .then((response) => response.status() === 401)
    .catch(() => false);
  test.skip(!reachable, `backend Java fora do ar em ${API_URL}`);
});

test.beforeEach(({ browserName, isMobile }) => {
  test.skip(
    browserName !== "chromium" || isMobile,
    "o fluxo real usa cookie Secure cross-origin e layout desktop: só chromium desktop",
  );
});

const uniqueId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const newUser = (label: string) => {
  const id = uniqueId();
  return {
    username: `e2e_${label}_${id}`,
    email: `e2e-${label}-${id}@example.test`,
    password: PASSWORD,
  };
};

type TestUser = ReturnType<typeof newUser>;

const registerUser = async (page: Page, user: TestUser) => {
  await page.goto(PAGE_URL);
  await page.getByLabel("Nome de usuário").fill(user.username);
  await page.getByLabel("Email").first().fill(user.email);
  await page.getByLabel("Senha", { exact: true }).first().fill(user.password);
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page.getByRole("button", { name: "Criar sala" }).first()).toBeVisible();
};

const openAs = async (browser: Browser, user: TestUser) => {
  const context = await browser.newContext({ ignoreHTTPSErrors: true, locale: "pt-BR" });
  const page = await context.newPage();
  await registerUser(page, user);
  return { context, page };
};

const createRoom = async (page: Page, name: string) => {
  await page.getByRole("button", { name: "Criar sala" }).first().click();
  await page.getByPlaceholder("ex: design-review").fill(name);
  await page.getByRole("button", { name: "Criar sala" }).last().click();
  const link = (await page.getByText(/\?room=/).innerText()).trim();
  await page.getByRole("button", { name: "Ir para a sala" }).click();
  await expect(page.getByLabel(`Mensagem em #${name}`)).toBeVisible();
  return link;
};

const joinByLink = async (page: Page, link: string, roomName: string) => {
  await page.getByPlaceholder("Colar link da sala…").fill(link);
  await page.getByRole("button", { name: "Entrar com link" }).click();
  await expect(page.getByLabel(`Mensagem em #${roomName}`)).toBeVisible();
};

const sendMessage = async (page: Page, roomName: string, text: string) => {
  await page.getByLabel(`Mensagem em #${roomName}`).fill(text);
  await page.getByRole("button", { name: "Enviar mensagem" }).click();
};

const closeAll = async (...contexts: BrowserContext[]) => {
  await Promise.all(contexts.map((context) => context.close()));
};

test.describe("Realtime — conta", () => {
  test("cadastro, sessão persistente, logout e login", async ({ page }) => {
    const user = newUser("auth");
    await registerUser(page, user);

    await page.reload();
    await expect(page.getByRole("button", { name: "Criar sala" }).first()).toBeVisible();

    await page.getByRole("button", { name: "Sair" }).click();
    await expect(page.getByRole("button", { name: "Entrar" }).first()).toBeVisible();

    const loginEmail = page.getByLabel("Email").nth(1);
    const loginPassword = page.getByLabel("Senha", { exact: true }).nth(1);
    await loginEmail.fill(user.email);
    await loginPassword.fill("Errada@999");
    await page.getByRole("button", { name: "Entrar" }).first().click();
    await expect(page.getByText("Email ou senha incorretos.")).toBeVisible();

    await loginPassword.fill(user.password);
    await page.getByRole("button", { name: "Entrar" }).first().click();
    await expect(page.getByRole("button", { name: "Criar sala" }).first()).toBeVisible();
  });

  test("não permite cadastrar o mesmo email duas vezes", async ({ page, browser }) => {
    const user = newUser("dup");
    await registerUser(page, user);

    const { context, page: second } = await openAs(browser, newUser("dup2"));
    await second.getByRole("button", { name: "Sair" }).click();
    await second.getByLabel("Nome de usuário").fill(`${user.username}_b`);
    await second.getByLabel("Email").first().fill(user.email);
    await second.getByLabel("Senha", { exact: true }).first().fill(user.password);
    await second.getByRole("button", { name: "Criar conta" }).click();
    await expect(second.getByText("Esse email já tem uma conta nesta demo.")).toBeVisible();
    await closeAll(context);
  });

  test("recuperação de senha: pede o link e rejeita token inválido", async ({ page }) => {
    await page.goto(PAGE_URL);
    await page.getByRole("button", { name: "Esqueci minha senha" }).click();
    const unknownEmail = `e2e-sem-conta-${uniqueId()}@example.test`;
    await page.getByLabel("Email").fill(unknownEmail);
    await page.getByRole("button", { name: "Enviar link" }).click();
    await expect(page.getByText("Link enviado!")).toBeVisible();

    await page.goto(`${PAGE_URL}?resetToken=token-invalido`);
    await page.getByLabel("Nova senha", { exact: true }).fill("Nova@1234");
    await page.getByLabel("Confirmar nova senha").fill("Outra@1234");
    await expect(page.getByText("As senhas não coincidem")).toBeVisible();
    await page.getByLabel("Confirmar nova senha").fill("Nova@1234");
    await page.getByRole("button", { name: "Alterar senha" }).click();
    await expect(page.getByText("Link inválido ou expirado. Solicite um novo.")).toBeVisible();
  });
});

test.describe("Realtime — salas e mensagens", () => {
  test("dois usuários trocam mensagens ao vivo e o dono exclui a sala", async ({ browser }) => {
    const owner = await openAs(browser, newUser("dono"));
    const guest = await openAs(browser, newUser("convidado"));
    const roomName = `sala-${uniqueId()}`;

    const link = await createRoom(owner.page, roomName);
    await joinByLink(guest.page, link, roomName);

    await sendMessage(owner.page, roomName, "olá do dono");
    await expect(guest.page.getByText("olá do dono")).toBeVisible();

    await sendMessage(guest.page, roomName, "oi, aqui é o convidado");
    await expect(owner.page.getByText("oi, aqui é o convidado")).toBeVisible();

    await expect(guest.page.getByRole("button", { name: "Excluir sala" })).toHaveCount(0);

    await owner.page.getByRole("button", { name: "Excluir sala" }).click();
    await owner.page
      .getByRole("dialog", { name: "Excluir sala" })
      .getByRole("button", { name: "Excluir", exact: true })
      .click();

    await expect(guest.page.getByText("Essa sala foi excluída pelo dono.")).toBeVisible();
    await expect(guest.page.getByLabel(`Mensagem em #${roomName}`)).toHaveCount(0);
    await expect(owner.page.getByLabel(`Mensagem em #${roomName}`)).toHaveCount(0);
    await expect(owner.page.getByText("Essa sala foi excluída pelo dono.")).toHaveCount(0);

    await closeAll(owner.context, guest.context);
  });

  test("link de sala inexistente mostra erro", async ({ page }) => {
    await registerUser(page, newUser("semsala"));
    await page
      .getByPlaceholder("Colar link da sala…")
      .fill("00000000-0000-4000-8000-000000000000");
    await page.getByRole("button", { name: "Entrar com link" }).click();
    await expect(page.getByText("Sala não encontrada. Confira o link.")).toBeVisible();
  });

  test("limite de 1000 caracteres no campo de mensagem", async ({ page }) => {
    await registerUser(page, newUser("limite"));
    const roomName = `limite-${uniqueId()}`;
    await createRoom(page, roomName);

    const input = page.getByLabel(`Mensagem em #${roomName}`);
    await input.fill("a".repeat(1200));
    await expect(input).toHaveValue("a".repeat(1000));
    await expect(page.getByText("1000/1000")).toBeVisible();
  });
});

test.describe("Realtime — notificações (SSE)", () => {
  const stubNotification = async (context: BrowserContext) => {
    await context.addInitScript(() => {
      const calls: { title: string; body?: string }[] = [];
      (window as unknown as { __notifications: typeof calls }).__notifications = calls;
      class FakeNotification {
        static permission = "granted";
        static requestPermission = async () => "granted";
        onclick: (() => void) | null = null;
        constructor(title: string, options?: { body?: string }) {
          calls.push({ title, body: options?.body });
        }
        close() {}
      }
      (window as unknown as { Notification: unknown }).Notification = FakeNotification;
    });
  };

  const notifications = (page: Page) =>
    page.evaluate(
      () =>
        (window as unknown as { __notifications: { title: string; body?: string }[] })
          .__notifications,
    );

  test("mensagem em sala não aberta gera notificação; sala aberta não gera", async ({
    browser,
  }) => {
    const owner = await openAs(browser, newUser("emissor"));
    const guestContext = await browser.newContext({ ignoreHTTPSErrors: true, locale: "pt-BR" });
    await stubNotification(guestContext);
    const guestPage = await guestContext.newPage();
    await registerUser(guestPage, newUser("receptor"));

    const roomA = `a-${uniqueId()}`;
    const roomB = `b-${uniqueId()}`;
    const linkA = await createRoom(owner.page, roomA);
    await joinByLink(guestPage, linkA, roomA);
    const linkB = await createRoom(owner.page, roomB);
    await joinByLink(guestPage, linkB, roomB);

    await guestPage.getByRole("button", { name: "Ativar notificações de mensagens" }).click();
    await expect(
      guestPage.getByRole("button", { name: "Silenciar notificações de mensagens" }),
    ).toBeVisible();

    const [socket] = await Promise.all([
      owner.page.waitForEvent("websocket"),
      owner.page.getByText(roomA, { exact: true }).first().click(),
    ]);
    await socket.waitForEvent("framereceived");
    await sendMessage(owner.page, roomA, "mensagem na sala A");

    await expect.poll(async () => (await notifications(guestPage)).length).toBe(1);
    const [first] = await notifications(guestPage);
    expect(first.title).toContain(roomA);
    expect(first.body).toBe("mensagem na sala A");

    await guestPage.getByText(roomA, { exact: true }).first().click();
    await sendMessage(owner.page, roomA, "mensagem com a sala aberta");
    await expect(guestPage.getByText("mensagem com a sala aberta")).toBeVisible();
    expect(await notifications(guestPage)).toHaveLength(1);

    await closeAll(owner.context, guestContext);
  });
});
