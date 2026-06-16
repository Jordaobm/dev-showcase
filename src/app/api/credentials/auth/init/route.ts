import { NextRequest } from "next/server";
import { challengeStore } from "../../store";

const PENDING_AUTH_KEY = "__pending_auth__";

export const POST = async (request: NextRequest) => {
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const challengeBase64url = Buffer.from(challenge).toString("base64url");

  challengeStore.set(PENDING_AUTH_KEY, challengeBase64url);

  const { hostname } = new URL(request.url);

  return Response.json({
    challenge: challengeBase64url,
    allowCredentials: [],
    rpId: hostname,
    timeout: 60000,
  });
};
