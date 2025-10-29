import { validate as isUuid } from "uuid";
import ChatPage from "../../../../components/screen/ChatScreen";
import { getChatRoom } from "../../../../lib/db/room";
import { redirect } from "next/navigation";

type Props = {
    params: Promise<{ roomId: string }>
}

export default async function ChatPageScreen({ params }: Props) {
    const { roomId } = await params;

    if (!isUuid(roomId)) {

        redirect("/new")
    }

    try {
       const room = await getChatRoom(roomId);
       if(!room){
        throw new Error("Project does not exist")
       }
    } catch {
        redirect("/new")
    }

    return <ChatPage chatRoomId={roomId} />;
}