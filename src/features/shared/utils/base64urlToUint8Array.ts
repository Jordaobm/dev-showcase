export const base64urlToUint8Array = (
  base64url: string,
): Uint8Array<ArrayBuffer> => {
  const base64 = base64url.replaceAll("-", "+").replaceAll("_", "/");

  const binary = atob(base64);

  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.codePointAt(i)!;
  }

  return bytes;
};
