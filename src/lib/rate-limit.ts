import { type NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env, isDev } from "@/lib/env";
import { logger } from "@/lib/logger";

let _redis: Redis | null = null;

function getRedis(): Redis | null {
  if (_redis) return _redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  _redis = new Redis({ url, token });
  return _redis;
}

let _ratelimit: Ratelimit | null = null;

function getRatelimit(): Ratelimit | null {
  if (_ratelimit) return _ratelimit;
  const redis = getRedis();
  if (!redis) return null;
  _ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(
      env.RATE_LIMIT_REQUESTS_PER_MINUTE,
      "60 s"
    ),
    analytics: false,
    prefix: "promptoptimizer:ratelimit",
  });
  return _ratelimit;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitEntry>();

let _cleanupInterval: ReturnType<typeof setInterval> | null = null;

function ensureCleanupInterval(): void {
  if (_cleanupInterval) return;
  _cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of memoryStore) {
      if (now > entry.resetAt) memoryStore.delete(key);
    }
    if (memoryStore.size === 0 && _cleanupInterval) {
      clearInterval(_cleanupInterval);
      _cleanupInterval = null;
    }
  }, 60_000);
  if (_cleanupInterval?.unref) {
    _cleanupInterval.unref();
  }
}

function checkRateLimitMemory(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const maxRequests = env.RATE_LIMIT_REQUESTS_PER_MINUTE;
  const now = Date.now();
  ensureCleanupInterval();
  const entry = memoryStore.get(ip);
  if (!entry || now > entry.resetAt) {
    memoryStore.set(ip, { count: 1, resetAt: now + 60_000 });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + 60_000 };
  }
  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }
  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}

export async function checkRateLimit(
  ip: string
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const ratelimit = getRatelimit();
  if (ratelimit) {
    const result = await ratelimit.limit(ip);
    return {
      allowed:   result.success,
      remaining: result.remaining,
      resetAt:   result.reset,
    };
  }
  if (!isDev) {
    logger.error("rate-limit: Upstash Redis no configurado en producción", { ip });
    return { allowed: true, remaining: 0, resetAt: Date.now() + 60_000 };
  }
  return checkRateLimitMemory(ip);
}

export function getClientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? req.headers.get("x-real-ip")
    ?? "127.0.0.1";
}

export function cleanupRateLimitStore(): void {
  if (_cleanupInterval) {
    clearInterval(_cleanupInterval);
    _cleanupInterval = null;
  }
  memoryStore.clear();
}
