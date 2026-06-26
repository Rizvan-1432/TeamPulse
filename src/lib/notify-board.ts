import { publishBoardUpdate } from "@/lib/realtime";
import { prisma } from "@/lib/prisma";

export async function notifyBoardByColumnId(
  columnId: string,
  userId: string,
) {
  const column = await prisma.column.findUnique({
    where: { id: columnId },
    select: { boardId: true },
  });

  if (column) {
    await publishBoardUpdate(column.boardId, userId);
  }
}

export async function notifyBoardByCardId(cardId: string, userId: string) {
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    select: { column: { select: { boardId: true } } },
  });

  if (card) {
    await publishBoardUpdate(card.column.boardId, userId);
  }
}

export async function notifyBoard(boardId: string, userId: string) {
  await publishBoardUpdate(boardId, userId);
}
