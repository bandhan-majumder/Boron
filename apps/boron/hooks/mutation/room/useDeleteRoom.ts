"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export function useDeleteRoom() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationKey: ["deleteRoom"],
    mutationFn: async ({ roomId }: { roomId: string }) => {
      if (!roomId) {
        throw new Error("Room name is required!");
      }
      try {
        const response = await axios.delete("/api/room", {
          params: { roomId },
        });
        return response.data.room;
      } catch (err) {
        throw new Error("Internal Server Error");
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['getRoom'] }) // refetch fresh avl rooms
    },
    retry(failureCount, error) {
      if (failureCount < 2) {
        return true;
      }
      return false;
    },
  });

  return mutation;
}
