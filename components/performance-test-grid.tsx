"use client";

import { useState } from "react";
import { StickerCard } from "./sticker-card";
import { LazyStickerCard } from "./lazy-sticker-card";
import { Button } from "@/components/ui/button";
import { type Database } from "@/lib/supabase";

type StickerData = Database["public"]["Tables"]["stickers"]["Row"];

interface PerformanceTestGridProps {
  displayedStickers: StickerData[];
  onDownload: (id: string) => void;
  onPreview: () => void;
}

export function PerformanceTestGrid({
  displayedStickers,
  onDownload,
  onPreview,
}: PerformanceTestGridProps) {
  const [testMode, setTestMode] = useState<"native" | "manual">("native");

  return (
    <div className="space-y-6">
      {/* Test Mode Selector */}
      <div className="flex items-center justify-center gap-4 p-4 bg-muted/30 rounded-lg">
        <span className="text-sm font-medium">Lazy Loading Test:</span>
        <Button
          variant={testMode === "native" ? "default" : "outline"}
          size="sm"
          onClick={() => setTestMode("native")}
        >
          🚀 Native (loading=&ldquo;lazy&rdquo;)
        </Button>
        <Button
          variant={testMode === "manual" ? "default" : "outline"}
          size="sm"
          onClick={() => setTestMode("manual")}
        >
          🔍 Manual Intersection Observer
        </Button>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="p-3 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900">Native Lazy Loading</h3>
          <p className="text-blue-700">Browser handles intersection detection</p>
          <ul className="text-xs text-blue-600 mt-1">
            <li>• Automatic viewport detection</li>
            <li>• Optimized by browser engine</li>
            <li>• Works with Next.js Image optimization</li>
          </ul>
        </div>
        <div className="p-3 bg-green-50 rounded-lg">
          <h3 className="font-medium text-green-900">Manual Intersection Observer</h3>
          <p className="text-green-700">Custom control over loading behavior</p>
          <ul className="text-xs text-green-600 mt-1">
            <li>• Custom rootMargin control</li>
            <li>• Loading state indicators</li>
            <li>• Fine-grained viewport detection</li>
          </ul>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
        {displayedStickers.map((sticker) => {
          const commonProps = {
            key: sticker.id,
            id: sticker.id,
            name: sticker.name,
            imageUrl: sticker.file_url,
            downloadCount: sticker.download_count,
            tags: sticker.tags || [],
            onDownload,
            onPreview,
            selectionMode: false,
            isSelected: false,
          };

          return testMode === "native" ? (
            <StickerCard {...commonProps} />
          ) : (
            <LazyStickerCard {...commonProps} />
          );
        })}
      </div>

      {/* Instructions */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-medium text-yellow-900 mb-2">Performance Testing Instructions:</h3>
        <ol className="text-sm text-yellow-800 space-y-1">
          <li>1. Open browser DevTools → Network tab</li>
          <li>2. Switch between Native and Manual modes</li>
          <li>3. Scroll slowly and observe image loading behavior</li>
          <li>4. Compare network requests and loading timing</li>
          <li>5. Check Console for detailed loading logs</li>
        </ol>
      </div>
    </div>
  );
}