import prismaClient from "@repo/db/client";

export const getAllChatRooms = async () => {
    try {
        const allChatRooms = await prismaClient.chatRoom.findMany({})
        return allChatRooms;
    } catch (err) {
        throw new Error("Error fetching chatrooms");
    }
}

export const createChatRoom = async (name: string) => {
    try {
        const newChatRoom = await prismaClient.chatRoom.create({
            data: {
                name: name
            }
        })
        return newChatRoom;
    } catch (err) {
        throw new Error("Error creating chatroom");
    }
}

export const updateChatRoomName = async (roomId: string, newName: string) => {
    try {
        const updatedChatRoom = await prismaClient.chatRoom.update({
            where: {
                id: roomId
            },
            data: {
                name: newName
            }
        })
        return updatedChatRoom;
    } catch (err) {
        throw new Error("Error updating chatroom name");
    }   
}

export const deleteChatRoom = async (roomId: string) => {
    try {
        const allChatRooms = await prismaClient.chatRoom.delete({
            where: {
                id: roomId
            }
        })
        return allChatRooms;
    } catch (err) {
        throw new Error("Error fetching chatrooms");
    }
}