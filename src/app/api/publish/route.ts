import { NextResponse } from "next/server";
import { publishToPlatform } from "@/lib/publishing";
import type { PublishJob } from "@/lib/types";

export async function POST(request: Request) {
  const job = (await request.json()) as Partial<PublishJob>;

  if (!job.postId || !job.platform || !job.assetUrl || !job.scheduledFor) {
    return NextResponse.json(
      {
        ok: false,
        error: "postId, platform, assetUrl, and scheduledFor are required.",
      },
      { status: 400 },
    );
  }

  const result = await publishToPlatform(job as PublishJob);
  return NextResponse.json(result, { status: result.ok ? 200 : 501 });
}
