import { validate as isUuid } from "uuid";
import ChatPage from "../../../../components/screen/ChatScreen";
import { getChatRoom } from "../../../../lib/db/room";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "../../../../lib/auth/auth";

type Props = {
  params: Promise<{ roomId: string }>;
};

export default async function ChatPageScreen({ params }: Props) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/auth");
  }

  const { roomId } = await params;

  if (!isUuid(roomId)) {
    redirect("/new");
  }

  try {
    const room = await getChatRoom(roomId, session.user.id);
    if (!room) {
      throw new Error("Project does not exist");
    }
  } catch {
    redirect("/new");
  }

  return <ChatPage chatRoomId={roomId} isNew={false} />;
}
