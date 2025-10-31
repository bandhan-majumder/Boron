import { BASE_PROMPT } from "../prompts";
import {
  reactBaseTemplateAsJson,
  reactBasePromptSchema,
} from "../prompts/base/react";

export function findTemplateHelper(answer: string) {
  if (answer === "react") {
    return {
      prompts: [
        BASE_PROMPT,
        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of all files in the project. Consider this as base template. Return all the files while giving reply \n${JSON.stringify(reactBaseTemplateAsJson)}\n`,
      ],
      schema: reactBasePromptSchema,
      uiPrompts: [reactBaseTemplateAsJson],
    };
  }

  return { message: "Unable to find" };
}
