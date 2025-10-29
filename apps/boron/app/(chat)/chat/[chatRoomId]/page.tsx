import { validate as isUuid } from "uuid";
import ChatPage from "../../../../components/screen/ChatScreen";

type Props = {
    params: Promise<{ chatRoomId: string }>
}

export default async function ChatPageScreen({ params }: Props) {
    const { chatRoomId } = await params;

    if (!isUuid(chatRoomId)) {
        console.log("Show 404 page as uuid is invalid");        
    }

    return <ChatPage chatRoomId={chatRoomId} />;
}