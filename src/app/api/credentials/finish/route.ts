import { NextRequest } from "next/server";
import { challengeStore, credentialStore } from "../store";

export const POST = async (request: NextRequest) => {
  const { username, id, response } = await request.json();

  if (!username || !id || !response) {
    return Response.json({ error: "dados incompletos" }, { status: 400 });
  }

  const clientData = JSON.parse(
    Buffer.from(response.clientDataJSON, "base64url").toString("utf-8"),
  );

  if (clientData.type !== "webauthn.create") {
    return Response.json(
      { error: "tipo de operação inválido" },
      { status: 400 },
    );
  }

  const storedChallenge = challengeStore.get(username);

  if (!storedChallenge) {
    return Response.json(
      { error: "nenhum registro pendente para este usuário" },
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

  const existing = credentialStore.get(username) ?? [];

  credentialStore.set(username, [
    ...existing,
    {
      id,
      username,
      publicKey: response.publicKey,
      publicKeyAlgorithm: response.publicKeyAlgorithm,
      transports: response.transports ?? [],
      createdAt: new Date().toISOString(),
    },
  ]);

  challengeStore.delete(username);

  return Response.json({
    verified: true,
    credentialId: id,
    clientData,
  });
};
