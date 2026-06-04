import { deleteRefreshToken } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
  try {
    const refreshToken = request.cookies.get("refresh_token")?.value;

    if (!refreshToken) {
      return Response.json(
        { error: "Refresh token ausente" },
        { status: 401 },
      );
    }

    await deleteRefreshToken(refreshToken);

    const response = NextResponse.json({}, { status: 200 });

    response.cookies.delete({ name: "refresh_token", path: "/api/jwt" });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 401 });
  }
};
