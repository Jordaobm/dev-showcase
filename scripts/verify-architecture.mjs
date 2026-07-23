import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const FEATURES_DIR = path.join(ROOT, "src", "features");
const REGISTRY_PATH = path.join(ROOT, "src", "registry", "index.ts");
const LOCALES = ["pt-BR", "en-US", "es-ES"];
const REQUIRED_METADATA_FIELDS = [
  "id",
  "name",
  "description",
  "category",
  "tags",
  "featured",
  "status",
  "technologies",
  "architecture",
  "concepts",
];
const NON_FEATURE_DIRS = new Set(["shared", "about"]);

const errors = [];
const report = (message) => errors.push(message);

function flattenKeys(obj, prefix = "") {
  return Object.entries(obj).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      return flattenKeys(value, fullKey);
    }
    return [fullKey];
  });
}

function registeredSlugs() {
  const content = readFileSync(REGISTRY_PATH, "utf-8");
  const matches = [
    ...content.matchAll(/@\/features\/([a-z0-9-]+)\/services\/metadata/g),
  ];
  return new Set(matches.map((m) => m[1]));
}

function checkMetadataContract(slug, metadataPath) {
  const content = readFileSync(metadataPath, "utf-8");
  for (const field of REQUIRED_METADATA_FIELDS) {
    const re = new RegExp(`\\b${field}\\s*:`);
    if (!re.test(content)) {
      report(
        `[${slug}] metadata.ts não declara o campo obrigatório "${field}"`,
      );
    }
  }
  const statusMatch = content.match(/status:\s*"(live|coming-soon)"/);
  const i18nMatch = content.match(/i18nNamespace:\s*"([^"]+)"/);
  return {
    status: statusMatch?.[1] ?? null,
    i18nNamespace: i18nMatch?.[1] ?? null,
  };
}

function checkI18nParity(slug, featureDir) {
  const i18nDir = path.join(featureDir, "i18n");
  if (!existsSync(i18nDir)) {
    report(`[${slug}] tem i18nNamespace mas a pasta i18n/ não existe`);
    return;
  }

  const keysByLocale = {};
  for (const locale of LOCALES) {
    const filePath = path.join(i18nDir, `${locale}.json`);
    if (!existsSync(filePath)) {
      report(`[${slug}] falta i18n/${locale}.json`);
      continue;
    }
    try {
      const json = JSON.parse(readFileSync(filePath, "utf-8"));
      keysByLocale[locale] = new Set(flattenKeys(json));
    } catch (err) {
      report(
        `[${slug}] i18n/${locale}.json não é um JSON válido: ${err.message}`,
      );
    }
  }

  const localesPresent = Object.keys(keysByLocale);
  if (localesPresent.length < 2) return;

  const unionKeys = new Set(
    localesPresent.flatMap((l) => [...keysByLocale[l]]),
  );
  for (const locale of localesPresent) {
    const missing = [...unionKeys].filter((k) => !keysByLocale[locale].has(k));
    if (missing.length > 0) {
      report(
        `[${slug}] i18n/${locale}.json está sem ${missing.length} chave(s) presentes em outro locale: ${missing.slice(0, 5).join(", ")}${missing.length > 5 ? "…" : ""}`,
      );
    }
  }
}

function checkTestsPresence(slug, featureDir) {
  const testsDir = path.join(featureDir, "tests");
  if (!existsSync(testsDir)) {
    report(
      `[${slug}] status "live" mas falta a pasta "tests/" com a spec Playwright`,
    );
    return;
  }
  const specFiles = readdirSync(testsDir).filter((f) => f.endsWith(".spec.ts"));
  if (specFiles.length === 0) {
    report(
      `[${slug}] pasta "tests/" existe mas não tem nenhum arquivo *.spec.ts`,
    );
  }
}

function checkFolderStructure(slug, featureDir, status) {
  for (const required of ["services", "i18n"]) {
    if (!existsSync(path.join(featureDir, required))) {
      report(`[${slug}] falta a pasta obrigatória "${required}/"`);
    }
  }
  if (status === "live") {
    if (!existsSync(path.join(featureDir, "pages"))) {
      report(
        `[${slug}] status "live" mas falta a pasta "pages/" com o componente de demo`,
      );
    }
    checkTestsPresence(slug, featureDir);
  }
}

function main() {
  const targetSlug = process.argv[2] ?? null;

  const registered = registeredSlugs();
  const allFeatureDirs = readdirSync(FEATURES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !NON_FEATURE_DIRS.has(d.name))
    .map((d) => d.name);

  if (targetSlug && !allFeatureDirs.includes(targetSlug)) {
    console.error(
      `[verify-architecture] src/features/${targetSlug}/ não existe.`,
    );
    process.exit(1);
  }

  if (targetSlug) {
    if (!registered.has(targetSlug)) {
      report(
        `[${targetSlug}] pasta existe em src/features/ mas não está registrada em src/registry/index.ts`,
      );
    }
  } else {
    for (const slug of allFeatureDirs) {
      if (!registered.has(slug)) {
        report(
          `[${slug}] pasta existe em src/features/ mas não está registrada em src/registry/index.ts`,
        );
      }
    }
    for (const slug of registered) {
      if (!allFeatureDirs.includes(slug)) {
        report(
          `[${slug}] registrado em src/registry/index.ts mas a pasta src/features/${slug}/ não existe`,
        );
      }
    }
  }

  const featureDirs = targetSlug ? [targetSlug] : allFeatureDirs;

  for (const slug of featureDirs) {
    const featureDir = path.join(FEATURES_DIR, slug);
    const metadataPath = path.join(featureDir, "services", "metadata.ts");
    if (!existsSync(metadataPath)) {
      report(`[${slug}] falta services/metadata.ts`);
      continue;
    }
    const { status, i18nNamespace } = checkMetadataContract(slug, metadataPath);
    checkFolderStructure(slug, featureDir, status);
    if (i18nNamespace) checkI18nParity(slug, featureDir);
  }

  if (errors.length > 0) {
    console.error(
      `\n[verify-architecture] ${errors.length} violação(ões) encontrada(s):\n`,
    );
    for (const e of errors) console.error(`  - ${e}`);
    console.error("");
    process.exit(1);
  }

  console.log(
    targetSlug
      ? `[verify-architecture] OK — "${targetSlug}" confere com a arquitetura esperada (Feature-Sliced Design + contrato DemoMetadata + paridade de chaves i18n).`
      : `[verify-architecture] OK — ${featureDirs.length} features conferem com a arquitetura esperada (Feature-Sliced Design + contrato DemoMetadata + paridade de chaves i18n).`,
  );
}

main();
