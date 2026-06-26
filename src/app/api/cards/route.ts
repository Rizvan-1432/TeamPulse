import { Priority } from "@/generated/prisma/client";
import { logActivity } from "@/lib/activity";
import { requireAuth } from "@/lib/api-auth";
import { getColumnForUser } from "@/lib/boards";
import { notifyBoardByColumnId } from "@/lib/notify-board";
import { canEditCards, getUserBoardRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const PRIORITIES = new Set<string>(["LOW", "MEDIUM", "HIGH"]);

export async function POST(request: Request) {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;

  const body = await request.json();
  const columnId = String(body.columnId ?? "");
  const title = String(body.title ?? "").trim();
  const description = body.description
    ? String(body.description).trim()
    : undefined;
  const priority = String(body.priority ?? "MEDIUM");
  const dueAt = body.dueAt ? new Date(String(body.dueAt)) : undefined;

  if (!columnId || !title) {
    return NextResponse.json(
      { error: "Колонка и название карточки обязательны" },
      { status: 400 },
    );
  }

  if (!PRIORITIES.has(priority)) {
    return NextResponse.json({ error: "Неверный приоритет" }, { status: 400 });
  }

  const column = await prisma.column.findFirst({
    where: { id: columnId },
    select: { boardId: true, _count: { select: { cards: true } } },
  });
  if (!column) {
    return NextResponse.json({ error: "Колонка не найдена" }, { status: 404 });
  }

  const role = await getUserBoardRole(column.boardId, authResult.userId);
  if (!canEditCards(role)) {
    return NextResponse.json({ error: "Только просмотр" }, { status: 403 });
  }

  const accessColumn = await getColumnForUser(columnId, authResult.userId);
  if (!accessColumn) {
    return NextResponse.json({ error: "Колонка не найдена" }, { status: 404 });
  }

  const card = await prisma.card.create({
    data: {
      columnId,
      title,
      description,
      priority: priority as Priority,
      dueAt,
      order: column._count.cards,
      authorId: authResult.userId,
    },
  });

  await logActivity(
    column.boardId,
    authResult.userId,
    "CARD_CREATED",
    `Создал карточку «${title}»`,
  );
  await notifyBoardByColumnId(columnId, authResult.userId);

  return NextResponse.json({ card }, { status: 201 });
}
