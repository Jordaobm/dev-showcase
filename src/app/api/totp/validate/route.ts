import {
  getSecretByUserId,
  updateBackupCodes,
  updateLastUsedToken,
} from "@/lib/supabase/server";
import { createHash } from "node:crypto";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { verify } from "otplib";

const JWT_SECRET = process.env.JWT_SECRET!;

export const POST = async (request: NextRequest) => {
  try {
    const { token: code, type = "totp" } = await request.json();

    const authHeader = request.headers.get("Authorization")?.split(" ")[1];
    if (!authHeader) {
      return Response.json({ error: "Token ausente" }, { status: 401 });
    }

    const payload = jwt.verify(authHeader, JWT_SECRET) as { id: number };
    const data = await getSecretByUserId(payload?.id);

    if (!data?.length) {
      return Response.json({ error: "2FA não configurado" }, { status: 401 });
    }

    const record = data[0];

    if (type === "backup") {
      const hash = createHash("sha256")
        .update(code.toUpperCase())
        .digest("hex");

      const codeIndex = (record.backup_codes as string[])?.indexOf(hash);

      if (codeIndex === -1 || codeIndex === undefined) {
        return NextResponse.json(
          { error: "Backup code inválido ou já utilizado" },
          { status: 400 },
        );
      }

      const remaining = (record.backup_codes as string[]).filter(
        (_: string, i: number) => i !== codeIndex,
      );
      await updateBackupCodes(payload.id, remaining);

      return NextResponse.json(
        { success: true, remainingCodes: remaining.length },
        { status: 200 },
      );
    }

    if (record.last_used_token === String(code)) {
      return NextResponse.json(
        { error: "Código já utilizado nesta janela de 30s" },
        { status: 401 },
      );
    }

    const isValid = await verify({
      secret: record?.secret,
      token: String(code),
    });

    if (isValid?.valid) {
      await updateLastUsedToken(payload.id, String(code));
      return NextResponse.json({}, { status: 200 });
    }

    return NextResponse.json({}, { status: 400 });
  } catch (error) {
    return NextResponse.json(error, { status: 400 });
  }
};
