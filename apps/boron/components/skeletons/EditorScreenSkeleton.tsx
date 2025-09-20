import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Skeleton,
} from "../../components/index";
import LoadingBars from "../../../../packages/ui/components/ui/BarsLoading";
import { Rocket } from "lucide-react";

function BuildStepItemSkeleton() {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-background">
      <div className="flex-shrink-0 mt-0.5">
        <Skeleton className="w-5 h-5 rounded-full bg-gray-200" />
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-4 w-3/4 bg-gray-200" />
        <Skeleton className="h-3 w-full bg-gray-200" />
      </div>
      <div className="flex-shrink-0">
        <Skeleton className="h-5 w-16 rounded-full bg-gray-200" />
      </div>
    </div>
  );
}

function FileExplorerSkeleton() {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-sm font-medium mb-3 text-foreground">
        <Skeleton className="h-4 w-24 bg-gray-200" />
      </div>
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center gap-2 px-2 py-1 rounded">
          <Skeleton className="w-4 h-4 bg-gray-200" />
          <Skeleton className="h-4 w-24 bg-gray-200" />
        </div>
      ))}
    </div>
  );
}

export default function EditorScreenSkeleton() {
  return (
    <div
      className="flex h-screen bg-background"
      role="status"
      aria-label="Loading editor"
    >
      <div className="w-96 border-r bg-card">
        <Card className="h-full rounded-none border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-24 bg-gray-200" />
              <Skeleton className="h-5 w-12 rounded-full bg-gray-200" />
            </div>
            <Skeleton className="w-full h-2 rounded-full mt-2 bg-gray-200" />
          </CardHeader>
          <CardContent className="pt-0 h-full overflow-y-auto">
            <div className="space-y-1">
              {Array.from({ length: 8 }).map((_, index) => (
                <BuildStepItemSkeleton key={index} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="w-80 border-r bg-card">
        <Card className="h-full rounded-none border-0">
          <CardHeader className="pb-4">
            <Skeleton className="h-6 w-28 bg-gray-200" />
          </CardHeader>
          <CardContent className="pt-0 h-full overflow-y-auto">
            <FileExplorerSkeleton />
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="border-b bg-background">
          <div className="flex items-center px-4 py-2">
            <div className="flex space-x-1">
              <Skeleton className="h-8 w-16 rounded-md bg-gray-200" />
              <Skeleton className="h-8 w-16 rounded-md bg-gray-200" />
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 space-y-8 overflow-y-auto">
          <div className=" flex flex-col justify-center items-center text-white h-[80vh]">
            <LoadingBars size={60} />
            <p className="text-white text-xl tracking-widest mt-5">
              building app...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
