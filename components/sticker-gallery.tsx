"use client";

import { useState, useMemo, useEffect } from "react";
import { StickerCard } from "./sticker-card";
import { CategoryFilter } from "./category-filter";
import { HowToGuide } from "./how-to-guide";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { DatabaseService } from "@/lib/database-service";
import { type Database } from "@/lib/supabase";

// Use Supabase database types
type StickerData = Database['public']['Tables']['stickers']['Row'];

type CategoryData = {
  id: string;
  name: string;
  count: number;
  icon: string;
};

export function StickerGallery() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [stickers, setStickers] = useState<StickerData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallbackData, setUsingFallbackData] = useState(false);

  // Load stickers and categories on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Fetch from database
        const [stickersData, categoriesData] = await Promise.all([
          DatabaseService.getStickers(),
          DatabaseService.getCategories(),
        ]);

        setStickers(stickersData);
        setCategories(categoriesData);
        setUsingFallbackData(false);
      } catch {
        // If database fails, show error message
        setStickers([]);
        setCategories([]);
        setUsingFallbackData(true);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredStickers = useMemo(() => {
    let filtered = stickers;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (sticker) => sticker.category === selectedCategory
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
  }, [stickers, selectedCategory, searchQuery]);

  const handleDownload = async (stickerId: string) => {
    // Track download in database if available
    if (!usingFallbackData) {
      try {
        await DatabaseService.trackDownload(
          stickerId,
          "0.0.0.0",
          navigator.userAgent
        );
      } catch {
        // Silently fail - tracking is not critical for user experience
      }
    }
  };

  const handlePreview = () => {
    // Preview functionality - could be used for analytics later
  };

  // Simple grid layout for MVP
  const gridClasses =
    "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";

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
              <strong>Connection Error:</strong> Unable to load stickers from database. 
              Please check your connection and try refreshing the page.
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
              Discover {stickers.length} free stickers across{" "}
              {categories.length} categories
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            <HowToGuide />
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search stickers by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-3 bg-secondary border-0 focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Category Filter */}
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            Showing {filteredStickers.length} sticker
            {filteredStickers.length !== 1 ? "s" : ""}
            {selectedCategory !== "all" && (
              <span>
                {" "}
                in{" "}
                <span className="font-medium">
                  {categories.find((cat) => cat.id === selectedCategory)?.name}
                </span>
              </span>
            )}
            {searchQuery && (
              <span>
                {" "}
                for &ldquo;<span className="font-medium">{searchQuery}</span>
                &rdquo;
              </span>
            )}
          </p>
        </div>

        {/* Sticker Grid */}
        {filteredStickers.length > 0 ? (
          <div className={`grid gap-4 ${gridClasses}`}>
            {filteredStickers.map((sticker) => (
              <StickerCard
                key={sticker.id}
                id={sticker.id}
                name={sticker.name}
                category={
                  categories.find((cat) => cat.id === sticker.category)?.name ||
                  sticker.category
                }
                imageUrl={sticker.file_url}
                downloadCount={sticker.download_count}
                onDownload={handleDownload}
                onPreview={handlePreview}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No stickers found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or category filter to find what
              you&apos;re looking for.
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Load More */}
        {filteredStickers.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              Load More Stickers
            </Button>
          </div>
        )}

        {/* How To Add Guide Section - Static as per MVP docs */}
        <div className="bg-yellow-100 p-6 mt-12 rounded-lg">
          <h3 className="text-xl font-display font-bold mb-4 text-center">
            📱 How to Add Stickers to WhatsApp?
          </h3>

          <div className="grid md:grid-cols-2 gap-6 mt-4">
            <div className="bg-white/70 rounded-lg p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                📱 Mobile (Android/iOS):
              </h4>
              <ol className="text-sm space-y-1 text-gray-700">
                <li>1. Download any &quot;Sticker Maker&quot; app</li>
                <li>2. Import downloaded stickers</li>
                <li>3. Create pack & add to WhatsApp</li>
              </ol>
            </div>

            <div className="bg-white/70 rounded-lg p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                💻 Desktop/Web:
              </h4>
              <ol className="text-sm space-y-1 text-gray-700">
                <li>1. Open any chat in WhatsApp</li>
                <li>2. Click emoji icon → Sticker tab</li>
                <li>3. Click + and select downloaded file</li>
              </ol>
            </div>
          </div>

          <div className="text-center mt-6">
            <HowToGuide
              trigger={
                <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
                  View Detailed Guide
                </Button>
              }
            />
          </div>
        </div>

      </div>
    </section>
  );
}
