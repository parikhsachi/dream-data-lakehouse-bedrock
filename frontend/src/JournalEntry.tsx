import React, { useState } from "react";

type DreamCreate = {
  mood: number | "" ;
  sleep_quality: number | "" ;
  context_note: string;
  mbti: string;
  spotify_url: string;
  letterboxd_url: string;
  goodreads_url: string;
  listening_to: string;
  watching: string;
  reading: string;
  title: string;
  narrative: string;
};

type JournalEntryPageProps = {
  onDreamCreated?: (dreamId: string) => void; // we'll use this later to go to theater view
};

const initialForm: DreamCreate = {
  mood: "",
  sleep_quality: "",
  context_note: "",
  mbti: "",
  spotify_url: "",
  letterboxd_url: "",
  goodreads_url: "",
  listening_to: "",
  watching: "",
  reading: "",
  title: "",
  narrative: "",
};

export const JournalEntryPage: React.FC<JournalEntryPageProps> = ({
  onDreamCreated,
}) => {
  const [form, setForm] = useState<DreamCreate>(initialForm);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDreamId, setLastDreamId] = useState<string | null>(null);

  function update<K extends keyof DreamCreate>(key: K, value: DreamCreate[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      // Build payload, converting "" to null for numeric fields
      const payload = {
        ...form,
        mood: form.mood === "" ? null : Number(form.mood),
        sleep_quality:
          form.sleep_quality === "" ? null : Number(form.sleep_quality),
      };

      const res = await fetch("http://127.0.0.1:8000/dreams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Backend error: ${res.status} ${txt}`);
      }

      const data = await res.json();
      setLastDreamId(data.id);
      if (onDreamCreated) onDreamCreated(data.id);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to save dream.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "2rem",
        background:
          "radial-gradient(circle at top, #3d2b5b 0, #130919 40%, #05030a 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'Georgia', 'Times New Roman', serif",
        color: "#f7f1ff",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          width: "100%",
          background:
            "linear-gradient(135deg, rgba(40,25,68,0.95), rgba(19,11,38,0.98))",
          borderRadius: "16px",
          boxShadow: "0 18px 45px rgba(0,0,0,0.6)",
          padding: "2rem 2.5rem",
          border: "1px solid rgba(214, 180, 255, 0.35)",
        }}
      >
        <h1
          style={{
            fontSize: "1.8rem",
            marginBottom: "0.5rem",
            letterSpacing: "0.09em",
            textTransform: "uppercase",
            color: "#f5e0ff",
          }}
        >
          Dream Journal
        </h1>
        <p
          style={{
            marginBottom: "1.5rem",
            fontSize: "0.95rem",
            color: "#d8c7f0",
          }}
        >
          Left page: your day. Right page: your dream. When you&apos;re ready, we
          turn it into a film.
        </p>

        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr 1.5fr",
              gap: "1.5rem",
            }}
          >
            {/* LEFT PAGE */}
            <div
              style={{
                background:
                  "linear-gradient(135deg, rgba(51,31,82,0.9), rgba(32,16,58,0.95))",
                borderRadius: "12px",
                padding: "1.25rem",
                border: "1px solid rgba(230,206,255,0.28)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  backgroundImage:
                    "radial-gradient(circle at 0 0, rgba(255,255,255,0.06), transparent 55%), radial-gradient(circle at 100% 100%, rgba(255,255,255,0.04), transparent 55%)",
                  opacity: 0.7,
                }}
              />
              <div style={{ position: "relative", zIndex: 1 }}>
                <h2
                  style={{
                    fontSize: "1.1rem",
                    marginBottom: "0.75rem",
                    color: "#f3ddff",
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    borderBottom: "1px solid rgba(245,224,255,0.35)",
                    paddingBottom: "0.5rem",
                  }}
                >
                  Today&apos;s Atmosphere
                </h2>

                {/* Mood + Sleep */}
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <div style={{ flex: 1 }}>
                    <label
                      style={{ fontSize: "0.8rem", color: "#d8c7f0" }}
                    >
                      Mood (-3 to +3)
                    </label>
                    <input
                      type="number"
                      min={-3}
                      max={3}
                      value={form.mood}
                      onChange={(e) =>
                        update("mood", e.target.value === "" ? "" : Number(e.target.value))
                      }
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label
                      style={{ fontSize: "0.8rem", color: "#d8c7f0" }}
                    >
                      Sleep quality (1–5)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={form.sleep_quality}
                      onChange={(e) =>
                        update(
                          "sleep_quality",
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* MBTI */}
                <div style={{ marginTop: "0.75rem" }}>
                  <label
                    style={{ fontSize: "0.8rem", color: "#d8c7f0" }}
                  >
                    MBTI
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. INFJ"
                    value={form.mbti}
                    onChange={(e) => update("mbti", e.target.value)}
                    style={inputStyle}
                  />
                </div>

                {/* Links */}
                <div style={{ marginTop: "0.75rem" }}>
                  <label
                    style={{ fontSize: "0.8rem", color: "#d8c7f0" }}
                  >
                    Spotify link
                  </label>
                  <input
                    type="url"
                    placeholder="profile or playlist"
                    value={form.spotify_url}
                    onChange={(e) => update("spotify_url", e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={{ marginTop: "0.5rem" }}>
                  <label
                    style={{ fontSize: "0.8rem", color: "#d8c7f0" }}
                  >
                    Letterboxd link
                  </label>
                  <input
                    type="url"
                    value={form.letterboxd_url}
                    onChange={(e) => update("letterboxd_url", e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={{ marginTop: "0.5rem" }}>
                  <label
                    style={{ fontSize: "0.8rem", color: "#d8c7f0" }}
                  >
                    Goodreads link
                  </label>
                  <input
                    type="url"
                    value={form.goodreads_url}
                    onChange={(e) => update("goodreads_url", e.target.value)}
                    style={inputStyle}
                  />
                </div>

                {/* What you're consuming */}
                <div style={{ marginTop: "0.75rem" }}>
                  <label
                    style={{ fontSize: "0.8rem", color: "#d8c7f0" }}
                  >
                    Listening to
                  </label>
                  <input
                    type="text"
                    placeholder="playlist / album / artist"
                    value={form.listening_to}
                    onChange={(e) => update("listening_to", e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={{ marginTop: "0.5rem" }}>
                  <label
                    style={{ fontSize: "0.8rem", color: "#d8c7f0" }}
                  >
                    Watching
                  </label>
                  <input
                    type="text"
                    placeholder="film / show"
                    value={form.watching}
                    onChange={(e) => update("watching", e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={{ marginTop: "0.5rem" }}>
                  <label
                    style={{ fontSize: "0.8rem", color: "#d8c7f0" }}
                  >
                    Reading
                  </label>
                  <input
                    type="text"
                    placeholder="book / essay"
                    value={form.reading}
                    onChange={(e) => update("reading", e.target.value)}
                    style={inputStyle}
                  />
                </div>

                {/* Context note */}
                <div style={{ marginTop: "0.75rem" }}>
                  <label
                    style={{ fontSize: "0.8rem", color: "#d8c7f0" }}
                  >
                    Context note
                  </label>
                  <textarea
                    placeholder="Anything else about your day..."
                    value={form.context_note}
                    onChange={(e) => update("context_note", e.target.value)}
                    style={{
                      ...inputStyle,
                      minHeight: "70px",
                      resize: "vertical",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* RIGHT PAGE */}
            <div
              style={{
                background:
                  "linear-gradient(135deg, #fdf6ff, #f5ecff)",
                borderRadius: "12px",
                padding: "1.25rem",
                border: "1px solid rgba(115,74,145,0.4)",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.4)",
                color: "#3b244d",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Ruled paper lines */}
              <div
                style={{
                  position: "absolute",
                  inset: "0.8rem 0.8rem",
                  backgroundImage:
                    "repeating-linear-gradient(to bottom, rgba(150,120,190,0.32) 0, rgba(150,120,190,0.32) 1px, transparent 1px, transparent 21px)",
                  opacity: 0.7,
                  pointerEvents: "none",
                }}
              />
              <div style={{ position: "relative", zIndex: 1 }}>
                <h2
                  style={{
                    fontSize: "1.1rem",
                    marginBottom: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color: "#6b3c8b",
                  }}
                >
                  Dream Entry
                </h2>

                <div style={{ marginBottom: "0.75rem" }}>
                  <label
                    style={{
                      fontSize: "0.8rem",
                      color: "#7c5c9a",
                    }}
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    placeholder="optional"
                    value={form.title}
                    onChange={(e) => update("title", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.4rem 0.5rem",
                      borderRadius: "6px",
                      border: "1px solid rgba(136,102,164,0.7)",
                      background: "rgba(255,255,255,0.85)",
                      fontSize: "0.9rem",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      fontSize: "0.8rem",
                      color: "#7c5c9a",
                    }}
                  >
                    Dream narrative
                  </label>
                  <textarea
                    required
                    placeholder="Write your dream here as if it were a scene..."
                    value={form.narrative}
                    onChange={(e) => update("narrative", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.6rem 0.7rem",
                      borderRadius: "6px",
                      border: "1px solid rgba(136,102,164,0.7)",
                      background: "rgba(255,255,255,0.65)",
                      minHeight: "260px",
                      resize: "vertical",
                      fontSize: "0.95rem",
                      lineHeight: "1.5",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer / Generate button */}
          <div
            style={{
              marginTop: "1.4rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
            }}
          >
            <div style={{ fontSize: "0.8rem", color: "#cbb6ea" }}>
              {lastDreamId && (
                <span>
                  Saved entry ID:{" "}
                  <code
                    style={{
                      fontSize: "0.78rem",
                      background: "rgba(0,0,0,0.25)",
                      padding: "0.05rem 0.35rem",
                      borderRadius: "4px",
                    }}
                  >
                    {lastDreamId}
                  </code>
                  {" "}– next, we&apos;ll project it as a film.
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isSaving}
              style={{
                padding: "0.7rem 1.7rem",
                borderRadius: "999px",
                border: "1px solid rgba(247,228,171,0.9)",
                background:
                  "linear-gradient(135deg, #f7dd91, #e3b571)",
                color: "#3b244d",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontSize: "0.85rem",
                cursor: isSaving ? "wait" : "pointer",
                boxShadow: "0 10px 25px rgba(0,0,0,0.45)",
                transform: isSaving ? "translateY(1px)" : "translateY(0)",
                opacity: isSaving ? 0.85 : 1,
                transition: "transform 120ms ease, box-shadow 120ms ease, opacity 120ms ease",
              }}
            >
              {isSaving ? "Saving..." : "Generate Dream Film"}
            </button>
          </div>

          {error && (
            <div
              style={{
                marginTop: "0.75rem",
                fontSize: "0.8rem",
                color: "#ffb3c1",
              }}
            >
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.4rem 0.5rem",
  borderRadius: "6px",
  border: "1px solid rgba(198,172,229,0.8)",
  background: "rgba(22,8,43,0.75)",
  color: "#f7f1ff",
  fontSize: "0.9rem",
  outline: "none",
};
