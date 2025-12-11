import json
import os
from datetime import datetime
from uuid import uuid4
from typing import Any, Dict, List

import boto3
import pyarrow as pa
import pyarrow.parquet as pq


# S3 paths
BUCKET = os.getenv("DREAM_LAKE_BUCKET", "dream-film-lake-dev-sachi")
RAW_PREFIX = "raw/dream_journal_events/"
STRUCTURED_PREFIX = "structured/dreams_parquet/v1/"

s3 = boto3.client("s3")


def list_raw_keys() -> List[str]:
    """List all raw dream event keys under RAW_PREFIX."""
    keys: List[str] = []
    continuation_token = None

    while True:
        kwargs: Dict[str, Any] = {
            "Bucket": BUCKET,
            "Prefix": RAW_PREFIX,
        }
        if continuation_token:
            kwargs["ContinuationToken"] = continuation_token

        resp = s3.list_objects_v2(**kwargs)
        for obj in resp.get("Contents", []):
            key = obj["Key"]
            if key.endswith(".json"):
                keys.append(key)

        if resp.get("IsTruncated"):
            continuation_token = resp.get("NextContinuationToken")
        else:
            break

    return keys


def read_json_from_s3(key: str) -> Dict[str, Any]:
    resp = s3.get_object(Bucket=BUCKET, Key=key)
    body = resp["Body"].read()
    return json.loads(body)


def extract_row(event: Dict[str, Any]) -> Dict[str, Any]:
    """
    Normalize one raw event JSON into a flat row.

    We assume it either has:
      - top-level dream fields, OR
      - nested 'dream' + 'render' structure.

    Adjust field names here if your raw JSON structure differs.
    """
    dream = event.get("dream") or event
    render = event.get("render") or event.get("render_result") or {}

    psycho_meta = render.get("psycho_metadata") or event.get("psycho_metadata") or {}
    key_signifiers = psycho_meta.get("key_signifiers") or []

    created_at_str = dream.get("created_at") or event.get("created_at")
    created_at_dt = None
    event_date = None
    if isinstance(created_at_str, str):
        try:
            created_at_dt = datetime.fromisoformat(created_at_str.replace("Z", "+00:00"))
            event_date = created_at_dt.date().isoformat()
        except Exception:
            event_date = None

    row: Dict[str, Any] = {
        # core
        "dream_id": dream.get("id"),
        "created_at": created_at_str,
        "event_date": event_date,
        "title": dream.get("title"),
        "narrative": dream.get("narrative"),

        # context
        "mood": dream.get("mood"),
        "sleep_quality": dream.get("sleep_quality"),
        "mbti": dream.get("mbti"),
        "listening_to": dream.get("listening_to"),
        "watching": dream.get("watching"),
        "reading": dream.get("reading"),
        "context_note": dream.get("context_note"),

        # links
        "spotify_url": dream.get("spotify_url"),
        "letterboxd_url": dream.get("letterboxd_url"),
        "goodreads_url": dream.get("goodreads_url"),

        # psycho-metadata (from model)
        "register_feel": psycho_meta.get("register_feel"),
        "wish_fulfillment_type": psycho_meta.get("wish_fulfillment_type"),
        "subject_position": psycho_meta.get("subject_position"),
        "day_residues_count": len(psycho_meta.get("day_residues") or []),
        "key_signifiers_count": len(key_signifiers),

        # output
        "has_video": bool(render.get("video_url") or event.get("video_url")),
        "video_s3_prefix": render.get("video_url") or event.get("video_url"),
    }

    return row


def group_rows_by_event_date(rows: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
    grouped: Dict[str, List[Dict[str, Any]]] = {}
    for row in rows:
        date = row.get("event_date") or "unknown_date"
        grouped.setdefault(date, []).append(row)
    return grouped


def write_parquet_to_s3(rows: List[Dict[str, Any]], date: str) -> None:
    if not rows:
        return

    table = pa.Table.from_pylist(rows)

    key = f"{STRUCTURED_PREFIX}event_date={date}/part-{uuid4().hex}.parquet"
    local_path = f"/tmp/{uuid4().hex}.parquet"

    pq.write_table(table, local_path)

    print(f"Uploading Parquet for date={date} to s3://{BUCKET}/{key}")
    s3.upload_file(local_path, BUCKET, key)


def main() -> None:
    keys = list_raw_keys()
    print(f"Found {len(keys)} raw event files.")

    rows: List[Dict[str, Any]] = []
    for key in keys:
        try:
            event = read_json_from_s3(key)
            row = extract_row(event)
            rows.append(row)
        except Exception as e:
            print(f"Skipping {key} due to error: {e}")

    grouped = group_rows_by_event_date(rows)

    for date, group in grouped.items():
        write_parquet_to_s3(group, date)


if __name__ == "__main__":
    main()
