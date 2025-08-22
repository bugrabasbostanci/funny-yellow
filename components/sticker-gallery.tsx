"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { StickerCard } from "./sticker-card";
import { DownloadOptionsModal } from "./download-options-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Grid3X3, Grid2X2, LayoutGrid, X } from "lucide-react";
import { DatabaseService } from "@/lib/database-service";
import { type Database } from "@/lib/supabase";
import { type StickerForDownload } from "@/lib/bulk-download-utils";

// Use Supabase database types
type StickerData = Database["public"]["Tables"]["stickers"]["Row"];

type StickerSize = "small" | "medium" | "large";

// Fallback data generation functions for when database is not available
async function generateFallbackStickerData(): Promise<StickerData[]> {
  // List of known sticker files (this would ideally be generated automatically)
  const stickerFiles = [
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "20",
    "21",
    "22",
    "23",
    "24",
    "25",
    "27",
    "3",
    "4",
    "5",
    "6",
    "8",
    "agent-sticker",
    "angry-walking-sticker",
    "binoculars-sticker",
    "bowing-down-sticker",
    "coban-sticker",
    "covering-ear-sticker",
    "crazy-sticker",
    "cute-manga-sticker",
    "denying-sticker",
    "depressed-sticker",
    "despair-sticker",
    "eyelid-pulling-sticker",
    "face-palm-sticker",
    "feet-up-sticker",
    "flower-sticker",
    "giving-hand-sticker",
    "hand-on-cheek-sticker",
    "hiding-smile-sticker",
    "hope-sticker",
    "image-Photoroom",
    "kermit-middle-finger",
    "kermit-sad",
    "kermit-sitting",
    "middle-finger-sticker",
    "monkey-side-eye",
    "nervous-sticker",
    "plants-and-zombies-aesthetic -sunflower",
    "pocoyo-angry-sticker",
    "pocoyo-sitting-crying-sticker",
    "pocoyo-sitting-happy-sticker",
    "pocoyo-sleeping-sticker",
    "pocoyo-standing-sticker",
    "pointing-eyes-sticker",
    "ponder-sticker",
    "poor-sticker",
    "refuse-sticker",
    "rose-sticker",
    "rubbing-belly-sticker",
    "shinny-smile-sticker",
    "shrek-funny",
    "shrek-rizz",
    "side-eye-sticker",
    "sly-sticker",
    "small-size-sticker",
    "smoking-cat-sticker",
    "spy-sticker",
    "suspicious-sticker",
    "thumos-down-sticker",
    "thump-up-winking-witcker",
    "thumps-up-sticker",
    "touching-nose-sticker",
    "villain-sticker",
    "wink-fingers-sticker",
    "wonder-female-sticker",
    "yuck-face-sticker",
  ];

  return stickerFiles.map((filename, index) => {
    const id = `fallback-${index}`;
    const name =
      filename.charAt(0).toUpperCase() + filename.slice(1).replace(/-/g, " ");
    const slug = filename.toLowerCase();

    // Simple tag generation based on filename
    const tags = generateTagsFromFilename(filename);

    return {
      id,
      name,
      slug,
      tags,
      file_url: `/stickers/source/${filename}.png`,
      thumbnail_url: `/stickers/source/${filename}.png`,
      file_size: 0,
      file_format: "png",
      width: 512,
      height: 512,
      download_count: 0, // Fallback mode - no real download tracking
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  });
}

function generateTagsFromFilename(filename: string): string[] {
  const baseTags = ["emoji", "reaction"];

  // Add specific tags based on filename patterns
  if (filename.includes("kermit")) baseTags.push("kermit", "meme");
  if (
    filename.includes("sad") ||
    filename.includes("depressed") ||
    filename.includes("despair")
  )
    baseTags.push("sad");
  if (filename.includes("happy") || filename.includes("smile"))
    baseTags.push("happy");
  if (filename.includes("angry")) baseTags.push("angry");
  if (filename.includes("funny")) baseTags.push("funny");
  if (filename.includes("cute")) baseTags.push("cute");
  if (filename.includes("finger")) baseTags.push("rude");
  if (filename.includes("monkey")) baseTags.push("monkey", "meme");
  if (filename.includes("shrek")) baseTags.push("shrek", "meme");
  if (filename.includes("pocoyo")) baseTags.push("pocoyo", "cartoon");
  if (filename.includes("flower") || filename.includes("rose"))
    baseTags.push("flower");

  return baseTags;
}

function generateFallbackTags() {
  return [
    { tag: "emoji", count: 50 },
    { tag: "reaction", count: 50 },
    { tag: "meme", count: 15 },
    { tag: "happy", count: 10 },
    { tag: "sad", count: 8 },
    { tag: "funny", count: 12 },
    { tag: "kermit", count: 3 },
    { tag: "cute", count: 5 },
  ];
}

export function StickerGallery() {
  const [selectedTag, setSelectedTag] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [stickers, setStickers] = useState<StickerData[]>([]);
  const [popularTags, setPopularTags] = useState<
    { tag: string; count: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [usingFallbackData, setUsingFallbackData] = useState(false);

  // Infinite scroll pagination state
  const [displayedStickers, setDisplayedStickers] = useState<StickerData[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const itemsPerPage = 24;
  const sentinelRef = useRef<HTMLDivElement>(null);

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

        // Add a small delay to ensure database consistency
        await new Promise((resolve) => setTimeout(resolve, 50));

        // Fetch from database
        const [stickersData, tagsData] = await Promise.all([
          DatabaseService.getStickers(),
          DatabaseService.getPopularTags(),
        ]);

        console.log(
          "✅ Database connection successful, loaded",
          stickersData.length,
          "stickers"
        );

        // Log a sample of download counts when loading from database
        const sampleStickers = stickersData.slice(0, 3);
        console.log(
          "📊 Sample download counts from database:",
          sampleStickers.map((s) => ({
            id: s.id.slice(0, 8),
            name: s.name,
            download_count: s.download_count,
          }))
        );

        // Double-check first few stickers for consistency
        console.log("🔍 Checking data consistency...");
        for (const sticker of sampleStickers) {
          try {
            const freshData = await DatabaseService.getSticker(sticker.id);
            if (freshData.download_count !== sticker.download_count) {
              console.warn(
                `⚠️ Data inconsistency detected for ${sticker.name}: list shows ${sticker.download_count}, fresh query shows ${freshData.download_count}`
              );
            }
          } catch (err) {
            console.error(`❌ Could not verify sticker ${sticker.id}:`, err);
          }
        }
        setStickers(stickersData);
        setPopularTags(tagsData);
        setUsingFallbackData(false);
      } catch (error) {
        // If database fails, use fallback local data
        console.error("❌ Database connection failed:", error);
        console.log("🔄 Using local fallback data");

        // Generate fallback sticker data from local files
        const fallbackStickers = await generateFallbackStickerData();

        setStickers(fallbackStickers);
        setPopularTags(generateFallbackTags());
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

  // Load more stickers for infinite scroll
  const loadMoreStickers = useCallback(() => {
    const startIndex = displayedStickers.length;
    const endIndex = startIndex + itemsPerPage;
    const newStickers = filteredStickers.slice(startIndex, endIndex);

    if (newStickers.length > 0) {
      setDisplayedStickers((prev) => {
        // Prevent duplicates by checking existing IDs
        const existingIds = new Set(prev.map((s) => s.id));
        const uniqueNewStickers = newStickers.filter(
          (s) => !existingIds.has(s.id)
        );
        return [...prev, ...uniqueNewStickers];
      });
      setHasMore(endIndex < filteredStickers.length);
    } else {
      setHasMore(false);
    }
  }, [filteredStickers, displayedStickers.length, itemsPerPage]);

  // Reset pagination when filters change
  useEffect(() => {
    const initialStickers = filteredStickers.slice(0, itemsPerPage);
    setDisplayedStickers(initialStickers);
    setHasMore(filteredStickers.length > itemsPerPage);
  }, [filteredStickers, itemsPerPage]);

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

  const handleDownload = async (stickerId: string) => {
    console.log(
      "🔽 Download started for sticker:",
      stickerId,
      "Database mode:",
      !usingFallbackData
    );

    // Only track download in database - no localStorage needed
    if (!usingFallbackData) {
      try {
        console.log("📊 Tracking individual download in database...");

        // Track download in database first
        await DatabaseService.trackDownload(
          stickerId,
          "0.0.0.0",
          navigator.userAgent
        );

        console.log("✅ Individual download tracked successfully in database");

        // Refresh the specific sticker's data from database
        await refreshStickerData(stickerId);
      } catch (error) {
        console.error("❌ Database tracking failed:", error);
        // Don't update UI if database fails
      }
    } else {
      console.log("⚠️ Fallback mode - download not tracked");
    }
  };

  // Helper function to refresh individual sticker data
  const refreshStickerData = async (stickerId: string) => {
    try {
      const updatedSticker = await DatabaseService.getSticker(stickerId);
      setStickers((prevStickers) =>
        prevStickers.map((sticker) =>
          sticker.id === stickerId
            ? { ...sticker, download_count: updatedSticker.download_count }
            : sticker
        )
      );
      console.log(
        `🔄 Updated UI: sticker ${stickerId} now shows download_count: ${updatedSticker.download_count}`
      );
    } catch (refreshError) {
      console.error("⚠️ Could not refresh sticker data:", refreshError);
    }
  };

  // Handle bulk download completion
  const handleBulkDownloadComplete = async (stickerIds: string[]) => {
    if (usingFallbackData) {
      console.log("⚠️ Fallback mode - bulk download UI update skipped");
      return;
    }

    console.log(
      `🔄 Refreshing UI for ${stickerIds.length} stickers after bulk download`
    );

    try {
      // Refresh data for all affected stickers in parallel
      const refreshPromises = stickerIds.map(async (stickerId) => {
        try {
          const updatedSticker = await DatabaseService.getSticker(stickerId);
          return { id: stickerId, updatedData: updatedSticker };
        } catch (error) {
          console.error(`⚠️ Could not refresh sticker ${stickerId}:`, error);
          return null;
        }
      });

      const refreshResults = await Promise.allSettled(refreshPromises);
      const successfulRefreshes = refreshResults
        .filter(
          (
            r
          ): r is PromiseFulfilledResult<{
            id: string;
            updatedData: StickerData;
          }> => r.status === "fulfilled" && r.value !== null
        )
        .map((r) => r.value);

      // Update all stickers at once
      if (successfulRefreshes.length > 0) {
        setStickers((prevStickers) =>
          prevStickers.map((sticker) => {
            const refresh = successfulRefreshes.find(
              (r) => r.id === sticker.id
            );
            return refresh
              ? {
                  ...sticker,
                  download_count: refresh.updatedData.download_count,
                }
              : sticker;
          })
        );

        console.log(
          `✅ Bulk UI update completed for ${successfulRefreshes.length}/${stickerIds.length} stickers`
        );
      }
    } catch (error) {
      console.error("❌ Error during bulk UI refresh:", error);
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
    const allDisplayedStickerIds = new Set(
      displayedStickers.map((sticker) => sticker.id)
    );
    setSelectedStickers(allDisplayedStickerIds);
  };

  const deselectAllStickers = () => {
    setSelectedStickers(new Set());
  };

  const isAllSelected =
    displayedStickers.length > 0 &&
    displayedStickers.every((sticker) => selectedStickers.has(sticker.id));

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
              Discover {stickers.length} free stickers with {popularTags.length}
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
                Showing {displayedStickers.length} of {filteredStickers.length}{" "}
                sticker
                {filteredStickers.length !== 1 ? "s" : ""}
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

        {/* Sticker Grid */}
        {displayedStickers.length > 0 ? (
          <div className={`grid gap-4 ${gridClasses}`}>
            {displayedStickers.map((sticker) => (
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
              Try adjusting your search or tag filter to find what you&apos;re
              looking for.
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

        {/* Download Options Modal */}
        <DownloadOptionsModal
          stickers={selectedStickersData}
          isOpen={showDownloadModal}
          onClose={() => setShowDownloadModal(false)}
          onDownload={handleDownload}
          onBulkDownloadComplete={handleBulkDownloadComplete}
        />
      </div>
    </section>
  );
}
