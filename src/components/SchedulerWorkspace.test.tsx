import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SchedulerWorkspace } from "./SchedulerWorkspace";

describe("SchedulerWorkspace", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ ok: true }))));
    vi.stubGlobal("crypto", { randomUUID: () => "post-123" });
  });

  it("creates a scheduled post, stores it locally, and calls the schedule API", async () => {
    render(<SchedulerWorkspace />);

    fireEvent.change(screen.getByLabelText("Post title"), {
      target: { value: "Launch clip" }
    });
    fireEvent.change(screen.getByLabelText("Caption"), {
      target: { value: "Going live" }
    });
    fireEvent.change(screen.getByLabelText("Publish time"), {
      target: { value: "2026-05-07T10:30" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Schedule post" }));

    expect(await screen.findByText("Launch clip")).toBeInTheDocument();
    expect(screen.getByText(/Post added to the local queue/)).toBeInTheDocument();

    const fetchMock = vi.mocked(fetch);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/schedule",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" }
      })
    );

    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse(String(init?.body));
    expect(body).toMatchObject({
      id: "post-123",
      title: "Launch clip",
      caption: "Going live",
      platforms: ["youtube"],
      status: "scheduled"
    });
    expect(body.scheduledFor).toBe(new Date("2026-05-07T10:30").toISOString());

    await waitFor(() => {
      expect(localStorage.getItem("bragi.schedule.posts")).toContain("Launch clip");
    });
  });
});
