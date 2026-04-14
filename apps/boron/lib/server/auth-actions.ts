"use server";

import { headers } from "next/headers";
import { auth } from "../auth/auth";

export const signOut = async () => {
  const result = auth.api.signOut({ headers: await headers() });
  return result;
};
