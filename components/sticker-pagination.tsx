"use client";

import { useEffect, useRef } from "react";
import { type Database } from "@/lib/supabase";

type StickerData = Database["public"]["Tables"]["stickers"]["Row"];

interface StickerPaginationProps {
  hasMore: boolean;
  displayedStickers: StickerData[];
  filteredStickers: StickerData[];
  itemsPerPage: number;
  loadMoreStickers: () => void;
}

export function StickerPagination({
  hasMore,
  displayedStickers,
  filteredStickers,
  itemsPerPage,
  loadMoreStickers,
}: StickerPaginationProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreStickers();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMoreStickers, hasMore]);

  return (
    <>
      {/* Infinite Scroll Sentinel */}
      {hasMore && displayedStickers.length > 0 && (
        <div ref={sentinelRef} className="mt-8 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square bg-muted/30 rounded-2xl animate-pulse">
                <div className="aspect-square bg-muted/50 rounded-xl m-4"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* End of results indicator */}
      {!hasMore &&
        displayedStickers.length > 0 &&
        filteredStickers.length > itemsPerPage && (
          <div className="text-center mt-8 py-4">
            <p className="text-sm text-muted-foreground">
              🎉 You&apos;ve seen all {filteredStickers.length} stickers!
            </p>
          </div>
        )}
    </>
  );
}