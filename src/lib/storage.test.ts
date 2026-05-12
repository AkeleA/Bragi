import { afterEach, describe, expect, it, vi } from "vitest";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("createUploadTarget", () => {
  it("sanitizes filenames and returns a local placeholder when R2 is not configured", async () => {
    process.env.R2_BUCKET_NAME = "";
    process.env.R2_PUBLIC_BASE_URL = "";
    vi.spyOn(Date, "now").mockReturnValue(1_778_169_600_000);

    const { createUploadTarget } = await import("./storage");

    await expect(createUploadTarget("Launch Clip FINAL!.MOV")).resolves.toEqual({
      key: "exports/1778169600000-launch-clip-final-.mov",
      publicUrl: "/local-placeholder/exports/1778169600000-launch-clip-final-.mov"
    });
  });

  it("builds a public R2 URL without duplicating slashes", async () => {
    process.env.R2_BUCKET_NAME = "bragi-assets";
    process.env.R2_PUBLIC_BASE_URL = "https://cdn.example.com/";
    vi.spyOn(Date, "now").mockReturnValue(1_778_169_600_000);

    const { createUploadTarget } = await import("./storage");

    await expect(createUploadTarget("clip.webm")).resolves.toEqual({
      key: "exports/1778169600000-clip.webm",
      publicUrl: "https://cdn.example.com/exports/1778169600000-clip.webm"
    });
  });
});
