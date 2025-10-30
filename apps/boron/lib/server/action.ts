'use server';

import { generateObject, streamObject } from 'ai';
import { createStreamableValue } from '@ai-sdk/rsc';
import { z } from 'zod';
import { google } from '@ai-sdk/google';
import { findTemplateHelper } from '../buildTemplate';
import { getAllChat, createChat, getLastAIChat } from '../db/chat';
import { updateChatRoomName } from '../db/room';
import { auth } from '../auth/auth';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function generate(input: string, chatRoomId: string) {
  'use server';
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return NextResponse.json("Unauthorized user", { status: 401 });
  };

  const stream = createStreamableValue();

  (async () => {
    try {
      await createChat(chatRoomId, 'user', input, session.user.id);

      const answer = "react";
      const template = findTemplateHelper(answer);
      const allPrevChats = await getAllChat(chatRoomId);
      const allPrevAIMessages = await getLastAIChat(chatRoomId);

      if (!allPrevAIMessages) {
        generateObject({
          model: google("gemini-2.5-flash"),
          system: "You are a professional summarization agent. You can easily summarlize long long texts in 20 characters. Given the user input, generate a short and concise title for the conversation that captures the main topic discussed. The title should be around 22 characters long and should be relevant to the content of the conversation.",
          prompt: input,
          schema: z.object({
            summarized: z.string().max(25, "Summarized text with around 22 characters.")
          }),
        }).then(({ object: summarizedText }) => {
          return updateChatRoomName(chatRoomId, summarizedText.summarized);
        }).catch(error => {
          console.error("Failed to update chat room name:", error);
        });
      }
      
      const conversationHistory = allPrevChats
        .slice(0, -1) // Remove the last message (current user input)
        .map(chat => `${chat.sender === 'user' ? 'User' : 'Assistant'}: ${chat.chat}`)
        .join('\n\n');

      const messages = template.prompts
        ? template.prompts.reduce((acc: string, promptText: string) => acc + promptText, " ")
        : "";

      const systemWithHistory = conversationHistory
        ? `${messages}\n\n=== Previous Conversation ===\n${conversationHistory}\n\n=== Current Request ===`
        : messages;

      let fullResponse = '';

      const { partialObjectStream } = streamObject({
        model: google("gemini-2.5-flash"),
        system: systemWithHistory,
        prompt: input,
        schema: template.schema || z.any(),
      });

      for await (const partialObject of partialObjectStream) {
        stream.update(partialObject);
        fullResponse = JSON.stringify(partialObject);
      }

      await createChat(chatRoomId, 'assistant', fullResponse);

      stream.done();
    } catch (error) {
      console.error('Error in generate function:', error);
      stream.error(error);
      throw error;
    }
  })();

  return { object: stream.value };
}