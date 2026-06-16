import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { createMagicLink, getUserByEmail } from "@/lib/supabase/server";
import { sendMail } from "./resend";

export const POST = async (request: NextRequest) => {
  try {
    const { email = "" } = await request.json();

    if (!email) {
      return NextResponse.json({}, { status: 400 });
    }

    const url = new URL(request.url);
    const user = await getUserByEmail(email);

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const token_hash = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
      const expires_at = new Date(Date.now() + 15 * 60 * 1000);

      await createMagicLink({
        expires_at,
        token_hash,
        user_id: user.id,
      });

      await sendMail(user.email, token, url.origin);
    }

    return NextResponse.json({}, { status: 200 });
  } catch {
    return NextResponse.json({}, { status: 200 });
  }
};
