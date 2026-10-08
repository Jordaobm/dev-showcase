import { defineConfig, devices } from "@playwright/test";

const useHttps = process.env.E2E_HTTPS === "1";
const baseURL = useHttps ? "https://localhost:3000" : "http://localhost:3000";
const httpsFlags =
  "--experimental-https --experimental-https-key ./certificates/localhost-key.pem --experimental-https-cert ./certificates/localhost.pem";

export default defineConfig({
  testDir: "./src",
  testMatch: "**/tests/*.spec.ts",
  globalSetup: "./src/testing/coverage-global-setup.ts",
  globalTeardown: "./src/testing/coverage-global-teardown.ts",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL,
    ignoreHTTPSErrors: useHttps,
    locale: "pt-BR",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "mobile-chrome", use: { ...devices["Pixel 5"] } },
  ],
  webServer: {
    command: useHttps
      ? `npm run build && npx next start ${httpsFlags}`
      : "npm run build && npm run start",
    url: baseURL,
    ignoreHTTPSErrors: useHttps,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
});
