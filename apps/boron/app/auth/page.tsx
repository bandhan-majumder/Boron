import { Suspense } from "react";
import Signin from "../../components/Signin";
import { auth } from "../../lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";

const SigninPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) redirect("/");

  return (
    <Suspense>
      <div className="flex h-screen w-screen bg-[#151a1c]">
        <div className="flex-1 flex flex-col items-center justify-center p-6 ">
          <Signin />
        </div>
        <div className="flex-1 hidden md:block relative">
          <Image
            src={"/login.jpg"}
            alt=""
            fill
            className="object-cover absolute"
          />
          <p className="absolute bottom-6 right-6 text-white text-sm md:text-base lg:text-lg max-w-[80%] md:max-w-[60%] text-right italic">
            "Your dreams are one prompt away..."
          </p>
        </div>
      </div>
    </Suspense>
  );
};

export default SigninPage;
