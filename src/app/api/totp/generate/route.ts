import { createSecret, getSecretByUserId } from "@/lib/supabase/server";
import { handleApiError } from "@/lib/apiError";
import { createHash, randomBytes } from "node:crypto";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { generateSecret, generateURI } from "otplib";

const JWT_SECRET = process.env.JWT_SECRET!;

export const POST = async (request: NextRequest) => {
  const headers = request.headers;

  const token = headers.get("Authorization")?.split(" ")[1];

  if (!token) {
    return Response.json({ error: "token_missing" }, { status: 401 });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      id: number;
    };

    const alreadyExists = await getSecretByUserId(payload.id);

    if (alreadyExists?.length > 0) {
      return Response.json({ error: "totp_already_configured" }, { status: 400 });
    }

    const secret = generateSecret();

    const backupCodes = Array.from({ length: 10 }, (_i) => {
      return randomBytes(4)
        .toString("hex")
        .toUpperCase()
        .match(/.{4}/g)!
        .join("-");
    });

    const rawBackupCodes = backupCodes?.map((code) =>
      createHash("sha256").update(code).digest("hex"),
    );

    const response = await createSecret({
      secret,
      backup_codes: rawBackupCodes,
      user_id: payload.id,
    });

    const qrCode = generateURI({
      issuer: "Dev Showcase",
      label: "devshowcase@example.com",
      secret,
    });

    return NextResponse.json({
      qrCode,
      backupCodes,
      id: response?.id,
    });
  } catch (error) {
    return handleApiError(error, "totp/generate", 401);
  }
};
