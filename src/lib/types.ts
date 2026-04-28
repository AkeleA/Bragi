export type Platform = "youtube" | "tiktok" | "instagram" | "facebook";

export type ExportFormat = "vertical" | "square" | "landscape";

export type ScheduleStatus = "draft" | "scheduled" | "published" | "failed";

export type TimelineState = {
  sourceName: string;
  duration: number;
  trimStart: number;
  trimEnd: number;
  format: ExportFormat;
  caption: string;
  overlayText: string;
};

export type ScheduledPost = {
  id: string;
  title: string;
  platforms: Platform[];
  scheduledFor: string;
  status: ScheduleStatus;
  assetUrl?: string;
  caption: string;
};

export type PublishJob = {
  postId: string;
  platform: Platform;
  assetUrl: string;
  caption: string;
  scheduledFor: string;
};
