'use client';

import * as React from "react";
import {
  Ellipsis,
  Pencil,
  PlusIcon,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import {
  Input,
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
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/index"

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
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
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
            <Link href="/new">
              <div className="font-medium text-3xl font-serif text-white">Boron</div>
            </Link>
            <div
              onClick={handleCreateNewRoom}
              className="flex justify-start gap-3 mt-5 cursor-pointer items-center hover:bg-[#000000] py-2 rounded-md"
            >
              <button
                disabled={mutationCreateRoom.isPending}
                className="flex justify-center items-center rounded-full p-1 bg-amber-50"
              >
                <PlusIcon size={15} className="text-black" />
              </button>
              <p className="text-amber-50">New project</p>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="bg-[#181818] text-white pt-3">
        <div className="ml-2 mt-3">
          <p className="text-gray-200 text-sm font-semibold"> Recents</p>
        </div>
        <SidebarGroup className="pt-0 mt-0">
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
                <div className="flex justify-between items-center">
                  <SidebarMenuButton asChild className="flex min-w-0" onClick={() => setSelectedProject(item.id)}>
                    <Link href={`/c/${item.id}`} className={`text-gray-200 border-none outline-none font-medium truncate ${selectedProject === item.id ? "bg-[#3d3a3a] rounded-md" : ""}`}>
                      {item.name}
                    </Link>
                  </SidebarMenuButton>

                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="p-1.5 border-none outline-none"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Ellipsis size={15} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        side="bottom"
                        sideOffset={5}
                        className="z-50 bg-[#303030] text-white border-none"
                      >
                        <DropdownMenuItem className="hover:bg-red-200" onClick={() => {
                          console.log('Edit:', item.id);
                        }}>
                          <Pencil size={16} className="mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteRoom(item.id)}
                          className="text-red-400 focus:text-red-400 hover:bg-[#303030]"
                        >
                          <Trash2 size={16} className="mr-2 text-red-400" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
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