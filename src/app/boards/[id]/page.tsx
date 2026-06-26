import { auth } from "@/auth";
import { AppHeader } from "@/components/app-header";
import { BoardSettings } from "@/components/board-settings";
import { KanbanBoard } from "@/components/kanban-board";
import { getBoardByIdForUser } from "@/lib/boards";
import { canEditCards, getUserBoardRole } from "@/lib/permissions";
import { notFound, redirect } from "next/navigation";

type BoardPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BoardPage({ params }: BoardPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const { id } = await params;
  const board = await getBoardByIdForUser(id, userId);

  if (!board) {
    notFound();
  }

  const role = await getUserBoardRole(id, userId);
  const isOwner = board.ownerId === userId;
  const canEdit = canEditCards(role);

  const members = [
    {
      userId: board.owner.id,
      role: "OWNER" as const,
      user: board.owner,
    },
    ...board.members.map((member) => ({
      userId: member.userId,
      role: member.role as "EDITOR" | "VIEWER",
      user: member.user,
    })),
  ];

  const columns = board.columns.map((column) => ({
    ...column,
    cards: column.cards.map((card) => ({
      ...card,
      dueAt: card.dueAt?.toISOString() ?? null,
    })),
  }));

  return (
    <div className="min-h-full bg-zinc-950 text-zinc-50">
      <AppHeader
        email={session.user.email}
        backHref="/dashboard"
        backLabel="Мои доски"
      />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="mb-6 sm:mb-8">
          <h1 className="truncate text-2xl font-bold sm:text-3xl">
            {board.title}
          </h1>
          <p className="mt-2 text-sm text-zinc-400 sm:text-base">
            Канбан-доска · {board.columns.length} колонки · real-time sync
            {role === "VIEWER" && " · наблюдатель"}
            {role === "EDITOR" && !isOwner && " · редактор"}
          </p>
        </div>

        <BoardSettings
          boardId={board.id}
          initialTitle={board.title}
          isOwner={isOwner}
          members={members}
        />

        <KanbanBoard
          boardId={board.id}
          currentUserId={userId}
          canEdit={canEdit}
          columns={columns}
        />
      </main>
    </div>
  );
}
