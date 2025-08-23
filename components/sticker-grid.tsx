"use client";

import { StickerCard } from "./sticker-card";
import { Button } from "@/components/ui/button";
import { type Database } from "@/lib/supabase";

type StickerData = Database["public"]["Tables"]["stickers"]["Row"];
type StickerSize = "small" | "medium" | "large";

interface StickerGridProps {
  displayedStickers: StickerData[];
  stickerSize: StickerSize;
  selectionMode: boolean;
  selectedStickers: Set<string>;
  onDownload: (stickerId: string) => Promise<void>;
  onPreview: () => void;
  onStickerSelection: (stickerId: string, selected: boolean) => void;
  onClearFilters: () => void;
}

export function StickerGrid({
  displayedStickers,
  stickerSize,
  selectionMode,
  selectedStickers,
  onDownload,
  onPreview,
  onStickerSelection,
  onClearFilters,
}: StickerGridProps) {
  const getGridClasses = () => {
    switch (stickerSize) {
      case "small":
        return "grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3";
      case "medium":
        return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4";
      case "large":
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6";
      default:
        return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4";
    }
  };

  const gridClasses = getGridClasses();

  if (displayedStickers.length > 0) {
    return (
      <div className={`grid gap-4 ${gridClasses}`}>
        {displayedStickers.map((sticker) => (
          <StickerCard
            key={sticker.id}
            id={sticker.id}
            name={sticker.name}
            imageUrl={sticker.file_url}
            downloadCount={sticker.download_count}
            tags={sticker.tags || []}
            onDownload={onDownload}
            onPreview={onPreview}
            selectionMode={selectionMode}
            isSelected={selectedStickers.has(sticker.id)}
            onSelectionChange={onStickerSelection}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">🔍</div>
      <h3 className="text-xl font-semibold mb-2">No stickers found</h3>
      <p className="text-muted-foreground mb-4">
        Try adjusting your search or tag filter to find what you&apos;re
        looking for.
      </p>
      <Button onClick={onClearFilters}>Clear Filters</Button>
    </div>
  );
}