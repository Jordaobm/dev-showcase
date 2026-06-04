import { createUser } from "@/lib/supabase/server";
import bcrypt from "bcrypt";
import { NextRequest } from "next/server";

const SALT_ROUNDS = 10;
const MAX_PASSWORD_BYTES = 72;

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();

    if (!body.email || !body.name || !body.password) {
      return Response.json(
        { error: "Campos obrigatórios ausentes" },
        { status: 400 },
      );
    }

    if (Buffer.byteLength(body.password, "utf8") > MAX_PASSWORD_BYTES) {
      return Response.json(
        { error: "Senha muito longa (máx. 72 caracteres)" },
        { status: 400 },
      );
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
    let message = error instanceof Error ? error.message : "Unknown error";
    if (String(message).includes("duplicate key")) {
      message =
        "Infelizmente este e-mail já está registrado. Tente outro e-mail ou avance para o formulário de autenticação!";
    }
    return Response.json({ error: message }, { status: 400 });
  }
};
