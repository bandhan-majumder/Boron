"use client";

import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export function useCreateRoom() {
  const mutation = useMutation({
    mutationKey: ["createRoom"],
    mutationFn: async ({ roomName }: { roomName: string }) => {
      if (!roomName) {
        throw new Error("Room name is required!");
      }
      try {
        const response = await axios.post("/api/room", { roomName });
        return response.data.room;
      } catch (err) {
        throw new Error("Internal Server Error");
      }
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
