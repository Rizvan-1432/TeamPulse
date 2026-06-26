import { prisma } from "@/lib/prisma";

export const DEFAULT_COLUMNS = [
  { title: "To Do", order: 0 },
  { title: "In Progress", order: 1 },
  { title: "Done", order: 2 },
] as const;

export function boardAccessFilter(userId: string) {
  return {
    OR: [{ ownerId: userId }, { members: { some: { userId } } }],
  };
}

export async function getBoardsForUser(userId: string) {
  return prisma.board.findMany({
    where: boardAccessFilter(userId),
    orderBy: { createdAt: "desc" },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      members: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
      columns: {
        include: { _count: { select: { cards: true } } },
      },
    },
  });
}

export async function getBoardByIdForUser(boardId: string, userId: string) {
  return prisma.board.findFirst({
    where: {
      id: boardId,
      ...boardAccessFilter(userId),
    },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      members: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
      columns: {
        orderBy: { order: "asc" },
        include: {
          cards: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });
}

export async function getBoardAsOwner(boardId: string, userId: string) {
  return prisma.board.findFirst({
    where: { id: boardId, ownerId: userId },
  });
}

export async function updateBoardTitleForOwner(
  boardId: string,
  userId: string,
  title: string,
) {
  const board = await getBoardAsOwner(boardId, userId);
  if (!board) return null;

  return prisma.board.update({
    where: { id: boardId },
    data: { title },
  });
}

export async function deleteBoardForOwner(boardId: string, userId: string) {
  const board = await getBoardAsOwner(boardId, userId);
  if (!board) return false;

  await prisma.board.delete({ where: { id: boardId } });
  return true;
}

export async function inviteBoardMemberByEmail(
  boardId: string,
  ownerId: string,
  email: string,
  role: "EDITOR" | "VIEWER" = "EDITOR",
) {
  const board = await getBoardAsOwner(boardId, ownerId);
  if (!board) return { error: "Нет прав" as const };

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return { error: "Email обязателен" as const };
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    return { error: "Пользователь с таким email не найден" as const };
  }

  if (user.id === ownerId) {
    return { error: "Нельзя пригласить самого себя" as const };
  }

  const existing = await prisma.boardMember.findUnique({
    where: { boardId_userId: { boardId, userId: user.id } },
  });

  if (existing) {
    return { error: "Пользователь уже в команде" as const };
  }

  const member = await prisma.boardMember.create({
    data: {
      boardId,
      userId: user.id,
      role,
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return { member };
}

export async function removeBoardMember(
  boardId: string,
  ownerId: string,
  memberUserId: string,
) {
  const board = await getBoardAsOwner(boardId, ownerId);
  if (!board) return { error: "Нет прав" as const };

  if (memberUserId === ownerId) {
    return { error: "Нельзя удалить владельца" as const };
  }

  const existing = await prisma.boardMember.findUnique({
    where: { boardId_userId: { boardId, userId: memberUserId } },
  });

  if (!existing) {
    return { error: "Участник не найден" as const };
  }

  await prisma.boardMember.delete({
    where: { boardId_userId: { boardId, userId: memberUserId } },
  });

  return { ok: true as const };
}

export async function createBoardForUser(userId: string, title: string) {
  return prisma.board.create({
    data: {
      title,
      ownerId: userId,
      columns: {
        create: DEFAULT_COLUMNS.map((col) => ({
          title: col.title,
          order: col.order,
        })),
      },
    },
    include: {
      columns: { orderBy: { order: "asc" } },
    },
  });
}

export async function getColumnForUser(columnId: string, userId: string) {
  return prisma.column.findFirst({
    where: {
      id: columnId,
      board: boardAccessFilter(userId),
    },
    include: { _count: { select: { cards: true } } },
  });
}

export async function getCardForUser(cardId: string, userId: string) {
  return prisma.card.findFirst({
    where: {
      id: cardId,
      column: {
        board: boardAccessFilter(userId),
      },
    },
  });
}

export async function moveCardForUser(
  cardId: string,
  userId: string,
  targetColumnId: string,
  targetIndex: number,
) {
  const card = await getCardForUser(cardId, userId);
  if (!card) return null;

  const targetColumn = await getColumnForUser(targetColumnId, userId);
  if (!targetColumn) return null;

  const safeIndex = Math.max(0, Math.min(targetIndex, targetColumn._count.cards));

  return prisma.$transaction(async (tx) => {
    const sourceColumnId = card.columnId;
    const sourceIndex = card.order;

    if (sourceColumnId === targetColumnId) {
      if (sourceIndex === safeIndex) return card;

      const cards = await tx.card.findMany({
        where: { columnId: sourceColumnId },
        orderBy: { order: "asc" },
      });

      const ids = cards.map((c) => c.id);
      const oldIndex = ids.indexOf(cardId);
      const newIds = [...ids];
      newIds.splice(oldIndex, 1);
      newIds.splice(safeIndex, 0, cardId);

      await Promise.all(
        newIds.map((id, index) =>
          tx.card.update({ where: { id }, data: { order: index } }),
        ),
      );

      return tx.card.findUnique({ where: { id: cardId } });
    }

    await tx.card.updateMany({
      where: { columnId: sourceColumnId, order: { gt: sourceIndex } },
      data: { order: { decrement: 1 } },
    });

    await tx.card.updateMany({
      where: { columnId: targetColumnId, order: { gte: safeIndex } },
      data: { order: { increment: 1 } },
    });

    return tx.card.update({
      where: { id: cardId },
      data: { columnId: targetColumnId, order: safeIndex },
    });
  });
}
