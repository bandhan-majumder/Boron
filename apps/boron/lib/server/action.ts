'use server';

import { generateObject, streamObject } from 'ai';
import { createStreamableValue } from '@ai-sdk/rsc';
import { z } from 'zod';
import { google } from '@ai-sdk/google';
import { findTemplateHelper } from '../buildTemplate';

export async function generate(input: string) {
  'use server';

  const stream = createStreamableValue();
  const system =
    "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra";

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
    
    const answer = "react"; // temporary hardcode
    const template = findTemplateHelper(answer);

    console.log("Selected template: ", template);
      console.log("input is: ", input);

    // convert everything to a single string
    const messages = template.prompts
      ? template.prompts.reduce((acc: string, promptText: string) => acc + promptText, " ")
      : "";


    console.log("Final system messages: ", messages);
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