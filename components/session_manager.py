"""
Redis Session Manager for WhatsApp Bot
Based on PDF Pages 146-176 (Context Engineering)
"""

import json
import redis
from typing import Dict, Any, Optional
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

class SessionManager:
    """
    Session manager using Redis for production
    Falls back to in-memory for development
    """
    def __init__(self):
        self.redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        self.session_ttl = int(os.getenv("SESSION_TTL_SECONDS", 3600))
        self._client = None
        self._in_memory = {}

    @property
    def client(self):
        """Lazy load Redis client"""
        if self._client is None:
            try:
                self._client = redis.from_url(self.redis_url, decode_responses=True)
                self._client.ping()
            except Exception:
                self._client = None
        return self._client

    def get_session(self, user_id: str) -> Dict[str, Any]:
        """Get or create session for user"""
        if self.client:
            key = f"whatsapp_session:{user_id}"
            data = self.client.get(key)
            if data:
                return json.loads(data)
        
        if user_id in self._in_memory:
            return self._in_memory[user_id]
        
        # Initialize default session
        session = {
                "last_interaction": datetime.now(),
                "context": "idle",
                "history": [],
                "message_count": 0,
                "preferences": {"use_hyde": True}
            }
        self.set_session(user_id, session)
        return session

    def set_session(self, user_id: str, session: Dict[str, Any]):
        """Save session to Redis or memory"""
        session["last_interaction"] = datetime.now().isoformat()
        if self.client:
            key = f"whatsapp_session:{user_id}"
            self.client.setex(key, self.session_ttl, json.dumps(session))
        else:
            self._in_memory[user_id] = session

    def update_session(self, user_id: str, key: str, value: Any):
        """Update a specific key in the session"""
        session = self.get_session(user_id)
        session[key] = value
        self.set_session(user_id, session)

    def add_to_history(self, user_id: str, role: str, content: str):
        """Append to conversation history"""
        session = self.get_session(user_id)
        session["history"].append({
            "role": role,
            "content": content[:500],
            "timestamp": datetime.now().isoformat()
        })
        # Keep window of 20 messages
        if len(session["history"]) > 20:
            session["history"] = session["history"][-20:]
        self.set_session(user_id, session)

    def get_user_state(self, phone_number):
        """Compatibility wrapper for legacy code"""
        return self.get_session(phone_number)

    def update_state(self, phone_number, context=None):
        """Compatibility wrapper for legacy code"""
        if context:
            self.update_session(phone_number, "context", context)
        else:
            self.set_session(phone_number, self.get_session(phone_number))

    @property
    def user_sessions(self):
        """Return active session IDs for stats"""
        if self.client:
            try:
                keys = self.client.keys("whatsapp_session:*")
                return {k.split(":")[-1]: {} for k in keys}
            except Exception:
                return {}
        return self._in_memory

session_manager = SessionManager()