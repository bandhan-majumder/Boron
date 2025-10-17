"use server";

import { headers } from "next/headers";
import { auth } from "../auth/auth";

export const signUp = async () => {
  // Placeholder for future sign-up logic
};

export const signIn = async () => {
  // Placeholder for future sign-in logic
};

export const signOut = async () => {
  const result = auth.api.signOut({ headers: await headers() });
  return result;
};
