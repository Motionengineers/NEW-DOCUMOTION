"""Main Flask entry point for WhatsApp Bot."""
import os
import sys
from flask import Flask, request, Response, jsonify
from twilio.twiml.messaging_response import MessagingResponse
from twilio.request_validator import RequestValidator
from dotenv import load_dotenv
import logging
from datetime import datetime
from celery.result import AsyncResult

# Add backend to path to find celery_config and package
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from whatsapp.tasks import process_message_async
from whatsapp.session_manager import session_manager
from whatsapp.message_handler import message_handler

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_VALIDATE_REQUESTS = os.getenv("TWILIO_VALIDATE_REQUESTS", "true").lower() == "true"

def validate_twilio_request(request_obj):
    """Validate incoming requests are from Twilio"""
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
    Main webhook handler - returns IMMEDIATE response
    Actual processing happens in Celery worker
    """
    if not validate_twilio_request(request):
        logger.warning("Invalid Twilio signature")
        return Response("Invalid signature", status=403)
    
    incoming_msg = request.values.get("Body", "").strip()
    sender = request.values.get("From", "")
    profile_name = request.values.get("ProfileName", "")
    message_sid = request.values.get("MessageSid", "")
    
    logger.info(f"📨 Message from {sender} ({profile_name}): {incoming_msg[:50]}...")
    
    resp = MessagingResponse()
    msg = resp.message()
    
    if not incoming_msg:
        msg.body("Hello! Send me a message describing your startup, and I'll find relevant government schemes.")
        return Response(str(resp), content_type="application/xml")
    
    msg.body("⏳ Processing your request... I'll get back to you shortly.")

    try:
        task = process_message_async.delay(sender, incoming_msg, profile_name)
        logger.info(f"📋 Queued task {task.id} for user {sender}")
        
        # Store task info in session
        session_manager.update_session(sender, "last_task_id", task.id)
        session_manager.update_session(sender, "last_message_sid", message_sid)
        
    except Exception as e:
        logger.error(f"Failed to queue task: {e}")
        msg.body("⚠️ Service temporarily unavailable. Please try again later.")
    
    return Response(str(resp), content_type="application/xml")

@app.route("/whatsapp/status/<task_id>", methods=["GET"])
def get_task_status(task_id):
    """Get task status"""
    from tasks import celery_app
    task = AsyncResult(task_id, app=celery_app)
    
    if task.ready():
        result = task.result
        return jsonify({
            "status": "completed",
            "result": result
        })
    elif task.failed():
        return jsonify({
            "status": "failed",
            "error": str(task.info)
        })
    else:
        return jsonify({
            "status": "pending"
        })

@app.route("/whatsapp/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    from datetime import datetime
    
    # Check Redis connection
    redis_ok = False
    try:
        if session_manager.client:
            session_manager.client.ping()
            redis_ok = True
    except:
        pass
    
    return jsonify({
        "status": "healthy",
        "active_sessions": len(session_manager.user_sessions),
        "timestamp": datetime.utcnow().isoformat(),
        "redis": "connected" if redis_ok else "disconnected",
        "twilio_configured": bool(os.getenv("TWILIO_ACCOUNT_SID"))
    })

@app.route("/whatsapp/stats", methods=["GET"])
def get_stats():
    """Get bot statistics"""
    return jsonify({
        "active_sessions": len(session_manager._in_memory) if not session_manager.client else "via_redis",
        "redis_connected": session_manager.client is not None,
        "twilio_configured": bool(os.getenv("TWILIO_ACCOUNT_SID"))
    })

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("DEBUG", "false").lower() == "true"
    
    print("=" * 50)
    print("🤖 Documotion WhatsApp Bot")
    print("=" * 50)
    print(f"Port: {port}")
    print(f"Redis: {os.getenv('REDIS_URL', 'redis://localhost:6379/0')}")
    print(f"Twilio: {'Configured' if os.getenv('TWILIO_ACCOUNT_SID') else 'Not Configured'}")
    print("=" * 50)
    
    app.run(host="0.0.0.0", port=port, debug=debug)