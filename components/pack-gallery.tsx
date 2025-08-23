"use client";

import { useState, useEffect, useMemo } from "react";
import { PackCard } from "./pack-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowLeft, X } from "lucide-react";
import { ErrorBoundary } from "./error-boundary";
import { loadPacksFromDatabase, type StickerPack } from "@/lib/pack-definitions";
import { DatabaseService } from "@/lib/database-service";
import { type Database } from "@/lib/supabase";
import { type StickerForDownload } from "@/lib/bulk-download-utils";

type StickerData = Database["public"]["Tables"]["stickers"]["Row"];

export function PackGallery() {
  const [searchQuery, setSearchQuery] = useState("");
  const [stickers, setStickers] = useState<StickerData[]>([]);
  const [packs, setPacks] = useState<StickerPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallbackData, setUsingFallbackData] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [stickersData, packsData] = await Promise.all([
          DatabaseService.getStickers(),
          loadPacksFromDatabase(),
        ]);
        setStickers(stickersData);
        setPacks(packsData);
        console.log("🔍 Loaded packs:", packsData.map(p => ({ id: p.id, name: p.name, previews: p.previewStickers })));
        
        // Pocoyo pack detayları
        const pocoyoPack = packsData.find(p => p.name.includes('Pocoyo'));
        if (pocoyoPack) {
          console.log("🔍 Pocoyo pack details:", pocoyoPack);
        }
        setUsingFallbackData(false);
      } catch (error) {
        console.error("Failed to load data for packs:", error);
        setUsingFallbackData(true);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredPacks = useMemo(() => {
    if (!searchQuery) return packs;
    
    return packs.filter((pack) =>
      pack.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pack.character.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pack.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, packs]);

  const handleDownload = async (stickerId: string) => {
    if (!usingFallbackData) {
      try {
        await DatabaseService.trackDownload(
          stickerId,
          "0.0.0.0",
          navigator.userAgent
        );
        
        const updatedSticker = await DatabaseService.getSticker(stickerId);
        setStickers((prevStickers) =>
          prevStickers.map((sticker) =>
            sticker.id === stickerId
              ? { ...sticker, download_count: updatedSticker.download_count }
              : sticker
          )
        );
      } catch (error) {
        console.error("Failed to track download:", error);
      }
    }
  };

  const handleBulkDownloadComplete = async (stickerIds: string[]) => {
    if (usingFallbackData) return;

    try {
      const refreshPromises = stickerIds.map(async (stickerId) => {
        try {
          const updatedSticker = await DatabaseService.getSticker(stickerId);
          return { id: stickerId, updatedData: updatedSticker };
        } catch (error) {
          console.error(`Could not refresh sticker ${stickerId}:`, error);
          return null;
        }
      });

      const refreshResults = await Promise.allSettled(refreshPromises);
      const successfulRefreshes = refreshResults
        .filter(
          (r): r is PromiseFulfilledResult<{
            id: string;
            updatedData: StickerData;
          }> => r.status === "fulfilled" && r.value !== null
        )
        .map((r) => r.value);

      if (successfulRefreshes.length > 0) {
        setStickers((prevStickers) =>
          prevStickers.map((sticker) => {
            const refresh = successfulRefreshes.find((r) => r.id === sticker.id);
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
      console.error("Error during bulk UI refresh:", error);
    }
  };

  if (loading) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading sticker packs...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {usingFallbackData && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p className="text-sm">
              <strong>Connection Error:</strong> Unable to load stickers from
              database. Pack downloads may not be tracked properly.
            </p>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="p-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-2xl sm:text-3xl font-bold font-display">
                Sticker Packs
              </h1>
            </div>
            <p className="text-muted-foreground">
              Browse {packs.length} curated character collections
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search packs by name or character"
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

        {/* Pack Stats */}
        <div className="flex items-center gap-4 mb-6">
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {filteredPacks.length} pack{filteredPacks.length !== 1 ? "s" : ""} available
          </Badge>
          <span className="text-sm text-muted-foreground">
            {packs.reduce((total, pack) => total + pack.totalStickers, 0)} total stickers
          </span>
        </div>

        {/* Pack Grid */}
        {filteredPacks.length > 0 ? (
          <ErrorBoundary>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPacks.map((pack) => {
                // For database packs, find stickers by pack.stickerIds (which contains slugs)
                const packStickers = stickers.filter(sticker => 
                  pack.stickerIds.some(packStickerId => 
                    sticker.slug === packStickerId || 
                    sticker.name.toLowerCase().replace(/\s+/g, '-') === packStickerId ||
                    sticker.name.toLowerCase().includes(packStickerId.toLowerCase())
                  )
                );
                
                console.log(`🔍 Pack "${pack.name}" stickers:`, {
                  packId: pack.id,
                  expectedStickerIds: pack.stickerIds,
                  foundStickers: packStickers.map(s => ({ id: s.id, name: s.name, slug: s.slug })),
                  allStickers: stickers.slice(0, 3).map(s => ({ id: s.id, name: s.name, slug: s.slug }))
                });
                
                const stickerForDownload: StickerForDownload[] = packStickers.map(
                  (sticker) => ({
                    id: sticker.id,
                    name: sticker.name,
                    tags: sticker.tags || [],
                    imageUrl: sticker.file_url,
                  })
                );

                return (
                  <ErrorBoundary key={pack.id}>
                    <PackCard
                      pack={pack}
                      stickers={stickerForDownload}
                      onDownload={handleDownload}
                      onBulkDownloadComplete={handleBulkDownloadComplete}
                    />
                  </ErrorBoundary>
                );
              })}
            </div>
          </ErrorBoundary>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold mb-2">No packs found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search to find the perfect sticker pack.
            </p>
            <Button onClick={() => setSearchQuery("")}>
              Clear Search
            </Button>
          </div>
        )}

        {/* Back to Gallery Link */}
        <div className="text-center mt-12">
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/")}
            className="px-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Gallery
          </Button>
        </div>
      </div>
    </section>
  );
}