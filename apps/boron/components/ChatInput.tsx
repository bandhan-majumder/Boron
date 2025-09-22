"use client";

import { Button, Textarea } from "./index";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./index";
import { ArrowUp, Brain, Plus, ChevronDown } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { groupedModels, models } from "../prompts/helper/models";
import { useRouter } from "next/navigation";
import { usePromptStore } from "../providers/prompt-store-provider";
import toast from "react-hot-toast";
import { ChatPageProps } from "./screen/Landing";
import {default as UUID} from "node-uuid";

function ChatInput({ currRoute }: ChatPageProps) {
  const slug = UUID.v4();
  const [message, setMessage] = useState<string>("");
  const router = useRouter();

  const setPrompt = usePromptStore((state) => state.setPrompt);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selectedModelData = models.find((model) => model.id === selectedModel);

  useEffect(() => {
    const savedModel = localStorage.getItem("model");
    if (savedModel && models.find((m) => m.id === savedModel)) {
      setSelectedModel(savedModel);
    }
  }, []);

  // route to playground if the user is authenticated.
  const onClickHandler = () => {
    if (!selectedModelData) {
      toast("😕 Please select a model first!", {
        style: {
          backgroundColor: "#FEFCE8",
          color: "black",
          border: "1px solid black",
        },
      });
      return;
    }

    setPrompt({ prompt: message.trim() });

    setMessage("");

    if (currRoute === "new") {
      router.push(`/chat/${slug}`)
    } else router.push("/playground");
  };

  const onKeyDownHandler = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        return;
      } else {
        e.preventDefault();
        if (message.trim()) {
          onClickHandler();
        }
      }
    }
  };

  return (
    <div className="relative">
      <div className="bg-[#272725] rounded-2xl p-4 border border-gray-700 transition-colors">
        <div className="flex items-start space-x-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-gray-700 rounded-full mt-1"
          >
            <Plus className="h-5 w-5" />
          </Button>

          <Textarea
            ref={textareaRef}
            style={{
              overflow: "auto",
              scrollbarWidth: "none",
              border: "none",
              outline: "none",
              fontSize: "16px",
            }}
            onKeyDown={onKeyDownHandler}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Build an app..."
            className="flex-1 bg-transparent border-none focus:ring-0 focus:border-none focus:outline-none text-white placeholder-gray-400 text-lg p-0 resize-none min-h-[24px] max-h-32 overflow-y-auto leading-6"
            rows={1}
          />
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex flex-row gap-3">
            <div className="text-sm text-gray-400">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 hover:text-gray-300 transition-colors focus:outline-none">
                    {selectedModelData?.icon || <Brain className="h-5 w-5" />}
                    <span>{selectedModelData?.name || "choose a model"}</span>
                    {selectedModelData?.badge && (
                      <span
                        className={`text-xs ${selectedModelData.badgeColor}`}
                      >
                        {selectedModelData.badge}
                      </span>
                    )}
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-80 max-h-80 bg-[#1a1a1a] border-gray-600"
                  // hide scrollbar
                  style={{
                    msOverflowStyle: "none",
                    scrollbarWidth: "none",
                  }}
                >
                  {Object.entries(groupedModels).map(
                    ([category, categoryModels], categoryIndex) => (
                      <div key={category}>
                        {categoryIndex > 0 && (
                          <DropdownMenuSeparator className="bg-gray-700" />
                        )}
                        <DropdownMenuLabel className="text-gray-400 text-xs uppercase tracking-wider">
                          {category}
                        </DropdownMenuLabel>
                        {categoryModels.map((model) => (
                          <DropdownMenuItem
                            key={model.id}
                            onClick={() => {
                              setSelectedModel(model.id);
                              localStorage.setItem("model", model.id);
                            }}
                            className={`flex items-center gap-3 cursor-pointer text-gray-300 hover:text-white hover:bg-gray-700/50 focus:bg-gray-700/50 px-3 py-2 ${selectedModel === model.id
                              ? "bg-yellow-400/20 text-yellow-400"
                              : ""
                              }`}
                          >
                            {model.icon}
                            <span className="flex-1">{model.name}</span>
                            {model.badge && (
                              <span className={`text-xs ${model.badgeColor}`}>
                                {model.badge}
                              </span>
                            )}
                          </DropdownMenuItem>
                        ))}
                      </div>
                    ),
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <Button
            onClick={onClickHandler}
            disabled={!message.trim()}
            size="icon"
            className="bg-[#92918f] hover:bg-white text-black rounded-full h-10 w-10 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ChatInput;
