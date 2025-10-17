'use client';
import Image from "next/image";
import { useState, useRef, useEffect } from 'react';
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
import { FileText, Loader2, ChevronRight, CheckCircle2 } from 'lucide-react';
import { StepAfterConvert, ActionType } from "../../types";
import EditorScreen from "../../components/screen/EditorScreen";

export const maxDuration = 30;

export default function Chat() {
  const [text, setText] = useState<string>('');
  const [status, setStatus] = useState<'submitted' | 'streaming' | 'ready' | 'error'>('ready');
  const [streamingSteps, setStreamingSteps] = useState<StepAfterConvert[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Convert streaming data to steps in real-time
  const convertToSteps = (partialObject: any): StepAfterConvert[] => {
    try {
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
  };

  const stop = () => {
    console.log('Stopping request...');

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setStatus('ready');
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
    setShowEditor(false);
    setProcessingError(null);
    setStatus('submitted');

    try {
      const { object } = await generate(message.text || '');
      let hasReceivedData = false;

      for await (const partialObject of readStreamableValue(object)) {
        if (partialObject) {
          if (!hasReceivedData) {
            setStatus('streaming');
            hasReceivedData = true;
            setShowEditor(true);
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
      setShowEditor(false);
      setTimeout(() => {
        setStatus('ready');
        setProcessingError(null);
      }, 3000);
    }
  };

  // Full screen layout when editor is not shown
  if (!showEditor) {
    return (
      <div className="flex flex-col w-full h-full">
        <div className="flex-1 overflow-y-auto p-6 pb-32">
          {status === 'submitted' && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="ml-3 text-gray-400">Initializing...</span>
            </div>
          )}

          {status === 'streaming' && streamingSteps.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-green-500" />
              <span className="ml-3 text-gray-400">Generating project files...</span>
            </div>
          )}

          {processingError && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-center text-red-400 max-w-md">
                <h2 className="text-xl font-semibold mb-2">Error</h2>
                <p className="mb-4">{processingError}</p>
                <button
                  onClick={() => {
                    setProcessingError(null);
                    setStreamingSteps([]);
                    setShowEditor(false);
                    setStatus('ready');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {!processingError && status === 'ready' && (
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
              <h2 className="text-2xl font-semibold mb-2">Hey, what are you building?</h2>
            </div>
          )}
        </div>

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
                  disabled={status === 'streaming' || status === 'submitted'}
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
    );
  }

  // Split layout when editor is shown
  return (
    <div className="flex w-full h-full">
      {/* Left Side - Chat Panel */}
      <div className="flex flex-col w-96 border-r border-gray-700 bg-[#1a1a1a]">
        {/* Chat messages area */}
        <div className="flex-1 overflow-y-auto p-6">
          {status === 'submitted' && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="ml-3 text-gray-400">Initializing...</span>
            </div>
          )}

          {status === 'streaming' && streamingSteps.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-green-500" />
              <span className="ml-3 text-gray-400">Generating...</span>
            </div>
          )}

          {processingError && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-center text-red-400 max-w-md">
                <h2 className="text-xl font-semibold mb-2">Error</h2>
                <p className="mb-4 text-sm">{processingError}</p>
                <button
                  onClick={() => {
                    setProcessingError(null);
                    setStreamingSteps([]);
                    setShowEditor(false);
                    setStatus('ready');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {status === 'streaming' && streamingSteps.length > 0 && (
            <div className="text-gray-400 text-sm">
              <div className="flex items-center gap-2 mb-2">
                <Loader2 className="w-4 h-4 animate-spin text-green-500" />
                <span>Generating files...</span>
              </div>
              <div className="text-xs text-gray-500">
                {streamingSteps.length} files created
              </div>
            </div>
          )}
        </div>

        {/* Input section at bottom */}
        <div className="flex-shrink-0 border-t border-gray-700 p-4">
          <div className="bg-[#272725] rounded-lg shadow-lg">
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
                  disabled={status === 'streaming' || status === 'submitted'}
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

      {/* Right Side - Editor Panel */}
      <div className="flex-1 overflow-hidden">
        {streamingSteps.length > 0 ? (
          <EditorScreen
            initialSteps={streamingSteps}
            isStreaming={status === 'streaming'}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Your project will appear here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}