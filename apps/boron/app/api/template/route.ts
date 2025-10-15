import { generateText } from "ai";
import type { TextBlock } from "@anthropic-ai/sdk/resources";
import { NextResponse } from "next/server";
import { anthropic } from "@ai-sdk/anthropic";
import { buildTemplateResponse } from "../../../lib/server/buildTemplate";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const system =
      "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra";

    const result = await generateText({
      model: anthropic("claude-3-haiku-20240307"), // fixed for this as it's a one word response
      system,
      prompt,
    });
    
    console.log("result is: ", result);

    const answer = (result.content[0] as TextBlock).text;

    const template = buildTemplateResponse(answer, false);
    return NextResponse.json(template);
  } catch (error) {
    console.error("Template API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
