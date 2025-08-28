import { SkeletonGrid } from "@/components/skeleton-card";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
      {/* Hero Section Skeleton */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="h-12 sm:h-16 bg-muted/50 rounded-lg animate-pulse mb-6 mx-auto max-w-2xl"></div>
            <div className="h-6 bg-muted/50 rounded animate-pulse mb-8 mx-auto max-w-3xl"></div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <div className="h-12 w-48 bg-primary/20 rounded-lg animate-pulse"></div>
              <div className="h-12 w-40 bg-muted/50 rounded-lg animate-pulse"></div>
            </div>
            
            {/* Stats skeleton */}
            <div className="grid grid-cols-2 gap-8 max-w-lg mx-auto">
              <div className="text-center">
                <div className="h-10 bg-muted/50 rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-muted/50 rounded animate-pulse w-20 mx-auto"></div>
              </div>
              <div className="text-center">
                <div className="h-10 bg-muted/50 rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-muted/50 rounded animate-pulse w-16 mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section Skeleton */}
      <section className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header skeleton */}
          <div className="mb-8">
            <div className="h-8 bg-muted/50 rounded w-64 animate-pulse mb-4"></div>
            <div className="h-5 bg-muted/50 rounded w-80 animate-pulse"></div>
          </div>

          {/* Filters skeleton */}
          <div className="mb-6">
            <div className="h-11 bg-muted/50 rounded-lg animate-pulse mb-6"></div>
            <div className="flex flex-wrap gap-2 mb-6">
              <div className="h-11 w-16 bg-muted/50 rounded-md animate-pulse"></div>
              <div className="h-11 w-20 bg-muted/50 rounded-md animate-pulse"></div>
              <div className="h-11 w-24 bg-muted/50 rounded-md animate-pulse"></div>
              <div className="h-11 w-28 bg-muted/50 rounded-md animate-pulse"></div>
            </div>
          </div>

          {/* Controls skeleton */}
          <div className="flex items-center justify-between mb-6">
            <div className="h-5 bg-muted/50 rounded w-32 animate-pulse"></div>
            <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
              <div className="h-11 w-11 bg-muted/70 rounded-md animate-pulse"></div>
              <div className="h-11 w-11 bg-muted/70 rounded-md animate-pulse"></div>
              <div className="h-11 w-11 bg-muted/70 rounded-md animate-pulse"></div>
            </div>
          </div>

          {/* Sticker Grid Skeleton */}
          <SkeletonGrid count={12} />
        </div>
      </section>
    </div>
  );
}