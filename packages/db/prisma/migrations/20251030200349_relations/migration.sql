/*
  Warnings:

  - You are about to drop the `ChatRoom` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[identifier,value]` on the table `verification` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."chat" DROP CONSTRAINT "chat_roomId_fkey";

-- AlterTable
ALTER TABLE "chat" ADD COLUMN     "userId" TEXT;

-- DropTable
DROP TABLE "public"."ChatRoom";

-- CreateTable
CREATE TABLE "chat_room" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "creatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_room_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chat_roomId_idx" ON "chat"("roomId");

-- CreateIndex
CREATE INDEX "chat_createdAt_idx" ON "chat"("createdAt");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "verification_identifier_value_key" ON "verification"("identifier", "value");

-- AddForeignKey
ALTER TABLE "chat_room" ADD CONSTRAINT "chat_room_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat" ADD CONSTRAINT "chat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat" ADD CONSTRAINT "chat_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "chat_room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
