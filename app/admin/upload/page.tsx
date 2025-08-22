"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload, X } from "lucide-react";
import Link from "next/link";

interface StickerFile {
  file: File;
  name: string;
  tags: string[];
}

export default function AdminUpload() {
  const [selectedFiles, setSelectedFiles] = useState<StickerFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const commonTags = [
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
    "sad",
    "angry",
    "love",
    "party",
    "cool",
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newStickerFiles: StickerFile[] = files.map((file) => ({
      file,
      name: file.name.split(".")[0].replace(/[-_]/g, " "),
      tags: [],
    }));
    setSelectedFiles((prev) => [...prev, ...newStickerFiles]);
  };

  const updateSticker = (
    index: number,
    field: keyof StickerFile,
    value: string | string[]
  ) => {
    setSelectedFiles((prev) =>
      prev.map((sticker, i) =>
        i === index ? { ...sticker, [field]: value } : sticker
      )
    );
  };

  const removeSticker = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const addTag = (index: number, tag: string) => {
    if (tag.trim()) {
      updateSticker(index, "tags", [...selectedFiles[index].tags, tag.trim()]);
    }
  };

  const removeTag = (stickerIndex: number, tagIndex: number) => {
    const newTags = selectedFiles[stickerIndex].tags.filter(
      (_, i) => i !== tagIndex
    );
    updateSticker(stickerIndex, "tags", newTags);
  };

  const handleUpload = async () => {
    setIsUploading(true);
    // TODO: Implement actual upload logic
    console.log("Upload stickers:", selectedFiles);

    // Simulate upload process
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsUploading(false);
    alert("Sticker upload tamamlandı! (Simulated)");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Admin Dashboard&apos;a Dön
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sticker Upload
          </h1>
          <p className="text-gray-600">
            Yeni sticker&apos;ları yükle ve metadata ekle
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Dosya Seçimi</CardTitle>
                <CardDescription>
                  Jpg, PNG, WebP formatlarında dosyalar seçin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="file-upload">Sticker Dosyaları</Label>
                    <Input
                      id="file-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="mt-1"
                    />
                  </div>

                  <div className="text-sm text-gray-500">
                    <p>• Minimum 300x300 boyut</p>
                    <p>• Yüksek çözünürlük tercih</p>
                    <p>• Script 512x512&apos;ye optimize eder</p>
                  </div>

                  {selectedFiles.length > 0 && (
                    <Button
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isUploading
                        ? "Yükleniyor..."
                        : `${selectedFiles.length} Sticker Yükle`}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {selectedFiles.length === 0 ? (
              <Card className="h-64 flex items-center justify-center">
                <CardContent>
                  <div className="text-center text-gray-500">
                    <Upload className="h-12 w-12 mx-auto mb-4" />
                    <p>Sticker dosyalarını seçin</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {selectedFiles.map((sticker, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {sticker.file.name}
                          </CardTitle>
                          <CardDescription>
                            {(sticker.file.size / 1024).toFixed(1)} KB
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSticker(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor={`name-${index}`}>Sticker Adı</Label>
                        <Input
                          id={`name-${index}`}
                          value={sticker.name}
                          onChange={(e) =>
                            updateSticker(index, "name", e.target.value)
                          }
                          placeholder="Sticker adı"
                        />
                      </div>

                      <div>
                        <Label>Tags</Label>
                        <div className="flex flex-wrap gap-2 mt-2 mb-3">
                          {sticker.tags.map((tag, tagIndex) => (
                            <div
                              key={tagIndex}
                              className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm flex items-center gap-1"
                            >
                              {tag}
                              <button
                                onClick={() => removeTag(index, tagIndex)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1 mb-2">
                            <span className="text-xs text-gray-500 mr-2">
                              Popüler:
                            </span>
                            {commonTags.slice(0, 8).map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => {
                                  if (!sticker.tags.includes(tag)) {
                                    addTag(index, tag);
                                  }
                                }}
                                disabled={sticker.tags.includes(tag)}
                                className="bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 px-2 py-1 rounded text-xs transition-colors"
                              >
                                {tag}
                              </button>
                            ))}
                          </div>

                          <Input
                            placeholder="Özel tag ekle (Enter'a bas)"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addTag(index, e.currentTarget.value);
                                e.currentTarget.value = "";
                              }
                            }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
