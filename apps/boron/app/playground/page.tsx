"use client";

import React, { useState, useEffect, Suspense } from "react";
import EditorScreen from "../../components/screen/EditorScreen";
import { useCreateApp } from "../../hooks/query/useCreateApp";
import { useRouter } from "next/navigation";
import { parseBoronActions } from "../../hooks/useConvertSteps";
import { StepAfterConvert } from "../../types";
import EditorScreenSkeleton from "../../components/skeletons/EditorScreenSkeleton";

export default function PlayGround() {
  const router = useRouter();
  const prompt = "";

  const [initialSteps, setInitialSteps] = useState<StepAfterConvert[] | null>(
    null,
  );
  const [processingError, setProcessingError] = useState<string | null>(null);

  useEffect(() => {
    if (!prompt) {
      router.push("/");
    }
  }, [prompt, router]);

  const { data, error, isLoading } = useCreateApp({
    prompt: prompt || "",
  });

  useEffect(() => {
    if (!data) return;

    async function processData() {
      try {
        setProcessingError(null);
        const processedSteps = parseBoronActions(data);

        if (processedSteps?.metadata && processedSteps.steps.length > 0) {
          setInitialSteps(processedSteps.steps);
        } else {
          setProcessingError("No valid steps found in response");
        }
      } catch (err) {
        console.error("Error processing response:", err);
        setProcessingError(
          err instanceof Error ? err.message : "Unknown error",
        );
      }
    }

    processData();
  }, [data]);

  if (!prompt) {
    return <div>loading...</div>;
  }

  if ((isLoading || !initialSteps) && !error) {
    return (
      <div className="h-screen bg-[#1C1C1C]">
        <EditorScreenSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-red-400">
          <h2 className="text-xl font-semibold mb-2">Error occurred</h2>
          <p>{error.message}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (processingError) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-red-400">
          <h2 className="text-xl font-semibold mb-2">Processing Error</h2>
          <p>{processingError}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (data && !initialSteps && !processingError) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Processing application data...</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<div>loading..</div>}>
      {initialSteps && <EditorScreen initialSteps={initialSteps} />}
    </Suspense>
  );
}
