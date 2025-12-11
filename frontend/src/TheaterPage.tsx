// src/TheaterPage.tsx
import React, { useEffect, useState } from "react";

import starLake from "../images/bedrock-7.jpeg";
import starProcession from "../images/bedrock-3.jpeg";
import spiralClock from "../images/bedrock-11.jpeg";

interface DreamRenderResponse {
  movie_script: string;
  psychoanalysis: string;
  style_profile?: any;
  video_url?: string | null;
}

type TheaterPageProps = {
  dreamId: string;
  onExit?: () => void;
};

export const TheaterPage: React.FC<TheaterPageProps> = ({
  dreamId,
  onExit,
}) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DreamRenderResponse | null>(null);
  const [curtainsOpen, setCurtainsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function runInference() {
      try {
        setLoading(true);
        setError(null);
        setCurtainsOpen(false);

        const res = await fetch(
          `http://127.0.0.1:8000/dreams/${dreamId}/render`,
          {
            method: "POST",
          }
        );

        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || `HTTP ${res.status}`);
        }

        const json = (await res.json()) as DreamRenderResponse;
        setData(json);

        // small delay before opening curtains for drama
        setTimeout(() => setCurtainsOpen(true), 1200);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to render dream.");
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
        backgroundImage: `radial-gradient(circle at top, rgba(43,20,68,0.9), rgba(5,1,10,0.98) 70%), url(${starLake})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundBlendMode: "soft-light",
        fontFamily: "var(--font-body)",
        overflow: "hidden",
        color: "#fbeaff",
      }}
    >
      {/* Star procession tapestry behind everything */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${starProcession})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: loading ? 0.55 : 0.22,
          transform: loading ? "translateX(0)" : "translateX(-16px)",
          transition: "opacity 3s ease, transform 30s ease-in-out",
          pointerEvents: "none",
          filter: "saturate(0.95)",
          zIndex: 0,
        }}
      />

      {/* Soft star glows */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.16) 0, transparent 45%), radial-gradient(circle at 70% 65%, rgba(255,255,255,0.12) 0, transparent 55%)",
          opacity: 0.4,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Curtains */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          width: "50%",
          background:
            "linear-gradient(135deg, #6a1e83 0%, #4b0c31 40%, #2a0318 100%)",
          boxShadow: "inset 0 0 60px rgba(0,0,0,0.7)",
          transition: "transform 1.4s ease-in-out",
          transform: curtainsOpen ? "translateX(-100%)" : "translateX(0)",
          zIndex: 5,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          right: 0,
          width: "50%",
          background:
            "linear-gradient(135deg, #6a1e83 0%, #4b0c31 40%, #2a0318 100%)",
          boxShadow: "inset 0 0 60px rgba(0,0,0,0.7)",
          transition: "transform 1.4s ease-in-out",
          transform: curtainsOpen ? "translateX(100%)" : "translateX(0)",
          zIndex: 5,
        }}
      />

      {/* Loading overlay */}
      {loading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10,
          }}
        >
          <div
            style={{
              fontSize: "2rem",
              color: "#f9d9ff",
              fontFamily: "var(--font-script)",
            }}
          >
            Projecting your dream…
          </div>
          <div
            style={{
              marginTop: "0.5rem",
              fontSize: "0.8rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#e6c8ff",
            }}
          >
            Please remain seated in the twilight zone
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2.5rem",
            zIndex: 10,
          }}
        >
          <div
            style={{
              maxWidth: "600px",
              backgroundColor: "rgba(32,4,40,0.95)",
              borderRadius: "16px",
              padding: "1.5rem 1.75rem",
              border: "1px solid rgba(255,179,193,0.7)",
              boxShadow: "0 18px 40px rgba(0,0,0,0.75)",
              color: "#ffb3c1",
              fontSize: "0.9rem",
              lineHeight: 1.6,
            }}
          >
            <strong style={{ display: "block", marginBottom: "0.5rem" }}>
              Projection failed.
            </strong>
            {error}
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      {data && (
        <div
          style={{
            position: "relative",
            padding: "4.5rem 2.5rem 3.5rem",
            maxWidth: "900px",
            margin: "0 auto",
            opacity: curtainsOpen ? 1 : 0,
            transition: "opacity 1.3s ease 0.5s",
            zIndex: 2,
          }}
        >
          {/* Top bar / title */}
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                fontSize: "0.8rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#d4bff6",
              }}
            >
              Private midnight cinema
            </div>
            {onExit && (
              <button
                type="button"
                onClick={onExit}
                style={{
                  padding: "0.4rem 1.1rem",
                  borderRadius: "999px",
                  border: "1px solid rgba(247,228,171,0.9)",
                  background:
                    "linear-gradient(135deg, #f7dd91, #e3b571)",
                  color: "#3b244d",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  boxShadow: "0 8px 18px rgba(0,0,0,0.55)",
                }}
              >
                Back to Journal
              </button>
            )}
          </header>

          {/* SCREEN + VIDEO */}
          <div
            style={{
              marginBottom: "2.5rem",
              padding: "0.9rem",
              borderRadius: "1.4rem",
              background:
                "radial-gradient(circle at top, #f7e3ff 0, #4b205f 40%, #140415 100%)",
              boxShadow:
                "0 22px 45px rgba(0,0,0,0.8), inset 0 0 35px rgba(0,0,0,0.75)",
              border: "1px solid rgba(250,230,255,0.35)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* spiral clock overlay */}
            <div
              style={{
                position: "absolute",
                inset: "-5%",
                backgroundImage: `url(${spiralClock})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: 0.18,
                mixBlendMode: "screen",
                transform: "scale(1.05)",
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                position: "relative",
                borderRadius: "1rem",
                overflow: "hidden",
                backgroundColor: "black",
                minHeight: data.video_url ? "auto" : "220px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {data.video_url ? (
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
              ) : (
                <div
                  style={{
                    padding: "1.5rem",
                    textAlign: "center",
                    fontSize: "0.9rem",
                    color: "#f6ddff",
                  }}
                >
                  Tonight&apos;s projector refused to start. The film only exists
                  on paper this time.
                </div>
              )}
            </div>
            <div
              style={{
                marginTop: "0.4rem",
                textAlign: "center",
                fontSize: "0.8rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#fbe8ff",
                opacity: 0.85,
              }}
            >
              Now showing: your dream
            </div>
          </div>

          {/* Program notes container */}
          <section
            style={{
              backgroundColor: "rgba(14,3,26,0.9)",
              borderRadius: "20px",
              border: "1px solid rgba(156,118,210,0.65)",
              boxShadow: "0 18px 40px rgba(0,0,0,0.8)",
              padding: "1.8rem 2rem",
            }}
          >
            <h1
              style={{
                fontSize: "1.6rem",
                marginBottom: "1.2rem",
                textAlign: "center",
                color: "#f7eaff",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Dream Film
            </h1>

            <p
              style={{
                whiteSpace: "pre-line",
                lineHeight: 1.6,
                fontSize: "1.02rem",
                marginBottom: "2rem",
                color: "#f4dcff",
              }}
            >
              {data.movie_script}
            </p>

            <h2
              style={{
                fontSize: "1.1rem",
                marginBottom: "0.7rem",
                color: "#dcbaff",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Dream Reading
            </h2>

            <p
              style={{
                whiteSpace: "pre-line",
                lineHeight: 1.55,
                fontSize: "0.98rem",
                color: "#e6cfff",
                borderLeft: "3px solid #9254c8",
                paddingLeft: "1rem",
              }}
            >
              {data.psychoanalysis}
            </p>
          </section>
        </div>
      )}
    </div>
  );
};

export default TheaterPage;