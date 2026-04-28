import type { PublishJob } from "./types";

export async function publishToPlatform(job: PublishJob) {
  return {
    ok: false,
    platform: job.platform,
    message:
      "Publishing adapter is intentionally stubbed. Add OAuth tokens and platform credentials before enabling live posts."
  };
}
