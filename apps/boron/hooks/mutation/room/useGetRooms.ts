"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useGetRooms() {
  const query = useQuery({
    queryKey: ["getRoom"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/room");
        return response.data.rooms;
      } catch (err) {
        throw new Error("Failed to fetch rooms");
      }
    },
    retry(failureCount, error) {
      if (failureCount < 3) {
        return true;
      }
      return false;
    },
  });
  return query;
}
