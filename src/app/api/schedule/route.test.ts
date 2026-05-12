import { describe, expect, it } from "vitest";
import { POST } from "./route";

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/schedule", {
    method: "POST",
    body: JSON.stringify(body)
  });
}

describe("POST /api/schedule", () => {
  it("reports every missing required field", async () => {
    const response = await POST(jsonRequest({ id: "post-1" }));

    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Missing required fields: title, platforms, scheduledFor, caption"
    });
    expect(response.status).toBe(400);
  });

  it("accepts a complete scheduled post", async () => {
    const post = {
      id: "post-1",
      title: "Launch clip",
      platforms: ["youtube"],
      scheduledFor: "2026-05-07T10:30:00.000Z",
      caption: "Going live"
    };
    const response = await POST(jsonRequest(post));

    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      post
    });
    expect(response.status).toBe(200);
  });
});
