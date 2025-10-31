import { NextResponse } from "next/server";
import { getAllChat, getLastAIChat } from "../../../lib/db/chat";
import { auth } from "../../../lib/auth/auth";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return NextResponse.json("Unauthorized user", { status: 401 });
  }

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
