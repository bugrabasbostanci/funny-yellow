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
import { ArrowLeft, Search, Edit, Trash2, Download } from "lucide-react";
import Link from "next/link";

interface Sticker {
  id: string;
  name: string;
  tags: string[];
  url: string;
  downloads: number;
  created_at: string;
}

export default function AdminGallery() {
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [filteredStickers, setFilteredStickers] = useState<Sticker[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [loading, setLoading] = useState(true);

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

  // Mock data - gerçek implementation'da Supabase'den gelecek
  useEffect(() => {
    const loadStickers = async () => {
      setLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockStickers: Sticker[] = [
        {
          id: "1",
          name: "Happy Face",
          tags: ["happy", "smile", "positive", "reactions"],
          url: "/stickers/webp/happy-face.webp",
          downloads: 156,
          created_at: "2024-01-15",
        },
        {
          id: "2",
          name: "Cat Meme",
          tags: ["cat", "meme", "funny", "animals"],
          url: "/stickers/webp/cat-meme.webp",
          downloads: 89,
          created_at: "2024-01-14",
        },
        {
          id: "3",
          name: "Celebration",
          tags: ["party", "celebration", "happy", "emoji"],
          url: "/stickers/webp/celebration.webp",
          downloads: 203,
          created_at: "2024-01-13",
        },
      ];

      setStickers(mockStickers);
      setFilteredStickers(mockStickers);
      setLoading(false);
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
    if (confirm("Bu sticker'ı silmek istediğinizden emin misiniz?")) {
      setStickers((prev) => prev.filter((s) => s.id !== id));
      // TODO: Implement actual delete logic
      console.log("Delete sticker:", id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Admin Dashboard&apos;a Dön
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sticker Yönetimi
          </h1>
          <p className="text-gray-600">
            Mevcut sticker&apos;ları görüntüle ve yönet
          </p>
        </div>

        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Filtrele ve Ara</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Sticker ara..."
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
                          {tag === "all" ? "Tüm Taglar" : tag}
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
            {filteredStickers.length} sticker gösteriliyor
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Sticker&apos;lar yükleniyor...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStickers.map((sticker) => (
              <Card key={sticker.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400 text-xs">Sticker</span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="mb-3">
                      <h3 className="font-semibold text-lg">{sticker.name}</h3>
                    </div>

                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {sticker.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {sticker.downloads}
                      </span>
                      <span>{sticker.created_at}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-3 w-3 mr-1" />
                        Düzenle
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-red-600 hover:text-red-700"
                        onClick={() => deleteSticker(sticker.id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Sil
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
                ? "Arama kriterlerinize uygun sticker bulunamadı."
                : "Henüz sticker yüklenmemiş."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
