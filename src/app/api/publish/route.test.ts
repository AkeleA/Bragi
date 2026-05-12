import { describe, expect, it } from "vitest";
import { POST } from "./route";

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/publish", {
    method: "POST",
    body: JSON.stringify(body)
  });
}

describe("POST /api/publish", () => {
  it("rejects incomplete publish jobs", async () => {
    const response = await POST(jsonRequest({ postId: "post-1" }));

    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "postId, platform, assetUrl, and scheduledFor are required."
    });
    expect(response.status).toBe(400);
  });

  it("returns the stubbed platform adapter result for valid jobs", async () => {
    const response = await POST(
      jsonRequest({
        postId: "post-1",
        platform: "youtube",
        assetUrl: "https://cdn.example.com/post-1.webm",
        caption: "Ready",
        scheduledFor: "2026-05-07T10:30:00.000Z"
      })
    );

    await expect(response.json()).resolves.toEqual({
      ok: false,
      platform: "youtube",
      message:
        "Publishing adapter is intentionally stubbed. Add OAuth tokens and platform credentials before enabling live posts."
    });
    expect(response.status).toBe(501);
  });
});
