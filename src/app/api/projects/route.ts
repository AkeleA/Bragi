import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.sourceName && !body.caption && !body.overlayText) {
    return NextResponse.json(
      { ok: false, error: "At least one edit field is required." },
      { status: 400 }
    );
  }

  // MVP note: persist this payload to Supabase once project tables are created.
  return NextResponse.json({
    ok: true,
    project: body,
    nextStep: "Create a Supabase project row tied to the authenticated user."
  });
}
