'use client';

import Image from "next/image";
import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import ChatInput from '../ai/ChatInput';
import { User } from 'lucide-react';

export default function Chat() {
  const { messages, sendMessage } = useChat();

  return (
    <div className="flex flex-col w-full max-w-3xl py-14 mx-auto stretch text-white">
      {messages.map(message => (
        <div key={message.id} className="whitespace-pre-wrap mb-4">
          <div className={`flex items-center gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.role === 'user' && (
              <>
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    case 'text':
                      return <div key={`${message.id}-${i}`} className="text-white p-2">{part.text}</div>;
                  }
                })}
                <User className="flex-shrink-0" />
              </>
            )}
            {message.role === 'assistant' && (
              <>
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    case 'text':
                      return <div key={`${message.id}-${i}`} className="text-white p-2">{part.text}</div>;
                  }
                })}
              </>
            )}
          </div>
        </div>
      ))}
      {(!messages || messages.length === 0) && (<div className='text-2xl flex justify-center items-center flex-col h-[40vh]'>
        <div className="flex items-center justify-center gap-4">
          <div>
            <Image
              crossOrigin="anonymous"
              src={"/icon.svg"}
              width={40}
              height={40}
              alt="logo"
              style={{ transform: "rotate(35deg)" }}
              className="rounded-full"
            />
          </div>
          <div className="text-[#C2C0B6] text-4xl font-serif">Hi, How are you doing today?</div>
        </div>
      </div>)}
      <div className='md:ml-25 fixed bottom-0 w-full max-w-xl p-2 mb-8'>
        <ChatInput sendMessage={sendMessage} />
      </div>
    </div>
  );
}