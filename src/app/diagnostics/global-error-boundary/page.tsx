"use client";

import { GLOBAL_ERROR_DIAGNOSTIC_MESSAGE } from "@/app/error";

const GlobalErrorBoundaryDiagnosticsPage = () => {
  throw new Error(GLOBAL_ERROR_DIAGNOSTIC_MESSAGE);
};

export default GlobalErrorBoundaryDiagnosticsPage;
