import { describe, expect, it } from "vitest";
import { POST } from "./route";

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/projects", {
    method: "POST",
    body: JSON.stringify(body)
  });
}

describe("POST /api/projects", () => {
  it("rejects empty project edits", async () => {
    const response = await POST(jsonRequest({}));

    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "At least one edit field is required."
    });
    expect(response.status).toBe(400);
  });

  it("accepts a draft when an edit field is present", async () => {
    const draft = { sourceName: "launch.mov", caption: "Ship it" };
    const response = await POST(jsonRequest(draft));

    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      project: draft
    });
    expect(response.status).toBe(200);
  });
});
