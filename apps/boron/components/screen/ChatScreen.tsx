'use client';
import Image from "next/image";
import { useState, useRef } from 'react';
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
  // PromptInputModelSelect,
  // PromptInputModelSelectContent,
  // PromptInputModelSelectItem,
  // PromptInputModelSelectTrigger,
  // PromptInputModelSelectValue,
  PromptInputSpeechButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from '../ai-elements/prompt-input';
import { readStreamableValue } from '@ai-sdk/rsc';
import { FileText, Loader2, ChevronRight } from 'lucide-react';

export const maxDuration = 30;

export default function Chat() {
  const [projectData, setProjectData] = useState<any>(null);
  const [text, setText] = useState<string>('');
  const [status, setStatus] = useState<'submitted' | 'streaming' | 'ready' | 'error'>('ready');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const stop = () => {
    console.log('Stopping request...');

    // Clear any pending timeouts
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

    setProjectData(null);
    setStatus('submitted');

    try {
      const { object } = await generate(message.text || '');
      let hasReceivedData = false;

      for await (const partialObject of readStreamableValue(object)) {
        if (partialObject) {
          if (!hasReceivedData) {
            setStatus('streaming');
            hasReceivedData = true;
          }
          
          console.log('Partial object:', partialObject);
          setProjectData(partialObject);
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
      setTimeout(() => setStatus('ready'), 2000);
    }
  };

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex-1 overflow-y-auto p-6 pb-32">
        {status === 'streaming' && !projectData && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-3 text-gray-400">Generating your project...</span>
          </div>
        )}

        {projectData && (
          <div className="space-y-4">
            {projectData.boronArtifact && (
              <div className="bg-[#1e1e1e] rounded-lg border border-gray-700 overflow-hidden">
                <div className="bg-[#2d2d2d] px-4 py-3 border-b border-gray-700">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    
                    {projectData.boronArtifact.title}
                  </h3>
                </div>

                <div className="divide-y divide-gray-700">
                  {projectData.boronArtifact.boronActions?.map((action: any, idx: number) => (
                    <details key={idx} className="group">
                      <summary className="p-4 cursor-pointer hover:bg-[#2d2d2d] transition-colors list-none">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <ChevronRight className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-90" />
                            <span className="text-blue-400 font-mono text-sm">
                              {action.filePath}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                            {action.type}
                          </span>
                        </div>
                      </summary>
                      
                      <div className="px-4 pb-4">
                        <div className="bg-[#0d1117] rounded-md overflow-hidden">
                          <pre className="p-4 text-sm text-gray-300 overflow-x-auto">
                            <code>{action.content}</code>
                          </pre>
                        </div>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4">
        <div className="max-w-xl mx-auto bg-[#272725]">
          <PromptInput className='text-white' globalDrop multiple onSubmit={handleSubmit}>
            <PromptInputBody>
              <PromptInputAttachments>
                {(attachment) => <PromptInputAttachment data={attachment} />}
              </PromptInputAttachments>
              <PromptInputTextarea
                onChange={(e) => setText(e.target.value)}
                ref={textareaRef}
                value={text}
                placeholder="Describe your project..."
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
                {/* <PromptInputButton>
                      <GlobeIcon size={16} />
                      <span>Search</span>
                    </PromptInputButton> */}
                {/* <PromptInputModelSelect onValueChange={setModel} value={model}>
                      <PromptInputModelSelectTrigger>
                        <PromptInputModelSelectValue />
                      </PromptInputModelSelectTrigger>
                      <PromptInputModelSelectContent>
                        {models.map((modelOption) => (
                          <PromptInputModelSelectItem
                            key={modelOption.id}
                            value={modelOption.id}
                          >
                            {modelOption.name}
                          </PromptInputModelSelectItem>
                        ))}
                      </PromptInputModelSelectContent>
                    </PromptInputModelSelect> */}
              </PromptInputTools>
              <PromptInputSubmit status={status} />
            </PromptInputToolbar>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}