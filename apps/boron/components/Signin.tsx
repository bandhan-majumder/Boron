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
    <div
      className={cn(
        "flex flex-col gap-8 w-full max-w-md border rounded-xl p-8 bg-[#151a1c]",
        className,
      )}
      {...props}
    >
      <div className="flex flex-col items-center gap-6">
        <Link
          href={"/"}
          className="flex flex-col items-center gap-3 font-medium transition-transform hover:scale-105"
        >
          <div className="flex items-center justify-center">
            <Image
              crossOrigin="anonymous"
              src={"/icon.svg"}
              width={70}
              height={70}
              alt="logo"
              style={{ transform: "rotate(35deg)" }}
              className="rounded-full"
            />
          </div>
        </Link>
        <div className="flex flex-col items-center gap-2">
          <div className="text-xl text-gray-400 tracking-wider">Welcome to</div>
          <div className="text-4xl font-bold text-[#FEFCE8] tracking-tight">
            Boron
          </div>
        </div>
        <div className="text-center text-sm text-gray-500 max-w-xs">
          Prompt. Generate. Edit. Preview. All in one place
        </div>
      </div>

      <Button
        onClick={() => {
          signInWithGoogle();
          setClicked(true);
        }}
        disabled={clicked}
        variant="outline"
        type="button"
        className="w-full rounded-4xl text-black flex items-center justify-center gap-3 py-6 bg-white border border-gray-700 text-base font-medium transition-all"
      >
        <Image
          crossOrigin="anonymous"
          src={"/google.svg"}
          width={24}
          height={24}
          alt="Google logo"
        />
        {!clicked ? "Continue with Google" : "Signing in.."}
      </Button>

      <div className="text-center text-xs text-gray-600">
        By continuing, you agree to our{" "}
        <a
          href="#"
          className="text-gray-500 hover:text-gray-400 underline underline-offset-4 transition-colors"
        >
          Terms of Service
        </a>{" "}
        and{" "}
        <a
          href="#"
          className="text-gray-500 hover:text-gray-400 underline underline-offset-4 transition-colors"
        >
          Privacy Policy
        </a>
        .
      </div>
    </div>
  );
}
