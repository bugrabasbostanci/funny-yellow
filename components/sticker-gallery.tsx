"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { StickerHeader } from "./sticker-header";
import { StickerFilters } from "./sticker-filters";
import { StickerControls } from "./sticker-controls";
import { StickerGrid } from "./sticker-grid";
import { StickerPagination } from "./sticker-pagination";
import { DownloadOptionsModal } from "./download-options-modal";
import { ErrorBoundary } from "./error-boundary";
import { SkeletonGrid } from "./skeleton-card";
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
  const [popularTags, setPopularTags] = useState<
    { tag: string; count: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Infinite scroll pagination state
  const [displayedStickers, setDisplayedStickers] = useState<StickerData[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const itemsPerPage = 24;

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
        setError(null);

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
      } catch (error) {
        console.error("❌ Database connection failed:", error);
        setError("Unable to load stickers from database. Please try refreshing the page.");
        setStickers([]);
        setPopularTags([]);
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

  const handleDownload = async (stickerId: string) => {
    console.log("🔽 Download started for sticker:", stickerId);

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

  const handleCreatePack = () => {
    if (selectedStickers.size === 0) {
      return;
    }
    setShowDownloadModal(true);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedTag("all");
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

  if (loading) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="h-8 bg-muted/50 rounded w-64 animate-pulse mb-4"></div>
            <div className="h-5 bg-muted/50 rounded w-80 animate-pulse"></div>
          </div>
          <div className="mb-6">
            <div className="h-11 bg-muted/50 rounded-lg animate-pulse mb-6"></div>
            <div className="flex flex-wrap gap-2 mb-6">
              <div className="h-11 w-16 bg-muted/50 rounded-md animate-pulse"></div>
              <div className="h-11 w-20 bg-muted/50 rounded-md animate-pulse"></div>
              <div className="h-11 w-24 bg-muted/50 rounded-md animate-pulse"></div>
            </div>
          </div>
          <SkeletonGrid count={12} />
        </div>
      </section>
    );
  }

  return (
    <section id="sticker-gallery" className="py-4 sm:py-6 lg:py-8 scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Database error indicator */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p className="text-sm">
              <strong>Connection Error:</strong> {error}
            </p>
          </div>
        )}

        <StickerHeader
          stickersCount={stickers.length}
          popularTagsCount={popularTags.length}
          selectionMode={selectionMode}
          selectedStickers={selectedStickers}
          toggleSelectionMode={toggleSelectionMode}
          handleCreatePack={handleCreatePack}
          selectAllStickers={selectAllStickers}
          deselectAllStickers={deselectAllStickers}
          isAllSelected={isAllSelected}
        />

        <ErrorBoundary>
          <StickerFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedTag={selectedTag}
            setSelectedTag={setSelectedTag}
            popularTags={popularTags}
          />
        </ErrorBoundary>

        <ErrorBoundary>
          <StickerControls
            selectionMode={selectionMode}
            selectedStickers={selectedStickers}
            displayedStickers={displayedStickers}
            stickerSize={stickerSize}
            setStickerSize={setStickerSize}
            selectedTag={selectedTag}
          />
        </ErrorBoundary>

        <ErrorBoundary>
          <StickerGrid
            displayedStickers={displayedStickers}
            stickerSize={stickerSize}
            selectionMode={selectionMode}
            selectedStickers={selectedStickers}
            onDownload={handleDownload}
            onPreview={handlePreview}
            onStickerSelection={handleStickerSelection}
            onClearFilters={handleClearFilters}
          />
        </ErrorBoundary>

        <ErrorBoundary>
          <StickerPagination
            hasMore={hasMore}
            displayedStickers={displayedStickers}
            filteredStickers={filteredStickers}
            itemsPerPage={itemsPerPage}
            loadMoreStickers={loadMoreStickers}
          />
        </ErrorBoundary>

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
