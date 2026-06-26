import { Redis } from "@upstash/redis";

export type BoardRealtimeEvent =
  | { type: "connected"; boardId: string; at: number }
  | { type: "board:updated"; boardId: string; userId?: string; at: number };

type Listener = (event: BoardRealtimeEvent) => void;

const globalForRealtime = globalThis as unknown as {
  boardListeners?: Map<string, Set<Listener>>;
  redis?: Redis | null;
};

function getBoardListeners() {
  if (!globalForRealtime.boardListeners) {
    globalForRealtime.boardListeners = new Map();
  }
  return globalForRealtime.boardListeners;
}

function getRedis() {
  if (globalForRealtime.redis === undefined) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    globalForRealtime.redis =
      url && token ? new Redis({ url, token }) : null;
  }
  return globalForRealtime.redis;
}

function boardRevKey(boardId: string) {
  return `board:${boardId}:rev`;
}

function boardEventKey(boardId: string) {
  return `board:${boardId}:event`;
}

export function subscribeToBoard(boardId: string, listener: Listener) {
  const listeners = getBoardListeners();
  if (!listeners.has(boardId)) {
    listeners.set(boardId, new Set());
  }
  listeners.get(boardId)!.add(listener);

  return () => {
    listeners.get(boardId)?.delete(listener);
    if (listeners.get(boardId)?.size === 0) {
      listeners.delete(boardId);
    }
  };
}

function notifyLocal(boardId: string, event: BoardRealtimeEvent) {
  getBoardListeners()
    .get(boardId)
    ?.forEach((listener) => listener(event));
}

export async function publishBoardUpdate(boardId: string, userId: string) {
  const event: BoardRealtimeEvent = {
    type: "board:updated",
    boardId,
    userId,
    at: Date.now(),
  };

  notifyLocal(boardId, event);

  const redis = getRedis();
  if (!redis) return;

  await Promise.all([
    redis.incr(boardRevKey(boardId)),
    redis.set(boardEventKey(boardId), event, { ex: 120 }),
  ]);
}

export async function getBoardRevision(boardId: string) {
  const redis = getRedis();
  if (!redis) return null;
  const rev = await redis.get<number>(boardRevKey(boardId));
  return rev ?? 0;
}
