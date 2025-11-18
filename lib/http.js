export function createRequestId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

export function jsonOk(data, rid) {
  return new Response(
    JSON.stringify({ success: true, data }),
    {
      status: 200,
      headers: {
        'content-type': 'application/json',
        ...(rid ? { 'x-request-id': rid } : {}),
      },
    }
  );
}

export function jsonError(code, message, status = 400, rid) {
  return new Response(
    JSON.stringify({ success: false, error: { code, message } }),
    {
      status,
      headers: {
        'content-type': 'application/json',
        ...(rid ? { 'x-request-id': rid } : {}),
      },
    }
  );
}

export function safeJsonParse(text, fallback) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}


