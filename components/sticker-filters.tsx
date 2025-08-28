"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface StickerFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTag: string;
  setSelectedTag: (tag: string) => void;
  popularTags: { tag: string; count: number }[];
}

export function StickerFilters({
  searchQuery,
  setSearchQuery,
  selectedTag,
  setSelectedTag,
  popularTags,
}: StickerFiltersProps) {
  const [showAllTags, setShowAllTags] = useState(false);
  const maxVisibleTags = 3; // Show only 3 tags initially on mobile

  return (
    <>
      {/* Search Bar */}
      <div className="relative mb-4 sm:mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="Search stickers by name and tags"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-12 py-2 sm:py-3 bg-secondary border-0 focus:ring-2 focus:ring-primary text-sm sm:text-base"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors w-11 h-11 flex items-center justify-center"
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
              className="h-9 sm:h-11 text-sm"
            >
              All
            </Button>
            {/* Mobile: Show limited tags, Desktop: Show all */}
            {popularTags
              .slice(0, showAllTags ? 10 : maxVisibleTags)
              .map(({ tag, count }) => (
                <Button
                  key={tag}
                  variant={selectedTag === tag ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTag(tag)}
                  className="h-9 sm:h-11 text-sm"
                >
                  {tag} ({count})
                </Button>
              ))}

            {/* Show More/Less button for mobile */}
            {popularTags.length > maxVisibleTags && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllTags(!showAllTags)}
                className="h-9 sm:h-11 text-sm text-muted-foreground hover:text-foreground sm:hidden"
              >
                {showAllTags ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-1" />
                    Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1" />+
                    {popularTags.length - maxVisibleTags} more
                  </>
                )}
              </Button>
            )}

            {/* Desktop: Show remaining tags */}
            <div className="hidden sm:contents">
              {popularTags.slice(maxVisibleTags, 10).map(({ tag, count }) => (
                <Button
                  key={tag}
                  variant={selectedTag === tag ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTag(tag)}
                  className="h-11 text-sm"
                >
                  {tag} ({count})
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
