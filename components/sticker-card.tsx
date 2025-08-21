"use client";

import type React from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { SimplePlatformDetection } from "@/lib/simple-platform-detection";

interface StickerCardProps {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  downloadCount: number;
  onDownload?: (id: string) => void;
  onPreview?: (id: string) => void;
}

export function StickerCard({
  id,
  name,
  category,
  imageUrl,
  downloadCount,
  onDownload,
  onPreview,
}: StickerCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [recommendedFormat, setRecommendedFormat] = useState<'webp' | 'png'>('webp');

  // Create a view-only URL by adding transform parameters
  const getViewUrl = (url: string) => {
    try {
      // For Supabase storage URLs, add transform parameters to ensure inline viewing
      if (url.includes('supabase.co/storage')) {
        const urlObj = new URL(url);
        urlObj.searchParams.set('t', Date.now().toString()); // Cache bust
        return urlObj.toString();
      }
      return url;
    } catch {
      return url;
    }
  };

  useEffect(() => {
    setRecommendedFormat(SimplePlatformDetection.getRecommendedFormat());
  }, []);

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPreview(true);
    onPreview?.(id);
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDownloading(true);

    try {
      // Use platform-specific format
      const format = recommendedFormat;
      const url = imageUrl || "/placeholder.svg";
      
      // Handle Supabase storage URLs or local URLs
      let formatUrl = url;
      if (url.includes('supabase')) {
        // For Supabase URLs, assume both formats exist in storage
        formatUrl = url.replace(/\.(webp|png|jpg|jpeg)$/i, `.${format}`);
      } else {
        // For local URLs, simple replacement
        formatUrl = url.replace('.webp', `.${format}`);
      }
      
      // Download via fetch to handle CORS properly
      let response = await fetch(formatUrl);
      
      // If preferred format not found, try original format
      if (!response.ok && formatUrl !== url) {
        response = await fetch(url);
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      
      const blob = await response.blob();
      
      // Use actual format from successful response
      const actualFormat = formatUrl !== url && response.url === url 
        ? url.split('.').pop()?.toLowerCase() || format
        : format;
      
      // Create download link with blob URL
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${name}.${actualFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up blob URL
      URL.revokeObjectURL(blobUrl);

      onDownload?.(id);
    } catch {
      // Fallback: open in new tab if download fails
      window.open(imageUrl, '_blank');
    }

    setIsDownloading(false);
  };

  return (
    <>
      <Card
        className="group relative overflow-hidden bg-card hover:shadow-lg transition-all duration-300 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handlePreview}
      >
        {/* Sticker Image */}
        <div className="aspect-square relative bg-white/80 backdrop-blur-sm border border-yellow-200/20 shadow-sm p-4">
          <div className="relative w-full h-full">
            <Image
              src={imageUrl || "/placeholder.svg"}
              alt={`${name} sticker - ${category}`}
              fill
              className={`object-contain transition-transform duration-300 ${
                isHovered ? "scale-110" : "scale-100"
              }`}
              sizes="(max-width: 640px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          </div>

          {/* Hover Overlay */}
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
        </div>

        {/* Sticker Info */}
        <div className="p-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium text-sm truncate">{name}</h3>
            <Badge variant="outline" className="text-xs">
              {category}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{downloadCount.toLocaleString()} downloads</span>
            <span>{SimplePlatformDetection.getFormatDescription()}</span>
          </div>
        </div>
      </Card>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">{name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="aspect-square bg-white/80 backdrop-blur-sm border border-yellow-200/20 shadow-sm rounded-lg p-8 relative">
              <div className="relative w-full h-full">
                <Image
                  src={getViewUrl(imageUrl) || "/placeholder.svg"}
                  alt={`${name} sticker preview - ${category}`}
                  fill
                  className="object-contain"
                  sizes="400px"
                  unoptimized
                  priority={false}
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Category: {category}</span>
              <span>{downloadCount.toLocaleString()} downloads</span>
            </div>
            <div className="space-y-3">
              <Button
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full bg-primary hover:bg-primary/90"
              >
                <Download className="w-4 h-4 mr-2" />
                Download {recommendedFormat.toUpperCase()}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
