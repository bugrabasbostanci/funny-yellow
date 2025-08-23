"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

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
  return (
    <>
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
    </>
  );
}