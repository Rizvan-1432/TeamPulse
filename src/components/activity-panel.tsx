"use client";

import { useEffect, useState } from "react";

type ActivityItem = {
  id: string;
  message: string;
  createdAt: string;
  user: { name: string | null; email: string };
};

export function ActivityPanel({ boardId }: { boardId: string }) {
  const [open, setOpen] = useState(false);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    if (!open) return;
    void fetch(`/api/boards/${boardId}/activities`)
      .then((res) => res.json())
      .then((data) => setActivities(data.activities ?? []));
  }, [boardId, open]);

  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900/50">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-zinc-200"
      >
        История действий
        <span className="text-zinc-500">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <ul className="max-h-64 space-y-2 overflow-y-auto border-t border-white/10 px-4 py-3">
          {activities.length === 0 ? (
            <li className="text-sm text-zinc-500">Пока нет событий</li>
          ) : (
            activities.map((item) => (
              <li
                key={item.id}
                className="rounded-lg border border-white/5 bg-zinc-950/50 px-3 py-2 text-sm"
              >
                <p className="text-zinc-200">{item.message}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {item.user.name ?? item.user.email} ·{" "}
                  {new Intl.DateTimeFormat("ru-RU", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(item.createdAt))}
                </p>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
