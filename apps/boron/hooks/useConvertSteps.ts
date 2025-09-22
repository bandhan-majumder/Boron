/*
 * Helper function to convert the API response to a structured format of steps. Steps are having this properties;
 * type - "file" | "shell"
 * filePath - "<file_path>" - optional as shell commands does not have file path
 * content - "<command_content>"
 */

import {
  ActionType,
  ResponseAfterConvert,
  StepAfterConvert,
} from "../types/index";

// Uncomment and use this enum for better type safety
export function parseBoronActions(response: string): ResponseAfterConvert {
  try {
    // convert the string to json
    let parsedData = JSON.parse(response);

    if (
      !(
        parsedData &&
        typeof parsedData === "object" &&
        parsedData.boronActions &&
        Array.isArray(parsedData.boronActions)
      )
    ) {
      throw new Error(
        "Invalid response format: expected object with boronActions as an array",
      );
    }

    const steps = parsedData.boronActions.map((action: any, index: number) => {
      // Validate action type
      if (
        !action.type ||
        (action.type !== ActionType.file && action.type !== ActionType.shell)
      ) {
        throw new Error(
          `Invalid type at action ${index}: must be '${ActionType.file}' or '${ActionType.shell}'`,
        );
      }

      // Validate content
      if (!action.content) {
        throw new Error(`Missing content at action ${index}`);
      }

      const step: StepAfterConvert = {
        type: action.type,
        filePath: undefined,
        content:
          typeof action.content === "object"
            ? JSON.stringify(action.content, null, 2)
            : action.content,
      };

      // Add filePath for file actions
      if (action.type === ActionType.file) {
        if (!action.filePath) {
          throw new Error(`Missing filePath for file action at index ${index}`);
        }
        step.filePath = action.filePath;
      }

      return step;
    });

    const result: ResponseAfterConvert = {
      steps: steps,
      metadata: {
        totalSteps: steps.length,
      },
    };

    return result;
  } catch (error) {
    throw new Error(
      `Error parsing response: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
