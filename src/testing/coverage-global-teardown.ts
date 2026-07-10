import { CoverageReport } from "monocart-coverage-reports";
import { coverageOptions } from "./coverage-options";

const globalTeardown = async () => {
  const mcr = new CoverageReport(coverageOptions);
  await mcr.generate();
};

export default globalTeardown;
