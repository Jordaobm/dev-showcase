import { NextRequest, NextResponse } from "next/server";
import { subscriptions } from "../store";
import { handleApiError } from "@/lib/apiError";

export const POST = async (request: NextRequest) => {
  try {
    const subscription = await request.json();
    subscriptions.push(subscription);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error, "push/subscribe", 400);
  }
};
