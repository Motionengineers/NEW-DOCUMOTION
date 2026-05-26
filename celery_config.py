"""
Celery Configuration for Async Processing
Based on PDF Pages 264-300 (MCP - async operations)
"""

import os
from dotenv import load_dotenv

load_dotenv()

# Redis as message broker (also for session storage)
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

CELERY_CONFIG = {
    "broker_url": REDIS_URL,
    "result_backend": REDIS_URL,
    "task_serializer": "json",
    "result_serializer": "json",
    "accept_content": ["json"],
    "timezone": "Asia/Kolkata",
    "enable_utc": True,
    "task_track_started": True,
    "task_time_limit": 30,  # 30 seconds max
    "task_soft_time_limit": 25,  # 25 seconds soft limit
    "worker_prefetch_multiplier": 1,
    "worker_concurrency": 4,
}

# For development (if Redis not available, use memory broker)
if os.getenv("ENVIRONMENT") == "development":
    CELERY_CONFIG["broker_url"] = "memory://"
    CELERY_CONFIG["result_backend"] = "cache+memory://"