import type { ReactNode } from "react";

export const AuthenticacaoAnchorLink = ({
  chunks,
}: Readonly<{ chunks: ReactNode }>) => {
  return (
    <a href="#autenticacao" className="underline">
      {chunks}
    </a>
  );
};
