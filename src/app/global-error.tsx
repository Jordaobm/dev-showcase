"use client";

import { useEffect } from "react";
import Link from "next/link";

const GlobalError = ({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          background: "#fafaf8",
          color: "#111827",
        }}
      >
        <div
          style={{
            maxWidth: 480,
            width: "100%",
            textAlign: "center",
            padding: "48px 32px",
            borderRadius: 32,
            background:
              "linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(249, 250, 251, 0.9))",
            border: "1px solid rgba(220, 38, 38, 0.15)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
          }}
        >
          <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 12 }}>
            Ops! Algo deu errado
          </h1>
          <p
            style={{
              fontSize: 17,
              color: "#6b7280",
              lineHeight: 1.6,
              marginBottom: 32,
            }}
          >
            Esta demo está suspensa por enquanto, estamos atualizando seu
            funcionamento. Tente novamente mais tarde.
          </p>
          <div
            style={{
              display: "flex",
              gap: 16,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={reset}
              style={{
                padding: "10px 24px",
                borderRadius: 16,
                border: "none",
                color: "#fff",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                background: "linear-gradient(135deg, #DC2626, #B91C1C)",
                boxShadow: "0 4px 16px rgba(220, 38, 38, 0.3)",
              }}
            >
              Tentar novamente
            </button>
            <Link
              href="/"
              style={{
                padding: "10px 24px",
                borderRadius: 16,
                fontSize: 14,
                fontWeight: 500,
                color: "#374151",
                textDecoration: "none",
                background: "rgba(255, 255, 255, 0.7)",
                border: "1px solid rgba(0, 0, 0, 0.06)",
              }}
            >
              Voltar para o início
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
};

export default GlobalError;
