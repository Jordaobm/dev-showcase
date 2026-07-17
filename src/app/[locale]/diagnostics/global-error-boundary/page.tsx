import { GLOBAL_ERROR_DIAGNOSTIC_MESSAGE } from "@/app/[locale]/errorDiagnosticMessage";

export const dynamic = "force-dynamic";

const GlobalErrorBoundaryDiagnosticsPage = () => {
  throw new Error(GLOBAL_ERROR_DIAGNOSTIC_MESSAGE);
};

export default GlobalErrorBoundaryDiagnosticsPage;
