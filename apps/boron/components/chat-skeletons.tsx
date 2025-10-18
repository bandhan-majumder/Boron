import { Skeleton } from "./ui/skeleton"

export function ChatSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3">
      <Skeleton className="h-6 w-full rounded-sm" />
      <Skeleton className="h-6 w-full rounded-sm" />
      <Skeleton className="h-6 w-full rounded-sm" />
      <Skeleton className="h-6 w-full rounded-sm" />
      <Skeleton className="h-6 w-full rounded-sm" />
      <Skeleton className="h-6 w-full rounded-sm" />
      <Skeleton className="h-6 w-full rounded-sm" />
      <Skeleton className="h-6 w-full rounded-sm" />
      <Skeleton className="h-6 w-full rounded-sm" />
      <Skeleton className="h-6 w-full rounded-sm" />
    </div>
  )
}
