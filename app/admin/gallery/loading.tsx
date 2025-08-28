import { SkeletonGrid } from "@/components/skeleton-card";

export default function Loading() {
  return (
    <div className="container mx-auto p-6">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 bg-muted/50 rounded w-48 animate-pulse mb-2"></div>
        <div className="h-5 bg-muted/50 rounded w-96 animate-pulse"></div>
      </div>

      {/* Controls skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="h-10 bg-primary/20 rounded w-32 animate-pulse"></div>
        <div className="h-10 bg-muted/50 rounded flex-1 animate-pulse"></div>
        <div className="h-10 bg-muted/50 rounded w-24 animate-pulse"></div>
      </div>

      {/* Stats skeleton */}
      <div className="mb-6">
        <div className="h-5 bg-muted/50 rounded w-40 animate-pulse"></div>
      </div>

      {/* Gallery skeleton */}
      <SkeletonGrid count={20} />
    </div>
  );
}