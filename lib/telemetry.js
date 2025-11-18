// Lightweight telemetry client with canonical event schema
// Works in both browser and Node.js environments

const BUFFER = [];
const FLUSH_INTERVAL_MS = 5000;
const ENDPOINT = typeof window !== 'undefined' 
  ? '/api/telemetry/events' 
  : (process.env.TELEMETRY_ENDPOINT || '/api/telemetry/events');

// Session management
let sessionId = null;
function getSessionId() {
  if (sessionId) return sessionId;
  if (typeof window !== 'undefined') {
    sessionId = sessionStorage.getItem('telemetry_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('telemetry_session_id', sessionId);
    }
  } else {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  return sessionId;
}

// User ID management (respects privacy/consent)
function getUserId() {
  if (typeof window === 'undefined') return null;
  // Check if user has opted out
  if (localStorage.getItem('telemetry_opt_out') === 'true') return null;
  // Return hashed user ID if available, or null for anonymous
  const userId = localStorage.getItem('telemetry_user_id');
  return userId || null;
}

// Consent check
function hasConsent() {
  if (typeof window === 'undefined') return true; // Server-side always allowed
  return localStorage.getItem('telemetry_consent') !== 'false';
}

function generateEventId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${Math.random().toString(36).substr(2, 9)}`;
}

function enqueue(eventType, properties = {}) {
  // Respect opt-out
  if (!hasConsent()) return;

  const event = {
    event_id: generateEventId(),
    event_type: eventType,
    user_id: getUserId(),
    session_id: getSessionId(),
    platform: typeof window !== 'undefined' ? 'web' : 'api',
    app_version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    timestamp: new Date().toISOString(),
    properties: properties,
    context: typeof window !== 'undefined' ? {
      ua: navigator.userAgent,
      url: window.location.href,
      referrer: document.referrer || null,
    } : {},
  };

  BUFFER.push(event);
}

async function flush() {
  if (BUFFER.length === 0) return;
  const payload = BUFFER.splice(0, BUFFER.length);
  
  try {
    const url = ENDPOINT.startsWith('http') 
      ? ENDPOINT 
      : (typeof window !== 'undefined' 
          ? ENDPOINT 
          : `${process.env.BASE_URL || 'http://localhost:3000'}${ENDPOINT}`);
    
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ events: payload }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok && response.status >= 500) {
      // Retry on server errors - put events back in buffer
      BUFFER.unshift(...payload);
      console.warn('Telemetry flush failed, will retry', response.status);
    }
  } catch (e) {
    // Network error - put events back in buffer for retry
    BUFFER.unshift(...payload);
    console.error('telemetry flush failed', e);
  }
}

// Start periodic flush (only in browser or Node.js with setInterval)
if (typeof setInterval !== 'undefined') {
  setInterval(flush, FLUSH_INTERVAL_MS);
  
  // Flush on page unload (browser only)
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      // Use sendBeacon for reliability on page unload
      if (BUFFER.length > 0 && navigator.sendBeacon) {
        const url = ENDPOINT.startsWith('http') 
          ? ENDPOINT 
          : ENDPOINT;
        const blob = new Blob([JSON.stringify({ events: BUFFER.splice(0, BUFFER.length) })], {
          type: 'application/json',
        });
        navigator.sendBeacon(url, blob);
      }
    });
  }
}

export function track(eventType, properties = {}) {
  enqueue(eventType, properties);
  // Also flush immediately if buffer is getting large
  if (BUFFER.length >= 10) {
    flush();
  }
}

// Consent management
export function setConsent(consented) {
  if (typeof window === 'undefined') return;
  if (consented) {
    localStorage.setItem('telemetry_consent', 'true');
    localStorage.removeItem('telemetry_opt_out');
  } else {
    localStorage.setItem('telemetry_opt_out', 'true');
    localStorage.removeItem('telemetry_consent');
    // Clear buffer when opting out
    BUFFER.length = 0;
  }
}

export function hasUserConsent() {
  return hasConsent();
}

export default { track, setConsent, hasUserConsent };
