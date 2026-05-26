#!/usr/bin/env python
"""
Celery Worker Entry Point
"""

import os
import sys

# Ensure backend directory is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from whatsapp.tasks import celery_app
from celery_config import CELERY_CONFIG

celery_app.conf.update(CELERY_CONFIG)

if __name__ == "__main__":
    print("🚀 Starting Documotion Celery Worker...")
    celery_app.start()