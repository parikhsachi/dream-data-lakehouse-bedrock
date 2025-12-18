# Project Description

A cinematic dream journal that transforms written dreams and daily context into surreal short films and reflective interpretations using AWS Bedrock (Claude + Luma Ray).

Built on a scalable AWS lakehouse and Bedrock-based pipeline, it ingests, stores, and analyzes dream and film data through structured ETL and ML workflows. The architecture leverages FastAPI, S3 lakehouse storage, Python ETL (Glue / Pandas), and AWS Bedrock foundation models to deliver a full-stack generative and analytics workflow.

This assumes you bring your own AWS account, credentials, and S3 buckets.

---

## Prerequisites

- Node 18+
- Python 3.9+
- AWS account with Bedrock access
- AWS CLI configured (`aws configure`)

---

## 1. AWS Setup (one-time)

### 1.1 S3 Buckets

Create two buckets (names are up to you):

- **Data bucket** — stores dream JSON
- **Video bucket** — stores Luma outputs and serves video

### 1.2 Video Bucket CORS (required)

Apply this CORS configuration to the video bucket so videos can play in the browser:

```json
[
  {
    "AllowedOrigins": ["http://127.0.0.1:5173", "http://localhost:5173"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag", "Accept-Ranges", "Content-Range"]
  }
]
```

### 1.3 Required AWS Permissions

Your AWS user or role must allow the following actions (scoped to your two buckets):

- `bedrock:InvokeModel`
- `bedrock:StartAsyncInvoke`
- `bedrock:GetAsyncInvoke`
- `s3:GetObject`
- `s3:PutObject`
- `s3:ListBucket`

---

## 2. Backend Setup (FastAPI)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2.1 Environment Variables

Create `backend/.env` using the template below.

**`.env.example`**

```bash
# AWS / Bedrock
BEDROCK_REGION=us-west-2

# Feature flags
USE_BEDROCK=true
USE_LUMA=true

# S3 buckets (you must create these)
DATA_BUCKET=your-data-bucket
LUMA_OUTPUT_BUCKET=your-video-bucket

# Models
# Use an inference profile ARN or a model ID your account has access to
CLAUDE_MODEL_ID=your-claude-model-or-inference-profile
LUMA_MODEL_ID=luma.ray-v2:0
```

Copy it:

```bash
cp .env.example .env
```

### 2.2 Run the API

```bash
uvicorn app.main:app --reload --port 8000
```

## 3. Frontend Setup (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Open in browser:

```
http://127.0.0.1:5173
```
