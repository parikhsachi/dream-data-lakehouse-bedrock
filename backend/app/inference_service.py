# backend/app/inference_service.py

import json
import os
import time
from typing import Dict, Any, List, Optional

import boto3

from .schemas import Dream, DreamRenderResponse, PsychoMetadata


# ---------- Env + clients ----------

BEDROCK_REGION = os.getenv("BEDROCK_REGION", "us-west-2")
bedrock_client = boto3.client("bedrock-runtime", region_name=BEDROCK_REGION)

USE_BEDROCK = os.getenv("USE_BEDROCK", "false").lower() == "true"
USE_LUMA = os.getenv("USE_LUMA", "false").lower() == "true"

CLAUDE_MODEL_ID = os.getenv(
    "CLAUDE_MODEL_ID",
    "anthropic.claude-3-5-sonnet-20241022-v1:0",  
)

LUMA_MODEL_ID = os.getenv(
    "LUMA_MODEL_ID",
    "luma.ray-v2:0",  
)

LUMA_OUTPUT_BUCKET = os.getenv("LUMA_OUTPUT_BUCKET", "dream-film-videos-dev-sachi")


# ---------- 1. Build model input payload (for Claude) ----------

def build_model_input(dream: Dream) -> Dict[str, Any]:
    """
    Shape the input we will send to the text model (Claude).
    This is the contract between your app and the model.
    """
    return {
        "dream": {
            "title": dream.title,
            "narrative": dream.narrative,
        },
        "context": {
            "mood": dream.mood,
            "sleep_quality": dream.sleep_quality,
            "mbti": dream.mbti,
            "spotify_url": dream.spotify_url,
            "letterboxd_url": dream.letterboxd_url,
            "goodreads_url": dream.goodreads_url,
            "listening_to": dream.listening_to,
            "watching": dream.watching,
            "reading": dream.reading,
            "context_note": dream.context_note,
            "created_at": dream.created_at.isoformat(),
            "id": dream.id,
        },
    }


# ---------- 2. Local stub: model behavior (for offline dev) ----------

def _local_style_and_analysis(model_input: Dict[str, Any]) -> Dict[str, Any]:
    """
    Temporary stand-in for a Bedrock text model.

    Takes the same payload we'd send to Claude and returns the same
    kind of structured output that Claude will eventually return.
    """
    dream_part = model_input.get("dream", {})
    ctx = model_input.get("context", {})

    title: Optional[str] = dream_part.get("title") or "Untitled dream"
    narrative: str = dream_part.get("narrative") or ""
    mood = ctx.get("mood")
    mbti = ctx.get("mbti")
    listening_to = ctx.get("listening_to")
    watching = ctx.get("watching")
    reading = ctx.get("reading")
    context_note = ctx.get("context_note")

    # --- style_profile ---
    if isinstance(mood, int) and mood <= -2:
        palette: List[str] = ["deep indigo", "bruised violet", "dull gold"]
    elif isinstance(mood, int) and mood >= 2:
        palette = ["neon magenta", "electric cyan", "acid yellow"]
    else:
        palette = ["muted plum", "off-white", "faded orange"]

    if isinstance(mbti, str) and mbti.upper().startswith("I"):
        camera_style = "intimate, lingering close-ups, static frames"
    else:
        camera_style = "restless tracking shots, wider compositions"

    influences: List[str] = []
    if listening_to:
        influences.append(
            f"The rhythm of cuts echoes what you were listening to ({listening_to})."
        )
    if watching:
        influences.append(
            f"The visual grammar borrows from what you were watching ({watching})."
        )
    if reading:
        influences.append(
            f"Narrative motifs echo what you were reading ({reading})."
        )
    if not influences:
        influences.append(
            "The film lingers on textures and small sensory details rather than plot."
        )

    style_profile: Dict[str, Any] = {
        "colorPalette": palette,
        "cameraStyle": camera_style,
        "mediaInfluence": influences,
        "mbti": mbti,
        "links": {
            "spotify": ctx.get("spotify_url"),
            "letterboxd": ctx.get("letterboxd_url"),
            "goodreads": ctx.get("goodreads_url"),
        },
    }

    # --- psychoanalytic metadata (placeholder) ---
    text = narrative.lower()

    imaginary_words = ["mirror", "reflection", "double", "face", "body", "image"]
    symbolic_words = [
        "exam",
        "test",
        "school",
        "university",
        "office",
        "manager",
        "contract",
        "email",
        "rules",
    ]
    real_words = ["blood", "wound", "dead", "scream", "void", "teeth", "falling", "crash"]

    found_signifiers: List[str] = []
    for w in imaginary_words + symbolic_words + real_words:
        if w in text:
            found_signifiers.append(w)

    register: Optional[str] = None
    if any(w in text for w in imaginary_words):
        register = "imaginary"
    if any(w in text for w in symbolic_words):
        register = "symbolic"
    if any(w in text for w in real_words):
        register = "real"

    psycho_metadata: Dict[str, Any] = {
        "key_signifiers": sorted(set(found_signifiers)) or None,
        "register_feel": register,
        "day_residues": None,
        "wish_fulfillment_type": None,
        "subject_position": None,
    }

    # --- textual psychoanalysis (summary) ---
    points: List[str] = []

    if register == "imaginary":
        points.append(
            "The dream leans into the Imaginary in Lacan's sense: images of body and identity circle a missing certainty."
        )
    elif register == "symbolic":
        points.append(
            "Symbolic structures dominate: institutions, rules, and evaluations stage how you experience desire and anxiety."
        )
    elif register == "real":
        points.append(
            "There are eruptions of the Real: scenes that puncture narrative coherence and resist being fully symbolized."
        )

    if found_signifiers:
        uniq = ", ".join(sorted(set(found_signifiers)))
        points.append(
            f"Certain signifiers recur ({uniq}), forming small knots where your attention and anxiety return."
        )

    if isinstance(mbti, str):
        points.append(
            f"Your MBTI ({mbti.upper()}) colors how conflict is staged—what stays internal vs. externalized as characters or spaces."
        )

    if context_note:
        points.append(
            f"The day's residue ('{context_note}') seeps into the dream's textures more than its literal plot."
        )

    if not points:
        points.append(
            "This dream threads together residues of the day with older desire patterns, without resolving them into a simple message."
        )

    psychoanalysis_text = " ".join(points)

    # --- movie_script (film treatment) ---
    palette_str = ", ".join(palette)
    influences_str = " ".join(influences)

    script_lines: List[str] = []
    script_lines.append(f"The dream film opens in a palette of {palette_str}.")
    script_lines.append(f"The camera moves with {camera_style}.")
    script_lines.append(influences_str)
    script_lines.append("")
    script_lines.append(f"TITLE CARD: \"{title}\"")
    script_lines.append("")
    script_lines.append("SCENE:")
    script_lines.append(narrative)

    movie_script = " ".join(script_lines)

    return {
        "movie_script": movie_script,
        "psychoanalysis": psychoanalysis_text,
        "style_profile": style_profile,
        "psycho_metadata": psycho_metadata,
    }


# ---------- 3. Claude (text model on Bedrock) ----------

def call_claude_model(model_input: Dict[str, Any]) -> Dict[str, Any]:
    """
    Call a Claude model on Bedrock to generate:
      - movie_script
      - psychoanalysis
      - style_profile
      - psycho_metadata

    Assumes the model returns a JSON object as text.
    You may need to adapt parsing to the exact Bedrock response format.
    """
    system_prompt = """
You are an assistant who acts as both:

1) A dream-film director, designing a short film treatment of a dream.
2) A psychoanalytic reader of dreams, loosely inspired by Freud and Lacan.

You receive structured JSON containing:
- a dream report ("dream.narrative", optionally "dream.title"),
- daily context: mood, sleep quality, MBTI type, media listened to / watched / read,
- links to media profiles, and a short free-form note about the day.

Your job is to:
1. Write a "movie_script" string: a short film treatment as if the dream were projected in a small vintage cinema. Include mood, color, shot style, and a clear sense of progression, but not a full screenplay.
2. Write a "psychoanalysis" string: a reflective, non-clinical interpretation of the dream. You may use some vocabulary inspired by Freud or Lacan (day residues, wish-fulfilment, signifiers, Imaginary/Symbolic/Real), but you MUST NOT provide any medical, diagnostic, or therapeutic advice.
3. Produce a "style_profile" object describing:
   - "colorPalette": 3–5 color phrases (e.g. "deep indigo", "acid yellow"),
   - "cameraStyle": 1–2 sentences about how the camera moves,
   - "mediaInfluence": a list of short sentences about how the user's listening/watching/reading might inflect the film's style,
   - "mbti": echo the MBTI string if present,
   - "links": an object with the given spotify / letterboxd / goodreads URLs (these are just echoed back; do not invent URLs).
4. Optionally produce "psycho_metadata":
   - "day_residues": a list of concrete day elements that return in the dream,
   - "wish_fulfillment_type": a short label (e.g. "reparation", "revenge", "escape", "performance") or null,
   - "key_signifiers": a list of short phrases that seem to knot together anxiety or desire,
   - "subject_position": a short phrase about how the dreamer is positioned (e.g. "examined", "abandoned", "performing", "observer"),
   - "register_feel": one of "imaginary", "symbolic", "real", or null.

Very important:
- DO NOT mention Freud, Lacan, or psychoanalysis explicitly in the output; let it be a stylistic undercurrent.
- DO NOT give mental health or medical advice.
- Respond ONLY with a single JSON object with the following top-level keys:
  "movie_script", "psychoanalysis", "style_profile", "psycho_metadata".
- The JSON must be strictly valid and parseable, with double quotes around keys and string values.
""".strip()

    user_json = json.dumps(model_input, ensure_ascii=False)

    body = {
        "modelId": CLAUDE_MODEL_ID,
        "messages": [
            {
                "role": "system",
                "content": [
                    {"type": "text", "text": system_prompt},
                ],
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": (
                            "Here is the dream JSON:\n\n"
                            f"{user_json}\n\n"
                            "Remember: respond ONLY with the JSON object described above."
                        ),
                    }
                ],
            },
        ],
        "inferenceConfig": {
            "maxTokens": 1200,
            "temperature": 0.7,
        },
    }

    response = bedrock_client.invoke_model(
        modelId=CLAUDE_MODEL_ID,
        body=json.dumps(body),
        contentType="application/json",
        accept="application/json",
    )

    response_body = json.loads(response["body"].read())

    # The exact field depends on the model API.
    # Adjust this according to Bedrock's Claude response schema.
    model_text = response_body.get("outputText")
    if not model_text:
        results = response_body.get("results")
        if isinstance(results, list) and results:
            model_text = results[0].get("outputText")

    if not model_text:
        raise RuntimeError(f"Unexpected Claude response format: {response_body}")

    return json.loads(model_text)


def call_model(model_input: Dict[str, Any]) -> Dict[str, Any]:
    """
    Single abstraction for 'the text model'.

    - If USE_BEDROCK is true → call Claude on Bedrock.
    - Otherwise → use local stub.
    """
    if USE_BEDROCK:
        return call_claude_model(model_input)

    return _local_style_and_analysis(model_input)


# ---------- 4. Luma Ray 2 (text-to-video via Bedrock Async) ----------

def build_luma_prompt(movie_script: str, style_profile: Dict[str, Any]) -> str:
    """
    Build a concise, visual prompt for Luma from the Claude output.
    """
    palette = style_profile.get("colorPalette") or []
    camera_style = style_profile.get("cameraStyle") or ""
    influences = style_profile.get("mediaInfluence") or []

    palette_str = ", ".join(palette)
    influences_str = " ".join(influences)

    prompt = (
        "Whimsigoth dream film in deep purple and gold, projected in a small vintage cinema. "
        f"Color palette: {palette_str}. Camera style: {camera_style}. "
        f"{influences_str} "
        f"Scene description: {movie_script}"
    )

    return prompt


def call_luma_model(prompt: str, key_prefix: str) -> Optional[str]:
    """
    Call Luma Ray 2 via Bedrock Async APIs to generate a video.

    - prompt: text prompt for the video
    - key_prefix: S3 prefix to keep outputs organized, e.g. "luma_outputs/<dream-id>"

    Returns: S3 URI for the output folder (or None on failure / disabled).
    """
    if not USE_LUMA:
        print("USE_LUMA is false; skipping Luma video generation.")
        return None

    # The docs say: outputDataConfig.s3OutputDataConfig.s3Uri
    s3_uri = f"s3://{LUMA_OUTPUT_BUCKET}/{key_prefix}"

    # 1) StartAsyncInvoke
    model_input = {
        "prompt": prompt,
        "aspect_ratio": "16:9",
        "loop": False,
        "duration": "5s",
        "resolution": "720p",
    }

    start_response = bedrock_client.start_async_invoke(
        modelId=LUMA_MODEL_ID,
        modelInput=model_input,
        outputDataConfig={
            "s3OutputDataConfig": {
                "s3Uri": s3_uri,
            }
        },
    )

    invoke_job_arn = start_response["invokeJobArn"]
    print(f"Started Luma async job: {invoke_job_arn}")

    # 2) Poll GetAsyncInvoke until completion or timeout
    max_wait_seconds = 300  # 5 minutes
    poll_interval = 10
    waited = 0

    while waited < max_wait_seconds:
        job = bedrock_client.get_async_invoke(invokeJobArn=invoke_job_arn)
        status = job["status"]
        print(f"Luma job status: {status}")

        if status == "Completed":
            # Video is now in S3 under s3_uri.
            # For now we just return the folder URI; you can later
            # list the exact .mp4 object if you want.
            return s3_uri

        if status == "Failed":
            print(f"Luma job failed: {job}")
            return None

        time.sleep(poll_interval)
        waited += poll_interval

    print("Luma job timed out.")
    return None


# ---------- 5. Main entrypoint used by FastAPI ----------

def run_dream_inference(dream: Dream) -> DreamRenderResponse:
    """
    Main inference pipeline:

      1. Build structured payload (dream + context).
      2. Use Claude (or local stub) to get:
         - movie_script
         - psychoanalysis
         - style_profile
         - psycho_metadata
      3. Build a prompt for Luma from movie_script + style_profile.
      4. Call Luma via Bedrock Async to generate a video (S3 URI).
      5. Return everything as DreamRenderResponse.
    """
    # 1. Prepare model input for text model
    model_input = build_model_input(dream)

    # 2. Claude (or stub)
    raw = call_model(model_input)

    raw_meta = raw.get("psycho_metadata")
    psycho_meta_obj: Optional[PsychoMetadata] = None
    if isinstance(raw_meta, dict):
        psycho_meta_obj = PsychoMetadata(**raw_meta)

    movie_script: str = raw.get("movie_script", "")
    style_profile: Dict[str, Any] = raw.get("style_profile", {})
    psychoanalysis: str = raw.get("psychoanalysis", "")

    # 3. Build Luma prompt
    luma_prompt = build_luma_prompt(movie_script, style_profile)

    # 4. Call Luma (optional, depending on USE_LUMA)
    key_prefix = f"luma_outputs/{dream.id}"
    video_uri = call_luma_model(luma_prompt, key_prefix)

    # 5. Return combined response
    return DreamRenderResponse(
        dream=dream,
        style_profile=style_profile,
        movie_script=movie_script,
        psychoanalysis=psychoanalysis,
        psycho_metadata=psycho_meta_obj,
        video_url=video_uri,
    )
