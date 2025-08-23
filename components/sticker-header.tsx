"use client";

import { Button } from "@/components/ui/button";

interface StickerHeaderProps {
  stickersCount: number;
  popularTagsCount: number;
  selectionMode: boolean;
  selectedStickers: Set<string>;
  toggleSelectionMode: () => void;
  handleCreatePack: () => void;
  selectAllStickers: () => void;
  deselectAllStickers: () => void;
  isAllSelected: boolean;
}

export function StickerHeader({
  stickersCount,
  popularTagsCount,
  selectionMode,
  selectedStickers,
  toggleSelectionMode,
  handleCreatePack,
  selectAllStickers,
  deselectAllStickers,
  isAllSelected,
}: StickerHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold font-display mb-2">
          Sticker Gallery
        </h2>
        <p className="text-muted-foreground">
          Discover {stickersCount} free stickers with {popularTagsCount}
          + popular tags
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mt-4 sm:mt-0 flex-wrap">
        {selectedStickers.size > 0 && selectionMode && (
          <Button
            onClick={handleCreatePack}
            className="bg-success text-success-foreground hover:bg-success/90"
            size="sm"
          >
            Create Pack ({selectedStickers.size})
          </Button>
        )}

        <Button
          variant={selectionMode ? "default" : "outline"}
          size="sm"
          onClick={toggleSelectionMode}
          className={`${
            !selectionMode
              ? "bg-success hover:bg-success/90 text-success-foreground border-success"
              : ""
          }`}
        >
          {selectionMode ? "Exit Select" : "Create Pack"}
        </Button>

        {/* Select All/Deselect All - only show in selection mode */}
        {selectionMode && (
          <Button
            variant="outline"
            size="sm"
            onClick={
              isAllSelected ? deselectAllStickers : selectAllStickers
            }
          >
            <span className="hidden sm:inline">
              {isAllSelected ? "Deselect All" : "Select All"}
            </span>
            <span className="sm:hidden">
              {isAllSelected ? "Deselect" : "Select All"}
            </span>
          </Button>
        )}
      </div>
    </div>
  );
}