"use client";

export function SkeletonPack() {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-sm transition-all duration-200 animate-pulse">
      {/* Pack preview skeleton */}
      <div className="aspect-square bg-muted/50 p-4 relative">
        <div className="grid grid-cols-2 gap-2 h-full">
          <div className="bg-muted/70 rounded-lg"></div>
          <div className="bg-muted/70 rounded-lg"></div>
          <div className="bg-muted/70 rounded-lg"></div>
          <div className="bg-muted/70 rounded-lg"></div>
        </div>
      </div>
      
      {/* Pack info skeleton */}
      <div className="p-4 space-y-3">
        <div className="h-5 bg-muted/50 rounded w-3/4"></div>
        <div className="flex items-center justify-between">
          <div className="h-4 bg-muted/50 rounded w-16"></div>
          <div className="h-8 bg-muted/50 rounded w-20"></div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonPackGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonPack key={i} />
      ))}
    </div>
  );
}