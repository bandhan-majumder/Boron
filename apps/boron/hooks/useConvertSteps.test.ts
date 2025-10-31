import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { parseBoronActions } from "./useConvertSteps";
import { ActionType } from "../types/index";

describe("parseBoronActions", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {}) as unknown as ReturnType<typeof vi.spyOn>;
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("Valid inputs", () => {
    it("should parse a valid todo app artifact with multiple files", () => {
      const todoAppArtifact = {
        boronArtifact: {
          id: "todo-app",
          title: "Simple Todo App",
          boronActions: [
            {
              type: "file",
              filePath: "src/App.tsx",
              content: `import React, { useState } from 'react';
import TodoList from './components/TodoList';

function App() {
  const [todos, setTodos] = useState([]);
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-4">My Todo App</h1>
      <TodoList todos={todos} setTodos={setTodos} />
    </div>
  );
}

export default App;`,
            },
            {
              type: "file",
              filePath: "src/components/TodoList.tsx",
              content: `import React from 'react';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export default function TodoList({ todos, setTodos }) {
  return (
    <div className="space-y-2">
      {todos.map(todo => (
        <div key={todo.id} className="bg-white p-4 rounded shadow">
          {todo.text}
        </div>
      ))}
    </div>
  );
}`,
            },
            {
              type: "file",
              filePath: "src/types/todo.ts",
              content: `export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: Date;
}

export type TodoFilter = 'all' | 'active' | 'completed';`,
            },
            {
              type: "file",
              filePath: "package.json",
              content: {
                name: "todo-app",
                version: "1.0.0",
                dependencies: {
                  react: "^18.3.1",
                  "react-dom": "^18.3.1",
                },
              },
            },
          ],
        },
      };

      const result = parseBoronActions(todoAppArtifact);

      expect(result).toBeDefined();
      expect(result.steps).toHaveLength(4);
      expect(result.metadata.totalSteps).toBe(4);

      // Check first file (App.tsx)
      expect(result.steps?.[0]).toEqual({
        type: ActionType.file,
        filePath: "src/App.tsx",
        content: expect.stringContaining("function App()"),
      });

      // Check second file (TodoList.tsx)
      expect(result.steps[1]).toEqual({
        type: ActionType.file,
        filePath: "src/components/TodoList.tsx",
        content: expect.stringContaining("TodoList"),
      });

      // Check third file (types)
      expect(result.steps[2]).toEqual({
        type: ActionType.file,
        filePath: "src/types/todo.ts",
        content: expect.stringContaining("interface Todo"),
      });

      // Check fourth file (package.json - object content)
      expect(result.steps[3]).toEqual({
        type: ActionType.file,
        filePath: "package.json",
        content: expect.stringContaining('"name": "todo-app"'),
      });
    });

    it("should parse artifact without boronArtifact wrapper", () => {
      const directArtifact = {
        id: "todo-app",
        boronActions: [
          {
            type: "file",
            filePath: "src/App.tsx",
            content: "import React from 'react';",
          },
        ],
      };

      const result = parseBoronActions(directArtifact);

      expect(result.steps).toHaveLength(1);
      expect(result.steps?.[0]?.filePath).toBe("src/App.tsx");
    });

    it("should parse stringified JSON response", () => {
      const artifact = {
        boronArtifact: {
          id: "todo-app",
          boronActions: [
            {
              type: "file",
              filePath: "index.html",
              content: "<!DOCTYPE html>",
            },
          ],
        },
      };

      const stringified = JSON.stringify(artifact);
      const result = parseBoronActions(stringified);

      expect(result.steps).toHaveLength(1);
      expect(result.steps?.[0]?.filePath).toBe("index.html");
    });

    it("should convert object content to JSON string", () => {
      const artifact = {
        boronArtifact: {
          boronActions: [
            {
              type: "file",
              filePath: "config.json",
              content: {
                theme: "dark",
                language: "en",
                features: {
                  autoSave: true,
                  notifications: false,
                },
              },
            },
          ],
        },
      };

      const result = parseBoronActions(artifact);

      expect(result.steps?.[0]?.content).toContain('"theme": "dark"');
      expect(result.steps?.[0]?.content).toContain('"autoSave": true');
      //@ts-ignore
      expect(JSON.parse(result.steps?.[0]?.content || "")).toEqual(
        artifact.boronArtifact?.boronActions?.[0]?.content ?? {},
      );
    });

    it("should handle content that is a number", () => {
      const artifact = {
        boronArtifact: {
          boronActions: [
            {
              type: "file",
              filePath: "version.txt",
              content: 123,
            },
          ],
        },
      };

      const result = parseBoronActions(artifact);

      expect(result.steps?.[0]?.content).toBe("123");
    });

    it("should handle content that is empty string", () => {
      const artifact = {
        boronArtifact: {
          boronActions: [
            {
              type: "file",
              filePath: "empty.txt",
              content: "",
            },
          ],
        },
      };

      const result = parseBoronActions(artifact);

      expect(result.steps?.[0]?.content).toBe("");
    });
  });

  describe("Invalid inputs", () => {
    it("should throw error when response is not an object", () => {
      expect(() => parseBoronActions(null)).toThrow(
        "Invalid response format: expected object with boronActions array",
      );
    });

    it("should throw error when boronActions is missing", () => {
      const invalidArtifact = {
        boronArtifact: {
          id: "test",
        },
      };

      expect(() => parseBoronActions(invalidArtifact)).toThrow(
        "Invalid response format: expected object with boronActions array",
      );
    });

    it("should throw error when boronActions is not an array", () => {
      const invalidArtifact = {
        boronArtifact: {
          boronActions: "not an array",
        },
      };

      expect(() => parseBoronActions(invalidArtifact)).toThrow(
        "Invalid response format: expected object with boronActions array",
      );
    });

    it("should throw error when filePath is missing", () => {
      const invalidArtifact = {
        boronArtifact: {
          boronActions: [
            {
              type: "file",
              content: "some content",
            },
          ],
        },
      };

      expect(() => parseBoronActions(invalidArtifact)).toThrow(
        "Missing filePath at action 0",
      );
    });

    it("should throw error when content is missing (undefined)", () => {
      const invalidArtifact = {
        boronArtifact: {
          boronActions: [
            {
              type: "file",
              filePath: "test.txt",
            },
          ],
        },
      };

      expect(() => parseBoronActions(invalidArtifact)).toThrow(
        "Missing content at action 0",
      );
    });

    it("should throw error when content is explicitly null", () => {
      const invalidArtifact = {
        boronArtifact: {
          boronActions: [
            {
              type: "file",
              filePath: "test.txt",
              content: null,
            },
          ],
        },
      };

      expect(() => parseBoronActions(invalidArtifact)).toThrow(
        "Missing content at action 0",
      );
    });

    it("should throw error when boronActions array is empty", () => {
      const emptyArtifact = {
        boronArtifact: {
          boronActions: [],
        },
      };

      expect(() => parseBoronActions(emptyArtifact)).toThrow(
        "No valid actions found in response",
      );
    });

    it("should throw error with proper message for invalid JSON string", () => {
      const invalidJson = '{"invalid": json}';

      expect(() => parseBoronActions(invalidJson)).toThrow(
        "Error parsing response:",
      );
    });

    it("should log error details before throwing", () => {
      const invalidArtifact = {
        boronArtifact: {
          boronActions: "not an array",
        },
      };

      expect(() => parseBoronActions(invalidArtifact)).toThrow();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Invalid data structure:",
        expect.any(Object),
      );
    });
  });

  describe("Edge cases", () => {
    it("should handle multiple actions with different content types", () => {
      const mixedArtifact = {
        boronArtifact: {
          boronActions: [
            {
              filePath: "string.txt",
              content: "text content",
            },
            {
              filePath: "number.txt",
              content: 42,
            },
            {
              filePath: "object.json",
              content: { key: "value" },
            },
            {
              filePath: "empty.txt",
              content: "",
            },
          ],
        },
      };

      const result = parseBoronActions(mixedArtifact);

      expect(result.steps).toHaveLength(4);
      expect(result.steps?.[0]?.content).toBe("text content");
      expect(result?.steps?.[1]?.content).toBe("42");
      expect(result?.steps?.[2]?.content).toContain('"key": "value"');
      expect(result?.steps?.[3]?.content).toBe("");
    });

    it("should handle nested file paths", () => {
      const artifact = {
        boronArtifact: {
          boronActions: [
            {
              filePath: "src/components/ui/Button/index.tsx",
              content: "export default Button;",
            },
          ],
        },
      };

      const result = parseBoronActions(artifact);

      expect(result.steps?.[0]?.filePath).toBe(
        "src/components/ui/Button/index.tsx",
      );
    });

    it("should preserve all ActionType.file types", () => {
      const artifact = {
        boronArtifact: {
          boronActions: [
            { filePath: "file1.txt", content: "content1" },
            { filePath: "file2.txt", content: "content2" },
            { filePath: "file3.txt", content: "content3" },
          ],
        },
      };

      const result = parseBoronActions(artifact);

      expect(result.steps.every((step) => step.type === ActionType.file)).toBe(
        true,
      );
    });

    it("should handle special characters in content", () => {
      const artifact = {
        boronArtifact: {
          boronActions: [
            {
              filePath: "special.txt",
              content: "Special chars: \n\t\r\"'\\",
            },
          ],
        },
      };

      const result = parseBoronActions(artifact);

      expect(result.steps?.[0]?.content).toContain("Special chars:");
    });

    it("should handle very long content", () => {
      const longContent = "x".repeat(10000);
      const artifact = {
        boronArtifact: {
          boronActions: [
            {
              filePath: "large.txt",
              content: longContent,
            },
          ],
        },
      };

      const result = parseBoronActions(artifact);

      expect(result.steps?.[0]?.content).toHaveLength(10000);
    });
  });

  describe("Metadata validation", () => {
    it("should correctly set totalSteps in metadata", () => {
      const artifact = {
        boronArtifact: {
          boronActions: [
            { filePath: "1.txt", content: "one" },
            { filePath: "2.txt", content: "two" },
            { filePath: "3.txt", content: "three" },
            { filePath: "4.txt", content: "four" },
            { filePath: "5.txt", content: "five" },
          ],
        },
      };

      const result = parseBoronActions(artifact);

      expect(result.metadata.totalSteps).toBe(5);
      expect(result.steps.length).toBe(5);
    });

    it("should return proper ResponseAfterConvert structure", () => {
      const artifact = {
        boronArtifact: {
          boronActions: [{ filePath: "test.txt", content: "test" }],
        },
      };

      const result = parseBoronActions(artifact);

      expect(result).toHaveProperty("steps");
      expect(result).toHaveProperty("metadata");
      expect(result.metadata).toHaveProperty("totalSteps");
      expect(Array.isArray(result.steps)).toBe(true);
    });
  });
});
