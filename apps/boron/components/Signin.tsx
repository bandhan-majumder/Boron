"use client";

import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { signInWithGoogle } from "../lib/auth/auth-client";

export default function Signin({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className="h-screen w-full bg-black flex items-center justify-center p-4">
      <div
        className={cn(
          "flex flex-col gap-6 w-md bg-[#191A1A] border border-[#FEFCE8] rounded-lg p-8",
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
            <div className="text-center text-sm text-gray-300">
              Prompt. Edit. Ship. Faster than you can imagine.
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <Button
              onClick={signInWithGoogle}
              variant="outline"
              type="button"
              className="w-full bg-[#FEFCE8] text-gray-900 font-medium hover:bg-[#FEFCE8]/90 border-[#FEFCE8] flex items-center justify-center gap-3 py-6"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 30 30"
                className="w-6 h-6"
              >
                <path
                  fill="#4285F4"
                  d="M 15.003906 3 C 8.3749062 3 3 8.373 3 15 C 3 21.627 8.3749062 27 15.003906 27 C 25.013906 27 27.269078 17.707 26.330078 13 L 25 13 L 22.732422 13 L 15 13 L 15 17 L 22.738281 17 C 21.848702 20.448251 18.725955 23 15 23 C 10.582 23 7 19.418 7 15 C 7 10.582 10.582 7 15 7 C 17.009 7 18.839141 7.74575 20.244141 8.96875 L 23.085938 6.1289062 C 20.951937 4.1849063 18.116906 3 15.003906 3 z"
                />
              </svg>
              Continue with Google
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
