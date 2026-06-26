import { logActivity } from "@/lib/activity";
import { requireAuth } from "@/lib/api-auth";
import {
  getBoardByIdForUser,
  inviteBoardMemberByEmail,
  removeBoardMember,
} from "@/lib/boards";
import { notifyBoard } from "@/lib/notify-board";
import { normalizeInviteRole } from "@/lib/permissions";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

const roleLabels: Record<string, string> = {
  OWNER: "Владелец",
  EDITOR: "Редактор",
  VIEWER: "Наблюдатель",
};

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;

  const { id } = await context.params;
  const board = await getBoardByIdForUser(id, authResult.userId);

  if (!board) {
    return NextResponse.json({ error: "Доска не найдена" }, { status: 404 });
  }

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

  return NextResponse.json({
    members,
    isOwner: board.ownerId === authResult.userId,
  });
}

export async function POST(request: Request, context: RouteContext) {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;

  const { id } = await context.params;
  const body = await request.json();
  const email = String(body.email ?? "");
  const inviteRole =
    normalizeInviteRole(String(body.role ?? "EDITOR")) ?? "EDITOR";
  if (inviteRole === "OWNER") {
    return NextResponse.json({ error: "Недопустимая роль" }, { status: 400 });
  }

  const result = await inviteBoardMemberByEmail(
    id,
    authResult.userId,
    email,
    inviteRole,
  );

  if ("error" in result) {
    const status = result.error === "Нет прав" ? 403 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  await logActivity(
    id,
    authResult.userId,
    "MEMBER_INVITED",
    `Пригласил ${email} как ${roleLabels[inviteRole]}`,
  );
  await notifyBoard(id, authResult.userId);
  return NextResponse.json({ member: result.member }, { status: 201 });
}

export async function DELETE(request: Request, context: RouteContext) {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;

  const { id } = await context.params;
  const { searchParams } = new URL(request.url);
  const memberUserId = searchParams.get("userId") ?? "";

  if (!memberUserId) {
    return NextResponse.json({ error: "userId обязателен" }, { status: 400 });
  }

  const result = await removeBoardMember(
    id,
    authResult.userId,
    memberUserId,
  );

  if ("error" in result) {
    const status = result.error === "Нет прав" ? 403 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  await logActivity(
    id,
    authResult.userId,
    "MEMBER_REMOVED",
    `Убрал участника с доски`,
  );
  await notifyBoard(id, authResult.userId);
  return NextResponse.json({ ok: true });
}
