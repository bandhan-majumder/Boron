/*
 * Helper function to convert the API response to a structured format of steps.
 */

import {
  ActionType,
  ResponseAfterConvert,
  StepAfterConvert,
} from "../types/index";

export function parseBoronActions(response: any): ResponseAfterConvert {
  try {
    // Handle both string and object inputs
    let parsedData = response;
    
    if (typeof response === "string") {
      parsedData = JSON.parse(response);
    }

    // Check if we have the boronArtifact wrapper
    const boronData = parsedData?.boronArtifact || parsedData;

    // Validate structure
    if (
      !(
        boronData &&
        typeof boronData === "object" &&
        boronData.boronActions &&
        Array.isArray(boronData.boronActions)
      )
    ) {
      console.error("Invalid data structure:", boronData);
      throw new Error(
        "Invalid response format: expected object with boronActions array",
      );
    }

    const steps: StepAfterConvert[] = boronData.boronActions.map((action: any, index: number) => {
      // Validate required fields
      if (!action.filePath) {
        throw new Error(`Missing filePath at action ${index}`);
      }

      if (action.content === undefined || action.content === null) {
        throw new Error(`Missing content at action ${index}`);
      }

      const step: StepAfterConvert = {
        type: ActionType.file, // Schema only supports 'file' type
        filePath: action.filePath,
        content:
          typeof action.content === "object"
            ? JSON.stringify(action.content, null, 2)
            : String(action.content),
      };

      return step;
    });

    if (steps.length === 0) {
      throw new Error("No valid actions found in response");
    }

    const result: ResponseAfterConvert = {
      steps: steps,
      metadata: {
        totalSteps: steps.length,
      },
    };

    return result;
  } catch (error) {
    console.error("Parse error details:", error);
    throw new Error(
      `Error parsing response: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}