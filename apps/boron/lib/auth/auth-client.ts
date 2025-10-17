import { createAuthClient } from "better-auth/client";
const authClient = createAuthClient();
export const signInWithGoogle = async () => {
  await authClient.signIn.social({
    provider: "google",
    callbackURL: "/",
  });
};
