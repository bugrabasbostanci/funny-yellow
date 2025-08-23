"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Grid3X3, Grid2X2, LayoutGrid } from "lucide-react";
import { type Database } from "@/lib/supabase";

type StickerData = Database["public"]["Tables"]["stickers"]["Row"];
type StickerSize = "small" | "medium" | "large";

interface StickerControlsProps {
  selectionMode: boolean;
  selectedStickers: Set<string>;
  displayedStickers: StickerData[];
  stickerSize: StickerSize;
  setStickerSize: (size: StickerSize) => void;
  selectedTag: string;
}

export function StickerControls({
  selectionMode,
  selectedStickers,
  displayedStickers,
  stickerSize,
  setStickerSize,
  selectedTag,
}: StickerControlsProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <p className="text-sm text-muted-foreground">
        {selectionMode ? (
          <span className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary"
            >
              {selectedStickers.size} of {displayedStickers.length} selected
            </Badge>
            {selectedTag !== "all" && (
              <span className="text-muted-foreground">
                from <span className="font-medium">#{selectedTag}</span>
              </span>
            )}
            {selectedStickers.size > 0 && (
              <span className="text-xs text-success font-medium">
                Ready to download!
              </span>
            )}
          </span>
        ) : (
          <>
            Showing {displayedStickers.length} stickers
            {selectedTag !== "all" && (
              <span className="hidden sm:inline">
                {" "}
                tagged with{" "}
                <span className="font-medium">#{selectedTag}</span>
              </span>
            )}
          </>
        )}
      </p>

      {/* Size Control Buttons */}
      <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
        <Button
          variant={stickerSize === "small" ? "default" : "ghost"}
          size="sm"
          onClick={() => setStickerSize("small")}
          className="h-8 w-8 p-0"
          title="Small size"
        >
          <Grid3X3 className="h-4 w-4" />
        </Button>
        <Button
          variant={stickerSize === "medium" ? "default" : "ghost"}
          size="sm"
          onClick={() => setStickerSize("medium")}
          className="h-8 w-8 p-0"
          title="Medium size"
        >
          <Grid2X2 className="h-4 w-4" />
        </Button>
        <Button
          variant={stickerSize === "large" ? "default" : "ghost"}
          size="sm"
          onClick={() => setStickerSize("large")}
          className="h-8 w-8 p-0"
          title="Large size"
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}