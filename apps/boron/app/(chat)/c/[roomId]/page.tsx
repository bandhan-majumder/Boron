import { validate as isUuid } from "uuid";
import ChatPage from "../../../../components/screen/ChatScreen";

type Props = {
    params: Promise<{ roomId: string }>
}

export default async function ChatPageScreen({ params }: Props) {
    const { roomId } = await params;

    if (!isUuid(roomId)) {
        console.log("Show 404 page as uuid is invalid");        
    }

    return <ChatPage chatRoomId={roomId} />;
}