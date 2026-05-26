#!/bin/bash

# Start Redis
docker run -d -p 6379:6379 --name docu-redis redis:alpine || docker start docu-redis

# Start Worker
celery -A celery_worker worker --loglevel=info &

# Start Bot
python whatsapp/bot.py