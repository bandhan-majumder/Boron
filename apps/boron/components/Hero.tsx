import React from "react";
import ChatInput from "./ChatInput";

function Hero() {
  return (
    <div>
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <div className="w-4xl mx-auto space-y-8">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-5xl tracking-wide font-bold text-yellow-50 flex items-center justify-center">
              Boron
            </h2>
            <p className="text-lg text-gray-200 max-w-2xl mx-auto leading-relaxed">
              Prompt, Edit, Ship. Faster by chatting with AI.
            </p>
          </div>

          <div className="mx-auto flex justify-center items-center flex-col">
            <div className="relative w-[30vw]">
              <ChatInput />
            </div>
            <p className="text-sm text-gray-400 mt-3">
              Press <span className="text-gray-200">Enter</span> or click the
              arrow to start{" "}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Hero;
