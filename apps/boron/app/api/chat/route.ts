import { getAnthropicInstance } from "../../../lib/anthropic";
// import { ANTHROPIC_MODEL_NAME } from "../../../lib/config";
import { getSystemPrompt } from "../../../prompts";
// import { cacheService } from "../../../lib/cache";
import type { TextBlock } from "@anthropic-ai/sdk/resources";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const model = "claude-3-5-sonnet-20241022"; // ANTHROPIC_MODEL_NAME;
    const maxTokens = 8000;
    const systemPrompt = JSON.stringify(getSystemPrompt());

    // Try to get cached response first
    // const cachedResponse = await cacheService.getCachedResponse(
    //   messages,
    //   model,
    //   systemPrompt,
    //   maxTokens,
    //   {
    //     keyPrefix: 'chat',
    //     ttl: 3600 // 1 hour cache
    //   }
    // );

    // if (cachedResponse) {
    //   return NextResponse.json({
    //     response: cachedResponse,
    //     cached: true
    //   });
    // }

    // If no cache hit, make API call
    const anthropic = getAnthropicInstance();

    const response = await anthropic.messages.create({
      messages: messages,
      model: model,
      max_tokens: maxTokens,
      system: systemPrompt,
    });

    const responseText = (response.content[0] as TextBlock)?.text;

    // Cache the response for future similar queries
    // if (responseText) {
    //   await cacheService.setCachedResponse(
    //     messages,
    //     model,
    //     systemPrompt,
    //     maxTokens,
    //     responseText,
    //     {
    //       keyPrefix: 'chat',
    //       ttl: 3600 // 1 hour cache
    //     }
    //   );
    // }

    return NextResponse.json({
      response: responseText,
      cached: false,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
