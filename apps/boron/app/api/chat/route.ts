import { createUIMessageStream, createUIMessageStreamResponse, generateObject, generateText, smoothStream, stepCountIs, streamText, UIMessage } from "ai";
import type { TextBlock } from "@anthropic-ai/sdk/resources";
import { NextResponse } from "next/server";
import { anthropic } from "@ai-sdk/anthropic";
import { findTemplateHelper } from "../../../lib/server/buildTemplate";
import { google } from "@ai-sdk/google";
import z from "zod";


// export const max_duration = 40;

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();
    // receive msg from frontend
    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { message: "No messages provided" },
        { status: 400 },
      );
    }

    //@ts-ignore
    const userPrompt = messages[0].parts[0].text;

    const isFirst = true; // fetch all prev messages and check if first - true for now

    if (isFirst) {
      const system =
        "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra";

      const { object : templateRespObj} = await generateObject({
        model: google("gemini-2.5-flash"), // anthropic('claude-3-haiku-20240307'),
        schema: z.object({
          templateOf: z.enum(["react", "node"]).describe("The type of project to create"),
        }),
        system: system,
        prompt: userPrompt,
      });

      const answer = templateRespObj.templateOf.toLowerCase();
      const template = findTemplateHelper(answer);

      // convert everything to a single string
      const messages = template.prompts
        ? template.prompts.reduce((acc: string, promptText: string) => acc + promptText, " ")
        : "";

      const stream = createUIMessageStream({
        execute: async ({ writer }) => {
          const result = await generateObject({
            model: google("gemini-2.5-flash"), // anthropic('claude-3-haiku-20240307'),
            messages: [
              { role: "system", content: messages },
              { role: "user", content: userPrompt },
            ],
            schema: template.schema || z.object({ message: z.string().describe("A message that describes the unavaibility of the answer schema") }),
            temperature: 0.3,
          });
          console.log("Result: ", JSON.stringify(result.object, null, 2));
          //@ts-ignore
          writer.merge(result.object);
        }
      })

      return createUIMessageStreamResponse({ stream });
    }
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
