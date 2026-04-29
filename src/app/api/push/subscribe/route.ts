import { NextRequest, NextResponse } from "next/server";
import { subscriptions } from "../store";

export const POST = async (request: NextRequest) => {
  const subscription = await request.json();
  subscriptions.push(subscription);
  return NextResponse.json({ ok: true });
};
