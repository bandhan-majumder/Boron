import { BASE_PROMPT } from "../../prompts";
import { basePromptAsJson as nodeBasePrompt } from "../../prompts/base/node";
import { reactBaseTemplateAsJson, reactBasePromptSchema  } from "../../prompts/base/react";

export function findTemplateHelper(answer: string) {
  if (answer === "react") {
    return {
      prompts: [
        BASE_PROMPT,
        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of all files in the project. Consider this as base template. Return all the files while\n${JSON.stringify(reactBaseTemplateAsJson)}\n`,
      ],
      schema: reactBasePromptSchema,
      uiPrompts: [reactBaseTemplateAsJson],
    };
  }

  if (answer === "node") {
    return {
      prompts: [
        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${JSON.stringify(nodeBasePrompt)}\n`,
      ],
      uiPrompts: [nodeBasePrompt],
      schema: reactBasePromptSchema
    };
  }

  return { message: "Unable to find" };
}
