// src/TheaterPage.tsx
import React, { useEffect, useRef, useState } from "react";

import starLake from "../images/bedrock-7.jpeg";
import starProcession from "../images/bedrock-3.jpeg";
import spiralClock from "../images/bedrock-11.jpeg";
import blueVelvet from "../images/bedrock-17.jpeg";

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
  const videoRef = useRef<HTMLVideoElement | null>(null);

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

        if (json.video_url) {
          setCurtainsOpen(true);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to render dream.");
      } finally {
        setLoading(false);
      }
    }

    runInference();
  }, [dreamId]);

  useEffect(() => {
  if (!curtainsOpen) return;
  if (!data?.video_url) return;

  const v = videoRef.current;
  if (!v) return;

  // Request fullscreen once
  if (v.requestFullscreen) {
    v.requestFullscreen().catch(() => {});
  }
}, [curtainsOpen, data?.video_url]);


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
      {!error && !curtainsOpen && (
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
              marginTop: "0.55rem",
              fontSize: "0.8rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#e6c8ff",
            }}
          >
            Please remain seated
          </div>
          <div style={{ marginTop: "0.7rem", fontSize: "0.8rem", color: "#d4bff6", opacity: 0.9 }}>
            (This can take a few minutes. Curtains stay closed until the film arrives.)
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
          </header>

          {/* SCREEN + VIDEO */}
          <div
            style={{
              marginBottom: "2.5rem",
              padding: "0.9rem",
              borderRadius: "1.4rem",
              background: "rgba(210, 175, 100, 0.25)",
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
                  ref={videoRef}
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
          </div>

          {/* Program notes container */}
          <section
            style={{
              backgroundColor: "rgba(1, 3, 47, 0.9)",
              borderRadius: "20px",
              border: "1px solid rgba(156,118,210,0.65)",
              boxShadow: "0 18px 40px rgba(0,0,0,0.8)",
              padding: "1.5rem 2rem",
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
            <div
  style={{
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "1.5rem",
  }}
>
  {onExit && (
    <button
      type="button"
      onClick={onExit}
      style={{
        padding: "0.6rem 1.2rem",
        borderRadius: "999px",
        backgroundImage: `url(${blueVelvet})`,
        backgroundSize: "cover",
        color: "rgba(180, 199, 248, 0.95)",
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        fontSize: "0.75rem",
        cursor: "pointer",
        border: "1px solid rgba(3, 2, 57, 0.7)",
        boxShadow: "0 8px 18px rgba(0,0,0,0.55)",
      }}
    >
      Back to Journal
    </button>
  )}
</div>

          </section>
        </div>
      )}
    </div>
  );
};

export default TheaterPage;