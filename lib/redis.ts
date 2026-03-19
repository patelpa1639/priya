import { Redis } from '@upstash/redis';

let _redis: Redis | null = null;

export function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return _redis;
}

// ── Caller Memory ──────────────────────────────────────────

export interface CallerProfile {
  name: string;
  number: string;
  callCount: number;
  lastCallAt: string;
  notes: string[]; // short context from past calls
}

const CALLER_PREFIX = 'caller:';

export async function getCallerProfile(number: string): Promise<CallerProfile | null> {
  const redis = getRedis();
  return redis.get<CallerProfile>(`${CALLER_PREFIX}${number}`);
}

export async function upsertCallerProfile(
  number: string,
  name: string | null,
  note: string,
): Promise<CallerProfile> {
  const redis = getRedis();
  const key = `${CALLER_PREFIX}${number}`;
  const existing = await redis.get<CallerProfile>(key);

  const profile: CallerProfile = existing
    ? {
        ...existing,
        name: name && name !== 'Unknown' ? name : existing.name,
        callCount: existing.callCount + 1,
        lastCallAt: new Date().toISOString(),
        notes: [...existing.notes.slice(-4), note], // keep last 5 notes
      }
    : {
        name: name || 'Unknown',
        number,
        callCount: 1,
        lastCallAt: new Date().toISOString(),
        notes: [note],
      };

  await redis.set(key, profile);
  return profile;
}

// ── Daily Digest ───────────────────────────────────────────

export interface CallLog {
  callId: string;
  callerName: string;
  callerNumber: string;
  summary: string;
  duration: number;
  timestamp: string;
  missed: boolean;
}

const DAILY_LOG_KEY = 'calls:daily';

export async function logCall(call: CallLog): Promise<void> {
  const redis = getRedis();
  await redis.lpush(DAILY_LOG_KEY, call);
  // Auto-expire after 48 hours so we don't pile up
  await redis.expire(DAILY_LOG_KEY, 48 * 60 * 60);
}

export async function getDailyLogs(): Promise<CallLog[]> {
  const redis = getRedis();
  return redis.lrange<CallLog>(DAILY_LOG_KEY, 0, -1);
}

export async function clearDailyLogs(): Promise<void> {
  const redis = getRedis();
  await redis.del(DAILY_LOG_KEY);
}
