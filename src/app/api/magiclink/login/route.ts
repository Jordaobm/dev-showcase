import { getUserByToken, updateToken } from "@/lib/supabase/server";
import { handleApiError } from "@/lib/apiError";
import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Não foi possível autenticar-se" },
        { status: 400 },
      );
    }
    const token_hash = crypto.createHash("sha256").update(token).digest("hex");

    const findToken = await getUserByToken(token_hash);

    if (!findToken) {
      return NextResponse.json(
        { error: "Não foi possível autenticar-se" },
        { status: 400 },
      );
    }

    if (findToken?.used_at) {
      return NextResponse.json(
        { error: "Não foi possível autenticar-se" },
        { status: 400 },
      );
    }

    if (new Date(findToken.expires_at).getTime() < Date.now()) {
      return NextResponse.json(
        { error: "Não foi possível autenticar-se" },
        { status: 400 },
      );
    }

    const updated = await updateToken(token_hash);

    delete updated?.user?.password;
    delete updated?.token_hash;

    return NextResponse.json({ ...updated }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "magiclink/login", 400);
  }
};
