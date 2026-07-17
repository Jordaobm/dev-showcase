import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const ErrorBoundaryDiagnosticsPage = () => {
  throw new Error(
    "Diagnóstico: erro forçado intencionalmente para testar o error boundary.",
  );
};

export default ErrorBoundaryDiagnosticsPage;
