"use client";

import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./index";
import { signOut } from "../lib/server/auth-actions";
import { LogOutIcon, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import UserImage from "./UserImage";
import { auth } from "../lib/auth";

type SessionType = typeof auth.$Infer.Session;

export default function UserAccountDropDown({
  session,
}: {
  session: SessionType | null;
}) {
  const user = session?.user;
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="flex items-center gap-2 rounded-xl px-3 py-2 shadow-sm transition-all duration-200 hover:shadow-md">
          <div className="border-primary/20 h-8 w-8 overflow-hidden rounded-full border-2">
            {user.image ? (
              <UserImage image={user.image as string} />
            ) : (
              <div className="from-primary-400 to-primary-600 flex h-full w-full items-center justify-center bg-gradient-to-br text-white">
                <UserRound size={16} />
              </div>
            )}
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="text-white shadow-lg shadow-neutral-600/5 backdrop-blur-lg border p-3 rounded-2xl w-[200px]">
        <DropdownMenuLabel className="text-center">Account</DropdownMenuLabel>
        <DropdownMenuItem
          className="cursor-pointer p-3 text-red-500 outline-none border-none hover:text-red-700
                "
          onClick={async () => {
            await signOut();
            router.push("/auth");
          }}
        >
          <LogOutIcon /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
