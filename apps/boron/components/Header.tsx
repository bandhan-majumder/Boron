import Link from "next/link";
import UserAccountDropDown from "./UseAccountDropDown";
import Image from "next/image";
import { auth } from "../lib/auth/auth";
import { headers } from "next/headers";

export const Header = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <nav className="mx-auto wrapper top-0 z-50 flex items-center gap-2 py-6 w-full">
      <div className="flex w-[90vw] justify-between mx-auto shadow-lg shadow-neutral-600/5 backdrop-blur-lg border border-gray-600 p-3 rounded-2xl md:w-[50vw]">
        <Link href={"/"} className="flex items-center gap-4 cursor-pointer">
          <Image
            crossOrigin="anonymous"
            src={"/icon.svg"}
            width={40}
            height={40}
            alt="logo"
            style={{ transform: "rotate(35deg)" }}
            className="rounded-full"
          />
        </Link>

        <div className="flex items-center gap-4">
          <UserAccountDropDown session={session} />
        </div>
      </div>
    </nav>
  );
};
