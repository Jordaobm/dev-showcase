import { NextRequest } from "next/server";
import { challengeStore, credentialStore } from "../store";
import { handleApiError } from "@/lib/apiError";

export const POST = async (request: NextRequest) => {
  try {
    const { username, id, response } = await request.json();

    if (!username || !id || !response) {
      return Response.json({ error: "incomplete_data" }, { status: 400 });
    }

    const clientData = JSON.parse(
      Buffer.from(response.clientDataJSON, "base64url").toString("utf-8"),
    );

    if (clientData.type !== "webauthn.create") {
      return Response.json({ error: "invalid_operation_type" }, { status: 400 });
    }

    const storedChallenge = challengeStore.get(username);

    if (!storedChallenge) {
      return Response.json({ error: "no_pending_registration" }, { status: 400 });
    }

    if (clientData.challenge !== storedChallenge) {
      return Response.json({ error: "invalid_challenge" }, { status: 400 });
    }

    const { origin } = new URL(request.url);

    if (clientData.origin !== origin) {
      return Response.json({ error: "invalid_origin" }, { status: 400 });
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
  } catch (error) {
    return handleApiError(error, "credentials/finish", 400);
  }
};
