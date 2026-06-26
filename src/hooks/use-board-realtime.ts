"use client";

import { useEffect, useRef, useState } from "react";

import type { ConnectionStatus } from "@/components/live-indicator";

export function useBoardRealtime(
  boardId: string,
  currentUserId: string,
  onRemoteUpdate: () => void,
) {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const isDraggingRef = useRef(false);
  const pendingUpdateRef = useRef(false);
  const onRemoteUpdateRef = useRef(onRemoteUpdate);

  useEffect(() => {
    onRemoteUpdateRef.current = onRemoteUpdate;
  }, [onRemoteUpdate]);

  useEffect(() => {
    const source = new EventSource(`/api/boards/${boardId}/stream`);

    source.onopen = () => setStatus("live");

    source.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as {
          type: string;
          userId?: string;
        };

        if (data.type !== "board:updated" || data.userId === currentUserId) {
          return;
        }

        if (isDraggingRef.current) {
          pendingUpdateRef.current = true;
          return;
        }

        onRemoteUpdateRef.current();
      } catch {
        // ignore malformed events
      }
    };

    source.onerror = () => {
      setStatus("offline");
    };

    return () => {
      source.close();
    };
  }, [boardId, currentUserId]);

  return {
    status,
    isDraggingRef,
    onDragStart: () => {
      isDraggingRef.current = true;
    },
    onDragEnd: () => {
      isDraggingRef.current = false;
      if (pendingUpdateRef.current) {
        pendingUpdateRef.current = false;
        onRemoteUpdateRef.current();
      }
    },
  };
}
