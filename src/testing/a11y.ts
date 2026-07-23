import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";

export const runAxeCheck = async (page: Page, disableRules: string[] = []) => {
  const builder = new AxeBuilder({ page });
  if (disableRules.length > 0) builder.disableRules(disableRules);
  const { violations } = await builder.analyze();
  return violations;
};
