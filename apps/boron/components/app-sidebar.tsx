"use client";

import * as React from "react";
import { Ellipsis, Pencil, PlusIcon, Trash2 } from "lucide-react";
import Link from "next/link";

import {
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
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useDeleteRoom } from "../hooks/mutation/room/useDeleteRoom";
import toast from "react-hot-toast";
import { NavUser, SessionType } from "./nav-user";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/index";
import { Loader } from "./ai-elements/loader";

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
  const pathname = usePathname();
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
          sessionStorage.setItem("isNew", "true"); // new chat does not have history
          router.push(`/c/${data.id}`);
          queryClient.invalidateQueries({ queryKey: ["getRoom"] });
        },
        onError: (error) => {
          console.error("Failed to create room:", error);
        },
      },
    );
  };

  const handleDeleteRoom = async (roomId: string, currentPath: string) => {
    mutationDeleteRoom.mutate(
      { roomId: roomId },
      {
        onSuccess: async (data) => {
          queryClient.invalidateQueries({ queryKey: ["getRoom"] });
          // if deleting the current chatpage, it should route me to /new
          if (currentPath.includes(roomId)) {
            router.push("/new");
          }
          toast.success("Project deleted successfully!");
        },
        onError: (error) => {
          console.error("Failed to delete room:", error);
        },
      },
    );
  };

  return (
    <Sidebar variant="floating" {...props} className="bg-[#181818] border-none">
      <SidebarHeader className="bg-[#181818] border-none text-white">
        <SidebarMenu>
          <SidebarMenuItem className="bg-none hover:none">
            <Link href="/new">
              <div className="font-medium text-3xl font-serif text-white">
                Boron
              </div>
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
              <div className="text-gray-400 flex justify-center h-[20vh]">
                <Loader size={25} />
              </div>
            )}
            {isError && (
              <div className="text-red-400 text-sm px-2">
                Failed to load chats
              </div>
            )}
            {!chatRoomsData ||
              (chatRoomsData.length === 0 && (
                <div className="text-gray-400 text-center">
                  No project found. Create one!
                </div>
              ))}
            {chatRoomsData &&
              chatRoomsData.map((item: IRoomData) => (
                <SidebarMenuItem key={item.id}>
                  <div className="flex justify-between items-center">
                    <SidebarMenuButton
                      asChild
                      className={`flex min-w-0 hover:bg-[#000000] hover:text-gray-300 focus:bg-transparent active:bg-transparent data-[state=open]:bg-transparent ${selectedProject === item.id && "bg-[#000000]"}`}
                      onClick={() => setSelectedProject(item.id)}
                    >
                      <Link
                        href={`/c/${item.id}`}
                        className="text-gray-200 border-none outline-none font-medium truncate"
                      >
                        {item.name}
                      </Link>
                    </SidebarMenuButton>

                    <div className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
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
                          <DropdownMenuItem
                            disabled={true}
                            onClick={() => {
                              console.log("Edit:", item.id);
                            }}
                          >
                            <Pencil size={16} className="mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteRoom(item.id, pathname)}
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
      <SidebarFooter className="text-gray-300 bg-[#181818]">
        <NavUser session={session} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
