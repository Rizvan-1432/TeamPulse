import type { Role } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { boardAccessFilter } from "@/lib/boards";

export type BoardRole = "OWNER" | "EDITOR" | "VIEWER";

export async function getUserBoardRole(
  boardId: string,
  userId: string,
): Promise<BoardRole | null> {
  const board = await prisma.board.findFirst({
    where: { id: boardId, ...boardAccessFilter(userId) },
    include: { members: { where: { userId }, take: 1 } },
  });

  if (!board) return null;
  if (board.ownerId === userId) return "OWNER";
  const memberRole = board.members[0]?.role;
  if (memberRole === "EDITOR" || memberRole === "VIEWER") return memberRole;
  return "EDITOR";
}

export function canEditCards(role: BoardRole | null) {
  return role === "OWNER" || role === "EDITOR";
}

export function canManageBoard(role: BoardRole | null) {
  return role === "OWNER";
}

export function canInviteMembers(role: BoardRole | null) {
  return role === "OWNER";
}

export function normalizeInviteRole(role: string): Role | null {
  if (role === "EDITOR" || role === "VIEWER") return role;
  return null;
}
