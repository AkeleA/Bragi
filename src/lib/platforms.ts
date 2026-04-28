import type { ExportFormat, Platform } from "./types";

export const platformLabels: Record<Platform, string> = {
  youtube: "YouTube Shorts",
  tiktok: "TikTok",
  instagram: "Instagram Reels",
  facebook: "Facebook Reels"
};

export const exportPresets: Record<
  ExportFormat,
  { label: string; width: number; height: number; aspect: string }
> = {
  vertical: {
    label: "Vertical 9:16",
    width: 1080,
    height: 1920,
    aspect: "9 / 16"
  },
  square: {
    label: "Square 1:1",
    width: 1080,
    height: 1080,
    aspect: "1 / 1"
  },
  landscape: {
    label: "Landscape 16:9",
    width: 1920,
    height: 1080,
    aspect: "16 / 9"
  }
};

export const defaultPlatforms: Platform[] = ["youtube", "tiktok", "instagram"];
