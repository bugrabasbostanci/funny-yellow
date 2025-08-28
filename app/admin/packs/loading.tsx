import { SkeletonPackGrid } from "@/components/skeleton-pack";

export default function Loading() {
  return (
    <div className="container mx-auto p-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 bg-muted/50 rounded w-48 animate-pulse"></div>
        <div className="h-10 bg-primary/20 rounded w-32 animate-pulse"></div>
      </div>

      {/* Search skeleton */}
      <div className="mb-6">
        <div className="h-10 bg-muted/50 rounded-lg animate-pulse"></div>
      </div>

      {/* Stats skeleton */}
      <div className="mb-6">
        <div className="h-5 bg-muted/50 rounded w-40 animate-pulse"></div>
      </div>

      {/* Pack Grid Skeleton */}
      <SkeletonPackGrid count={12} />
    </div>
  );
}