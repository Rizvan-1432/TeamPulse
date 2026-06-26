import { Priority } from "@/generated/prisma/client";
import { logActivity } from "@/lib/activity";
import { requireAuth } from "@/lib/api-auth";
import { getCardForUser, moveCardForUser } from "@/lib/boards";
import { notifyBoardByCardId } from "@/lib/notify-board";
import { canEditCards, getUserBoardRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

const PRIORITIES = new Set<string>(["LOW", "MEDIUM", "HIGH"]);

async function getCardContext(cardId: string, userId: string) {
  const card = await getCardForUser(cardId, userId);
  if (!card) return null;

  const column = await prisma.column.findUnique({
    where: { id: card.columnId },
    select: { boardId: true },
  });
  if (!column) return null;

  const role = await getUserBoardRole(column.boardId, userId);
  return { card, boardId: column.boardId, role };
}

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;

  const { id } = await context.params;
  const ctx = await getCardContext(id, authResult.userId);
  if (!ctx) {
    return NextResponse.json({ error: "Карточка не найдена" }, { status: 404 });
  }
  if (!canEditCards(ctx.role)) {
    return NextResponse.json({ error: "Только просмотр" }, { status: 403 });
  }

  const body = await request.json();
  const title = body.title !== undefined ? String(body.title).trim() : undefined;
  const description =
    body.description !== undefined
      ? String(body.description).trim() || null
      : undefined;
  const priority =
    body.priority !== undefined ? String(body.priority) : undefined;
  const dueAt =
    body.dueAt !== undefined
      ? body.dueAt
        ? new Date(String(body.dueAt))
        : null
      : undefined;
  const columnId =
    body.columnId !== undefined ? String(body.columnId) : undefined;
  const order = body.order !== undefined ? Number(body.order) : undefined;

  if (title !== undefined && !title) {
    return NextResponse.json(
      { error: "Название не может быть пустым" },
      { status: 400 },
    );
  }

  if (priority !== undefined && !PRIORITIES.has(priority)) {
    return NextResponse.json({ error: "Неверный приоритет" }, { status: 400 });
  }

  if (columnId !== undefined && order !== undefined) {
    if (!Number.isInteger(order) || order < 0) {
      return NextResponse.json({ error: "Неверная позиция" }, { status: 400 });
    }

    const moved = await moveCardForUser(
      id,
      authResult.userId,
      columnId,
      order,
    );

    if (!moved) {
      return NextResponse.json({ error: "Не удалось переместить" }, { status: 400 });
    }

    await logActivity(
      ctx.boardId,
      authResult.userId,
      "CARD_MOVED",
      `Переместил карточку «${moved.title}»`,
    );
    await notifyBoardByCardId(id, authResult.userId);

    return NextResponse.json({ card: moved });
  }

  const updated = await prisma.card.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(priority !== undefined && { priority: priority as Priority }),
      ...(dueAt !== undefined && { dueAt }),
    },
  });

  await logActivity(
    ctx.boardId,
    authResult.userId,
    "CARD_UPDATED",
    `Обновил карточку «${updated.title}»`,
  );
  await notifyBoardByCardId(id, authResult.userId);

  return NextResponse.json({ card: updated });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;

  const { id } = await context.params;
  const ctx = await getCardContext(id, authResult.userId);
  if (!ctx) {
    return NextResponse.json({ error: "Карточка не найдена" }, { status: 404 });
  }
  if (!canEditCards(ctx.role)) {
    return NextResponse.json({ error: "Только просмотр" }, { status: 403 });
  }

  await logActivity(
    ctx.boardId,
    authResult.userId,
    "CARD_DELETED",
    `Удалил карточку «${ctx.card.title}»`,
  );
  await notifyBoardByCardId(id, authResult.userId);
  await prisma.card.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
