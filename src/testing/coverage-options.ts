import fs from "node:fs";
import path from "node:path";
import * as swc from "@swc/core";
import type { CoverageReportOptions } from "monocart-coverage-reports";

export const coverageOptions: CoverageReportOptions = {
  name: "dev-showcase — Coverage E2E (Chromium)",
  outputDir: "./coverage/playwright",
  reports: ["v8", "json", "console-summary"],
  lcov: true,
  entryFilter: (entry) => entry.url.includes("localhost:3000"),

  sourceFilter: (sourcePath) => {
    const normalized = sourcePath.replaceAll("\\", "/");
    if (normalized.includes("node_modules")) return false;
    const srcIndex = normalized.indexOf("src/");
    if (srcIndex === -1) return false;
    return fs.existsSync(path.join(process.cwd(), normalized.slice(srcIndex)));
  },
  sourcePath: { "_N_E/": "" },
  all: {
    dir: ["./src"],
    filter: {
      "**/*.d.ts": false,
      "**/*.test.{ts,tsx}": false,
      "**/*.spec.{ts,tsx}": false,
      "**/testing/**": false,
      "**/app/api/**": false,
      "**/*.{ts,tsx}": true,
    },
    transformer: async (entry) => {
      const { code, map } = await swc.transform(entry.source, {
        filename: path.basename(entry.url),
        sourceMaps: true,
        isModule: true,
        jsc: {
          parser: { syntax: "typescript", tsx: true },
          transform: {},
        },
      });
      entry.source = code;
      if (map) entry.sourceMap = JSON.parse(map);
    },
  },
};
