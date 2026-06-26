import { auth } from "@/auth";
import { AppHeader } from "@/components/app-header";
import { BoardList } from "@/components/board-list";
import { CreateBoardForm } from "@/components/create-board-form";
import { getBoardsForUser } from "@/lib/boards";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const boards = await getBoardsForUser(session.user.id);

  return (
    <div className="min-h-full bg-zinc-950 text-zinc-50">
      <AppHeader email={session.user.email} />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-bold sm:text-3xl">Мои доски</h1>
          <p className="mt-2 text-sm text-zinc-400 sm:text-base">
            Добро пожаловать, {session.user.name}. Здесь ваши доски и доски,
            куда вас пригласили. Чтобы поделиться доской — откройте её и
            пригласите коллегу по email в настройках.
          </p>
        </div>

        <div className="mb-6 sm:mb-8">
          <CreateBoardForm />
        </div>

        <BoardList boards={boards} currentUserId={session.user.id} />
      </main>
    </div>
  );
}
