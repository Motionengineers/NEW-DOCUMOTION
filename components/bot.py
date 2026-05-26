"""Main Flask entry point for WhatsApp Bot."""
import os
from flask import Flask, request, Response, jsonify
from twilio.twiml.messaging_response import MessagingResponse
from twilio.request_validator import RequestValidator
from dotenv import load_dotenv
import logging
from datetime import datetime

# Import Celery tasks and session
from .tasks import process_message_async
from .session_manager import session_manager
from .message_handler import message_handler

load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Twilio configuration
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_VALIDATE_REQUESTS = os.getenv("TWILIO_VALIDATE_REQUESTS", "true").lower() == "true"

def validate_twilio_request(request_obj):
    """Validate incoming requests are from Twilio (security)"""
    if not TWILIO_VALIDATE_REQUESTS:
        return True
    
    validator = RequestValidator(TWILIO_AUTH_TOKEN)
    url = request_obj.url
    post_vars = request_obj.form.to_dict()
    signature = request_obj.headers.get('X-Twilio-Signature', '')
    
    return validator.validate(url, post_vars, signature)


@app.route("/whatsapp", methods=["POST"])
def whatsapp_webhook():
    """
    Main webhook handler for WhatsApp messages
    Based on MCP: Tool use for external APIs (PDF 264-300)
    Main webhook handler - returns IMMEDIATE response (<15 seconds)
    Actual processing happens asynchronously in Celery
    """
    
    # Validate request (security)
    if not validate_twilio_request(request):
        logger.warning("Invalid Twilio signature")
        return Response("Invalid signature", status=403)
    
    # Extract message data
    incoming_msg = request.values.get("Body", "").strip()
    sender = request.values.get("From", "")
    wa_id = request.values.get("WaId", "")
    profile_name = request.values.get("ProfileName", "")
    message_sid = request.values.get("MessageSid", "")
    
    logger.info(f"Message from {sender} ({profile_name}): {incoming_msg[:50]}...")
    
    # Create response
    resp = MessagingResponse()
    msg = resp.message()
    
    # Ignore empty messages
    if not incoming_msg:
        msg.body("Hello! Send me a message describing your startup, and I'll find relevant government schemes.")
        return Response(str(resp), content_type="application/xml")
    
    # Process message using the handler
    # Send acknowledgment immediately (within 15 seconds)
    msg.body("⏳ Processing your request... I'll search for relevant schemes and get back to you shortly.")

    # Queue async task for actual processing
    try:
        # Use WhatsApp as the identifier
        user_id = sender
        task = process_message_async.delay(sender, incoming_msg)
        logger.info(f"Queued task {task.id} for user {sender}")
        

    except Exception as e:
        logger.error(f"Error processing message: {str(e)}")
        msg.body("⚠️ Sorry, I encountered an error. Please try again later.")
        logger.error(f"Failed to queue task: {e}")
        # Fallback: process synchronously if small enough (or return error)
        msg.body("⚠️ Service under high load. I'm processing requests as fast as possible.")
    
    return Response(str(resp), content_type="application/xml")


@app.route("/whatsapp/health", methods=["GET"])
def health_check():
    """Health check endpoint for monitoring"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "active_sessions": len(message_handler.user_sessions)
    })


@app.route("/whatsapp/stats", methods=["GET"])
def get_stats():
    """Get bot statistics"""
    sessions = session_manager.user_sessions
    return jsonify({
        "active_sessions": len(sessions),
        "redis_connected": session_manager.client is not None,
        "hyde_available": message_handler.rag_available,
        "sessions": list(sessions.keys())
    })


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("DEBUG", "false").lower() == "true"
    
    print("=" * 50)
    print("🤖 Documotion WhatsApp Bot")
    print("=" * 50)
    print(f"Port: {port}")
    print(f"Debug: {debug}")
    print(f"API URL: {os.getenv('API_URL', 'http://localhost:8000')}")
    print("=" * 50)
    
    app.run(host="0.0.0.0", port=port, debug=debug)