import { existsSync, rmSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

const slug = process.argv[2];

if (!slug) {
  console.error(
    "Uso: npm run check:feature -- <slug>\n" +
      "Exemplo: npm run check:feature -- device-sensors\n" +
      "(o -- é obrigatório, senão o npm engole o argumento)",
  );
  process.exit(1);
}

const ROOT = process.cwd();
const featureDir = path.join(ROOT, "src", "features", slug);
const featureTestsDir = path.join(featureDir, "tests");

if (!existsSync(featureDir)) {
  console.error(`[check:feature] src/features/${slug}/ não existe.`);
  process.exit(1);
}
if (!existsSync(featureTestsDir)) {
  console.error(
    `[check:feature] src/features/${slug}/tests/ não existe — sem spec pra rodar.`,
  );
  process.exit(1);
}

const run = (label, command, args) => {
  console.log(`\n[check:feature] ▶ ${label}`);
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    console.error(
      `\n[check:feature] ✘ falhou em "${label}" (feature: ${slug})`,
    );
    process.exit(result.status ?? 1);
  }
};

run("lint", "npx", ["eslint", `src/features/${slug}`]);
run("typecheck", "npx", ["tsc", "--noEmit"]);
run("verify:architecture", "node", ["scripts/verify-architecture.mjs", slug]);

rmSync(path.join(ROOT, ".next"), { recursive: true, force: true });
run("suíte Playwright (5 engines, só as specs desta feature)", "npx", [
  "playwright",
  "test",
  `src/features/${slug}/tests`,
]);

run("cobertura da feature", "node", [
  "scripts/check-coverage-threshold.mjs",
  slug,
]);

console.log(
  `\n[check:feature] ✔ "${slug}" passou em todo o checklist automatizável ` +
    "(lint, typecheck, verify:architecture, suíte nos 5 engines, cobertura ≥ 80% dos arquivos da própria feature).",
);
console.log(
  "[check:feature] Lembrete: isto cobre os itens automatizáveis do FEATURE_CHECKLIST.md (seções 7–11). " +
    "Escopo/nomenclatura (0–2), i18n de conteúdo, ROADMAP.md (13) e convenção de commit/PR (14) continuam manuais.",
);
