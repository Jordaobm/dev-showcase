import { fileURLToPath } from "node:url";
import path from "node:path";
import { chromium } from "playwright";

const dir = path.dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 8 });
await page.goto(`file://${path.join(dir, "index.html").replace(/\\/g, "/")}`);

for (const id of ["a", "b", "c", "d"]) {
  const card = page.locator(`#${id} .card`);
  await card.screenshot({ path: path.join(dir, `variant-${id}.png`), scale: "css" });
  const box = await card.boundingBox();
  await page.screenshot({
    path: path.join(dir, `zoom-left-${id}.png`),
    clip: { ...box, width: 46, height: 22 },
  });
}

await browser.close();
console.log("ok");
