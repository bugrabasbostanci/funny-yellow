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
        <div ref={sentinelRef} className="text-center mt-8 py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">
            Loading more stickers...
          </p>
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