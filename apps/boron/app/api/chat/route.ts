import { NextResponse } from "next/server";
import { getAllChat, getLastAIChat } from "../../../lib/db/chat";

export async function POST(req: Request) {
    const body = await req.json();
    const { roomId, onlyAI = false } = body;

    if (!roomId) {
        return NextResponse.json("roomId is required", { status: 400 });
    }

    try {
        if (onlyAI) {
            const lastAIChat = await getLastAIChat(roomId);
            return NextResponse.json({ chat: lastAIChat, status: 200 });
        } 
        const chats = await getAllChat(roomId);
        return NextResponse.json({ chats, status: 200 });
    } catch (err) {
        return NextResponse.json("Error fetching chats", { status: 500 });
    }
}