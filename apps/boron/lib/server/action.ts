"use server";

import { generateObject, generateText, streamObject } from "ai";
import { createStreamableValue } from "@ai-sdk/rsc";
import { z } from "zod";
import { google } from "@ai-sdk/google";
import { findTemplateHelper } from "../buildTemplate";
import { getAllChat, createChat, getLastAIChat } from "../db/chat";
import { updateChatRoomName } from "../db/room";
import { auth } from "../auth/auth";
import { headers } from "next/headers";

export async function generate(input: string, chatRoomId: string) {
  "use server";
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  const stream = createStreamableValue();

  (async () => {
    try {
      await createChat(chatRoomId, "user", input, session.user.id, false);

      const { object: decisionObject } = await generateObject({
        model: google("gemini-2.5-flash"),
        system:
          "You are a professional agent that creates React applications and takes user feedback to improve existing code or add changes. You can easily detect irrelevant information from queries. Given the user input, determine if the input is related to React project development or not. A requets containing replicating design or functionalities of a bad reputed or adult site or any illegal site is considered as non-project related.",
        prompt: input,
        schema: z.object({
          decision: z
            .boolean()
            .describe(
              "Decision whether the user input is related to React project development or not. Respond with true for yes and false for no.",
            ),
        }),
      });

      const isProjectRelated = decisionObject.decision;

      if (!isProjectRelated) {
        const response = await generateText({
          model: google("gemini-2.5-flash"),
          system:
            "You are Boron, a professional assistant. You can easily handle user queries. Given the user input, provide a concise and relevant response to the user's query. If the query is not clear, ask for more information. Do not provide any response to any sensitive, adult or harmful queries and respond with a general message that you can not assist with the request and you can help users to create useful non-sensitive React websites only. If the user asks to replicate a design or functionalities of a bad reputed or adult site or any illegal site, please do not provide any code or do not ask any further related questions. Simply say you can not assist with that request.",
          prompt: input,
        });

        await createChat(
          chatRoomId,
          "assistant",
          response.text,
          undefined,
          false,
        );

        stream.update({ text: response.text, isProjectCode: false });
        stream.done();
        return;
      }

      const template = findTemplateHelper("react");
      const lastAIresponse = await getLastAIChat(chatRoomId);

      if (!lastAIresponse) {
        generateObject({
          model: google("gemini-2.5-flash"),
          system:
            "You are a professional summarization agent. You can easily summarlize long long texts in 20 characters. Given the user input, generate a short and concise title for the conversation that captures the main topic discussed. The title should be around 22 characters long and should be relevant to the content of the conversation.",
          prompt: input,
          schema: z.object({
            summarized: z
              .string()
              .max(25, "Summarized text with around 22 characters."),
          }),
        })
          .then(({ object: summarizedText }) => {
            return updateChatRoomName(chatRoomId, summarizedText.summarized);
          })
          .catch((error) => {
            console.error("Failed to update chat room name:", error);
          });
      }

      const messages = template.prompts
        ? template.prompts.reduce(
            (acc: string, promptText: string) => acc + promptText,
            " ",
          )
        : "";

      const systemWithHistory = lastAIresponse
        ? `${messages}\n\n=== Previous Conversation ===\n${lastAIresponse.chat}\n\n=== Current Request ===`
        : messages;

      let fullResponse = "";

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

      await createChat(chatRoomId, "assistant", fullResponse, undefined, true);

      stream.done();
    } catch (error) {
      console.error("Error in generate function:", error);
      stream.error(error);
      throw error;
    }
  })();

  return { object: stream.value };
}
