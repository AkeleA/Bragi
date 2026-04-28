import { NextResponse } from "next/server";
import type { ScheduledPost } from "@/lib/types";

const requiredFields = ["id", "title", "platforms", "scheduledFor", "caption"] as const;

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<ScheduledPost>;
  const missing = requiredFields.filter((field) => body[field] === undefined);

  if (missing.length) {
    return NextResponse.json(
      { ok: false, error: `Missing required fields: ${missing.join(", ")}` },
      { status: 400 },
    );
  }

  // MVP note: persist to Supabase and enqueue with QStash here once credentials exist.
  return NextResponse.json({
    ok: true,
    post: body,
    nextStep:
      "Persist this post, then create one delayed publish job per selected platform.",
  });
}
