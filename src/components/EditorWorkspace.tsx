"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { exportPresets } from "@/lib/platforms";
import type { ExportFormat, TimelineState } from "@/lib/types";

const draftKey = "bragi.editor.draft";

const initialTimeline: TimelineState = {
  sourceName: "",
  duration: 0,
  trimStart: 0,
  trimEnd: 0,
  format: "vertical",
  caption: "",
  overlayText: "New drop"
};

type ExportState = {
  status: "idle" | "exporting" | "complete" | "error";
  url: string;
  message: string;
};

export function EditorWorkspace() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [timeline, setTimeline] = useState<TimelineState>(initialTimeline);
  const [saveMessage, setSaveMessage] = useState("");
  const [exportState, setExportState] = useState<ExportState>({
    status: "idle",
    url: "",
    message: ""
  });

  useEffect(() => {
    const saved = window.localStorage.getItem(draftKey);
    if (!saved) return;

    try {
      setTimeline({ ...initialTimeline, ...JSON.parse(saved) });
      setSaveMessage("Loaded saved draft from this browser.");
    } catch {
      setSaveMessage("Saved draft could not be loaded.");
    }
  }, []);

  const trimLength = Math.max(0, timeline.trimEnd - timeline.trimStart);

  const uploadVideo = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setSourceUrl(url);
    setTimeline((current) => ({
      ...current,
      sourceName: file.name,
      trimStart: 0,
      trimEnd: 0
    }));
    setExportState({ status: "idle", url: "", message: "" });
    setSaveMessage("Video loaded. Save the draft when the edit is ready.");
  };

  const updateDuration = () => {
    const duration = videoRef.current?.duration ?? 0;
    setTimeline((current) => ({
      ...current,
      duration,
      trimEnd: current.trimEnd || duration
    }));
  };

  const updateTimeline = <Key extends keyof TimelineState>(
    key: Key,
    value: TimelineState[Key]
  ) => {
    setTimeline((current) => ({ ...current, [key]: value }));
  };

  const saveDraft = async () => {
    const draft = {
      ...timeline,
      savedAt: new Date().toISOString(),
      exportUrl: exportState.url
    };

    window.localStorage.setItem(draftKey, JSON.stringify(draft));

    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft)
    });

    setSaveMessage(
      response.ok
        ? "Draft saved locally. Supabase persistence is ready to wire once env values are filled."
        : "Draft saved locally, but the API save failed."
    );
  };

  const exportClip = async () => {
    const video = videoRef.current;
    if (!video || !sourceUrl) return;

    setExportState({ status: "exporting", url: "", message: "Rendering timeline..." });

    try {
      const blob = await renderTimeline(video, timeline);
      const url = URL.createObjectURL(blob);
      setExportState({
        status: "complete",
        url,
        message: `Exported ${Math.round((blob.size / 1024 / 1024) * 10) / 10} MB as ${blob.type}.`
      });
    } catch (error) {
      setExportState({
        status: "error",
        url: "",
        message: error instanceof Error ? error.message : "Export failed."
      });
    }
  };

  const timelineStyle = useMemo(() => {
    if (!timeline.duration) return { left: "0%", width: "0%" };
    const left = (timeline.trimStart / timeline.duration) * 100;
    const width = (trimLength / timeline.duration) * 100;
    return { left: `${left}%`, width: `${width}%` };
  }, [timeline.duration, timeline.trimStart, trimLength]);

  return (
    <main className="page-shell" aria-labelledby="editor-title">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Editor</p>
          <h1 id="editor-title">Edit one short-form video</h1>
        </div>
        <button className="btn primary" onClick={saveDraft} type="button">
          Save edit
        </button>
      </section>

      <section className="editor-grid" aria-label="Video editing workspace">
        <article className="preview-panel" aria-label="Video preview">
          {sourceUrl ? (
            <video
              ref={videoRef}
              className={`preview-video ${timeline.format}`}
              controls
              onLoadedMetadata={updateDuration}
              src={sourceUrl}
            >
              <track kind="captions" />
            </video>
          ) : (
            <div className="empty-preview">
              <strong>No video selected</strong>
              <span>Choose a video file to begin editing.</span>
            </div>
          )}
        </article>

        <aside className="control-stack" aria-label="Editing controls">
          <section className="panel" aria-labelledby="source-title">
            <h2 id="source-title">Source</h2>
            <div className="field">
              <label htmlFor="video-upload">Video file</label>
              <input id="video-upload" accept="video/*" onChange={uploadVideo} type="file" />
            </div>
            <p className="help-text">
              The MVP saves the edit instructions first. Uploaded assets move to Supabase/R2 when
              those credentials are filled.
            </p>
          </section>

          <section className="panel" aria-labelledby="settings-title">
            <h2 id="settings-title">Settings</h2>
            <div className="field">
              <label htmlFor="format">Export format</label>
              <select
                id="format"
                value={timeline.format}
                onChange={(event) => updateTimeline("format", event.target.value as ExportFormat)}
              >
                {Object.entries(exportPresets).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="overlay">Text overlay</label>
              <input
                id="overlay"
                maxLength={60}
                value={timeline.overlayText}
                onChange={(event) => updateTimeline("overlayText", event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="caption">Caption</label>
              <textarea
                id="caption"
                maxLength={2200}
                onChange={(event) => updateTimeline("caption", event.target.value)}
                placeholder="Write the caption for scheduling..."
                value={timeline.caption}
              />
            </div>
          </section>

          <section className="panel" aria-labelledby="export-title">
            <h2 id="export-title">Export</h2>
            <div className="button-row">
              <button
                className="btn primary"
                disabled={!sourceUrl || exportState.status === "exporting"}
                onClick={exportClip}
                type="button"
              >
                {exportState.status === "exporting" ? "Exporting" : "Export clip"}
              </button>
              {exportState.url ? (
                <a className="btn secondary" download="bragi-export.webm" href={exportState.url}>
                  Download
                </a>
              ) : null}
            </div>
            {exportState.message ? (
              <p className="notice" role={exportState.status === "error" ? "alert" : "status"}>
                {exportState.message}
              </p>
            ) : null}
          </section>
        </aside>
      </section>

      <section className="timeline" aria-labelledby="timeline-title">
        <h2 id="timeline-title">Timeline</h2>
        <div className="timeline-labels" aria-live="polite">
          <span>{formatSeconds(timeline.trimStart)}</span>
          <span>{formatSeconds(trimLength)} selected</span>
          <span>{formatSeconds(timeline.trimEnd || timeline.duration)}</span>
        </div>
        <div className="timeline-track" aria-hidden="true">
          <div className="timeline-selection" style={timelineStyle} />
        </div>
        <div className="range-row">
          <label className="sr-only" htmlFor="trim-start">
            Trim start
          </label>
          <input
            disabled={!timeline.duration}
            id="trim-start"
            max={timeline.duration}
            min={0}
            onChange={(event) =>
              updateTimeline("trimStart", Math.min(Number(event.target.value), timeline.trimEnd))
            }
            step={0.1}
            type="range"
            value={timeline.trimStart}
          />
          <label className="sr-only" htmlFor="trim-end">
            Trim end
          </label>
          <input
            disabled={!timeline.duration}
            id="trim-end"
            max={timeline.duration}
            min={0}
            onChange={(event) =>
              updateTimeline("trimEnd", Math.max(Number(event.target.value), timeline.trimStart))
            }
            step={0.1}
            type="range"
            value={timeline.trimEnd}
          />
        </div>
        {saveMessage ? (
          <p className="notice" role="status">
            {saveMessage}
          </p>
        ) : null}
      </section>
    </main>
  );
}

async function renderTimeline(video: HTMLVideoElement, timeline: TimelineState) {
  const preset = exportPresets[timeline.format];
  const canvas = document.createElement("canvas");
  canvas.width = preset.width;
  canvas.height = preset.height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas renderer is unavailable in this browser.");

  const stream = canvas.captureStream(30);
  const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
    ? "video/webm;codecs=vp9"
    : "video/webm";
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 5_000_000
  });
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  };

  const trimStart = timeline.trimStart;
  const trimEnd = timeline.trimEnd || video.duration;
  await seekVideo(video, trimStart);

  recorder.start();
  await video.play();

  await new Promise<void>((resolve) => {
    const draw = () => {
      drawFrame(context, canvas, video, timeline);
      if (video.currentTime >= trimEnd || video.ended) {
        video.pause();
        recorder.stop();
        resolve();
        return;
      }
      requestAnimationFrame(draw);
    };
    draw();
  });

  await new Promise<void>((resolve) => {
    recorder.onstop = () => resolve();
  });

  return new Blob(chunks, { type: mimeType });
}

function drawFrame(
  context: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  timeline: TimelineState
) {
  context.fillStyle = "#090909";
  context.fillRect(0, 0, canvas.width, canvas.height);

  const scale = Math.max(canvas.width / video.videoWidth, canvas.height / video.videoHeight);
  const width = video.videoWidth * scale;
  const height = video.videoHeight * scale;
  const x = (canvas.width - width) / 2;
  const y = (canvas.height - height) / 2;
  context.drawImage(video, x, y, width, height);

  const padding = Math.round(canvas.width * 0.06);
  context.fillStyle = "rgba(0, 0, 0, 0.66)";
  context.fillRect(padding, canvas.height - padding * 3, canvas.width - padding * 2, padding * 1.7);

  context.fillStyle = "#ffffff";
  context.font = `700 ${Math.round(canvas.width * 0.055)}px Arial, sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(
    timeline.overlayText || timeline.caption.slice(0, 48),
    canvas.width / 2,
    canvas.height - padding * 2.15,
    canvas.width - padding * 3
  );
}

function seekVideo(video: HTMLVideoElement, time: number) {
  return new Promise<void>((resolve) => {
    const done = () => {
      video.removeEventListener("seeked", done);
      resolve();
    };
    video.addEventListener("seeked", done);
    video.currentTime = time;
  });
}

function formatSeconds(value: number) {
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}
