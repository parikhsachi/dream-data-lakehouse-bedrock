// src/TheaterPage.tsx
import React, { useEffect, useState } from "react";

interface DreamRenderResponse {
  movie_script: string;
  psychoanalysis: string;
  style_profile?: any;
  video_url?: string | null; // 👈 NEW
}

type TheaterPageProps = {
  dreamId: string;
  onExit?: () => void;
};

export const TheaterPage: React.FC<TheaterPageProps> = ({ dreamId, onExit }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DreamRenderResponse | null>(null);
  const [curtainsOpen, setCurtainsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function runInference() {
      try {
        setLoading(true);
        const res = await fetch(`http://127.0.0.1:8000/dreams/${dreamId}/render`, {
          method: "POST",
        });

        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt);
        }

        const json = await res.json();
        setData(json);

        setTimeout(() => setCurtainsOpen(true), 1200);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    runInference();
  }, [dreamId]);

  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        background: "radial-gradient(circle at top, #2b1444, #0a0314 70%)",
        fontFamily: "'Georgia', serif",
        overflow: "hidden",
        color: "#fbeaff",
      }}
    >
      {/* Twinkly sky */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.15) 0, transparent 40%), radial-gradient(circle at 70% 60%, rgba(255,255,255,0.1) 0, transparent 50%)",
          opacity: 0.4,
          pointerEvents: "none",
        }}
      />

      {/* Left curtain */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          width: "50%",
          background: "linear-gradient(135deg, #6a1e83, #30063a)",
          boxShadow: "inset 0 0 60px rgba(0,0,0,0.7)",
          transition: "transform 1.4s ease-in-out",
          transform: curtainsOpen ? "translateX(-100%)" : "translateX(0)",
          zIndex: 10,
        }}
      />

      {/* Right curtain */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          right: 0,
          width: "50%",
          background: "linear-gradient(135deg, #6a1e83, #30063a)",
          boxShadow: "inset 0 0 60px rgba(0,0,0,0.7)",
          transition: "transform 1.4s ease-in-out",
          transform: curtainsOpen ? "translateX(100%)" : "translateX(0)",
          zIndex: 10,
        }}
      />

      {/* Loading */}
      {loading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "1.4rem",
            color: "#f9d9ff",
            zIndex: 20,
            letterSpacing: "0.08em",
          }}
        >
          Projecting your dream…
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ padding: "3rem", color: "#ffb3c1", zIndex: 20 }}>
          Error: {error}
        </div>
      )}

      {/* MAIN CONTENT */}
      {data && (
        <div
          style={{
            position: "relative",
            padding: "4.5rem 2.5rem",
            maxWidth: "800px",
            margin: "0 auto",
            opacity: curtainsOpen ? 1 : 0,
            transition: "opacity 1.3s ease 0.5s",
            zIndex: 1,
          }}
        >
          {/* SCREEN + VIDEO */}
          {data.video_url && (
            <div
              style={{
                marginBottom: "2.5rem",
                padding: "0.9rem",
                borderRadius: "1.4rem",
                background:
                  "radial-gradient(circle at top, #f7e3ff 0, #4b205f 40%, #140415 100%)",
                boxShadow:
                  "0 22px 45px rgba(0,0,0,0.7), inset 0 0 35px rgba(0,0,0,0.7)",
                border: "1px solid rgba(250,230,255,0.3)",
              }}
            >
              <div
                style={{
                  borderRadius: "1rem",
                  overflow: "hidden",
                  backgroundColor: "black",
                }}
              >
                <video
                  src={data.video_url}
                  controls
                  style={{
                    display: "block",
                    width: "100%",
                    maxHeight: "60vh",
                    backgroundColor: "black",
                  }}
                />
              </div>
              <div
                style={{
                  marginTop: "0.4rem",
                  textAlign: "center",
                  fontSize: "0.8rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#fbe8ff",
                  opacity: 0.8,
                }}
              >
                Now showing: your dream
              </div>
            </div>
          )}

          {/* Movie */}
          <h1
            style={{
              fontSize: "1.6rem",
              marginBottom: "1.2rem",
              textAlign: "center",
              color: "#f7eaff",
              letterSpacing: "0.05em",
            }}
          >
            Dream Film
          </h1>

          <p
            style={{
              whiteSpace: "pre-line",
              lineHeight: "1.6",
              fontSize: "1.05rem",
              marginBottom: "2rem",
              color: "#f4dcff",
            }}
          >
            {data.movie_script}
          </p>

          {/* Interpretation */}
          <h2
            style={{
              fontSize: "1.2rem",
              marginBottom: "0.7rem",
              color: "#dcbaff",
            }}
          >
            Interpretation
          </h2>

          <p
            style={{
              whiteSpace: "pre-line",
              lineHeight: "1.55",
              fontSize: "1rem",
              color: "#e6cfff",
              borderLeft: "3px solid #9254c8",
              paddingLeft: "1rem",
            }}
          >
            {data.psychoanalysis}
          </p>

          {/* Back button */}
          {onExit && (
            <button
              onClick={onExit}
              style={{
                marginTop: "2rem",
                padding: "0.6rem 1.5rem",
                borderRadius: "999px",
                background: "linear-gradient(135deg, #f7dd91, #e3b571)",
                border: "1px solid rgba(247,228,171,0.9)",
                color: "#43225e",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "0.9rem",
                letterSpacing: "0.06em",
                boxShadow: "0 10px 25px rgba(0,0,0,0.45)",
                display: "block",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              Back to Journal
            </button>
          )}
        </div>
      )}
    </div>
  );
};
export default TheaterPage;