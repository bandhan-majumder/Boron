import { NextResponse } from "next/server";
import { getAllChatRooms } from "../../../lib/db/room";

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