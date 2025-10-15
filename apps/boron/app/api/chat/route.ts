import { createUIMessageStream, createUIMessageStreamResponse, generateText, smoothStream, stepCountIs, streamText, UIMessage } from "ai";
import type { TextBlock } from "@anthropic-ai/sdk/resources";
import { NextResponse } from "next/server";
import { anthropic } from "@ai-sdk/anthropic";
import { buildTemplateResponse } from "../../../lib/server/buildTemplate";
import { google } from "@ai-sdk/google";


export const max_duration = 40;

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();
    //@ts-ignore
    console.log(messages[0]);
    //@ts-ignore
    console.log(messages[0].parts[0]);
    //@ts-ignore
    const firstPrompt = messages[0].parts[0].text;

    console.log("First prompt received in chat route: ", firstPrompt);

    const isFirst = true; // fetch all prev messages and check if first - true for now

    if (isFirst) {
      const system =
        "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra";

      const templateResultFromAI = await generateText({
        model: google("gemini-2.5-flash"), // anthropic('claude-3-haiku-20240307'), // fixed for this as it's a one word response
        system: system,
        prompt: firstPrompt,
      });

      console.log("result is: ", templateResultFromAI);

      const answer = (templateResultFromAI.content[0] as TextBlock).text;

      console.log("answer is: ", answer);

      const template = buildTemplateResponse(answer, false);

      console.log("template is: ", template)
      // convert everything to a single string
      const messages = template.prompts
        ? template.prompts.reduce((acc: string, promptText: string) => acc + promptText, " ")
        : "";

      console.log("Final messages to be sent: ", messages);

      const stream = createUIMessageStream({
        execute: async ({ writer }) => {
          const result = streamText({
            model: google("gemini-2.5-flash"), // anthropic('claude-3-haiku-20240307'),
            messages: [
              { role: "system", content: messages },
              { role: "user", content: firstPrompt },
            ],
            stopWhen: stepCountIs(5),
            temperature: 0.3,
            experimental_transform: smoothStream(),
            onFinish: (output) => {
              console.log("Final output:", output);
            },
          });
          writer.merge(result.toUIMessageStream());
          console.log(result.text);
          console.log("steps are: ", JSON.stringify(result.steps, null, 2));
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
