'use client';
import Image from "next/image";
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { generate } from "../../lib/server/action";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  type PromptInputMessage,
  PromptInputSpeechButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from '../ai-elements/prompt-input';
import { readStreamableValue } from '@ai-sdk/rsc';
import { FileText, Loader2, Maximize2, User, Bot, Delete } from 'lucide-react';
import { StepAfterConvert, ActionType } from "../../types";
import EditorScreen from "../../components/screen/EditorScreen";
import { useCreateRoom } from "../../hooks/mutation/room/useCreateRoom";
import { useQueryClient } from "@tanstack/react-query";
import { ChatHistorySkeleton } from "../skeletons/ChatPageSkeletons";
import axios from "axios";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";

export const maxDuration = 30;

type ChatMessage = {
  id: number;
  chat: string;
  sender: 'user' | 'assistant';
  createdAt: Date;
  steps?: StepAfterConvert[];
};

export default function ChatPage({
  chatRoomId,
  isNew,
}: {
  chatRoomId?: string,
  isNew?: boolean,
}) {
  const router = useRouter();
  const mutation = useCreateRoom();
  const queryClient = useQueryClient();

  const [text, setText] = useState<string>('');
  const [status, setStatus] = useState<'submitted' | 'streaming' | 'ready' | 'error'>('ready');
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [pendingMessage, setPendingMessage] = useState<PromptInputMessage | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [streamingSteps, setStreamingSteps] = useState<StepAfterConvert[]>([]);
  const [currentStreamingMessageId, setCurrentStreamingMessageId] = useState<number | null>(null);
  const [openEditorId, setOpenEditorId] = useState<number | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // for newly created chat windows from the sidebar
  useEffect(() => {
    const stored = sessionStorage.getItem("isNew");
    if (stored === "true") {
      isNew = true;
      sessionStorage.removeItem("isNew");
    }
  }, []);

  const createRoomHandler = async (roomName: string) => {
    return new Promise<{ id: string }>((resolve, reject) => {
      mutation.mutate(
        { roomName },
        {
          onSuccess: (data) => {
            resolve(data)
            queryClient.invalidateQueries({ queryKey: ['getRoom'] });
          },
          onError: (error) => reject(error)
        }
      );
    });
  };

  useEffect(() => {
    if (!isNew && chatRoomId) {
      const pending = sessionStorage.getItem('pendingMessage');
      
      if (pending) {
        sessionStorage.removeItem('pendingMessage');
        const message = JSON.parse(pending) as PromptInputMessage;
        
        setTimeout(() => {
          processMessage(message, chatRoomId);
        }, 100);
      } else {
        loadChatHistory();
      }
    }
  }, [chatRoomId, isNew]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, streamingSteps]);

  const loadChatHistory = async () => {
    if (!chatRoomId) return;

    setIsLoadingHistory(true);
    try {
      const response = await axios.post('/api/chat', { roomId: chatRoomId });
      const data = response.data;

      if (data.chats) {
        const processedChats = data.chats.map((chat: any) => {
          if (chat.sender === 'assistant') {
            try {
              const parsed = JSON.parse(chat.chat);
              const steps = convertToSteps(parsed);
              return {
                ...chat,
                steps: steps.length > 0 ? steps : undefined
              };
            } catch {
              return chat;
            }
          }
          return chat;
        });

        setChatHistory(processedChats);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    const hasPendingMessage = sessionStorage.getItem('pendingMessage');
    if (!hasPendingMessage) {
      setStreamingSteps([]);
      setProcessingError(null);
      setText('');
      setStatus('ready');
      setPendingMessage(null);
      setChatHistory([]);
      setCurrentStreamingMessageId(null);
      setOpenEditorId(null);
    }
  }, [chatRoomId]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const convertToSteps = useCallback((partialObject: any): StepAfterConvert[] => {
    try {
      queryClient.invalidateQueries({ queryKey: ['getRoom'] });
      const boronData = partialObject?.boronArtifact || partialObject;

      if (!boronData?.boronActions || !Array.isArray(boronData.boronActions)) {
        return [];
      }

      return boronData.boronActions
        .filter((action: any) => action.filePath && action.content)
        .map((action: any) => ({
          type: ActionType.file,
          filePath: action.filePath,
          content: typeof action.content === "object"
            ? JSON.stringify(action.content, null, 2)
            : String(action.content),
        }));
    } catch (err) {
      console.error("Error converting to steps:", err);
      return [];
    }
  }, [queryClient]);

  const stop = useCallback(() => {
    console.log('Stopping request...');

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setStatus('ready');
    setCurrentStreamingMessageId(null);
    setStreamingSteps([]);
  }, []);

  const processMessage = async (message: PromptInputMessage, roomId: string) => {
    setStatus('submitted');

    const userMessageId = Date.now();
    const userMessage: ChatMessage = {
      id: userMessageId,
      chat: message.text || '',
      sender: 'user',
      createdAt: new Date(),
    };
    setChatHistory(prev => [...prev, userMessage]);

    const assistantMessageId = userMessageId + 1;
    const assistantPlaceholder: ChatMessage = {
      id: assistantMessageId,
      chat: '',
      sender: 'assistant',
      createdAt: new Date(),
      steps: []
    };

    setCurrentStreamingMessageId(assistantMessageId);
    setChatHistory(prev => [...prev, assistantPlaceholder]);

    try {
      const { object } = await generate(message.text || '', roomId);
      let hasReceivedData = false;
      let assistantResponse = '';
      let finalSteps: StepAfterConvert[] = [];

      for await (const partialObject of readStreamableValue(object)) {
        if (partialObject) {
          if (!hasReceivedData) {
            setStatus('streaming');
            hasReceivedData = true;
          }

          assistantResponse = JSON.stringify(partialObject);
          const steps = convertToSteps(partialObject);

          if (steps.length > 0) {
            finalSteps = steps;
            setStreamingSteps(steps);

            setChatHistory(prev => prev.map(msg =>
              msg.id === assistantMessageId
                ? { ...msg, chat: assistantResponse, steps }
                : msg
            ));
          }
        }
      }

      setChatHistory(prev => prev.map(msg =>
        msg.id === assistantMessageId
          ? { ...msg, chat: assistantResponse, steps: finalSteps }
          : msg
      ));

      setText('');
      setStatus('ready');
      setCurrentStreamingMessageId(null);
      setStreamingSteps([]);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

    } catch (error) {
      console.error('Generation error:', error);
      setStatus('error');
      setProcessingError(error instanceof Error ? error.message : 'Generation failed');

      setChatHistory(prev => prev.filter(msg =>
        msg.id !== userMessageId && msg.id !== assistantMessageId
      ));
      setCurrentStreamingMessageId(null);
      setStreamingSteps([]);
    }
  };

  const handleSubmit = async (message: PromptInputMessage) => {
    if (status === 'streaming' || status === 'submitted') {
      stop();
      return;
    }

    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) {
      return;
    }

    setProcessingError(null);

    if (isNew) {
      setPendingMessage(message);
      setStatus('submitted');

      try {
        const newRoom = await createRoomHandler("New project");
        sessionStorage.setItem('pendingMessage', JSON.stringify(message));
        router.push(`/c/${newRoom.id}`);
      } catch (error) {
        console.error('Failed to create room:', error);
        setStatus('error');
        setProcessingError('Failed to create chat room');
        setPendingMessage(null);
      }
    } else {
      await processMessage(message, chatRoomId ?? "");
    }
  };

  const handleDismissError = useCallback(() => {
    setProcessingError(null);
    setStatus('ready');
  }, []);

  const isLoading = status === 'submitted' || status === 'streaming';
  const isInputDisabled = isLoading;

  const openEditorSteps = openEditorId
    ? chatHistory.find(msg => msg.id === openEditorId)?.steps
    : null;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="flex justify-center px-6 py-6 pb-32">
            <div className="w-full max-w-4xl">
              {isLoadingHistory && <ChatHistorySkeleton />}

              {!isLoadingHistory && chatHistory.length === 0 && (
                <div>
                  <div className="flex justify-center items-center py-4">
                    <Image
                      crossOrigin="anonymous"
                      src={"/icon.svg"}
                      width={60}
                      height={60}
                      alt="logo"
                      style={{ transform: "rotate(35deg)" }}
                      className="rounded-full text-center"
                    />
                  </div>
                  <div className="text-white text-center text-4xl font-serif">What are you building today?</div>
                </div>
              )}

              {!isLoadingHistory && chatHistory.length > 0 && (
                <div className="space-y-6 mb-6">
                  {chatHistory.map((msg) => (
                    <div key={msg.id} className="space-y-3">
                      <div
                        className={`flex gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                      >
                        {msg.sender === 'assistant' && (
                          <div className="flex-shrink-0">
                            <Bot className="w-5 h-5 text-white" />
                          </div>
                        )}

                        <div
                          className={`max-w-[50%] rounded-lg p-4 ${msg.sender === 'user'
                            ? 'bg-[#303030] text-white'
                            : 'text-gray-100'
                            }`}
                        >
                          <div className="text-sm whitespace-pre-wrap break-words">
                            {msg.sender === 'user' ? msg.chat : (
                              msg.id === currentStreamingMessageId && (status === 'streaming' || status === 'submitted')
                                ? 'Answering query...'
                                : 'Generated project files'
                            )}
                          </div>
                        </div>

                        {msg.sender === 'user' && (
                          <div className="flex-shrink-0">
                            <User className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </div>

                      {msg.sender === 'assistant' && msg.steps && msg.steps.length > 0 && (
                        <div className="flex justify-start ml-12">
                          <button
                            onClick={() => setOpenEditorId(msg.id)}
                            className="bg-[#2B2B29] border border-[#2B2B29] group relative overflow-hidden text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 hover:bg-[#3B3B39] transition-colors"
                          >
                            {msg.id === currentStreamingMessageId && status === 'streaming' ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="font-medium text-sm">Preparing editor...</span>
                                <span className="bg-white/20 px-2 py-1 rounded text-xs">
                                  {streamingSteps.length} files
                                </span>
                              </>
                            ) : (
                              <>
                                <Maximize2 className="w-4 h-4" />
                                <span className="font-medium text-sm">View Files in Editor</span>
                                <span className="bg-white/20 px-2 py-1 rounded text-xs">
                                  {msg.steps.length} files
                                </span>
                              </>
                            )}
                            <div className="absolute inset-0 rounded-lg border-2 border-white/20 group-hover:border-white/40 transition-all"></div>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
              )}

              {processingError && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="text-cente max-w-md p-6 flex flex-col">
                    <h2 className="text-gray-400 text-xl font-semibold mb-2">Something went wrong!</h2>
                    <Button
                      onClick={handleDismissError}
                      variant={"link"}
                      className="text-lg text-yellow-50 outline-none border-none"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>

      <div className="flex-shrink-0 border-none bg-transparent">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="rounded-lg shadow-none">
            <PromptInput className="bg-[#30302E] text-white rounded-xl" globalDrop multiple onSubmit={handleSubmit}>
              <PromptInputBody>
                <PromptInputAttachments>
                  {(attachment) => <PromptInputAttachment data={attachment} />}
                </PromptInputAttachments>
                <PromptInputTextarea
                  className="bg-transparent"
                  onChange={(e) => setText(e.target.value)}
                  ref={textareaRef}
                  value={text}
                  disabled={isInputDisabled}
                />
              </PromptInputBody>
              <PromptInputToolbar>
                <PromptInputTools>
                  <PromptInputActionMenu>
                    <PromptInputActionMenuTrigger />
                    <PromptInputActionMenuContent>
                      <PromptInputActionAddAttachments />
                    </PromptInputActionMenuContent>
                  </PromptInputActionMenu>
                  <PromptInputSpeechButton
                    onTranscriptionChange={setText}
                    textareaRef={textareaRef}
                  />
                </PromptInputTools>
                <PromptInputSubmit status={status} />
              </PromptInputToolbar>
            </PromptInput>
          </div>
        </div>
      </div>

      {openEditorId !== null && openEditorSteps && openEditorSteps.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-[#1a1a1a] animate-in slide-in-from-bottom duration-300 flex flex-col">
            <div className="flex-shrink-0 bg-[#2d2d2d] border-b border-gray-700 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-500" />
                <span className="font-semibold text-white">Project Editor</span>
                {openEditorId === currentStreamingMessageId && status === 'streaming' && (
                  <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 px-3 py-1 rounded-full">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Generating...</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setOpenEditorId(null)}
                className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg transition-colors flex items-center gap-2"
              >
                <Delete />
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              <EditorScreen
                initialSteps={openEditorId === currentStreamingMessageId ? streamingSteps : openEditorSteps}
                isStreaming={openEditorId === currentStreamingMessageId && status === 'streaming'}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}