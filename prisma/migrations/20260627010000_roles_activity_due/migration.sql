-- Extend Role enum and migrate MEMBER -> EDITOR
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'EDITOR';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'VIEWER';

UPDATE "BoardMember" SET role = 'EDITOR' WHERE role::text = 'MEMBER';

-- ActivityType enum
CREATE TYPE "ActivityType" AS ENUM (
  'CARD_CREATED',
  'CARD_UPDATED',
  'CARD_MOVED',
  'CARD_DELETED',
  'BOARD_RENAMED',
  'MEMBER_INVITED',
  'MEMBER_REMOVED'
);

-- Activity log
CREATE TABLE "Activity" (
  "id" TEXT NOT NULL,
  "boardId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" "ActivityType" NOT NULL,
  "message" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Activity_boardId_createdAt_idx" ON "Activity"("boardId", "createdAt");

ALTER TABLE "Activity" ADD CONSTRAINT "Activity_boardId_fkey"
  FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Card due date
ALTER TABLE "Card" ADD COLUMN "dueAt" TIMESTAMP(3);

-- Default for new members
ALTER TABLE "BoardMember" ALTER COLUMN "role" SET DEFAULT 'EDITOR';
