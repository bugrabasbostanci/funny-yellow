"use client";

import { useState, useMemo, useEffect } from "react";
import { StickerCard } from "./sticker-card";
import { CategoryFilter } from "./category-filter";
import { WhatsAppIntegration } from "./whatsapp-integration";
import { HowToGuide } from "./how-to-guide";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MessageCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { DatabaseService } from "@/lib/database-service";

// Fallback mock data for when database is not available
const mockStickers = [
  {
    id: "1",
    name: "Happy Face",
    category: "funny-emoji",
    file_url: "/stickers/webp/happy-face.webp",
    download_count: 15420,
    tags: ["happy", "smile", "positive"],
  },
  {
    id: "2",
    name: "Thumbs Up",
    category: "reactions",
    file_url: "/stickers/webp/thumbs-up.webp",
    download_count: 8930,
    tags: ["good", "approval", "like"],
  },
  {
    id: "3",
    name: "Crying Laugh",
    category: "memes",
    file_url: "/stickers/webp/crying-laugh.webp",
    download_count: 23150,
    tags: ["funny", "lol", "tears"],
  },
  {
    id: "4",
    name: "Heart Eyes",
    category: "expressions",
    file_url: "/stickers/webp/heart-eyes.webp",
    download_count: 12680,
    tags: ["love", "heart", "crush"],
  },
  {
    id: "5",
    name: "Cute Cat",
    category: "animals",
    file_url: "/stickers/webp/cute-cat.webp",
    download_count: 19240,
    tags: ["cat", "cute", "pet"],
  },
  {
    id: "6",
    name: "Winking Face",
    category: "funny-emoji",
    file_url: "/stickers/webp/winking-face.webp",
    download_count: 7850,
    tags: ["wink", "flirt", "secret"],
  },
  {
    id: "7",
    name: "Angry Face",
    category: "reactions",
    file_url: "/stickers/webp/angry-face.webp",
    download_count: 5420,
    tags: ["angry", "mad", "rage"],
  },
  {
    id: "8",
    name: "Shocked Face",
    category: "reactions",
    file_url: "/stickers/webp/shocked-face.webp",
    download_count: 31200,
    tags: ["surprised", "wow", "shock"],
  },
  {
    id: "9",
    name: "Cool Sunglasses",
    category: "expressions",
    file_url: "/stickers/webp/cool-sunglasses.webp",
    download_count: 14500,
    tags: ["cool", "sunglasses", "awesome"],
  },
  {
    id: "10",
    name: "Party Hat",
    category: "celebration",
    file_url: "/stickers/webp/party-hat.webp",
    download_count: 9800,
    tags: ["party", "celebration", "fun"],
  },
];

const mockCategories = [
  { id: "funny-emoji", name: "Funny Emoji", count: 2, icon: "😄" },
  { id: "reactions", name: "Reactions", count: 3, icon: "👍" },
  { id: "memes", name: "Memes", count: 1, icon: "🤣" },
  { id: "expressions", name: "Expressions", count: 2, icon: "😍" },
  { id: "animals", name: "Animals", count: 1, icon: "🐱" },
  { id: "celebration", name: "Celebration", count: 1, icon: "🎉" },
];

type StickerData = {
  id: string;
  name: string;
  category: string;
  file_url: string;
  download_count: number;
  tags?: string[];
};

type CategoryData = {
  id: string;
  name: string;
  count: number;
  icon: string;
};

// WhatsApp sticker format for integration
type WhatsAppSticker = {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  downloadCount: number;
  isLiked: boolean;
};

export function StickerGallery() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [likedStickers, setLikedStickers] = useState<Set<string>>(
    new Set() // Start with no liked stickers
  );
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [selectedStickers, setSelectedStickers] = useState<WhatsAppSticker[]>(
    []
  );
  const [stickers, setStickers] = useState<StickerData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallbackData, setUsingFallbackData] = useState(false);

  const { user, addToFavorites, removeFromFavorites, addToDownloadHistory } =
    useAuth();

  // Load stickers and categories on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Try to fetch from database
        const [stickersData, categoriesData] = await Promise.all([
          DatabaseService.getStickers(),
          DatabaseService.getCategories(),
        ]);

        setStickers(stickersData);
        setCategories(categoriesData);
        setUsingFallbackData(false);
      } catch (error) {
        console.warn("Database not available, using fallback data:", error);
        // Use fallback mock data
        setStickers(mockStickers);
        setCategories(mockCategories);
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

  const handleDownload = async (stickerId: string) => {
    if (user) {
      addToDownloadHistory(stickerId);
    }

    // Track download in database if available
    if (!usingFallbackData) {
      try {
        // Get user's IP address for tracking (in a real app, this would be done server-side)
        await DatabaseService.trackDownload(
          stickerId,
          "0.0.0.0",
          navigator.userAgent
        );
      } catch (error) {
        console.warn("Failed to track download:", error);
      }
    }

    console.log("Downloading sticker:", stickerId);
  };

  const handlePreview = (stickerId: string) => {
    console.log("Previewing sticker:", stickerId);
  };

  const handleCreateWhatsAppPack = () => {
    // Use current liked stickers for pack creation
    const favoriteStickers = stickers.filter((sticker) =>
      likedStickers.has(sticker.id)
    );

    if (favoriteStickers.length === 0) {
      // Show message to add favorites first
      return;
    }

    // Transform StickerData to WhatsApp Sticker format
    const whatsappStickers = favoriteStickers.map((sticker) => ({
      id: sticker.id,
      name: sticker.name,
      category: sticker.category,
      imageUrl: sticker.file_url,
      downloadCount: sticker.download_count,
      isLiked: likedStickers.has(sticker.id), // Use dynamic liked state
    }));

    setSelectedStickers(whatsappStickers);
    setShowWhatsAppModal(true);
  };

  // Simple grid layout for MVP
  const gridClasses =
    "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";

  // Use dynamic liked stickers count for accurate display
  const favoriteCount = likedStickers.size;

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
        {/* Database status indicator */}
        {usingFallbackData && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
            <p className="text-sm">
              <strong>Demo Mode:</strong> Using local sticker data. Database
              integration available in production.
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
