import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const LCOV_PATH = path.join(ROOT, "coverage", "playwright", "lcov.info");
const THRESHOLD = Number(process.env.COVERAGE_THRESHOLD ?? 80);
const scopeSlug = process.argv[2] ?? null;
const scopePrefix = scopeSlug
  ? `src/features/${scopeSlug}/`.replaceAll("\\", "/")
  : null;

if (!existsSync(LCOV_PATH)) {
  console.error(
    `[check-coverage-threshold] ${LCOV_PATH} não encontrado — rode \`npm test\` (ou \`npm run test:coverage\`) antes.`,
  );
  process.exit(1);
}

const lcov = readFileSync(LCOV_PATH, "utf-8");
let linesFound = 0;
let linesHit = 0;
let matchedFiles = 0;
let currentFileMatches = !scopePrefix;

for (const line of lcov.split("\n")) {
  if (line.startsWith("SF:")) {
    const filePath = line.slice(3).replaceAll("\\", "/");
    currentFileMatches = !scopePrefix || filePath.includes(scopePrefix);
    if (currentFileMatches) matchedFiles += 1;
  } else if (currentFileMatches && line.startsWith("LF:")) {
    linesFound += Number(line.slice(3));
  } else if (currentFileMatches && line.startsWith("LH:")) {
    linesHit += Number(line.slice(3));
  }
}

if (scopeSlug && matchedFiles === 0) {
  console.error(
    `[check-coverage-threshold] nenhum arquivo de "src/features/${scopeSlug}/" aparece no lcov.info — confirme que as specs dessa feature rodaram nesta execução.`,
  );
  process.exit(1);
}

if (linesFound === 0) {
  console.error(
    "[check-coverage-threshold] lcov.info sem linhas rastreadas — algo está errado na coleta de cobertura.",
  );
  process.exit(1);
}

const pct = (linesHit / linesFound) * 100;
const formatted = pct.toFixed(2);
const scopeLabel = scopeSlug
  ? ` (escopo: src/features/${scopeSlug}/, ${matchedFiles} arquivo(s))`
  : "";

if (pct < THRESHOLD) {
  console.error(
    `[check-coverage-threshold] Cobertura em ${formatted}%${scopeLabel} — abaixo do mínimo de ${THRESHOLD}%.`,
  );
  process.exit(1);
}

console.log(
  `[check-coverage-threshold] OK — cobertura em ${formatted}%${scopeLabel} (mínimo exigido: ${THRESHOLD}%).`,
);
