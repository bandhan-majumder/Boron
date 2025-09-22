import React from "react";
import ChatInput from "./ChatInput";
import { ChatPageProps } from "./screen/Landing";

export default function ChatMain({ currRoute }: ChatPageProps) {
  return (
    <main
      className={`relative z-10 flex flex-col items-center px-6 text-center 
        ${currRoute === "new" ? "min-h-[80vh] justify-center" : ""}`}
    >
      <div className="w-4xl mx-auto space-y-8">
        {currRoute === "new" && (
          <div className="space-y-6">
            <h2 className="text-3xl md:text-5xl tracking-wide font-bold text-yellow-50 flex items-center justify-center">
              Boron
            </h2>
            <p className="text-lg text-gray-200 max-w-2xl mx-auto leading-relaxed">
              Prompt, Edit, Ship. Faster by chatting with AI.
            </p>
          </div>
        )}

        <div className="mx-auto flex justify-center items-center flex-col">
          <div className="relative w-full sm:w-[70%] md:w-[50%] lg:w-[30vw]">
            <ChatInput currRoute={currRoute} />
          </div>
          <p className="text-sm text-gray-400 mt-3">
            Press <span className="text-gray-200">Enter</span> or click the
            arrow to start
          </p>
        </div>
      </div>
    </main>
  );
}
