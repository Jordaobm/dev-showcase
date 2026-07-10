import { CoverageReport } from "monocart-coverage-reports";
import { coverageOptions } from "./coverage-options";

const globalSetup = async () => {
  const mcr = new CoverageReport(coverageOptions);
  mcr.cleanCache();
};

export default globalSetup;
