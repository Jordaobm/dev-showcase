import webpush from "web-push";
import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/apiError";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export const POST = async (request: NextRequest) => {
  try {
    const { title, body, subscription } = await request.json();

    await webpush.sendNotification(
      subscription,
      JSON.stringify({ title, body }),
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error, "push/send", 400);
  }
};
