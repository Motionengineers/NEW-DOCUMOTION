const stores = new Map();

function getStore(name) {
  if (!stores.has(name)) {
    stores.set(name, new Map());
  }
  return stores.get(name);
}

export function getCachedValue(storeName, key) {
  const store = getStore(storeName);
  const entry = store.get(key);
  if (entry && entry.expiresAt > Date.now()) {
    return entry.payload;
  }
  return null;
}

export function setCachedValue(storeName, key, payload, ttlMs) {
  const store = getStore(storeName);
  store.set(key, {
    payload,
    expiresAt: Date.now() + ttlMs,
  });
}


