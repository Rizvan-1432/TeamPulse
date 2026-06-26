"use client";

import { cn } from "@/lib/utils";

export type ConnectionStatus = "connecting" | "live" | "offline";

export function LiveIndicator({ status }: { status: ConnectionStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        status === "live" &&
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
        status === "connecting" &&
          "border-amber-500/30 bg-amber-500/10 text-amber-300",
        status === "offline" &&
          "border-zinc-500/30 bg-zinc-500/10 text-zinc-400",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "live" && "animate-pulse bg-emerald-400",
          status === "connecting" && "animate-pulse bg-amber-400",
          status === "offline" && "bg-zinc-500",
        )}
      />
      {status === "live" && "Live"}
      {status === "connecting" && "Подключение..."}
      {status === "offline" && "Офлайн"}
    </span>
  );
}
