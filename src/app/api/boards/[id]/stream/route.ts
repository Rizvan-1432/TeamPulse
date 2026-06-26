import { requireAuth } from "@/lib/api-auth";
import { getBoardByIdForUser } from "@/lib/boards";
import {
  getBoardRevision,
  subscribeToBoard,
  type BoardRealtimeEvent,
} from "@/lib/realtime";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;

  const { id: boardId } = await context.params;
  const board = await getBoardByIdForUser(boardId, authResult.userId);

  if (!board) {
    return new Response("Not found", { status: 404 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: BoardRealtimeEvent) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
        );
      };

      send({ type: "connected", boardId, at: Date.now() });

      const unsubscribe = subscribeToBoard(boardId, send);
      let lastRev = 0;

      const pollRedis = setInterval(async () => {
        const rev = await getBoardRevision(boardId);
        if (rev !== null && rev > lastRev) {
          lastRev = rev;
          send({
            type: "board:updated",
            boardId,
            at: Date.now(),
          });
        }
      }, 2000);

      getBoardRevision(boardId).then((rev) => {
        if (rev !== null) lastRev = rev;
      });

      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(": heartbeat\n\n"));
      }, 25_000);

      const close = () => {
        clearInterval(heartbeat);
        clearInterval(pollRedis);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // stream already closed
        }
      };

      _request.signal.addEventListener("abort", close);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
