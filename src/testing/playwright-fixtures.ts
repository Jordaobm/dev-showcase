import { test as base } from "@playwright/test";
import type { Page } from "@playwright/test";

export { expect } from "@playwright/test";
import { CoverageReport } from "monocart-coverage-reports";
import { coverageOptions } from "./coverage-options";

export const openMobileMenu = async (page: Page) => {
  await page.getByRole("button", { name: "Abrir menu" }).click();
};

const mcr = new CoverageReport(coverageOptions);

export const test = base.extend<{ autoCoverage: void }>({
  autoCoverage: [
    async ({ page, browserName }, use) => {
      const collectCoverage = browserName === "chromium";

      if (collectCoverage) {
        await Promise.all([
          page.coverage.startJSCoverage({ resetOnNavigation: false }),
          page.coverage.startCSSCoverage({ resetOnNavigation: false }),
        ]);
      }

      await use();

      if (collectCoverage) {
        const [jsCoverage, cssCoverage] = await Promise.all([
          page.coverage.stopJSCoverage(),
          page.coverage.stopCSSCoverage(),
        ]);
        await mcr.add([...jsCoverage, ...cssCoverage]);
      }
    },
    { auto: true },
  ],
});
