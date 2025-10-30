import prismaClient from "@repo/db/client";


export const getAllChat = async (roomId: string) => {
    try {
        const allChats = await prismaClient.chat.findMany({
            where: {
                roomId: roomId
            },
            orderBy: {
                createdAt: 'asc'
            }
        })
        return allChats;
    } catch (err) {
        throw new Error("Error fetching chats");
    }
}

export const getLastAIChat = async (roomId: string) => {
    try {
        const allChats = await prismaClient.chat.findFirst({
            where: {
                roomId: roomId,
                sender: 'assistant'
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        return allChats;
    } catch (err) {
        throw new Error("Error fetching chats");
    }
}

export const createChat = async (roomId: string, sender: "user" | "assistant", message: string, userId?: string) => {
    try {
        const newChat = await prismaClient.chat.create({
            data: {
                roomId: roomId,
                sender: sender,
                chat: message,
                userId: userId || null
            }
        })
        return newChat;
    } catch (err) {
        throw new Error("Error creating chat");
    }
}