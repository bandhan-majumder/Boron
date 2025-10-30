import { User, Bot, Loader2, Code, FileText } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

// Skeleton Components
export const ChatHistorySkeleton = () => (
  <div className="space-y-6 mb-6">
    <div className="flex gap-4 justify-end">
      <div className="max-w-[70%] space-y-2">
        <Skeleton className="h-16 w-80 rounded-lg" />
      </div>
      <User className="w-5 h-5 text-white" />
    </div>

    <div className="flex gap-4 justify-start">
      <Bot className="w-5 h-5 text-white" />
      <div className="max-w-[70%] space-y-2">
        <Skeleton className="h-20 w-96 rounded-lg" />
        <Skeleton className="h-10 w-46 rounded-lg" />
      </div>
    </div>

    <div className="flex gap-4 justify-end">
      <div className="max-w-[70%] space-y-2">
        <Skeleton className="h-16 w-80 rounded-lg" />
      </div>
       <User className="w-5 h-5 text-white" />
    </div>

    <div className="flex gap-4 justify-start">
     <Bot className="w-5 h-5 text-white" />
      <div className="max-w-[70%] space-y-2">
        <Skeleton className="h-24 w-[450px] rounded-lg" />
        <Skeleton className="h-10 w-46 rounded-lg" />
      </div>
    </div>
  </div>
);

export const InitializingSkeleton = () => (
  <div className="flex flex-col items-center justify-center py-12 space-y-4">
    <div className="relative">
      <Skeleton className="w-16 h-16 rounded-full" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    </div>
    <div className="space-y-2 text-center">
      <Skeleton className="h-4 w-40 mx-auto" />
      <Skeleton className="h-3 w-32 mx-auto" />
    </div>
  </div>
);

export const GeneratingFilesSkeleton = () => (
  <div className="flex flex-col items-center justify-center py-12 space-y-6">
    <div className="relative">
      <Skeleton className="w-20 h-20 rounded-xl" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Code className="w-10 h-10 text-green-500 animate-pulse" />
      </div>
    </div>
    <div className="space-y-3 text-center">
      <Skeleton className="h-5 w-48 mx-auto" />
      <div className="flex gap-2 justify-center">
        <Skeleton className="h-2 w-2 rounded-full animate-bounce" />
        <Skeleton className="h-2 w-2 rounded-full animate-bounce [animation-delay:0.2s]" />
        <Skeleton className="h-2 w-2 rounded-full animate-bounce [animation-delay:0.4s]" />
      </div>
    </div>
    {/* File generation progress skeleton */}
    <div className="w-full max-w-md space-y-2">
      <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
        <Skeleton className="w-6 h-6 rounded" />
        <Skeleton className="h-4 flex-1" />
      </div>
      <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
        <Skeleton className="w-6 h-6 rounded" />
        <Skeleton className="h-4 flex-1" />
      </div>
      <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
        <Skeleton className="w-6 h-6 rounded" />
        <Skeleton className="h-4 flex-1" />
      </div>
    </div>
  </div>
);

export const CreatingRoomSkeleton = () => (
  <div className="flex flex-col items-center justify-center py-12 space-y-6">
    <div className="relative">
      <Skeleton className="w-24 h-24 rounded-2xl" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
          <div className="absolute inset-0 flex items-center justify-center">
            <FileText className="w-6 h-6 text-blue-300" />
          </div>
        </div>
      </div>
    </div>
    <div className="space-y-3 text-center">
      <Skeleton className="h-6 w-56 mx-auto" />
      <Skeleton className="h-4 w-40 mx-auto" />
    </div>
    {/* Progress bar */}
    <div className="w-64 space-y-2">
      <Skeleton className="h-2 w-full rounded-full" />
      <div className="flex justify-between">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  </div>
);