import { NextResponse } from "next/server";

const GENERIC_ERROR_CODE = "internal_error";

export class PublicApiError extends Error {
  constructor(
    message: string,
    public readonly status: number = 400,
  ) {
    super(message);
    this.name = "PublicApiError";
  }
}

export const handleApiError = (
  error: unknown,
  context: string,
  fallbackStatus = 500,
) => {
  if (error instanceof PublicApiError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }

  console.error(`[api:${context}]`, error);
  return NextResponse.json(
    { error: GENERIC_ERROR_CODE },
    { status: fallbackStatus },
  );
};
