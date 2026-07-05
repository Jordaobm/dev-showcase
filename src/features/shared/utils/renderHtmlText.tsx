import { ReactNode } from "react";

export const renderHtmlText = {
  b: (c: ReactNode) => <strong>{c}</strong>,
  code: (c: ReactNode) => <code>{c}</code>,
};
