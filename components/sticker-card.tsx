"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Eye, Check } from "lucide-react";
import { useState } from "react";

interface StickerCardProps {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  downloadCount: number;
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
  category,
  imageUrl,
  downloadCount,
  selectionMode = false,
  isSelected = false,
  onSelectionChange,
  onDownload,
  onPreview,
}: StickerCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);


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
    setIsDownloading(true);

    try {
      const url = imageUrl || "/placeholder.svg";
      
      // Try to fetch the image first to handle CORS
      const response = await fetch(url, {
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      
      const blob = await response.blob();
      
      // Create download link with blob URL
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${name.replace(/\s+/g, "_")}_sticker.${url.split('.').pop()?.toLowerCase() || 'png'}`;
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
        window.open(imageUrl, '_blank');
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
          selectionMode && isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={selectionMode ? handleSelectionToggle : handlePreview}
      >
        {/* Sticker Container */}
        <div className="aspect-square relative bg-transparent border border-border/10 hover:border-border/30 rounded-2xl overflow-hidden hover:shadow-sm transition-all duration-200 p-4">
          {/* Selection checkbox */}
          {selectionMode && (
            <div className="absolute top-2 right-2 z-10">
              <div 
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                  isSelected 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-white border border-gray-300'
                }`}
              >
                {isSelected && <Check className="w-4 h-4" />}
              </div>
            </div>
          )}
          
          <img
            src={imageUrl || "/placeholder.svg"}
            alt={name}
            className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-105"
          />

          {/* Hover Actions - Only show in normal mode */}
          {!selectionMode && (
            <div
              className={`absolute inset-0 bg-black/20 flex items-center justify-center gap-2 transition-opacity duration-300 ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
            >
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
          <p className="text-sm font-medium text-foreground truncate leading-tight">
            {name}
          </p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-muted-foreground">
              {downloadCount > 1000
                ? `${(downloadCount / 1000).toFixed(1)}k`
                : downloadCount.toLocaleString()}{" "}
              downloads
            </p>
            {downloadCount > 20000 && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                🔥 Trending
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">{name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="aspect-square bg-transparent border border-border/10 rounded-xl p-8">
              <img
                src={imageUrl || "/placeholder.svg"}
                alt={name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Category: {category}</span>
              <div className="flex items-center gap-2">
                <span>{downloadCount.toLocaleString()} downloads</span>
                {downloadCount > 20000 && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                    🔥 Trending
                  </span>
                )}
              </div>
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
