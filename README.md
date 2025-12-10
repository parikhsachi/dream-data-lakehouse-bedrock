A scalable AWS lakehouse and Bedrock-based pipeline for ingesting, storing, and analyzing dream and film data through structured ETL and ML workflows. Leverages FastAPI, S3 lakehouse architecture, Python ETL (Glue/Pandas), and Bedrock foundation models to deliver a full-stack generative and analytics workflow.

User → FastAPI Backend → Claude (Bedrock) → film script + style + analysis
                                     ↓
                            Build Luma prompt
                                     ↓
                     Luma Ray 2 (Async Invoke via Bedrock)
                                     ↓
                       Output MP4 stored in S3 bucket
                                     ↓
                        Returned JSON + S3 video URL

