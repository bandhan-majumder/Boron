import prismaClient from "@repo/db/client";

export const getAllChatRooms = async ({ userId }: { userId: string }) => {
  try {
    const allChatRooms = await prismaClient.chatRoom.findMany({
      where: {
        creatorId: userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
    }); // keep the recent ones in top
    return allChatRooms;
  } catch (err) {
    throw new Error("Error fetching chatrooms");
  }
};

export const getChatRoom = async (roomId: string) => {
  try {
    const chatRoom = await prismaClient.chatRoom.findFirst({
      where: {
        id: roomId,
      },
    });
    return chatRoom;
  } catch (err) {
    // chat room does not exist
    throw new Error("Error fetching chatroom");
  }
};

export const createChatRoom = async (roomName: string, userId: string) => {
  try {
    const newChatRoom = await prismaClient.chatRoom.create({
      data: {
        name: roomName,
        creatorId: userId,
      },
    });
    return newChatRoom;
  } catch (err) {
    throw new Error("Error creating chatroom");
  }
};

export const updateChatRoomName = async (roomId: string, newName: string) => {
  try {
    const updatedChatRoom = await prismaClient.chatRoom.update({
      where: {
        id: roomId,
      },
      data: {
        name: newName,
      },
    });
    return updatedChatRoom;
  } catch (err) {
    throw new Error("Error updating chatroom name");
  }
};

export const deleteChatRoom = async (roomId: string) => {
  try {
    const allChatRooms = await prismaClient.chatRoom.delete({
      where: {
        id: roomId,
      },
    });
    return allChatRooms;
  } catch (err) {
    throw new Error("Error deleting chatroom");
  }
};
