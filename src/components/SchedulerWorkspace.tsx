"use client";

import { useEffect, useMemo, useState } from "react";
import { platformLabels } from "@/lib/platforms";
import type { Platform, ScheduledPost, ScheduleStatus } from "@/lib/types";

const scheduleKey = "bragi.schedule.posts";
const platformOptions: Platform[] = ["youtube", "tiktok", "instagram", "facebook"];

type ScheduleDraft = {
  title: string;
  caption: string;
  scheduledFor: string;
  platforms: Platform[];
};

const initialDraft: ScheduleDraft = {
  title: "",
  caption: "",
  scheduledFor: "",
  platforms: ["youtube"]
};

export function SchedulerWorkspace() {
  const [draft, setDraft] = useState<ScheduleDraft>(initialDraft);
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [ready, setReady] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const monthAnchor = useMemo(() => new Date(), []);

  useEffect(() => {
    const saved = window.localStorage.getItem(scheduleKey);
    if (saved) {
      try {
        setPosts(JSON.parse(saved));
      } catch {
        setStatusMessage("Saved schedule could not be loaded.");
      }
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(scheduleKey, JSON.stringify(posts));
  }, [posts, ready]);

  const togglePlatform = (platform: Platform) => {
    setDraft((current) => {
      const platforms = current.platforms.includes(platform)
        ? current.platforms.filter((item) => item !== platform)
        : [...current.platforms, platform];
      return { ...current, platforms };
    });
  };

  const schedulePost = async () => {
    if (!draft.title || !draft.scheduledFor || draft.platforms.length === 0) return;

    const post: ScheduledPost = {
      id: crypto.randomUUID(),
      title: draft.title,
      caption: draft.caption,
      platforms: draft.platforms,
      scheduledFor: new Date(draft.scheduledFor).toISOString(),
      status: "scheduled"
    };

    setPosts((current) => [post, ...current]);
    setDraft(initialDraft);

    const response = await fetch("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(post)
    });

    setStatusMessage(
      response.ok
        ? "Post added to the local queue. QStash/Supabase will take over once configured."
        : "Post was added locally, but the API schedule call failed."
    );
  };

  return (
    <main className="page-shell" aria-labelledby="schedule-title">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Scheduling</p>
          <h1 id="schedule-title">Plan social posts</h1>
        </div>
      </section>

      <section className="schedule-layout" aria-label="Scheduling workspace">
        <form className="panel" onSubmit={(event) => event.preventDefault()}>
          <h2>Create scheduled post</h2>
          <div className="field">
            <label htmlFor="post-title">Post title</label>
            <input
              id="post-title"
              onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
              required
              value={draft.title}
            />
          </div>
          <div className="field">
            <label htmlFor="post-caption">Caption</label>
            <textarea
              id="post-caption"
              onChange={(event) =>
                setDraft((current) => ({ ...current, caption: event.target.value }))
              }
              value={draft.caption}
            />
          </div>
          <fieldset className="fieldset">
            <legend>Platforms</legend>
            <div className="button-row">
              {platformOptions.map((platform) => (
                <label className="check-pill" key={platform}>
                  <input
                    checked={draft.platforms.includes(platform)}
                    onChange={() => togglePlatform(platform)}
                    type="checkbox"
                  />
                  <span>{platformLabels[platform]}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="field">
            <label htmlFor="scheduled-for">Publish time</label>
            <input
              id="scheduled-for"
              onChange={(event) =>
                setDraft((current) => ({ ...current, scheduledFor: event.target.value }))
              }
              required
              type="datetime-local"
              value={draft.scheduledFor}
            />
          </div>
          <button
            className="btn primary"
            disabled={!draft.title || !draft.scheduledFor || draft.platforms.length === 0}
            onClick={schedulePost}
            type="button"
          >
            Schedule post
          </button>
          {statusMessage ? (
            <p className="notice" role="status">
              {statusMessage}
            </p>
          ) : null}
        </form>

        <Calendar monthAnchor={monthAnchor} posts={posts} ready={ready} />
      </section>

      <section className="panel" aria-labelledby="queue-title">
        <h2 id="queue-title">Publishing queue</h2>
        <JobList posts={posts} ready={ready} />
      </section>
    </main>
  );
}

function Calendar({
  monthAnchor,
  posts,
  ready
}: {
  monthAnchor: Date;
  posts: ScheduledPost[];
  ready: boolean;
}) {
  const first = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), 1);
  const daysInMonth = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() + 1, 0).getDate();
  const offset = first.getDay();
  const cells = Array.from({ length: offset + daysInMonth }, (_, index) => {
    const day = index - offset + 1;
    return day > 0 ? day : null;
  });

  return (
    <section className="panel calendar" aria-labelledby="calendar-title">
      <div className="calendar-header">
        <h2 id="calendar-title">Calendar</h2>
        <span className="status-pill">
          {monthAnchor.toLocaleString("en", { month: "long", year: "numeric" })}
        </span>
      </div>
      <div className="calendar-grid" role="grid" aria-label="Monthly publishing calendar">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div className="weekday" key={day} role="columnheader">
            {day}
          </div>
        ))}
        {cells.map((day, index) => {
          const count =
            ready && day
              ? posts.filter((post) => {
                  const date = new Date(post.scheduledFor);
                  return date.getMonth() === monthAnchor.getMonth() && date.getDate() === day;
                }).length
              : 0;
          return (
            <div
              className={`calendar-day ${count ? "active" : ""}`}
              key={`${day ?? "empty"}-${index}`}
              role="gridcell"
            >
              {day ? <span>{day}</span> : null}
              {count ? (
                <small>
                  {count} post{count > 1 ? "s" : ""}
                </small>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function JobList({ posts, ready }: { posts: ScheduledPost[]; ready: boolean }) {
  if (!ready) {
    return <p className="help-text">Loading queue...</p>;
  }

  if (!posts.length) {
    return <p className="help-text">No scheduled posts yet.</p>;
  }

  return (
    <div className="job-list">
      {posts.map((post) => (
        <article className="job-row" key={post.id}>
          <div>
            <strong>{post.title}</strong>
            <span>
              {new Date(post.scheduledFor).toLocaleString()} -{" "}
              {post.platforms.map((platform) => platformLabels[platform]).join(", ")}
            </span>
          </div>
          <StatusBadge status={post.status} />
        </article>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: ScheduleStatus }) {
  return <span className={`badge ${status}`}>{status}</span>;
}
