"use client";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "./index";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./index";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./index";

import { auth } from "../lib/auth/auth";
import { useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";
import { signOut } from "../lib/server/auth-actions";

export type SessionType = typeof auth.$Infer.Session;

export function NavUser({ session }: { session: SessionType | null }) {
  if (!session || !session.user) {
    redirect("/auth")
  }
  const user = session.user;
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { isMobile } = useSidebar();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (!user) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="hover:bg-[#181818] focus:bg-[#181818] active:bg-[#181818] data-[state=open]:bg-[#181818] hover:text-gray-300 focus:text-gray-300 data-[state=open]:text-gray-300"
            >
              <Avatar className="h-8 w-8 rounded-lg text-black">
                <AvatarImage
                  crossOrigin="anonymous"
                  src={user.image as string}
                  alt={user.name || "User avatar"}
                />
                <AvatarFallback className="rounded-lg">
                  {user.name ? user.name.charAt(0).toUpperCase() : "👤"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium group-hover:text-gray-300 group-focus:text-gray-300 group-data-[state=open]:text-gray-300">
                  {user.name}
                </span>
                <span className="truncate text-xs group-hover:text-gray-300 group-focus:text-gray-300 group-data-[state=open]:text-gray-300">
                  {user.email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 group-hover:text-gray-300 group-focus:text-gray-300 group-data-[state=open]:text-gray-300" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg bg-[#181818] text-white hover:text-white border-none outline-none"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg text-black">
                  <AvatarImage
                    crossOrigin="anonymous"
                    src={user.image as string}
                    alt={user.name || "User avatar"}
                  />
                  <AvatarFallback className="rounded-lg">
                    {user.name ? user.name.charAt(0).toUpperCase() : "👤"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            {/* <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator /> */}
            <DropdownMenuItem
            className="text-red-600 hover:bg-red-400 hover:text-red-600"
              onClick={async () => {
                try {
                  await signOut();
                  router.push("/auth");
                } catch (error) {
                  console.error("Sign out error:", error);
                }
              }}
            >
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
