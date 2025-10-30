"use client";

import React from "react";
import { useState, useEffect, useMemo, useRef } from "react";
import { FileItem, Step, StepAfterConvert } from "../../types/index";
import { filterStepsToFiles, modifySteps } from "../../lib/step";
import { useWebContainer } from "../../hooks/useWebcontainer";
import { PreviewFrame } from "../PreviewFrame";
import { Loader2, FileText, FolderOpen, ChevronRight, CheckCircle2, Eye, Code, Download } from "lucide-react";
import { CodeEditor } from "../CodeEditor";
import toast from "react-hot-toast";

interface EditorScreenProps {
  initialSteps: StepAfterConvert[];
  isStreaming?: boolean;
}

export default function EditorScreen({
  initialSteps,
  isStreaming = false
}: EditorScreenProps) {
  const [steps, setSteps] = useState<Step[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const webcontainer = useWebContainer();
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [view, setView] = useState<"code" | "preview">("code");
  const [animatingIndices, setAnimatingIndices] = useState<Set<number>>(new Set());
  const prevStepsLengthRef = useRef(0);

  // Update steps when initialSteps changes (streaming)
  useEffect(() => {
    const modifiedSteps = modifySteps(initialSteps);
    const newStepsCount = modifiedSteps.length;
    const prevStepsCount = prevStepsLengthRef.current;

    if (newStepsCount > prevStepsCount) {
      const newIndices = new Set<number>();
      for (let i = prevStepsCount; i < newStepsCount; i++) {
        newIndices.add(i);
      }
      setAnimatingIndices(newIndices);

      setTimeout(() => {
        setAnimatingIndices(new Set());
      }, 500);
    }

    setSteps(modifiedSteps);
    prevStepsLengthRef.current = newStepsCount;

    if (!selectedFile && modifiedSteps.length > 0) {
      //@ts-ignore
      setSelectedFile(modifiedSteps[0]);
    }

    const originalFiles = filterStepsToFiles(modifiedSteps);
    if (originalFiles.length > 0) {
      setFiles(originalFiles);
    }
  }, [initialSteps]);

  // webcontainer effect - only runs when files or webcontainer changes
  useEffect(() => {
    if (!webcontainer || files.length === 0) return;

    const createMountStructure = (files: FileItem[]): Record<string, any> => {
      const mountStructure: Record<string, any> = {};

      const processFile = (file: FileItem, isRootFolder: boolean) => {
        if (file.type === "folder") {
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
            return {
              file: {
                contents: file.content || "",
              },
            };
          }
        }

        return mountStructure[file.name];
      };

      files.forEach((file) => processFile(file, true));
      return mountStructure;
    };

    const mountStructure = createMountStructure(files);
    webcontainer.mount(mountStructure);
  }, [files, webcontainer]);

  // Build file tree structure for UI
  const buildFileTree = () => {
    const tree: any = {};

    steps.forEach((step, idx) => {
      if (!step.filePath) return;

      const parts = step.filePath.split('/');
      let current = tree;

      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          current[part] = { ...step, _index: idx };
        } else {
          if (!current[part]) {
            current[part] = {};
          }
          current = current[part];
        }
      });
    });

    return tree;
  };

  const renderTree = (node: any, path: string = '', level: number = 0) => {
    return Object.keys(node).map((key) => {
      if (key === '_index') return null;

      const value = node[key];
      const isFile = value.type !== undefined;
      const fullPath = path ? `${path}/${key}` : key;
      const isAnimating = isFile && animatingIndices.has(value._index);

      //@ts-ignore
      const isSelected = selectedFile?.filePath === fullPath;

      if (isFile) {
        return (
          <div
            key={fullPath}
            onClick={() => {
              setSelectedFile(value)
            }}
            className={`
              flex items-center gap-2 px-3 py-2 cursor-pointer transition-all
              ${isSelected ? 'bg-gray-700/50 text-gray-300' : 'hover:bg-gray-700/50 text-gray-300'}
            `}
            style={{ paddingLeft: `${level * 16 + 12}px` }}
          >
            <FileText className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-mono truncate">{key}</span>
            {isAnimating && <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto animate-bounce" />}
          </div>
        );
      } else {
        return (
          <details key={fullPath} open={level === 0} className="group">
            <summary
              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-700/50 list-none transition-colors"
              style={{ paddingLeft: `${level * 16 + 12}px` }}
            >
              <ChevronRight className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-90" />
              <FolderOpen className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-gray-300">{key}</span>
            </summary>
            <div>
              {renderTree(value, fullPath, level + 1)}
            </div>
          </details>
        );
      }
    });
  };

  const fileTree = buildFileTree();

  // Download all files as a proper zip folder
  const downloadAllFiles = async () => {
    if (files.length === 0) {
      toast.error("No files to download");
      return;
    }

    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      const processFilesForZip = (fileItems: FileItem[], folder: any) => {
        fileItems.forEach(file => {
          if (file.type === "file") {
            folder.file(file.name, file.content || "");
          } else if (file.type === "folder" && file.children) {
            const subFolder = folder.folder(file.name);
            processFilesForZip(file.children, subFolder);
          }
        });
      };

      // Add all files to zip maintaining folder structure
      processFilesForZip(files, zip);

      // Generate zip file
      const blob = await zip.generateAsync({ type: "blob" });
      
      // Download the zip
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `project-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Project downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download project. Make sure JSZip is installed.");
    }
  };

  // Memoize preview frame
  const previewFrame = useMemo(() => {
    if (!webcontainer) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-900 text-gray-400">
          <div className="text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin" />
            <p>Loading preview...</p>
            <p>It generally takes around 1-2 mintues. Please wait!</p>
          </div>
        </div>
      );
    }

    return (
      <PreviewFrame webContainer={webcontainer} />
    );
  }, [webcontainer]);

  return (
    <div className="flex h-screen bg-[#1a1a1a] text-white">
      {/* Sidebar - File Tree */}
      <div className="w-80 bg-[#1e1e1e] border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-blue-500" />
            Project Files
          </h2>
          {isStreaming && (
            <div className="flex items-center gap-2 text-xs text-green-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating...</span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {steps.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p className="text-sm">Waiting for files...</p>
            </div>
          ) : (
            <div className="py-2">
              {renderTree(fileTree)}
            </div>
          )}
        </div>

        <div className="p-3 border-t border-gray-700 text-xs text-gray-400">
          {steps.length} file{steps.length !== 1 ? 's' : ''} generated
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="bg-[#2d2d2d] px-4 py-3 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-500" />
            <span className="font-mono text-sm">
              {//@ts-ignore
                selectedFile?.filePath || 'No file selected'
              }
            </span>
          </div>

          <button
            onClick={downloadAllFiles}
            className="flex items-center gap-2 px-3 py-1.5 rounded border-none outline-none cursor-pointer text-sm text-white"
          >
            <Download className="w-4 h-4" />
            Download Project
          </button>

          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-[#1e1e1e] rounded-lg p-1">
            <button
              onClick={() => setView('code')}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded transition-colors text-sm
                ${view === 'code'
                  ? 'bg-white text-black'
                  : 'text-gray-400 hover:text-gray-200'
                }
              `}
            >
              <Code className="w-4 h-4" />
              Code
            </button>
            <button
              onClick={() => setView('preview')}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded transition-colors text-sm
                ${view === 'preview'
                  ? 'bg-white text-black'
                  : 'text-gray-400 hover:text-gray-200'
                }
              `}
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {view === 'code' ? (
            selectedFile ? (
              <CodeEditor file={selectedFile} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Select a file to view its contents</p>
                </div>
              </div>
            )
          ) : (
            <div className="h-full">
              {previewFrame}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}