"use client";

import React from "react";
import { useState, useEffect, useMemo } from "react";
import StepList from "../StepList";
import { CodeEditor } from "../CodeEditor";
import { FileItem, Step, StepAfterConvert } from "../../types/index";
import { filterStepsToFiles, modifySteps } from "../../lib/step";
import { useWebContainer } from "../../hooks/useWebcontainer";
import { FileExplorer } from "../FileExplorer";
import { TabView } from "../TabView";
import { PreviewFrame } from "../PreviewFrame";
import Link from "next/link";
import Image from "next/image";

export default function EditorScreen({
  initialSteps,
}: {
  initialSteps: StepAfterConvert[];
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [steps, setSteps] = useState<Step[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const webcontainer = useWebContainer();
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");

  // Initialize files from initialSteps only once when component mounts
  useEffect(() => {
    const modifiedSteps = modifySteps(initialSteps);
    setSteps(modifiedSteps);
    const originalFiles = filterStepsToFiles(modifiedSteps);
    if (originalFiles.length > 0) {
      setFiles(originalFiles);
      setSteps((prevSteps) =>
        prevSteps.map((s: Step) => ({
          ...s,
          status: "completed",
        })),
      );
    }
  }, [initialSteps]); // Only depend on initialSteps

  // webcontainer effect - only runs when files or webcontainer changes
  useEffect(() => {
    if (!webcontainer || files.length === 0) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createMountStructure = (files: FileItem[]): Record<string, any> => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mountStructure: Record<string, any> = {};

      const processFile = (file: FileItem, isRootFolder: boolean) => {
        if (file.type === "folder") {
          // For folders, create a directory entry
          mountStructure[file.name] = {
            directory: file.children
              ? Object.fromEntries(
                  file.children.map((child) => [
                    child.name,
                    processFile(child, false),
                  ]),
                )
              : {},
          };
        } else if (file.type === "file") {
          if (isRootFolder) {
            mountStructure[file.name] = {
              file: {
                contents: file.content || "",
              },
            };
          } else {
            // For files, create a file entry with contents
            return {
              file: {
                contents: file.content || "",
              },
            };
          }
        }

        return mountStructure[file.name];
      };

      // Process each top-level file/folder
      files.forEach((file) => processFile(file, true));

      return mountStructure;
    };

    const mountStructure = createMountStructure(files);
    webcontainer.mount(mountStructure);
  }, [files, webcontainer]);

  // Memoize the PreviewFrame to prevent unnecessary re-renders
  const previewFrame = useMemo(() => {
    return webcontainer ? (
      <PreviewFrame webContainer={webcontainer} /> //  files={files}
    ) : null;
  }, [webcontainer, files]);

  return (
    <div className="min-h-screen bg-[#1C1C1C] flex flex-col">
      <header className="flex gap-3 px-6 py-2">
        <Link href={"/"} className="flex items-center gap-4 cursor-pointer">
          <Image
            crossOrigin="anonymous"
            src={"/icon.svg"}
            width={30}
            height={30}
            alt="logo"
            className="rounded-full"
          />
        </Link>
        <div className="flex justify-center items-center flex-col">
          <p className="text-sm font-semibold text-white">building-your-app</p>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-12 gap-6 p-6">
          {/* Steps Panel - Increased from col-span-1 to col-span-4 */}
          <div className="col-span-4 space-y-6 overflow-auto">
            <div>
              <div className="h-[80vh] w-[30vw] border-none">
                <StepList
                  steps={steps}
                  currentStep={currentStep}
                  onSelectStep={setCurrentStep}
                />
              </div>
              <div>
                <div className="flex">
                  <br />
                  {/* {(loading || !templateSet) && <Loader />}
                  {!(loading || !templateSet) && <div className='flex'>
                    <textarea value={userPrompt} onChange={(e) => {
                    setPrompt(e.target.value)
                  }} className='p-2 w-full'></textarea>
                  <button onClick={async () => {
                    const newMessage = {
                      role: "user" as "user",
                      content: userPrompt
                    };

                    setLoading(true);
                    const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
                      messages: [...llmMessages, newMessage]
                    });
                    setLoading(false);

                    setLlmMessages(x => [...x, newMessage]);
                    setLlmMessages(x => [...x, {
                      role: "assistant",
                      content: stepsResponse.data.response
                    }]);
                    
                    setSteps(s => [...s, ...parseXml(stepsResponse.data.response).map(x => ({
                      ...x,
                      status: "pending" as "pending"
                    }))]);

                  }} className='bg-purple-400 px-4'>Send</button>
                  </div>} */}
                </div>
              </div>
            </div>
          </div>

          {/* File Explorer - Reduced from col-span-1 to col-span-2 */}
          <div className="col-span-2">
            <FileExplorer files={files} onFileSelect={setSelectedFile} />
          </div>

          {/* Code/Preview Area - Reduced from col-span-2 to col-span-6 */}
          <div className="col-span-6 bg-gray-900 rounded-lg shadow-lg p-4 h-[calc(100vh-8rem)]">
            <TabView activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="h-[calc(100%-4rem)]">
              {activeTab === "code" ? (
                <CodeEditor file={selectedFile} />
              ) : (
                previewFrame
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
