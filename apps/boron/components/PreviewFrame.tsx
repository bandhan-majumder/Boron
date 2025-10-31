"use client";

import { WebContainer } from "@webcontainer/api";
import React, { useEffect, useState } from "react";
import LoadingBars from "./ui/BarsLoading";

interface PreviewFrameProps {
  // files: any[];
  webContainer: WebContainer;
}

export function PreviewFrame({ webContainer }: PreviewFrameProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function installDependencies() {
    try {
      const installProcess = await webContainer.spawn("npm", ["install"]);

      installProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            console.log(data);
          },
        }),
      );

      const exitCode = await installProcess.exit;

      if (exitCode !== 0) {
        throw new Error("Installation failed");
      }

      return exitCode;
    } catch (err) {
      console.error("Install error:", err);
      throw err;
    }
  }

  async function startDevServer() {
    try {
      await webContainer.spawn("npm", ["run", "dev"]);

      webContainer.on("server-ready", (port, url) => {
        setUrl(url);
        setIsLoading(false);
      });
    } catch (err) {
      console.error("Dev server error:", err);
      setError("Failed to start development server");
      setIsLoading(false);
    }
  }

  async function main() {
    try {
      setIsLoading(true);
      setError(null);

      const exitCode = await installDependencies();

      if (exitCode === 0) {
        await startDevServer();
      }
    } catch (err) {
      console.error("Setup error:", err);
      setError("Failed to setup development environment");
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (webContainer) {
      main();
    }
  }, [webContainer]);

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-red-400">
        <div className="text-center">
          <p className="mb-2">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center text-gray-400">
      {isLoading && (
        <div className="text-center">
          <div className="flex items-center justify-center">
            <LoadingBars />
          </div>
          <p>Loading preview...</p>
          <p className="mt-5">It generally takes around 1-2 mintues. Please wait!</p>
          <p className="mt-1">Tip: Open developer console to see progress</p>
        </div>
      )}
      {!isLoading && url && (
        <iframe width="100%" height="100%" src={url} title="Preview" />
      )}
    </div>
  );
}
