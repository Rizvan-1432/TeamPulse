import { requireAuth } from "@/lib/api-auth";
import { getBoardActivities } from "@/lib/activity";
import { getBoardByIdForUser } from "@/lib/boards";
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

  const activities = await getBoardActivities(id);
  return NextResponse.json({ activities });
}
