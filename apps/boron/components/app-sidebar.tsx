'use client';

import * as React from "react";
import {
  PlusIcon,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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
  SidebarRail,
} from "./index";
import { useCreateRoom } from "../hooks/mutation/room/useCreateRoom";
import { useGetRooms } from "../hooks/mutation/room/useGetRooms";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ChatSkeleton } from "./chat-skeletons";
import { useDeleteRoom } from "../hooks/mutation/room/useDeleteRoom";
import toast from "react-hot-toast";
import { NavUser, SessionType } from "./nav-user";

interface IRoomData {
  id: string;
  name: string;
  updatedAt: string;
  createdAt: string;
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  session: SessionType | null;
}

export function AppSidebar({ session, ...props }: AppSidebarProps) {
  const { data: chatRoomsData, isLoading, isError } = useGetRooms();
  const queryClient = useQueryClient();
  const mutationCreateRoom = useCreateRoom();
  const mutationDeleteRoom = useDeleteRoom();
  const router = useRouter();

  const handleCreateNewRoom = async () => {
    mutationCreateRoom.mutate(
      { roomName: "new project" },
      {
        onSuccess: async (data) => {
          router.push(`/c/${data.id}`);
          queryClient.invalidateQueries({ queryKey: ['getRoom'] });
        },
        onError: (error) => {
          console.error("Failed to create room:", error);
        }
      }
    );
  };

  const handleDeleteRoom = async (roomId: string) => {
    mutationDeleteRoom.mutate(
      { roomId: roomId },
      {
        onSuccess: async (data) => {
          queryClient.invalidateQueries({ queryKey: ['getRoom'] });
          toast.success("Project deleted successfully!")
        },
        onError: (error) => {
          console.error("Failed to delete room:", error);
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
              <Link href="/new">
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
                  <span className="font-medium text-xl">Boron</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="bg-[#181818] text-white pt-5">
        <div className="flex justify-between mx-1">
          <p className="text-white flex flex-col justify-center items-center text-lg font-semibold">Previous Projects</p>
          <button
            onClick={handleCreateNewRoom}
            disabled={mutationCreateRoom.isPending}
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
            {!chatRoomsData || chatRoomsData.length === 0 && <div className="text-gray-400 text-center">No project found. Create one!</div>}
            {chatRoomsData && chatRoomsData.map((item: IRoomData) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton asChild>
                  <div className="flex justify-between">
                    <Link href={`/c/${item.id}`} className="font-medium hover:bg-[#272725]">
                      {item.name}
                    </Link>
                    <div className="text-red-700 hidden group-hover:block">
                      <Trash2 size={20} onClick={() => {
                        handleDeleteRoom(item.id)
                      }} />
                    </div>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="text-black">
        <NavUser session={session} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}