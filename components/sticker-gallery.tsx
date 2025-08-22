"use client";

import { useState, useMemo, useEffect } from "react";
import { StickerCard } from "./sticker-card";
import { DownloadOptionsModal } from "./download-options-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Grid3X3,
  Grid2X2,
  LayoutGrid,
  X,
} from "lucide-react";
import { DatabaseService } from "@/lib/database-service";
import { type Database } from "@/lib/supabase";
import { type StickerForDownload } from "@/lib/bulk-download-utils";

// Use Supabase database types
type StickerData = Database["public"]["Tables"]["stickers"]["Row"];

type StickerSize = "small" | "medium" | "large";

export function StickerGallery() {
  const [selectedTag, setSelectedTag] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [stickers, setStickers] = useState<StickerData[]>([]);
  const [popularTags, setPopularTags] = useState<{tag: string, count: number}[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallbackData, setUsingFallbackData] = useState(false);

  // Bulk download state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedStickers, setSelectedStickers] = useState<Set<string>>(
    new Set()
  );
  const [stickerSize, setStickerSize] = useState<StickerSize>("medium");
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  // Load stickers and popular tags on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Fetch from database
        const [stickersData, tagsData] = await Promise.all([
          DatabaseService.getStickers(),
          DatabaseService.getPopularTags()
        ]);
        
        setStickers(stickersData);
        setPopularTags(tagsData);
        setUsingFallbackData(false);
      } catch {
        // If database fails, show error message
        setStickers([]);
        setPopularTags([]);
        setUsingFallbackData(true);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredStickers = useMemo(() => {
    let filtered = stickers;

    // Filter by tag
    if (selectedTag !== "all") {
      filtered = filtered.filter((sticker) =>
        sticker.tags?.includes(selectedTag)
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((sticker) => {
        const nameMatch = sticker.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const tagMatch = sticker.tags?.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return nameMatch || tagMatch;
      });
    }

    return filtered;
  }, [stickers, selectedTag, searchQuery]);

  const handleDownload = async (stickerId: string) => {
    // Track download in database if available
    if (!usingFallbackData) {
      try {
        await DatabaseService.trackDownload(
          stickerId,
          "0.0.0.0",
          navigator.userAgent
        );
      } catch {
        // Silently fail - tracking is not critical for user experience
      }
    }
  };

  const handlePreview = () => {
    // Preview functionality - could be used for analytics later
  };

  // Bulk download handlers
  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedStickers(new Set()); // Clear selection when toggling
  };

  const handleStickerSelection = (stickerId: string, selected: boolean) => {
    setSelectedStickers((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(stickerId);
      } else {
        newSet.delete(stickerId);
      }
      return newSet;
    });
  };

  const selectAllStickers = () => {
    const allFilteredStickerIds = new Set(
      filteredStickers.map((sticker) => sticker.id)
    );
    setSelectedStickers(allFilteredStickerIds);
  };

  const deselectAllStickers = () => {
    setSelectedStickers(new Set());
  };

  const isAllSelected =
    filteredStickers.length > 0 &&
    filteredStickers.every((sticker) => selectedStickers.has(sticker.id));

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

  const handleCreatePack = () => {
    if (selectedStickers.size === 0) {
      return;
    }
    setShowDownloadModal(true);
  };

  // Get selected stickers data for bulk download
  const selectedStickersData: StickerForDownload[] = useMemo(() => {
    return stickers
      .filter((sticker) => selectedStickers.has(sticker.id))
      .map((sticker) => ({
        id: sticker.id,
        name: sticker.name,
        tags: sticker.tags || [],
        imageUrl: sticker.file_url,
      }));
  }, [stickers, selectedStickers]);

  // Grid layout with size controls
  const gridClasses = getGridClasses();

  if (loading) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading stickers...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Database error indicator */}
        {usingFallbackData && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p className="text-sm">
              <strong>Connection Error:</strong> Unable to load stickers from
              database. Please check your connection and try refreshing the
              page.
            </p>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display mb-2">
              Sticker Gallery
            </h2>
            <p className="text-muted-foreground">
              Discover {stickers.length} free stickers with{" "}
              {popularTags.length}+ popular tags
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

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search stickers by name and tags"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 py-3 bg-secondary border-0 focus:ring-2 focus:ring-primary"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Tag Filter Buttons */}
        {popularTags.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedTag === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTag("all")}
                className="h-8"
              >
                All
              </Button>
              {popularTags.slice(0, 10).map(({ tag, count }) => (
                <Button
                  key={tag}
                  variant={selectedTag === tag ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTag(tag)}
                  className="h-8"
                >
                  #{tag} ({count})
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Results Info and Size Controls */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {selectionMode ? (
              <span className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary"
                >
                  {selectedStickers.size} of {filteredStickers.length} selected
                </Badge>
                {selectedTag !== "all" && (
                  <span className="text-muted-foreground">
                    from{" "}
                    <span className="font-medium">
                      #{selectedTag}
                    </span>
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
                {filteredStickers.length} sticker
                {filteredStickers.length !== 1 ? "s" : ""}
                {selectedTag !== "all" && (
                  <span className="hidden sm:inline">
                    {" "}
                    tagged with{" "}
                    <span className="font-medium">
                      #{selectedTag}
                    </span>
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

        {/* Sticker Grid */}
        {filteredStickers.length > 0 ? (
          <div className={`grid gap-4 ${gridClasses}`}>
            {filteredStickers.map((sticker) => (
              <StickerCard
                key={sticker.id}
                id={sticker.id}
                name={sticker.name}
                imageUrl={sticker.file_url}
                downloadCount={sticker.download_count}
                tags={sticker.tags || []}
                onDownload={handleDownload}
                onPreview={handlePreview}
                selectionMode={selectionMode}
                isSelected={selectedStickers.has(sticker.id)}
                onSelectionChange={handleStickerSelection}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No stickers found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or tag filter to find what
              you&apos;re looking for.
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedTag("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Load More */}
        {filteredStickers.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              Load More Stickers
            </Button>
          </div>
        )}

        {/* Download Options Modal */}
        <DownloadOptionsModal
          stickers={selectedStickersData}
          isOpen={showDownloadModal}
          onClose={() => setShowDownloadModal(false)}
        />
      </div>
    </section>
  );
}
