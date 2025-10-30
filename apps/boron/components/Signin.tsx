"use client";

import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { signInWithGoogle } from "../lib/auth/auth-client";
import { useState } from "react";

export default function Signin({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [clicked, setClicked] = useState<boolean>(false);
  return (
    <div className="h-screen w-full bg-black flex items-center justify-center p-4">
      <div
        className={cn(
          "flex flex-col gap-6 w-md bg-[#191A1A] border border-gray-500 rounded-lg p-8",
          className,
        )}
        {...props}
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-4">
            <Link
              href={"/"}
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex items-center justify-center">
                <Image
                  crossOrigin="anonymous"
                  src={"/icon.svg"}
                  width={60}
                  height={60}
                  alt="logo"
                  style={{ transform: "rotate(35deg)" }}
                  className="rounded-full"
                />
              </div>
            </Link>
            <div className="flex flex-col items-center gap-2">
              <div className="text-2xl text-gray-200 italic">Welcome to</div>
              <div className="text-3xl font-bold text-[#FEFCE8]">Boron</div>
            </div>
            <div className="text-center text-md text-gray-300">
              Prompt. Generate. Edit. Preview. All in one place
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <Button
              onClick={() => {
                signInWithGoogle();
                setClicked(true);
              }}
              disabled={clicked}
              variant="outline"
              type="button"
              className="w-full text-white flex items-center justify-center gap-3 py-6 bg-[#141413] border border-gray-700 hover:bg-[#000000] hover:text-white text-lg"
            >
              <Image
                crossOrigin="anonymous"
                src={"/google.svg"}
                width={30}
                height={30}
                alt="logo"
              />
              {!clicked ? "Continue with Google" : "Signing in.."}
            </Button>
          </div>
        </div>

        <div className="text-center text-xs text-balance text-gray-500">
          By continuing, you agree to our{" "}
          <a
            href="#"
            className="text-blue-400 hover:text-blue-300 underline underline-offset-4"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="#"
            className="text-blue-400 hover:text-blue-300 underline underline-offset-4"
          >
            Privacy Policy
          </a>
          .
        </div>
      </div>
    </div>
  );
}
