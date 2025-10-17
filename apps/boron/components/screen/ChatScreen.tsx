'use client';
import Image from "next/image";
import { useState, useRef, useEffect } from 'react';
import { generate } from "../../action";
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
            setShowEditor(true); // Show editor immediately when streaming starts
          }

          // Convert and update steps in real-time
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

  // Show editor with streaming steps
  if (showEditor && streamingSteps.length > 0) {
    return (
      <EditorScreen
        initialSteps={streamingSteps}
        isStreaming={status === 'streaming'}
      />
    );
  }

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

        {!processingError && status === 'ready' && streamingSteps.length === 0 && (
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

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#1a1a1a] to-transparent">
        <div className="max-w-xl mx-auto bg-[#272725] rounded-lg shadow-lg">
          <PromptInput className='text-white' globalDrop multiple onSubmit={handleSubmit}>
            <PromptInputBody>
              <PromptInputAttachments>
                {(attachment) => <PromptInputAttachment data={attachment} />}
              </PromptInputAttachments>
              <PromptInputTextarea
                onChange={(e) => setText(e.target.value)}
                ref={textareaRef}
                value={text}
                placeholder="Describe your react project..')"
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