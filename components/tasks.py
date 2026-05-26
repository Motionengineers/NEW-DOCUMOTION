"""
Celery tasks for WhatsApp message processing.
"""
import os
import logging
from celery import Celery
from twilio.rest import Client
from .message_handler import message_handler
from .session_manager import session_manager
from backend.whatsapp.celery_config import CELERY_CONFIG

logger = logging.getLogger(__name__)

# Initialize Celery
celery_app = Celery("whatsapp_tasks")
celery_app.conf.update(CELERY_CONFIG)

# Twilio setup
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_NUMBER = os.getenv("TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")

client = None
if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN:
    client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

@celery_app.task(name="process_message_async")
def process_message_async(user_id, incoming_msg):
    """
    Asynchronously process message and send response via Twilio API.
    """
    try:
        logger.info(f"Task started: Processing message for {user_id}")
        
        # Perform RAG/HyDE processing
        response_text = message_handler.process_message(user_id, incoming_msg)
        
        # Send message back via Twilio REST API
        if client:
            client.messages.create(
                body=response_text,
                from_=TWILIO_NUMBER,
                to=user_id
            )
            logger.info(f"Task completed: Response sent to {user_id}")
        else:
            logger.warning("Twilio client not initialized. Response: " + response_text)
            
        return {"status": "success", "user_id": user_id}
    except Exception as e:
        logger.error(f"Task failed for {user_id}: {str(e)}")
        return {"status": "error", "error": str(e)}