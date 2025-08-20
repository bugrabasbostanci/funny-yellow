"use client";

import { useState, useMemo } from "react";
import { StickerCard } from "./sticker-card";
import { CategoryFilter } from "./category-filter";
import { WhatsAppIntegration } from "./whatsapp-integration";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Grid3X3, Grid2X2, List, MessageCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

// Mock data for stickers - all free for MVP
const mockStickers = [
  {
    id: "1",
    name: "Laughing Face",
    category: "funny-emoji",
    imageUrl: "/placeholder.svg?height=200&width=200",
    downloadCount: 15420,
    isLiked: true,
  },
  {
    id: "2",
    name: "Thumbs Up",
    category: "reactions",
    imageUrl: "/placeholder.svg?height=200&width=200",
    downloadCount: 8930,
    isLiked: false,
  },
  {
    id: "3",
    name: "Crying Laughing",
    category: "memes",
    imageUrl: "/placeholder.svg?height=200&width=200",
    downloadCount: 23150,
    isLiked: true,
  },
  {
    id: "4",
    name: "Heart Eyes",
    category: "expressions",
    imageUrl: "/placeholder.svg?height=200&width=200",
    downloadCount: 12680,
    isLiked: false,
  },
  {
    id: "5",
    name: "Cute Cat",
    category: "animals",
    imageUrl: "/placeholder.svg?height=200&width=200",
    downloadCount: 19240,
    isLiked: true,
  },
  {
    id: "6",
    name: "Winking Face",
    category: "funny-emoji",
    imageUrl: "/placeholder.svg?height=200&width=200",
    downloadCount: 7850,
    isLiked: false,
  },
  {
    id: "7",
    name: "Angry React",
    category: "reactions",
    imageUrl: "/placeholder.svg?height=200&width=200",
    downloadCount: 5420,
    isLiked: false,
  },
  {
    id: "8",
    name: "Surprised Pikachu",
    category: "memes",
    imageUrl: "/placeholder.svg?height=200&width=200",
    downloadCount: 31200,
    isLiked: true,
  },
];

const categories = [
  { id: "funny-emoji", name: "Funny Emoji", count: 2, icon: "😄" },
  { id: "reactions", name: "Reactions", count: 2, icon: "👍" },
  { id: "memes", name: "Memes", count: 2, icon: "🤣" },
  { id: "expressions", name: "Expressions", count: 1, icon: "😍" },
  { id: "animals", name: "Animals", count: 1, icon: "🐱" },
];

type ViewMode = "grid-large" | "grid-small" | "list";

export function StickerGallery() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid-large");
  const [likedStickers, setLikedStickers] = useState<Set<string>>(
    new Set(["1", "3", "5", "8"])
  );
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [selectedStickers, setSelectedStickers] = useState<typeof mockStickers>([]);

  const { user, addToFavorites, removeFromFavorites, addToDownloadHistory } =
    useAuth();

  const filteredStickers = useMemo(() => {
    let filtered = mockStickers;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (sticker) => sticker.category === selectedCategory
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((sticker) =>
        sticker.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [selectedCategory, searchQuery]);

  const handleLike = (stickerId: string) => {
    if (likedStickers.has(stickerId)) {
      if (user) removeFromFavorites(stickerId);
      setLikedStickers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(stickerId);
        return newSet;
      });
    } else {
      if (user) addToFavorites(stickerId);
      setLikedStickers((prev) => new Set(prev).add(stickerId));
    }
  };

  const handleDownload = (stickerId: string) => {
    if (user) {
      addToDownloadHistory(stickerId);
    }
    console.log("Downloading sticker:", stickerId);
  };

  const handlePreview = (stickerId: string) => {
    console.log("Previewing sticker:", stickerId);
  };

  const handleCreateWhatsAppPack = () => {
    const favoriteStickers = mockStickers.filter((sticker) =>
      user ? user.favorites.includes(sticker.id) : likedStickers.has(sticker.id)
    );

    if (favoriteStickers.length === 0) {
      // Show message to add favorites first
      return;
    }

    setSelectedStickers(favoriteStickers);
    setShowWhatsAppModal(true);
  };

  const getGridClasses = () => {
    switch (viewMode) {
      case "grid-large":
        return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
      case "grid-small":
        return "grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8";
      case "list":
        return "grid-cols-1";
      default:
        return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
    }
  };

  const favoriteCount = user ? user.favorites.length : likedStickers.size;

  return (
    <section className="py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display mb-2">
              Sticker Gallery
            </h2>
            <p className="text-muted-foreground">
              Discover {mockStickers.length} free stickers across{" "}
              {categories.length} categories
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            {favoriteCount > 0 && (
              <Button
                onClick={handleCreateWhatsAppPack}
                className="bg-success text-success-foreground hover:bg-success/90"
                size="sm"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Create Pack ({favoriteCount})
              </Button>
            )}

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant={viewMode === "grid-large" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid-large")}
              >
                <Grid2X2 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "grid-small" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid-small")}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
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
                for &ldquo;<span className="font-medium">{searchQuery}</span>&rdquo;
              </span>
            )}
          </p>
        </div>

        {/* Sticker Grid */}
        {filteredStickers.length > 0 ? (
          <div className={`grid gap-4 ${getGridClasses()}`}>
            {filteredStickers.map((sticker) => (
              <StickerCard
                key={sticker.id}
                id={sticker.id}
                name={sticker.name}
                category={
                  categories.find((cat) => cat.id === sticker.category)?.name ||
                  sticker.category
                }
                imageUrl={sticker.imageUrl}
                downloadCount={sticker.downloadCount}
                isLiked={
                  user
                    ? user.favorites.includes(sticker.id)
                    : likedStickers.has(sticker.id)
                }
                onLike={handleLike}
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
              Try adjusting your search or category filter to find what you&apos;re
              looking for.
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

        {/* WhatsApp Integration Modal */}
        <WhatsAppIntegration
          stickers={selectedStickers}
          isOpen={showWhatsAppModal}
          onClose={() => setShowWhatsAppModal(false)}
        />
      </div>
    </section>
  );
}
