import { NextResponse } from "next/server";
import { createChatRoom, deleteChatRoom, getAllChatRooms } from "../../../lib/db/room";

export async function GET(req: Request) {
    try {
        const allRooms = await getAllChatRooms();
        if (!allRooms) {
            return NextResponse.json({ rooms: [], status: 200 });
        }
        return NextResponse.json({ rooms: allRooms, status: 200 });
    } catch (err) {
        return NextResponse.json("Error fetching chats", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { roomName } = body;

        if (!roomName) {
            return NextResponse.json("Room name is required", { status: 400 });
        }

        const newRoom = await createChatRoom(roomName);
        return NextResponse.json({ room: newRoom, status: 200 });
    } catch (err) {
        return NextResponse.json("Error creating room", { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const roomId = searchParams.get("roomId");

        if (!roomId) {
            return NextResponse.json("Room id is required", { status: 400 });
        }

        const newRoom = await deleteChatRoom(roomId);
        return NextResponse.json({ room: newRoom, status: 200 });
    } catch (err) {
        return NextResponse.json("Error deleting room", { status: 500 });
    }
}