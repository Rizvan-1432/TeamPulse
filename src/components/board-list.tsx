import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type BoardListItem = {
  id: string;
  title: string;
  ownerId: string;
  createdAt: Date;
  members: { userId: string; role: string }[];
  columns: { _count: { cards: number } }[];
};

export function BoardList({
  boards,
  currentUserId,
}: {
  boards: BoardListItem[];
  currentUserId: string;
}) {
  if (boards.length === 0) {
    return (
      <Card className="border-white/10 bg-zinc-900/50">
        <CardHeader>
          <CardTitle>Пока пусто</CardTitle>
          <CardDescription>
            Создайте первую доску — появятся колонки To Do, In Progress и Done.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {boards.map((board) => {
        const cardCount = board.columns.reduce(
          (sum, col) => sum + col._count.cards,
          0,
        );
        const isOwner = board.ownerId === currentUserId;
        const membership = board.members.find(
          (m) => m.userId === currentUserId,
        );
        const roleLabel = isOwner
          ? "Владелец"
          : membership?.role === "VIEWER"
            ? "Наблюдатель"
            : "Редактор";
        const memberCount = board.members.length + 1;

        return (
          <Link key={board.id} href={`/boards/${board.id}`}>
            <Card className="h-full border-white/10 bg-zinc-900/50 transition-colors hover:border-indigo-500/40 hover:bg-zinc-900/80">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="line-clamp-2">{board.title}</CardTitle>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase",
                      isOwner
                        ? "bg-indigo-500/20 text-indigo-300"
                        : "bg-zinc-500/20 text-zinc-400",
                    )}
                  >
                    {roleLabel}
                  </span>
                </div>
                <CardDescription>
                  {cardCount} {cardCount === 1 ? "карточка" : "карточек"} · 3
                  колонки · {memberCount} в команде
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-zinc-500">
                  Создана{" "}
                  {new Intl.DateTimeFormat("ru-RU", {
                    day: "numeric",
                    month: "long",
                  }).format(board.createdAt)}
                </p>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
