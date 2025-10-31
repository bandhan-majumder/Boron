import { redirect } from "next/navigation";
import ChatPage from "../../../components/screen/ChatScreen";
import { auth } from "../../../lib/auth/auth";
import { headers } from "next/headers";

export default async function NewChatPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/auth");
  return <ChatPage isNew={true} />;
}
