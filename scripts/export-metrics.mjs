import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const METRICS_DIR = path.join(ROOT, "metrics");
const LCOV_PATH = path.join(ROOT, "coverage", "playwright", "lcov.info");

mkdirSync(METRICS_DIR, { recursive: true });

function writeBadge(fileName, label, message, color) {
  const badge = { schemaVersion: 1, label, message, color };
  writeFileSync(
    path.join(METRICS_DIR, fileName),
    `${JSON.stringify(badge, null, 2)}\n`,
  );
  console.log(`  metrics/${fileName} -> ${label}: ${message}`);
}

function colorForPercent(pct) {
  if (pct >= 90) return "brightgreen";
  if (pct >= 75) return "green";
  if (pct >= 60) return "yellow";
  if (pct >= 40) return "orange";
  return "red";
}

function ratingLetter(value) {
  const map = { 1: "A", 2: "B", 3: "C", 4: "D", 5: "E" };
  return map[Math.round(Number(value))] ?? "?";
}

function colorForRating(letter) {
  return (
    { A: "brightgreen", B: "green", C: "yellow", D: "orange", E: "red" }[
      letter
    ] ?? "lightgrey"
  );
}

function exportCoverage() {
  if (!existsSync(LCOV_PATH)) {
    console.warn(
      "[metrics] coverage/playwright/lcov.info não encontrado — rode `npm run test:coverage` antes. Badge de cobertura não atualizado.",
    );
    return;
  }

  const lcov = readFileSync(LCOV_PATH, "utf-8");
  let linesFound = 0;
  let linesHit = 0;
  for (const line of lcov.split("\n")) {
    if (line.startsWith("LF:")) linesFound += Number(line.slice(3));
    else if (line.startsWith("LH:")) linesHit += Number(line.slice(3));
  }

  if (linesFound === 0) {
    console.warn(
      "[metrics] lcov.info sem linhas rastreadas — badge de cobertura não atualizado.",
    );
    return;
  }

  const pct = (linesHit / linesFound) * 100;
  writeBadge(
    "coverage-badge.json",
    "coverage",
    `${pct.toFixed(1)}%`,
    colorForPercent(pct),
  );
}

async function exportSonar() {
  const sonarHost = process.env.SONAR_HOST_URL ?? "http://localhost:9000";
  const projectKey = "dev-showcase";
  const token = process.env.SONAR_TOKEN;

  if (!token) {
    console.warn(
      "[metrics] SONAR_TOKEN não definido — pulando atualização dos badges do SonarQube (mantendo os já commitados).",
    );
    return;
  }

  const metricKeys = [
    "security_rating",
    "reliability_rating",
    "sqale_rating",
    "duplicated_lines_density",
    "security_hotspots_reviewed",
  ].join(",");

  const url = `${sonarHost}/api/measures/component?component=${projectKey}&metricKeys=${metricKeys}`;
  const auth = Buffer.from(`${token}:`).toString("base64");

  let response;
  try {
    response = await fetch(url, {
      headers: { Authorization: `Basic ${auth}` },
    });
  } catch {
    console.warn(
      `[metrics] Não foi possível alcançar ${sonarHost} — o SonarQube local está de pé (\`npm run sonar:up\`)? Badges do Sonar não atualizados.`,
    );
    return;
  }

  if (!response.ok) {
    console.warn(
      `[metrics] SonarQube respondeu ${response.status} — badges do Sonar não atualizados.`,
    );
    return;
  }

  const { component } = await response.json();
  const measures = Object.fromEntries(
    (component?.measures ?? []).map((m) => [m.metric, m.value]),
  );

  if (measures.security_rating) {
    const letter = ratingLetter(measures.security_rating);
    writeBadge(
      "sonar-security-badge.json",
      "security",
      letter,
      colorForRating(letter),
    );
  }
  if (measures.reliability_rating) {
    const letter = ratingLetter(measures.reliability_rating);
    writeBadge(
      "sonar-reliability-badge.json",
      "reliability",
      letter,
      colorForRating(letter),
    );
  }
  if (measures.sqale_rating) {
    const letter = ratingLetter(measures.sqale_rating);
    writeBadge(
      "sonar-maintainability-badge.json",
      "maintainability",
      letter,
      colorForRating(letter),
    );
  }
  if (measures.duplicated_lines_density) {
    const pct = Number(measures.duplicated_lines_density);
    writeBadge(
      "sonar-duplication-badge.json",
      "duplication",
      `${pct.toFixed(1)}%`,
      colorForPercent(100 - pct),
    );
  }
  if (measures.security_hotspots_reviewed) {
    const pct = Number(measures.security_hotspots_reviewed);
    writeBadge(
      "sonar-hotspots-badge.json",
      "security hotspots",
      `${pct.toFixed(0)}% revisados`,
      colorForPercent(pct),
    );
  }

  writeFileSync(
    path.join(METRICS_DIR, "sonar-last-updated.json"),
    `${JSON.stringify({ updatedAt: new Date().toISOString() }, null, 2)}\n`,
  );
}

console.log("[metrics] Exportando cobertura (Playwright/monocart)...");
exportCoverage();
console.log("[metrics] Exportando métricas do SonarQube...");
await exportSonar();
console.log(
  "[metrics] Concluído. Revise o diff em metrics/ e comite o que mudou.",
);
