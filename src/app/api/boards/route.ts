import { requireAuth } from "@/lib/api-auth";
import { createBoardForUser, getBoardsForUser } from "@/lib/boards";
import { NextResponse } from "next/server";

export async function GET() {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;

  const boards = await getBoardsForUser(authResult.userId);
  return NextResponse.json({ boards });
}

export async function POST(request: Request) {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;

  const body = await request.json();
  const title = String(body.title ?? "").trim();

  if (!title) {
    return NextResponse.json(
      { error: "Название доски обязательно" },
      { status: 400 },
    );
  }

  const board = await createBoardForUser(authResult.userId, title);
  return NextResponse.json({ board }, { status: 201 });
}
