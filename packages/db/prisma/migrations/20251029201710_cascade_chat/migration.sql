-- DropForeignKey
ALTER TABLE "public"."chat" DROP CONSTRAINT "chat_roomId_fkey";

-- AddForeignKey
ALTER TABLE "chat" ADD CONSTRAINT "chat_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
