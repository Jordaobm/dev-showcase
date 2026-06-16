import { NextRequest } from "next/server";
import { challengeStore, credentialStore, StoredCredential } from "../../store";
import { base64urlToUint8Array } from "@/features/shared/utils/base64urlToUint8Array";

const PENDING_AUTH_KEY = "__pending_auth__";

const derToP1363 = (der: Uint8Array): Uint8Array<ArrayBuffer> => {
  let offset = 2;

  offset++;
  const rLen = der[offset++];
  const r = der.subarray(offset, offset + rLen);
  offset += rLen;

  offset++;
  const sLen = der[offset++];
  const s = der.subarray(offset, offset + sLen);

  const p1363 = new Uint8Array(64);

  p1363.set(
    r.subarray(Math.max(0, r.length - 32)),
    32 - Math.min(r.length, 32),
  );

  p1363.set(
    s.subarray(Math.max(0, s.length - 32)),
    64 - Math.min(s.length, 32),
  );

  return p1363;
};

export const POST = async (request: NextRequest) => {
  const { id, response } = await request.json();

  if (!id || !response) {
    return Response.json({ error: "dados incompletos" }, { status: 400 });
  }

  const clientData = JSON.parse(
    Buffer.from(response.clientDataJSON, "base64url").toString("utf-8"),
  );

  if (clientData.type !== "webauthn.get") {
    return Response.json(
      { error: "tipo de operação inválido" },
      { status: 400 },
    );
  }

  const storedChallenge = challengeStore.get(PENDING_AUTH_KEY);

  if (!storedChallenge) {
    return Response.json(
      { error: "nenhum challenge de autenticação pendente" },
      { status: 400 },
    );
  }

  if (clientData.challenge !== storedChallenge) {
    return Response.json({ error: "challenge inválido" }, { status: 400 });
  }

  const { origin } = new URL(request.url);

  if (clientData.origin !== origin) {
    return Response.json({ error: "origin inválida" }, { status: 400 });
  }

  let storedCredential: StoredCredential | undefined;

  for (const credentials of credentialStore.values()) {
    const found = credentials.find((c) => c.id === id);
    if (found) {
      storedCredential = found;
      break;
    }
  }

  if (!storedCredential) {
    return Response.json(
      { error: "credencial não encontrada" },
      { status: 400 },
    );
  }

  let importAlgo:
    | AlgorithmIdentifier
    | EcKeyImportParams
    | RsaHashedImportParams;
  let verifyAlgo: AlgorithmIdentifier | EcdsaParams;

  switch (storedCredential.publicKeyAlgorithm) {
    case -7:
      importAlgo = { name: "ECDSA", namedCurve: "P-256" };
      verifyAlgo = { name: "ECDSA", hash: "SHA-256" };
      break;
    case -257:
      importAlgo = { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" };
      verifyAlgo = importAlgo;
      break;
    default:
      return Response.json(
        { error: "algoritmo não suportado" },
        { status: 400 },
      );
  }

  const importedKey = await crypto.subtle.importKey(
    "spki",
    base64urlToUint8Array(storedCredential.publicKey).buffer,
    importAlgo,
    false,
    ["verify"],
  );

  const authDataBytes = base64urlToUint8Array(response.authenticatorData);
  const clientDataHash = await crypto.subtle.digest(
    "SHA-256",
    Buffer.from(response.clientDataJSON, "base64url"),
  );
  const signedData = new Uint8Array([
    ...authDataBytes,
    ...new Uint8Array(clientDataHash),
  ]);

  const rawSignature = base64urlToUint8Array(response.signature);
  const signature =
    storedCredential.publicKeyAlgorithm === -7
      ? derToP1363(rawSignature)
      : rawSignature;

  const verified = await crypto.subtle.verify(
    verifyAlgo,
    importedKey,
    signature,
    signedData,
  );

  challengeStore.delete(PENDING_AUTH_KEY);

  return Response.json({
    verified,
    credentialId: id,
    username: storedCredential.username,
    clientData,
  });
};
