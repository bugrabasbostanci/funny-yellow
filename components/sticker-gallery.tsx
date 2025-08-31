"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { StickerHeader } from "./sticker-header";
import { StickerFilters } from "./sticker-filters";
import { StickerControls } from "./sticker-controls";
import { StickerGrid } from "./sticker-grid";
import { StickerPagination } from "./sticker-pagination";
import { DownloadOptionsModal } from "./download-options-modal";
import { ScrollToTopButton } from "./scroll-to-top-button";
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

  // Server-side pagination state
  const [displayedStickers, setDisplayedStickers] = useState<StickerData[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentOffset, setCurrentOffset] = useState(0);
  const itemsPerPage = 24;

  // Bulk download state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedStickers, setSelectedStickers] = useState<Set<string>>(
    new Set()
  );
  const [stickerSize, setStickerSize] = useState<StickerSize>("medium");
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  // Load initial data on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);


        // Fetch first page of stickers and popular tags
        const [paginatedData, tagsData] = await Promise.all([
          DatabaseService.getStickersPaginated({
            limit: itemsPerPage,
            offset: 0,
            search: searchQuery || undefined,
            tag: selectedTag !== "all" ? selectedTag : undefined,
          }),
          DatabaseService.getPopularTags(),
        ]);


        setDisplayedStickers(paginatedData.stickers);
        setHasMore(paginatedData.hasMore);
        setTotalCount(paginatedData.totalCount);
        setCurrentOffset(paginatedData.nextOffset || 0);
        setPopularTags(tagsData);

        // Keep stickers state for compatibility (but it won't contain all data)
        setStickers(paginatedData.stickers);
      } catch (error) {
        console.error("❌ Initial data loading failed:", error);
        setError("Unable to load stickers from database. Please try refreshing the page.");
        setDisplayedStickers([]);
        setPopularTags([]);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount - filters handled by separate useEffect

  // Server-side filtering - trigger new API call when filters change
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  useEffect(() => {
    const reloadWithFilters = async () => {
      if (!initialLoadComplete) {
        setInitialLoadComplete(true);
        return; // Skip first run, let initial load handle it
      }
      
      try {
        setLoadingMore(true);

        const paginatedData = await DatabaseService.getStickersPaginated({
          limit: itemsPerPage,
          offset: 0, // Reset to first page
          search: searchQuery || undefined,
          tag: selectedTag !== "all" ? selectedTag : undefined,
        });


        setDisplayedStickers(paginatedData.stickers);
        setHasMore(paginatedData.hasMore);
        setTotalCount(paginatedData.totalCount);
        setCurrentOffset(paginatedData.nextOffset || 0);
      } catch (error) {
        console.error("❌ Filter reload failed:", error);
        setError("Failed to apply filters. Please try again.");
      } finally {
        setLoadingMore(false);
      }
    };

    reloadWithFilters();
  }, [selectedTag, searchQuery, initialLoadComplete]); // Trigger when filters change

  // Load more stickers from server (true infinite scroll)
  const loadMoreStickers = useCallback(async () => {
    if (loadingMore || !hasMore) {
      return;
    }

    try {
      setLoadingMore(true);

      const paginatedData = await DatabaseService.getStickersPaginated({
        limit: itemsPerPage,
        offset: currentOffset,
        search: searchQuery || undefined,
        tag: selectedTag !== "all" ? selectedTag : undefined,
      });


      setDisplayedStickers((prev) => {
        // Prevent duplicates by checking existing IDs
        const existingIds = new Set(prev.map((s) => s.id));
        const uniqueNewStickers = paginatedData.stickers.filter(
          (s) => !existingIds.has(s.id)
        );
        return [...prev, ...uniqueNewStickers];
      });
      
      setHasMore(paginatedData.hasMore);
      setCurrentOffset(paginatedData.nextOffset || currentOffset);
      
    } catch (error) {
      console.error("❌ Load more failed:", error);
      setError("Failed to load more stickers. Please try again.");
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, currentOffset, searchQuery, selectedTag, itemsPerPage]);

  // No need for client-side reset - server handles filtering

  const handleDownload = async (stickerId: string) => {
    try {
      // Track download in database first
      await DatabaseService.trackDownload(
        stickerId,
        "0.0.0.0",
        navigator.userAgent
      );

      // Refresh the specific sticker's data from database
      await refreshStickerData(stickerId);
    } catch (error) {
      console.error("❌ Database tracking failed:", error);
      // Don't update UI if database fails
    }
  };

  // Helper function to refresh individual sticker data in displayed list
  const refreshStickerData = async (stickerId: string) => {
    try {
      const updatedSticker = await DatabaseService.getSticker(stickerId);
      
      // Update both stickers and displayedStickers for compatibility
      setStickers((prevStickers) =>
        prevStickers.map((sticker) =>
          sticker.id === stickerId
            ? { ...sticker, download_count: updatedSticker.download_count }
            : sticker
        )
      );
      
      setDisplayedStickers((prevDisplayed) =>
        prevDisplayed.map((sticker) =>
          sticker.id === stickerId
            ? { ...sticker, download_count: updatedSticker.download_count }
            : sticker
        )
      );
      
    } catch (refreshError) {
      console.error("⚠️ Could not refresh sticker data:", refreshError);
    }
  };

  // Handle bulk download completion
  const handleBulkDownloadComplete = async (stickerIds: string[]) => {

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
          stickersCount={totalCount}
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
            filteredStickers={displayedStickers}
            itemsPerPage={itemsPerPage}
            loadMoreStickers={loadMoreStickers}
            loadingMore={loadingMore}
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

      {/* Scroll to Top Button - positioned outside container for fixed positioning */}
      <ScrollToTopButton 
        showAfter={800}
        className="animate-in slide-in-from-right-2 fade-in-0 duration-500"
      />
    </section>
  );
}
