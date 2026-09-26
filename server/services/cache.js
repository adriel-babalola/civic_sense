const TTL_MS = (Number(process.env.CACHE_TTL_SEC) || 3600) * 1000;
const MAX_ENTRIES = Number(process.env.CACHE_MAX_ENTRIES) || 300;

class LRUCache {
  constructor(max = MAX_ENTRIES, ttl = TTL_MS) {
    this.max = max;
    this.ttl = ttl;
    this.map = new Map();
  }

  get(key) {
    const entry = this.map.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.ttl) {
      this.map.delete(key);
      return null;
    }
    this.map.delete(key);
    this.map.set(key, entry);
    return entry.value;
  }

  set(key, value) {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, { value, timestamp: Date.now() });
    if (this.map.size > this.max) {
      const oldest = this.map.keys().next().value;
      this.map.delete(oldest);
    }
  }

  get size() {
    return this.map.size;
  }

  clear() {
    this.map.clear();
  }
}

export const cache = new LRUCache();
