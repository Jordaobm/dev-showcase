import { fileURLToPath } from "node:url";
import path from "node:path";
import { chromium } from "playwright";

const dir = path.dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 2 });
await page.goto(`file://${path.join(dir, "full.html").replace(/\\/g, "/")}`);

for (const id of ["a", "b", "c"]) {
  const card = page.locator(`#${id} .card`);
  await card.screenshot({ path: path.join(dir, `full-${id}.png`), scale: "css" });
  const box = await card.boundingBox();
  await page.screenshot({
    path: path.join(dir, `full-top-${id}.png`),
    clip: { ...box, height: 40 },
  });
}

await browser.close();
console.log("ok");
