import type { ActivityType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export async function logActivity(
  boardId: string,
  userId: string,
  type: ActivityType,
  message: string,
) {
  return prisma.activity.create({
    data: { boardId, userId, type, message },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function getBoardActivities(boardId: string, limit = 30) {
  return prisma.activity.findMany({
    where: { boardId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
}
