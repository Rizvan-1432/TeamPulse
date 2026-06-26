import { logActivity } from "@/lib/activity";
import { requireAuth } from "@/lib/api-auth";
import {
  deleteBoardForOwner,
  getBoardByIdForUser,
  updateBoardTitleForOwner,
} from "@/lib/boards";
import { notifyBoard } from "@/lib/notify-board";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;

  const { id } = await context.params;
  const board = await getBoardByIdForUser(id, authResult.userId);

  if (!board) {
    return NextResponse.json({ error: "Доска не найдена" }, { status: 404 });
  }

  return NextResponse.json({ board });
}

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;

  const { id } = await context.params;
  const body = await request.json();
  const title = String(body.title ?? "").trim();

  if (!title) {
    return NextResponse.json(
      { error: "Название доски обязательно" },
      { status: 400 },
    );
  }

  const board = await updateBoardTitleForOwner(id, authResult.userId, title);
  if (!board) {
    return NextResponse.json(
      { error: "Только владелец может переименовать доску" },
      { status: 403 },
    );
  }

  await logActivity(
    id,
    authResult.userId,
    "BOARD_RENAMED",
    `Переименовал доску в «${title}»`,
  );
  await notifyBoard(id, authResult.userId);
  return NextResponse.json({ board });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;

  const { id } = await context.params;
  const deleted = await deleteBoardForOwner(id, authResult.userId);

  if (!deleted) {
    return NextResponse.json(
      { error: "Только владелец может удалить доску" },
      { status: 403 },
    );
  }

  return NextResponse.json({ ok: true });
}
