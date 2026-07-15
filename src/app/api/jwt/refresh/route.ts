import {
  findAndDeleteRefreshToken,
  getUserById,
  saveRefreshToken,
} from "@/lib/supabase/server";
import { handleApiError } from "@/lib/apiError";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export const POST = async (request: NextRequest) => {
  try {
    const refreshToken = request.cookies.get("refresh_token")?.value;

    if (!refreshToken) {
      return Response.json({ error: "refresh_token_missing" }, { status: 401 });
    }

    await findAndDeleteRefreshToken(refreshToken);

    const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as {
      id: number;
    };

    const user = await getUserById(payload.id);

    if (!user) {
      return Response.json({ error: "user_not_found" }, { status: 401 });
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

    const newRefreshToken = jwt.sign({ id: safeUser.id }, JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });

    const decodedRefreshToken = jwt.decode(newRefreshToken) as jwt.JwtPayload;

    const expiresAt = new Date((decodedRefreshToken.exp ?? 0) * 1000);

    await saveRefreshToken({
      token: newRefreshToken,
      expires_at: expiresAt,
      user_id: safeUser?.id,
    });

    const response = NextResponse.json({ accessToken, user: safeUser });

    response.cookies.set("refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/api/jwt",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    return handleApiError(error, "jwt/refresh", 401);
  }
};
