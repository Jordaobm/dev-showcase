import { deleteRefreshToken } from "@/lib/supabase/server";
import { handleApiError } from "@/lib/apiError";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
  try {
    const refreshToken = request.cookies.get("refresh_token")?.value;

    if (!refreshToken) {
      return Response.json({ error: "refresh_token_missing" }, { status: 401 });
    }

    await deleteRefreshToken(refreshToken);

    const response = NextResponse.json({}, { status: 200 });

    response.cookies.delete({ name: "refresh_token", path: "/api/jwt" });

    return response;
  } catch (error) {
    return handleApiError(error, "jwt/logout", 401);
  }
};
