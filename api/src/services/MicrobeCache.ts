interface CacheEntry {
  payload: unknown;
  expiresAt: number;
}

/** 进程内缓存，标本数据是只读的，缓存 30 秒足够挡掉重复查询 */
const TTL_MS = 30_000;
const store = new Map<string, CacheEntry>();

export const MicrobeCache = {
  /** 把查询条件拼成稳定的键：键里出现的维度必须覆盖所有会改变结果的参数 */
  keyOf(dimensions: Record<string, string | number | undefined>): string {
    return Object.keys(dimensions)
      .sort()
      .filter((key) => dimensions[key] !== undefined && dimensions[key] !== '')
      .map((key) => `${key}=${String(dimensions[key])}`)
      .join('&');
  },

  get<T>(key: string): T | undefined {
    const hit = store.get(key);
    if (!hit) return undefined;
    if (hit.expiresAt <= Date.now()) {
      store.delete(key);
      return undefined;
    }
    return hit.payload as T;
  },

  set(key: string, payload: unknown): void {
    store.set(key, { payload, expiresAt: Date.now() + TTL_MS });
  },

  clear(): void {
    store.clear();
  },

  get size(): number {
    return store.size;
  },
};
