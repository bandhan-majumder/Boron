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
import { FileText, Loader2, X, Maximize2, Code } from 'lucide-react';
import { StepAfterConvert, ActionType } from "../../types";
import EditorScreen from "../../components/screen/EditorScreen";
import { useCreateRoom } from "../../hooks/mutation/room/useCreateRoom";
import { useQueryClient } from "@tanstack/react-query";

export const maxDuration = 30;

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
  const [streamingSteps, setStreamingSteps] = useState<StepAfterConvert[]>([]);
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [hasGeneratedFiles, setHasGeneratedFiles] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<PromptInputMessage | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const createRoomHandler = async (roomName: string) => {
    return new Promise<{ id: string }>((resolve, reject) => {
      mutation.mutate(
        { roomName },
        {
          onSuccess: (data) => {
            resolve(data)
            // get the "new project" default chat room
            queryClient.invalidateQueries({ queryKey: ['getRoom'] });
          },
          onError: (error) => reject(error)
        }
      );
    });
  };

  // Reset state when chatRoomId changes (navigating between chats)
  useEffect(() => {
    setStreamingSteps([]);
    setShowEditorModal(false);
    setProcessingError(null);
    setHasGeneratedFiles(false);
    setText('');
    setStatus('ready');
    setPendingMessage(null);
  }, [chatRoomId]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  // Convert streaming data to steps in real-time
  const convertToSteps = useCallback((partialObject: any): StepAfterConvert[] => {
    try {
      // get the new summarized name
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
  }, []);

  const stop = useCallback(() => {
    console.log('Stopping request...');

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setStatus('ready');
  }, []);

  const processMessage = async (message: PromptInputMessage, roomId: string) => {
    setStatus('submitted');

    try {
      const { object } = await generate(message.text || '', roomId);
      let hasReceivedData = false;

      for await (const partialObject of readStreamableValue(object)) {
        if (partialObject) {
          if (!hasReceivedData) {
            setStatus('streaming');
            hasReceivedData = true;
            setHasGeneratedFiles(true);
          }

          const steps = convertToSteps(partialObject);
          if (steps.length > 0) {
            setStreamingSteps(steps);
          }
        }
      }

      setText('');
      setStatus('ready');

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

    } catch (error) {
      console.error('Generation error:', error);
      setStatus('error');
      setProcessingError(error instanceof Error ? error.message : 'Generation failed');
      setHasGeneratedFiles(false);
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

    // Reset all states for new submission
    setStreamingSteps([]);
    setShowEditorModal(false);
    setProcessingError(null);
    setHasGeneratedFiles(false);

    // If this is a new chat, create room first
    if (isNew) {
      setPendingMessage(message);
      setStatus('submitted');
      
      try {
        const newRoom = await createRoomHandler("New project");
        router.push(`/chat/${newRoom.id}`);
        sessionStorage.setItem('pendingMessage', JSON.stringify(message));
      } catch (error) {
        console.error('Failed to create room:', error);
        setStatus('error');
        setProcessingError('Failed to create chat room');
        setPendingMessage(null);
      }
    } else {
      // Normal flow - process message in existing room
      await processMessage(message, chatRoomId ?? "");
    }
  };

  // Process pending message after navigation
  useEffect(() => {
    if (!isNew && chatRoomId) {
      const pending = sessionStorage.getItem('pendingMessage');
      if (pending) {
        sessionStorage.removeItem('pendingMessage');
        const message = JSON.parse(pending) as PromptInputMessage;
        processMessage(message, chatRoomId);
      }
    }
  }, [isNew, chatRoomId]);

  const handleDismissError = useCallback(() => {
    setProcessingError(null);
    setStreamingSteps([]);
    setHasGeneratedFiles(false);
    setStatus('ready');
  }, []);

  const isLoading = status === 'submitted' || status === 'streaming';
  const isInputDisabled = isLoading;

  return (
    <div className="flex flex-col w-full h-full relative">
      {/* Main Chat Screen */}
      <div className="flex-1 overflow-y-auto p-6 pb-32">
        {status === 'submitted' && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-3 text-gray-400">
              {isNew ? 'Creating chat room...' : 'Initializing...'}
            </span>
          </div>
        )}

        {status === 'streaming' && streamingSteps.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-green-500" />
            <span className="ml-3 text-gray-400">Generating project files...</span>
          </div>
        )}

        {/* Loader Button - Shows when files are being generated */}
        {hasGeneratedFiles && (
          <div className="flex items-center justify-center py-12">
            <button
              onClick={() => setShowEditorModal(!showEditorModal)}
              className="bg-[#2B2B29] border border-[#2B2B29] group relative overflow-hidden text-white px-8 py-4 rounded-lg shadow-lg flex items-center gap-3 hover:bg-[#3B3B39] transition-colors"
            >
              {status === 'streaming' ? (
                <>
                  <Code className="w-5 h-5" />
                  <span className="font-medium">Preparing editor...</span>
                  <span className="bg-white/20 px-2 py-1 rounded text-sm">
                    {streamingSteps.length} files
                  </span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-5 h-5" />
                  <span className="font-medium">View files in Editor</span>
                  <span className="bg-white/20 px-2 py-1 rounded text-sm">
                    {streamingSteps.length} files
                  </span>
                </>
              )}

              {/* Animated border */}
              <div className="absolute inset-0 rounded-lg border-2 border-white/20 group-hover:border-white/40 transition-all"></div>
            </button>
          </div>
        )}

        {processingError && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center text-red-400 max-w-md bg-red-950/20 border border-red-500/30 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-2">Error</h2>
              <p className="mb-4">{processingError}</p>
              <button
                onClick={handleDismissError}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {!processingError && !hasGeneratedFiles && status === 'ready' && isNew && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Image
              crossOrigin="anonymous"
              src={"/icon.svg"}
              width={60}
              height={60}
              alt="logo"
              style={{ transform: "rotate(35deg)" }}
              className="rounded-full"
            />
            <h2 className="text-2xl font-semibold mb-2 mt-4">
              Hey, what are you building?
            </h2>
          </div>
        )}
      </div>

      {/* Input Section - Fixed at bottom */}
      <div className="flex flex-col items-center justify-center py-2">
        <div className="w-xl mx-auto bg-[#272725] rounded-lg shadow-lg">
          <PromptInput className='text-white' globalDrop multiple onSubmit={handleSubmit}>
            <PromptInputBody>
              <PromptInputAttachments>
                {(attachment) => <PromptInputAttachment data={attachment} />}
              </PromptInputAttachments>
              <PromptInputTextarea
                onChange={(e) => setText(e.target.value)}
                ref={textareaRef}
                value={text}
                placeholder="Describe your react project.."
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

      {/* Full Screen Editor Modal */}
      {showEditorModal && streamingSteps.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-[#1a1a1a] animate-in slide-in-from-bottom duration-300 flex flex-col">
            {/* Top Bar with Close Button */}
            <div className="flex-shrink-0 bg-[#2d2d2d] border-b border-gray-700 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-500" />
                <span className="font-semibold text-white">Project Editor</span>
                {status === 'streaming' && (
                  <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 px-3 py-1 rounded-full">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Generating...</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowEditorModal(false)}
                className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                <span className="text-sm font-medium">Close Editor</span>
              </button>
            </div>

            {/* Editor Content */}
            <div className="flex-1 overflow-hidden">
              <EditorScreen
                initialSteps={streamingSteps}
                isStreaming={status === 'streaming'}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}