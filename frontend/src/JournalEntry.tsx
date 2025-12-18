import React, { useState } from "react";
import purpleFabric from "../images/bedrock-4.jpeg";
import fairyBook from "../images/bedrock-10.png";
import creamPaper from "../images/creampaper.png";
import scrapFlowers from "../images/bedrock-5.jpeg";
import scrapMoon from "../images/bedrock-11.jpeg";

type DreamCreate = {
  mood: number | "";
  sleep_quality: number | "";
  context_note: string;
  mbti: string;

  // keeping these in the type so backend stays compatible,
  // but you can remove their UI inputs later.
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
      setError(err?.message || "Failed to save dream.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: `url(${purpleFabric})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        fontFamily: "var(--font-body)",
        color: "#f7f1ff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "calc(100% - 4rem)", // 2rem margin on each side
          maxWidth: "1250px",
          zIndex: 1,
        }}
      >
        {/* MAIN NOTEBOOK */}
        <div style={{ position: "relative", borderRadius: "22px" }}>
          {/* Paper background layer */}
          <div
            style={{
              position: "absolute",
              inset: "-22px",
              backgroundImage: `url(${creamPaper})`,
              opacity: 0.8,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              zIndex: 0,
              transform: "rotate(180deg)",
              borderRadius: "22px",
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 1,
              padding: "1.2rem 3rem 2.1rem",
            }}
          >
            {/* Title row (centered, fairy next to text) */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "0.9rem",
                marginBottom: "1.2rem",
              }}
            >
              <img
                src={fairyBook}
                alt="Dream journal"
                className="float-soft"
                style={{
                  width: "120px",
                  height: "px",
                  objectFit: "contain",
                  filter: "drop-shadow(0 14px 30px rgba(0,0,0,0.55))",
                  pointerEvents: "none",
                }}
              />
              <h1
                style={{
                  margin: 0,
                  fontFamily: "var(--font-body)",
                  fontSize: "3rem",
                  fontWeight: 7000,
                  textTransform: "uppercase",
                  letterSpacing: "0.24em",
                  color: "rgba(12,10,14,0.9)",
                  textShadow: "0 1px 0 rgba(255,255,255,0.25)",
                  borderBottom: "2px solid rgba(12,10,14,0.65)",
                  display: "inline-block",
                }}
              >
                Dream Journal
              </h1>
            </div>

            <form onSubmit={handleSubmit}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.05fr 1.55fr",
                  gap: "1.7rem",
                  alignItems: "start",
                }}
              >
                {/* LEFT PAGE */}
                <div
                  style={{
                    background:
                      "radial-gradient(circle at top, rgba(80,52,120,0.94) 0, rgba(30,18,64,0.98) 60%)",
                    borderRadius: "14px",
                    padding: "1.3rem",
                    border: "1px solid rgba(230,206,255,0.35)",
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
                      opacity: 0.9,
                    }}
                  />

                  <div style={{ position: "relative", zIndex: 1 }}>
                    <h2
                      style={{
                        fontSize: "1rem",
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

                    {/* Mood + Sleep */}
                    <div style={{ display: "flex", gap: "0.85rem" }}>
                      <div style={{ flex: 1 }}>
                        <label
                          style={{
                            fontSize: "1.1rem",
                            color: "#ead9ff",
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
                          onChange={(e) => update("mood", Number(e.target.value))}
                        />
                      </div>

                      <div style={{ flex: 1 }}>
                        <label
                          style={{
                            fontSize: "1.1rem",
                            color: "#ead9ff",
                            display: "block",
                            marginBottom: "0.2rem",
                          }}
                        >
                          Sleep Quality (1–5)
                        </label>
                        <input
                          type="range"
                          min={1}
                          max={5}
                          className="gold-slider"
                          value={form.sleep_quality === "" ? 3 : form.sleep_quality}
                          onChange={(e) =>
                            update("sleep_quality", Number(e.target.value))
                          }
                        />
                      </div>
                    </div>

                    <div
                      style={{
                        margin: "0.9rem 0 0.65rem",
                        textAlign: "center",
                        fontSize: "0.7rem",
                        letterSpacing: "0.35em",
                        textTransform: "uppercase",
                        color: "#e9d7ff",
                        opacity: 0.9,
                      }}
                    >
                      ✶ ✶ ✶
                    </div>

                    <div style={{ marginTop: "0.4rem" }}>
                      <label style={{ fontSize: "1.05rem", color: "#ead9ff" }}>
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

                    <div style={{ marginTop: "0.75rem" }}>
                      <label style={{ fontSize: "1.05rem", color: "#ead9ff" }}>
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
                      <label style={{ fontSize: "1.05rem", color: "#ead9ff" }}>
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
                      <label style={{ fontSize: "1.05rem", color: "#ead9ff" }}>
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

                    <div style={{ marginTop: "0.75rem" }}>
                      <label style={{ fontSize: "1.05rem", color: "#ead9ff" }}>
                        Context
                      </label>
                      <input
                        placeholder="Anything else about your day..."
                        value={form.context_note}
                        onChange={(e) => update("context_note", e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>

                {/* RIGHT PAGE */}
                <div
                  style={{
                    borderRadius: "14px",
                    padding: "1.25rem",
                    border: "1px solid rgba(115,74,145,0.45)",
                    color: "#2c1a3b",
                    position: "relative",
                    overflow: "hidden",
                    backgroundImage: `url(${scrapFlowers})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <div style={{ marginBottom: "0.6rem" }}>
                      <span
                        style={{
                          fontFamily: "var(--font-script)",
                          fontSize: "1.9rem",
                          color: "#5c2a7c",
                          background: "antiquewhite",
                          padding: "0.1rem 1.4rem",
                          borderRadius: "6px",
                          boxShadow:
                            "0 0 12px rgba(255,255,255,0.5), inset 0 0 8px rgba(0,0,0,0.15)",
                          display: "inline-block",
                        }}
                      >
                        {todayLabel}
                      </span>
                    </div>

                    {/* Gold ruled lines layer */}
                    <div
                      style={{
                        position: "absolute",
                        inset: "3.8rem 0.4rem 0.9rem 0.8rem",
                        backgroundImage:
                          "repeating-linear-gradient(to bottom, rgba(210,175,100,0.75) 0, rgba(210,175,100,0.75) 1px, transparent 1px, transparent 26px)",
                        pointerEvents: "none",
                        opacity: 1,
                        zIndex: 0,
                        borderRadius: "8px",
                      }}
                    />

                    {/* Textarea */}
                    <textarea
                      required
                      placeholder="Write your dream here..."
                      value={form.narrative}
                      onChange={(e) => update("narrative", e.target.value)}
                      style={{
                        position: "relative",
                        zIndex: 1,
                        width: "100%",
                        padding: "0.75rem 0.8rem",
                        borderRadius: "8px",
                        border: "1px solid rgba(136,102,164,0.7)",
                        minHeight: "300px",
                        resize: "vertical",
                        background: "rgba(210, 175, 100, 0.25)",
                        fontSize: "1.2rem",
                        lineHeight: "1.65",
                        color: "white",
                        fontFamily: "var(--font-body)",
                        outline: "none",
                      }}
                    />
                  </div>

                  {/* Saved ID */}
                  {lastDreamId && (
                    <div
                      style={{
                        marginTop: "0.75rem",
                        fontSize: "0.82rem",
                        color: "#ead9ff",
                        textAlign: "center",
                      }}
                    >
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
                    </div>
                  )}

                  {/* Error */}
                  {error && (
                    <div
                      style={{
                        marginTop: "0.75rem",
                        fontSize: "0.85rem",
                        color: "#ffb3c1",
                        textAlign: "center",
                      }}
                    >
                      Error: {error}
                    </div>
                  )}
                </div>
              </div>
                                <div
                    style={{
                      marginTop: "1rem",
                      display: "flex",
                      justifyContent: "right",
                    }}
                  >
                    <button
                      type="submit"
                      disabled={isSaving}
                      style={{
                        padding: "1.05rem 2.6rem",
                        borderRadius: "999px",
                        backgroundImage: `url(${scrapMoon})`,
                        backgroundSize: "cover",
                        fontWeight: 1500,
                        letterSpacing: "0.14em",
                        color: "white",
                        textTransform: "uppercase",
                        fontSize: "0.9rem",
                        cursor: isSaving ? "wait" : "pointer",
                        opacity: isSaving ? 0.88 : 1,
                        border: "1px solid rgba(255,255,255,0.25)",
                        textShadow: "0 0 4px rgba(255,255,255,0.6)",
                      }}
                    >
                      {isSaving ? "Summoning..." : "Generate"}
                    </button>
                  </div>
            </form>
          </div>
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
