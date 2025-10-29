'use server';

import { generateObject, generateText, streamObject } from 'ai';
import { createStreamableValue } from '@ai-sdk/rsc';
import { z } from 'zod';
import { google } from '@ai-sdk/google';
import { findTemplateHelper } from '../buildTemplate';
import { getLastAIChat } from '../db/chat';
import { updateChatRoomName } from '../db/room';

export async function generate(input: string, chatRoomId: string) {
  'use server';

  const stream = createStreamableValue();
  // const system =
  //   "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra";

  (async () => {
    // const { object: templateRespObj } = await generateObject({
    //   model: google("gemini-2.5-flash"), // anthropic('claude-3-haiku-20240307'),
    //   schema: z.object({
    //     templateOf: z.enum(["react", "node"]).describe("The type of project to create"),
    //   }),
    //   system: system,
    //   prompt: input,
    // });

    // const answer = templateRespObj.templateOf.toLowerCase();

    const answer = "react";
    const template = findTemplateHelper(answer);
    const allPrevAIMessage = await getLastAIChat(chatRoomId);

    if (!allPrevAIMessage) {
      generateObject({
        model: google("gemini-2.5-flash"),
        system: "You are a professional summarization agent. You can easily summarlize long long texts in 20 characters.",
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

    const messages = template.prompts
      ? template.prompts.reduce((acc: string, promptText: string) => acc + promptText, " ")
      : "";

    const { partialObjectStream } = streamObject({
      model: google("gemini-2.5-flash"),
      system: messages,
      prompt: input,
      schema: template.schema || z.any(),
    });

    for await (const partialObject of partialObjectStream) {
      stream.update(partialObject);
    }

    stream.done();
  })();

  return { object: stream.value };
}