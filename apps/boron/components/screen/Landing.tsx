import type React from "react";
import { Avatar, AvatarFallback, AvatarImage, Card } from "../index";
import { Star, Play, MessageCircle, Code, Zap, Brain } from "lucide-react";
import { Header } from "../Header";
import Footer from "../Footer";
import ChatMain from "../ChatMain";

export interface ChatPageProps {
  currRoute: "new" | "chat"
}

// Extended chats data for better visualization
const chats = [
  {
    "id": 1,
    "client": "user",
    "message": "build me a todo application",
  },
  {
    "id": 2,
    "client": "boron",
    "message": "I'll create a beautiful todo application with React. Here's a complete implementation with add, edit, delete, and mark complete functionality...",
  },
  {
    "id": 3,
    "client": "user",
    "message": "make it responsive and add dark mode",
  },
  {
    "id": 4,
    "client": "boron",
    "message": "Perfect! I've enhanced the todo app with responsive design and a beautiful dark/light mode toggle. The interface adapts seamlessly to different screen sizes...",
  },
  {
    "id": 5,
    "client": "user",
    "message": "add local storage to persist tasks",
  },
  {
    "id": 6,
    "client": "boron",
    "message": "Excellent idea! I've integrated localStorage functionality so your tasks will persist between browser sessions. Here's the updated implementation...",
  }
];


export default function ChatPage({ currRoute }: ChatPageProps) {
  if (currRoute === "chat") {
    return (
      <div className="min-h-screen">
        <div className="relative z-0">
          <section className="py-16 px-6">
            <div className="max-w-4xl mx-auto">
              <div className="space-y-4">
                {chats.map((chat, index) => (
                  <div
                    key={index}
                    className="flex justify-start"
                  >
                    <div
                      className={`w-full p-4 rounded-2xl ${chat.client === "user"
                        ? "bg-[#141413] border border-gray-900 text-white"
                        : "text-gray-100"
                        } backdrop-blur-sm`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {chat.client === "user" && <span className="text-xs font-semibold tracking-wide">
                          <Avatar className="h-8 w-8 rounded-full text-black">
                            <AvatarImage
                              crossOrigin="anonymous"
                              src={""}
                              alt={"User avatar"}
                            />
                            <AvatarFallback className="rounded-full bg-[#C0BEB4] text-black">
                              You
                            </AvatarFallback>
                          </Avatar>
                        </span>}
                      </div>
                      <p className="text-sm leading-relaxed">{chat.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4">
          <ChatMain currRoute={currRoute} />
        </div>

      </div>
    );
  }

  // Original layout for "new" route
  return (
    <div className="bg-[#1C1C1C] focus:to-yellow-50 min-h-screen">
      <ChatMain currRoute={currRoute} />
    </div>
  );
}