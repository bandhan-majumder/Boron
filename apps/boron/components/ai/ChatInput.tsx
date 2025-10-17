'use client';

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
import { GlobeIcon } from 'lucide-react';
import { useRef, useState } from 'react';

// const models = [
//   { id: 'gpt-4', name: 'GPT-4' },
//   { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
//   { id: 'claude-2', name: 'Claude 2' },
//   { id: 'claude-instant', name: 'Claude Instant' },
// ];

const SUBMITTING_TIMEOUT = 200;
const STREAMING_TIMEOUT = 2000;

const ChatInput = ({ sendMessage }: {
  // FIX LATER
  sendMessage: ({ prompt }: {
    prompt: string
  }) => void;
}) => {
  const [text, setText] = useState<string>('');
  // const [model, setModel] = useState<string>(models[0].id);
  const [status, setStatus] = useState<
    'submitted' | 'streaming' | 'ready' | 'error'
  >('ready');
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

  const handleSubmit = (message: PromptInputMessage) => {
    // If currently streaming or submitted, stop instead of submitting
    if (status === 'streaming' || status === 'submitted') {
      stop();
      return;
    }

    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) {
      return;
    }

    setStatus('submitted');

    sendMessage({ prompt: message.text || "Tell me a joke" })

    setText('');

    setTimeout(() => {
      setStatus('streaming');
    }, SUBMITTING_TIMEOUT);

    timeoutRef.current = setTimeout(() => {
      setStatus('ready');
      timeoutRef.current = null;
    }, STREAMING_TIMEOUT);
  };

  return (
    <div className="bg-[#272725] h-full">
      <PromptInput globalDrop multiple onSubmit={handleSubmit}>
        <PromptInputBody>
          <PromptInputAttachments>
            {(attachment) => <PromptInputAttachment data={attachment} />}
          </PromptInputAttachments>
          <PromptInputTextarea
            onChange={(e) => setText(e.target.value)}
            ref={textareaRef}
            value={text}
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
  );
};

export default ChatInput;