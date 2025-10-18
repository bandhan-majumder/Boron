'use client';

import * as React from "react";
import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  PlusIcon,
} from "lucide-react";
import Image from "next/image";

import {
  Separator,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "./index";
import { NavUser } from "./nav-user";
import { auth } from "../lib/auth/auth";
import { useCreateRoom } from "../hooks/mutation/room/useCreateRoom";
import { useGetRooms } from "../hooks/mutation/room/useGetRooms";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ChatSkeleton } from "./chat-skeletons";

interface IRoomData {
  id: string;
  name: string;
  updatedAt: string;
  createdAt: string;
}

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { data: chatRoomsData, isLoading, isError } = useGetRooms();
  const queryClient = useQueryClient();
  const mutation = useCreateRoom();
  const router = useRouter();

  const handleCreateNewRoom = () => {
    mutation.mutate(
      { roomName: "new chat" },
      {
        onSuccess: (data) => {
          console.log("mutation data id: ", data.id);
          // Invalidate and refetch rooms list
          queryClient.invalidateQueries({ queryKey: ['rooms'] }); // Adjust the queryKey to match your useGetRooms hook
          // Navigate to the new room
          router.push(`/chat/${data.id}`);
        },
        onError: (error) => {
          console.error("Failed to create room:", error);
        }
      }
    );
  };

  return (
    <Sidebar variant="floating" {...props} className="bg-[#181818] border-none">
      <SidebarHeader className="bg-[#181818] border-none text-white">
        <SidebarMenu>
          <SidebarMenuItem className="bg-none hover:none">
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Image
                    crossOrigin="anonymous"
                    src={"/icon.svg"}
                    width={80}
                    height={80}
                    alt="logo"
                    style={{ transform: "rotate(35deg)" }}
                    className="rounded-full"
                  />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium text-xl">BoronGPT</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="bg-[#181818] text-white">
        <div className="flex justify-between mx-1">
          <p className="text-white flex flex-col justify-center items-center text-lg font-semibold">Chats</p>
          <button
            onClick={handleCreateNewRoom}
            disabled={mutation.isPending}
            className="flex justify-center items-center hover:bg-[#FFFFFF] hover:text-black rounded-full cursor-pointer p-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusIcon size={20} className="text-white hover:text-black" />
          </button>
        </div>
         <Separator />
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {isLoading && (
              <div className="text-gray-400 text-sm px-2">
                <ChatSkeleton />
              </div>
            )}
            {isError && (
              <div className="text-red-400 text-sm px-2">Failed to load chats</div>
            )}
            {chatRoomsData && chatRoomsData.map((item: IRoomData) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton asChild>
                  <a href={`/chat/${item.id}`} className="font-medium hover:bg-[#272725]">
                    {item.name}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      {/* <SidebarFooter className="bg-[#181818] text-white hover:bg-gray-900 hover:text-white">
        <NavUser session={session} />
      </SidebarFooter> */}
      <SidebarRail />
    </Sidebar>
  );
}