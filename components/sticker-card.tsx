"use client";

import type React from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Eye, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { SimplePlatformDetection } from "@/lib/simple-platform-detection";

interface StickerCardProps {
  id: string;
  name: string;
  imageUrl: string;
  downloadCount: number;
  tags?: string[];
  // Selection mode props
  selectionMode?: boolean;
  isSelected?: boolean;
  onSelectionChange?: (id: string, selected: boolean) => void;
  onDownload?: (id: string) => void;
  onPreview?: (id: string) => void;
}

export function StickerCard({
  id,
  name,
  imageUrl,
  downloadCount,
  tags,
  selectionMode = false,
  isSelected = false,
  onSelectionChange,
  onDownload,
  onPreview,
}: StickerCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);

  // Debouncing for download action
  const downloadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastDownloadTimeRef = useRef<number>(0);

  // Cleanup timeouts on unmount
  useEffect(() => {
    const timeoutRef = downloadTimeoutRef.current;
    return () => {
      if (timeoutRef) {
        clearTimeout(timeoutRef);
      }
    };
  }, []);

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectionMode) return; // Don't open preview in selection mode
    setShowPreview(true);
    onPreview?.(id);
  };

  const handleSelectionToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectionChange?.(id, !isSelected);
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Debouncing: prevent rapid clicks
    const now = Date.now();
    const DEBOUNCE_TIME = 1000; // 1 second debounce

    if (now - lastDownloadTimeRef.current < DEBOUNCE_TIME) {
      console.log(
        `⚠️ Download debounced for sticker ${id} - too soon after last click`
      );
      return;
    }

    if (isDownloading) {
      console.log(`⚠️ Download already in progress for sticker ${id}`);
      return;
    }

    // Clear any existing timeout
    if (downloadTimeoutRef.current) {
      clearTimeout(downloadTimeoutRef.current);
    }

    lastDownloadTimeRef.current = now;
    setIsDownloading(true);

    console.log(`🔽 Starting debounced download for sticker ${id}`);

    try {
      const url = imageUrl || "/placeholder.svg";

      // Try to fetch the image first to handle CORS
      const response = await fetch(url, {
        mode: "cors",
        credentials: "omit",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const blob = await response.blob();

      // Create download link with blob URL
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      // Use platform detection to determine file format
      const recommendedFormat = SimplePlatformDetection.getRecommendedFormat();
      link.download = `${name.replace(
        /\s+/g,
        "_"
      )}-sticker.${recommendedFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up blob URL
      URL.revokeObjectURL(blobUrl);

      onDownload?.(id);
    } catch (error) {
      console.error("Error downloading sticker:", error);
      // Fallback: open in new tab if download fails
      try {
        window.open(imageUrl, "_blank");
      } catch (fallbackError) {
        console.error("Fallback download also failed:", fallbackError);
      }
    }

    setIsDownloading(false);
  };

  return (
    <>
      <div
        className={`group relative cursor-pointer ${
          selectionMode && isSelected
            ? "ring-2 ring-primary ring-offset-2 rounded-md"
            : ""
        }`}
        onClick={selectionMode ? handleSelectionToggle : handlePreview}
      >
        {/* Sticker Container */}
        <div className="aspect-square relative bg-transparent border border-border/10 hover:border-border/30 rounded-2xl overflow-hidden hover:shadow-sm transition-all duration-200 p-4">
          {/* Selection checkbox */}
          {selectionMode && (
            <div className="absolute top-2 right-2 z-10">
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-white border border-gray-300"
                }`}
              >
                {isSelected && <Check className="w-5 h-5" />}
              </div>
            </div>
          )}

          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={name}
            fill
            className="object-contain transition-transform duration-200 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Hover Actions - Only show in normal mode and on hover (desktop only) */}
          {!selectionMode && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center gap-2 transition-opacity duration-300 opacity-0 md:hover:opacity-100 pointer-events-none md:hover:pointer-events-auto">
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/90 hover:bg-white shadow-sm"
                onClick={handlePreview}
                title="Preview sticker"
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 shadow-sm"
                onClick={handleDownload}
                disabled={isDownloading}
                title="Download sticker"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Minimal Info */}
        <div className="mt-2 px-1">
          <p className="text-sm font-medium text-foreground truncate leading-tight text-center">
            {name}
          </p>
        </div>
      </div>

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">{name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="aspect-square bg-transparent border border-border/10 rounded-xl p-8 relative">
              <Image
                src={imageUrl || "/placeholder.svg"}
                alt={name}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-end text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>{downloadCount.toLocaleString()} downloads</span>
                  {downloadCount > 20000 && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                      🔥 Trending
                    </span>
                  )}
                </div>
              </div>

              {/* Tags */}
              {tags && tags.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">
                      Tags:
                    </span>
                    {tags.length > 4 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-6 px-2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowAllTags(!showAllTags)}
                      >
                        {showAllTags ? "Show Less" : `+${tags.length - 4} more`}
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(showAllTags ? tags : tags.slice(0, 4)).map(
                      (tag, index) => (
                        <span
                          key={index}
                          className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md"
                        >
                          {tag}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <Button
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full bg-primary hover:bg-primary/90"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
