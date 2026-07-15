import { getUser, saveRefreshToken } from "@/lib/supabase/server";
import { handleApiError } from "@/lib/apiError";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();

    if (!body.email || !body.password) {
      return Response.json(
        { error: "invalid_credentials" },
        { status: 400 },
      );
    }

    const users = await getUser(body.email);

    const user = users[0];

    if (!users?.length || !user) {
      return Response.json({ error: "invalid_credentials" }, { status: 400 });
    }

    const matchPassword = await bcrypt.compare(body.password, user.password);

    if (!matchPassword) {
      return Response.json({ error: "invalid_credentials" }, { status: 400 });
    }

    const { password: _, ...safeUser } = user;

    const tokenPayload = {
      id: safeUser.id,
      name: safeUser.name,
      email: safeUser.email,
      createdAt: safeUser.created_at ?? safeUser.createdAt,
    };

    const accessToken = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: "5m",
    });

    const refreshToken = jwt.sign({ id: safeUser.id }, JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });

    const decodedRefreshToken = jwt.decode(refreshToken) as jwt.JwtPayload;

    const expiresAt = new Date((decodedRefreshToken.exp ?? 0) * 1000);

    await saveRefreshToken({
      token: refreshToken,
      expires_at: expiresAt,
      user_id: safeUser?.id,
    });

    const response = NextResponse.json({ user: safeUser, accessToken });

    response.cookies.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/api/jwt",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    return handleApiError(error, "jwt/auth", 400);
  }
};
