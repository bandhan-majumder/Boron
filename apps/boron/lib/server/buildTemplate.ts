import { BASE_PROMPT } from "../../prompts";
import { basePromptAsJson as nodeBasePrompt } from "../../prompts/base/node";
import { basePromptAsJson as reactBasePrompt } from "../../prompts/base/react";

export function buildTemplateResponse(answer: string, cached: boolean) {
  if (answer === "react") {
    return {
      prompts: [
        BASE_PROMPT,
        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${JSON.stringify(reactBasePrompt)}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
      ],
      uiPrompts: [reactBasePrompt],
      cached,
    };
  }

  if (answer === "node") {
    return {
      prompts: [
        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${JSON.stringify(nodeBasePrompt)}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
      ],
      uiPrompts: [nodeBasePrompt],
      cached,
    };
  }

  return { message: "Unable to access", status: 404 };
}
