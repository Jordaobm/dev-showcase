import { createUser } from "@/lib/supabase/server";
import { handleApiError } from "@/lib/apiError";
import bcrypt from "bcrypt";
import { NextRequest } from "next/server";

const SALT_ROUNDS = 10;
const MAX_PASSWORD_BYTES = 72;

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();

    if (!body.email || !body.name || !body.password) {
      return Response.json({ error: "missing_fields" }, { status: 400 });
    }

    if (Buffer.byteLength(body.password, "utf8") > MAX_PASSWORD_BYTES) {
      return Response.json({ error: "password_too_long" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(body.password, SALT_ROUNDS);

    const user = await createUser({
      name: body.name,
      email: body.email,
      password: hashedPassword,
    });

    const { password: _, ...safeUser } = user;
    return Response.json({ user: safeUser });
  } catch (error) {
    if (error instanceof Error && error.message.includes("duplicate key")) {
      return Response.json({ error: "email_taken" }, { status: 409 });
    }
    return handleApiError(error, "jwt/register", 400);
  }
};
