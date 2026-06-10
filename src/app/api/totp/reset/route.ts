import { deleteSecretByUserId } from "@/lib/supabase/server";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET!;

export const POST = async (request: NextRequest) => {
  const authHeader = request.headers.get("Authorization")?.split(" ")[1];

  if (!authHeader) {
    return Response.json({ error: "Token ausente" }, { status: 401 });
  }

  try {
    const payload = jwt.verify(authHeader, JWT_SECRET) as { id: number };
    await deleteSecretByUserId(payload.id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return Response.json(
      { error: "Erro ao remover configuração 2FA" },
      { status: 400 },
    );
  }
};
