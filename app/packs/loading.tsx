import { SkeletonPackGrid } from "@/components/skeleton-pack";

export default function Loading() {
  return (
    <section className="py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-8 bg-muted/50 rounded w-48 animate-pulse mb-4"></div>
          <div className="h-5 bg-muted/50 rounded w-96 animate-pulse mb-6"></div>
        </div>

        {/* Search skeleton */}
        <div className="mb-6">
          <div className="h-11 bg-muted/50 rounded-lg animate-pulse"></div>
        </div>

        {/* Pack Grid Skeleton */}
        <SkeletonPackGrid count={8} />
      </div>
    </section>
  );
}