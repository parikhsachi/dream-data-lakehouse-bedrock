import React, { useState } from "react";
import purpleFabric from "../images/bedrock-4.jpeg";
import fairyBook from "../images/bedrock-10.png";
import creamPaper from "../images/creampaper.jpg";
import scrapMoon from "../images/bedrock-12.jpeg";
import scrapFlowers from "../images/bedrock-5.jpeg";

type DreamCreate = {
  mood: number | "";
  sleep_quality: number | "";
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
  onDreamCreated?: (dreamId: string) => void;
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

  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  function update<K extends keyof DreamCreate>(key: K, value: DreamCreate[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
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
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: `url(${purpleFabric})`, // full purple diary fabric
        backgroundSize: "cover",
        backgroundPosition: "center",
        fontFamily: "var(--font-body)",
        color: "#f7f1ff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* twinkles across whole page */}
      <div className="twinkle-layer" />

      <div
        style={{
          position: "relative",
          maxWidth: "1100px",
          width: "100%",
        }}
      >
        {/* Fairy book sticker */}
        <img
          src={fairyBook}
          alt="Dream journal"
          className="float-soft"
          style={{
            position: "absolute",
            top: "-3.4rem",
            left: "-1.5rem",
            width: "110px",
            filter: "drop-shadow(0 14px 30px rgba(0,0,0,0.7))",
            pointerEvents: "none",
            zIndex: 5,
          }}
        />

        {/* Scrap images for junk-journal feel */}
        <img
          src={scrapMoon}
          alt=""
          style={{
            position: "absolute",
            right: "-2.4rem",
            top: "0.4rem",
            width: "140px",
            transform: "rotate(4deg)",
            opacity: 0.92,
            filter: "drop-shadow(0 12px 28px rgba(0,0,0,0.8))",
            borderRadius: "8px",
          }}
        />
        <img
          src={scrapFlowers}
          alt=""
          style={{
            position: "absolute",
            left: "-2.1rem",
            bottom: "-1.8rem",
            width: "150px",
            transform: "rotate(-5deg)",
            opacity: 0.9,
            filter: "drop-shadow(0 10px 24px rgba(0,0,0,0.85))",
            borderRadius: "10px",
          }}
        />

        {/* Main notebook */}
        <div
          style={{
            backgroundImage: `url(${creamPaper})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: "18px",
            boxShadow: "0 20px 55px rgba(0,0,0,0.75)",
            padding: "2.2rem 2.6rem 2.1rem",
            border: "1px solid rgba(214, 180, 255, 0.4)",
          }}
        >
          <h1
            style={{
              fontSize: "2.4rem",
              marginBottom: "0.25rem",
              color: "#f5e0ff",
              fontFamily: "var(--font-script)",
              letterSpacing: "0.06em",
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
            Left page: your day. Right page: your dream. When you&apos;re ready,
            we turn it into a film.
          </p>

          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.1fr 1.5fr",
                gap: "1.7rem",
              }}
            >
              {/* LEFT PAGE – day context */}
              <div
                style={{
                  background:
                    "radial-gradient(circle at top, rgba(80,52,120,0.95) 0, rgba(30,18,64,0.98) 60%)",
                  borderRadius: "14px",
                  padding: "1.3rem",
                  border: "1px solid rgba(230,206,255,0.4)",
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
                      "radial-gradient(circle at 0 0, rgba(255,255,255,0.06) 0, transparent 55%), radial-gradient(circle at 100% 100%, rgba(255,255,255,0.04) 0, transparent 55%)",
                    opacity: 0.85,
                  }}
                />
                <div style={{ position: "relative", zIndex: 1 }}>
                  <h2
                    style={{
                      fontSize: "1.05rem",
                      marginBottom: "0.7rem",
                      color: "#f3ddff",
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      borderBottom: "1px solid rgba(245,224,255,0.35)",
                      paddingBottom: "0.5rem",
                    }}
                  >
                    Today&apos;s atmosphere
                  </h2>

                  {/* Mood + Sleep (gold sliders) */}
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <div style={{ flex: 1 }}>
                      <label
                        style={{
                          fontSize: "0.8rem",
                          color: "#d8c7f0",
                          display: "block",
                          marginBottom: "0.2rem",
                        }}
                      >
                        Mood (1–5)
                      </label>
                      <input
                        type="range"
                        min={1}
                        max={5}
                        className="gold-slider"
                        value={form.mood === "" ? 3 : form.mood}
                        onChange={(e) =>
                          update(
                            "mood",
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label
                        style={{
                          fontSize: "0.8rem",
                          color: "#d8c7f0",
                          display: "block",
                          marginBottom: "0.2rem",
                        }}
                      >
                        Sleep quality (1–5)
                      </label>
                      <input
                        type="range"
                        min={1}
                        max={5}
                        className="gold-slider"
                        value={
                          form.sleep_quality === "" ? 3 : form.sleep_quality
                        }
                        onChange={(e) =>
                          update(
                            "sleep_quality",
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* little divider glyph */}
                  <div
                    style={{
                      margin: "0.9rem 0 0.65rem",
                      textAlign: "center",
                      fontSize: "0.7rem",
                      letterSpacing: "0.35em",
                      textTransform: "uppercase",
                      color: "#cbb6ea",
                      opacity: 0.9,
                    }}
                  >
                    ✶ ✶ ✶
                  </div>

                  {/* MBTI */}
                  <div style={{ marginTop: "0.4rem" }}>
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
                      onChange={(e) =>
                        update("context_note", e.target.value)
                      }
                      style={{
                        ...inputStyle,
                        minHeight: "70px",
                        resize: "vertical",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT PAGE – cream journal with gold ruled lines */}
              <div
                style={{
                  borderRadius: "14px",
                  padding: "1.25rem",
                  border: "1px solid rgba(115,74,145,0.45)",
                  color: "#3b244d",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* gold ruled lines */}
                <div
                  style={{
                    position: "absolute",
                    inset: "1rem 1rem",
                    backgroundImage:
                      "repeating-linear-gradient(to bottom, rgba(210,175,100,0.7) 0, rgba(210,175,100,0.7) 1px, transparent 1px, transparent 22px)",
                    opacity: 0.7,
                    pointerEvents: "none",
                  }}
                />
                <div style={{ position: "relative", zIndex: 1 }}>
                  {/* Date + small tag */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      marginBottom: "0.6rem",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-script)",
                        fontSize: "1.9rem",
                        color: "#6b3c8b",
                      }}
                    >
                      {todayLabel}
                    </span>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        letterSpacing: "0.28em",
                        textTransform: "uppercase",
                        color: "#9b7ba7",
                      }}
                    >
                      dream entry
                    </span>
                  </div>

                  {/* Optional title, no label */}
                  <div style={{ marginBottom: "0.7rem" }}>
                    <input
                      type="text"
                      placeholder="title (optional)"
                      value={form.title}
                      onChange={(e) => update("title", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.35rem 0.6rem",
                        borderRadius: "6px",
                        border: "1px solid rgba(136,102,164,0.7)",
                        background: "rgba(255,255,255,0.9)",
                        fontSize: "0.9rem",
                        fontFamily: "var(--font-body)",
                      }}
                    />
                  </div>

                  {/* Narrative */}
                  <div>
                    <textarea
                      required
                      placeholder="Write your dream here as if it were a scene..."
                      value={form.narrative}
                      onChange={(e) => update("narrative", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.75rem 0.8rem",
                        borderRadius: "8px",
                        border: "1px solid rgba(136,102,164,0.7)",
                        background: "rgba(255,255,255,0.85)",
                        minHeight: "260px",
                        resize: "vertical",
                        fontSize: "0.96rem",
                        lineHeight: "1.6",
                        fontFamily: "var(--font-body)",
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
                    </code>{" "}
                    – next, we&apos;ll project it as a film.
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="gold-button-twinkle"
                style={{
                  padding: "0.8rem 2rem",
                  borderRadius: "999px",
                  color: "#2a163d",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  fontSize: "0.82rem",
                  cursor: isSaving ? "wait" : "pointer",
                  transform: isSaving ? "translateY(1px)" : "translateY(0)",
                  opacity: isSaving ? 0.88 : 1,
                  transition:
                    "transform 120ms ease, box-shadow 120ms ease, opacity 120ms ease",
                  textShadow: "0 0 4px rgba(255,255,255,0.6)",
                }}
              >
                {isSaving ? "Summoning..." : "Generate Dream Film"}
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
