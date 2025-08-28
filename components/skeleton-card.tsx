"use client";

export function SkeletonCard() {
  return (
    <div className="aspect-square relative bg-transparent border border-border/10 rounded-2xl overflow-hidden p-4 animate-pulse">
      {/* Main skeleton area */}
      <div className="aspect-square bg-muted/50 rounded-xl"></div>
      
      {/* Text skeleton */}
      <div className="mt-2 px-1">
        <div className="h-4 bg-muted/50 rounded w-3/4 mx-auto"></div>
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}