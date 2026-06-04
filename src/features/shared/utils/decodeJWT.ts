import { fmtUnix } from "./formatDate";

export interface DecodedJWT {
  header: Record<string, string>;
  payload: Record<string, unknown>;
  signature: string;
  parts: [string, string, string];
}

export const decodeJWT = (token: string): DecodedJWT | null => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const b64url = (s: string) =>
      atob(s.replaceAll("-", "+").replaceAll("_", "/"));
    return {
      header: JSON.parse(b64url(parts[0])),
      payload: JSON.parse(b64url(parts[1])),
      signature: parts[2],
      parts: parts as [string, string, string],
    };
  } catch {
    return null;
  }
};

export const formatPayloadForDisplay = (payload: Record<string, unknown>) => {
  const formatted: Record<string, unknown> = { ...payload };
  if (typeof formatted.iat === "number") {
    formatted.iat = `${formatted.iat}  ← ${fmtUnix(formatted.iat)}`;
  }
  if (typeof formatted.exp === "number") {
    formatted.exp = `${formatted.exp}  ← ${fmtUnix(formatted.exp)}`;
  }
  return JSON.stringify(formatted, null, 2);
};