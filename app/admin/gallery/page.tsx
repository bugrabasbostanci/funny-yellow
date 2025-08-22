"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Search,
  Edit,
  Trash2,
  Download,
  Grid3X3,
  Grid2X2,
  LayoutGrid,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Sticker {
  id: string;
  name: string;
  tags: string[];
  file_url: string;
  thumbnail_url?: string;
  download_count: number;
  created_at: string;
  slug?: string;
  file_size?: number;
}

type StickerSize = "small" | "medium" | "large";

export default function AdminGallery() {
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [filteredStickers, setFilteredStickers] = useState<Sticker[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [loading, setLoading] = useState(true);
  const [stickerSize, setStickerSize] = useState<StickerSize>("medium");

  const allTags = [
    "all",
    "funny",
    "reactions",
    "expressions",
    "animals",
    "memes",
    "celebration",
    "food",
    "nature",
    "objects",
    "emoji",
    "happy",
    "cool",
  ];

  // Load stickers from Supabase via API
  useEffect(() => {
    const loadStickers = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/admin/stickers?limit=1000");

        if (!response.ok) {
          throw new Error("Failed to load stickers");
        }

        const data = await response.json();
        setStickers(data.stickers || []);
        setFilteredStickers(data.stickers || []);
      } catch (error) {
        console.error("Error loading stickers:", error);
        alert("Error loading stickers");
        setStickers([]);
        setFilteredStickers([]);
      } finally {
        setLoading(false);
      }
    };

    loadStickers();
  }, []);

  useEffect(() => {
    let filtered = stickers;

    if (searchTerm) {
      filtered = filtered.filter(
        (sticker) =>
          sticker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sticker.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    if (selectedTag !== "all") {
      filtered = filtered.filter((sticker) =>
        sticker.tags.includes(selectedTag)
      );
    }

    setFilteredStickers(filtered);
  }, [stickers, searchTerm, selectedTag]);

  const deleteSticker = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sticker?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/stickers?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Delete failed");
      }

      // Remove from local state
      setStickers((prev) => prev.filter((s) => s.id !== id));
      alert("✅ Sticker deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      alert(
        `❌ Delete error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const getGridClasses = () => {
    switch (stickerSize) {
      case "small":
        return "grid-cols-3 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2";
      case "medium":
        return "grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4";
      case "large":
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6";
      default:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6";
    }
  };

  const getCardClasses = () => {
    switch (stickerSize) {
      case "small":
        return {
          imageContainer:
            "aspect-square bg-gray-100 flex items-center justify-center p-1",
          content: "p-1",
          title: "font-medium text-xs truncate",
          tagContainer: "mb-1",
          tag: "px-1 py-0.5 text-xs",
          stats: "text-xs mb-1",
          buttons: "flex gap-1",
          button: "flex-1 h-6 text-xs px-1",
        };
      case "medium":
        return {
          imageContainer:
            "aspect-square bg-gray-100 flex items-center justify-center p-2",
          content: "p-2",
          title: "font-medium text-sm truncate",
          tagContainer: "mb-2",
          tag: "px-1 py-0.5 text-xs",
          stats: "text-xs mb-2",
          buttons: "flex gap-1",
          button: "flex-1 h-7 text-xs px-2",
        };
      case "large":
        return {
          imageContainer:
            "aspect-square bg-gray-100 flex items-center justify-center p-3",
          content: "p-3",
          title: "font-semibold text-base truncate",
          tagContainer: "mb-3",
          tag: "px-2 py-1 text-sm",
          stats: "text-sm mb-3",
          buttons: "flex gap-2",
          button: "flex-1 h-8 text-sm px-3",
        };
      default:
        return {
          imageContainer:
            "aspect-square bg-gray-100 flex items-center justify-center p-2",
          content: "p-2",
          title: "font-medium text-sm truncate",
          tagContainer: "mb-2",
          tag: "px-1 py-0.5 text-xs",
          stats: "text-xs mb-2",
          buttons: "flex gap-1",
          button: "flex-1 h-7 text-xs px-2",
        };
    }
  };

  const cardClasses = getCardClasses();

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin Dashboard
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sticker Management
          </h1>
          <p className="text-gray-600">View and manage existing stickers</p>
        </div>

        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Filter and Search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search stickers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <Select value={selectedTag} onValueChange={setSelectedTag}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {allTags.map((tag) => (
                        <SelectItem key={tag} value={tag}>
                          {tag === "all" ? "All Tags" : tag}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-4 flex justify-between items-center">
          <p className="text-gray-600">
            Showing {filteredStickers.length} stickers
          </p>

          {/* Size Control Buttons */}
          <div className="flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm border">
            <button
              onClick={() => setStickerSize("small")}
              className={`h-8 w-8 p-0 rounded flex items-center justify-center transition-colors ${
                stickerSize === "small"
                  ? "bg-yellow-100 text-yellow-800"
                  : "hover:bg-gray-100"
              }`}
              title="Small size"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setStickerSize("medium")}
              className={`h-8 w-8 p-0 rounded flex items-center justify-center transition-colors ${
                stickerSize === "medium"
                  ? "bg-yellow-100 text-yellow-800"
                  : "hover:bg-gray-100"
              }`}
              title="Medium size"
            >
              <Grid2X2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setStickerSize("large")}
              className={`h-8 w-8 p-0 rounded flex items-center justify-center transition-colors ${
                stickerSize === "large"
                  ? "bg-yellow-100 text-yellow-800"
                  : "hover:bg-gray-100"
              }`}
              title="Large size"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading stickers...</p>
          </div>
        ) : (
          <div className={`grid ${getGridClasses()}`}>
            {filteredStickers.map((sticker) => (
              <Card key={sticker.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className={cardClasses.imageContainer}>
                    <div className="relative w-full h-full">
                      <Image
                        src={
                          sticker.file_url ||
                          sticker.thumbnail_url ||
                          "/placeholder-sticker.png"
                        }
                        alt={sticker.name}
                        fill
                        className="object-contain rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder-sticker.png";
                        }}
                      />
                    </div>
                  </div>

                  <div className={cardClasses.content}>
                    <div className={cardClasses.tagContainer}>
                      <h3 className={cardClasses.title} title={sticker.name}>
                        {sticker.name}
                      </h3>
                    </div>

                    <div className={cardClasses.tagContainer}>
                      <div className="flex flex-wrap gap-1">
                        {sticker.tags
                          .slice(0, stickerSize === "large" ? 4 : 2)
                          .map((tag, index) => (
                            <span
                              key={index}
                              className={`bg-blue-100 text-blue-800 rounded ${cardClasses.tag}`}
                            >
                              {tag}
                            </span>
                          ))}
                        {sticker.tags.length >
                          (stickerSize === "large" ? 4 : 2) && (
                          <span
                            className={`bg-gray-100 text-gray-600 rounded ${cardClasses.tag}`}
                          >
                            +
                            {sticker.tags.length -
                              (stickerSize === "large" ? 4 : 2)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      className={`flex justify-between items-center text-gray-500 ${cardClasses.stats}`}
                    >
                      <span className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {sticker.download_count || 0}
                      </span>
                    </div>

                    <div className={cardClasses.buttons}>
                      <Link href={`/admin/gallery/edit/${sticker.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`${cardClasses.button}`}
                        >
                          <Edit className="h-3 w-3" />
                          {stickerSize === "large" && (
                            <span className="ml-1">Edit</span>
                          )}
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`${cardClasses.button} text-red-600 hover:text-red-700`}
                        onClick={() => deleteSticker(sticker.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                        {stickerSize === "large" && (
                          <span className="ml-1">Delete</span>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredStickers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchTerm || selectedTag !== "all"
                ? "No stickers found matching your search criteria."
                : "No stickers uploaded yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
