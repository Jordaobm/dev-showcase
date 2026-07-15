import { NextRequest } from "next/server";
import { challengeStore } from "../store";
import { handleApiError } from "@/lib/apiError";

export const POST = async (request: NextRequest) => {
  try {
    const { username } = await request.json();

    if (!username) {
      return Response.json({ error: "username_required" }, { status: 400 });
    }

    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const challengeBase64url = Buffer.from(challenge).toString("base64url");

    challengeStore.set(username, challengeBase64url);

    const { hostname } = new URL(request.url);

    const userId = Buffer.from(username).toString("base64url");

    return Response.json({
      challenge: challengeBase64url,

      rp: {
        id: hostname,
        name: "Dev Showcase",
      },

      user: {
        id: userId,
        name: username,
        displayName: username,
      },

      pubKeyCredParams: [
        { type: "public-key", alg: -7 },
        { type: "public-key", alg: -257 },
      ],

      authenticatorSelection: {
        authenticatorAttachment: "platform",
        residentKey: "preferred",
        userVerification: "required",
      },

      timeout: 60000,
      attestation: "none",
    });
  } catch (error) {
    return handleApiError(error, "credentials/init", 400);
  }
};
