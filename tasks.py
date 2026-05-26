"""
Celery tasks for async WhatsApp processing
"""

import os
import time
import logging
from typing import Dict, Any
from celery import Celery, Task
from celery_config import CELERY_CONFIG

celery_app = Celery("whatsapp_tasks")
celery_app.conf.update(CELERY_CONFIG)

logger = logging.getLogger(__name__)


class MessageProcessingTask(Task):
    """Task with retry logic and Twilio response"""
    
    def on_failure(self, exc, task_id, args, kwargs, einfo):
        logger.error(f"Task {task_id} failed: {exc}")
        
        # Try to send error message to user (handle positional or keyword args)
        user_id = kwargs.get('user_id') or (args[0] if args else None)
        if user_id:
            try:
                from .twilio_client import twilio_client_wrapper
                twilio_client_wrapper.send_message(
                    user_id,
                    "⚠️ Sorry, I encountered an error processing your request. Please try again later."
                )
            except Exception as send_error:
                logger.error(f"Failed to send error message: {send_error}")


@celery_app.task(base=MessageProcessingTask, bind=True, max_retries=3, name="whatsapp.process_message")
def process_message_async(self, user_id, incoming_msg, profile_name=None):
    """
    Task to process the message and send the result back to WhatsApp.
    """
    try:
        logger.info(f"Processing message for {user_id}: {incoming_msg[:50]}...")
        
        from .message_handler import message_handler
        from .twilio_client import twilio_client_wrapper
        from .session_manager import session_manager

        # Perform RAG/Intelligence
        response_text = message_handler.handle(incoming_msg, user_id)
        
        # Update session history
        session_manager.add_to_history(user_id, "user", incoming_msg)
        session_manager.add_to_history(user_id, "bot", response_text)
        
        # Send response via Twilio
        result = twilio_client_wrapper.send_message(user_id, response_text)
        
        if result:
            logger.info(f"Response sent to {user_id}, SID: {result.sid}")
            
            # Update session with response status
            session_manager.update_session(user_id, "last_response_sid", result.sid)
            session_manager.update_session(user_id, "last_response_time", time.time())
            
            return {
                "status": "success",
                "user_id": user_id,
                "response_sid": result.sid,
                "response_text": response_text[:200]
            }
        else:
            logger.error(f"Failed to send response to {user_id}")
            return {
                "status": "error",
                "user_id": user_id,
                "error": "Failed to send WhatsApp message"
            }
            
    except Exception as exc:
        logger.error(f"Task failed: {exc}")
        
        from .twilio_client import twilio_client_wrapper
        # Try to send error message
        twilio_client_wrapper.send_message(
            user_id,
            "⚠️ Service temporarily unavailable. Please try again later."
        )
        
        # Retry on transient errors (e.g. API timeouts)
        if self.request.retries < self.max_retries:
            raise self.retry(exc=exc, countdown=2 ** self.request.retries)
        
        return {
            "status": "error",
            "user_id": user_id,
            "error": str(exc)
        }


@celery_app.task(name="whatsapp.send_bulk")
def send_bulk_messages(messages: list) -> list:
    """Send multiple messages in batch"""
    from twilio_client import twilio_client_wrapper
    
    results = []
    for msg in messages:
        result = twilio_client_wrapper.send_message(msg['to'], msg['message'])
        results.append(result)
    
    return results


@celery_app.task(name="whatsapp.cleanup_sessions")
def cleanup_old_sessions():
    """Periodic task to clean up old sessions"""
    from .session_manager import session_manager
    cleaned = session_manager.cleanup_old_sessions()
    logger.info(f"Cleaned up {cleaned} old sessions")
    return {"cleaned": cleaned}