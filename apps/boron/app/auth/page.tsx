import { Suspense } from "react";
import Signin from "../../components/Signin";
import { auth } from "../../lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const SigninPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) redirect("/");

  return (
    <Suspense>
      {" "}
      <Signin />{" "}
    </Suspense>
  );
};

export default SigninPage;
