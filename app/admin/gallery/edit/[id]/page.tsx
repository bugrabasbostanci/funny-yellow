"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, X } from "lucide-react";
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

export default function EditSticker() {
  const router = useRouter();
  const params = useParams();
  const stickerId = params.id as string;

  const [sticker, setSticker] = useState<Sticker | null>(null);
  const [name, setName] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [slug, setSlug] = useState("");
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSticker = async () => {
      try {
        const response = await fetch(`/api/admin/stickers?limit=1000`);
        if (!response.ok) throw new Error("Failed to load stickers");
        
        const data = await response.json();
        const targetSticker = data.stickers.find((s: Sticker) => s.id === stickerId);
        
        if (!targetSticker) {
          alert("Sticker not found");
          router.push("/admin/gallery");
          return;
        }

        setSticker(targetSticker);
        setName(targetSticker.name);
        setTags(targetSticker.tags || []);
        setSlug(targetSticker.slug || "");
      } catch (error) {
        console.error("Error loading sticker:", error);
        alert("Error loading sticker");
        router.push("/admin/gallery");
      } finally {
        setLoading(false);
      }
    };

    if (stickerId) {
      loadSticker();
    }
  }, [stickerId, router]);

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (!sticker) return;

    setSaving(true);
    try {
      const response = await fetch("/api/admin/stickers", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: sticker.id,
          name: name.trim(),
          tags: tags,
          slug: slug.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Update failed");
      }

      alert("✅ Sticker updated successfully");
      router.push("/admin/gallery");
    } catch (error) {
      console.error("Save error:", error);
      alert(
        `❌ Save error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-500">Loading sticker...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!sticker) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-500">Sticker not found</p>
            <Link href="/admin/gallery" className="text-blue-600 hover:underline">
              Back to Gallery
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href="/admin/gallery"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Gallery
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Edit Sticker
          </h1>
          <p className="text-gray-600">Update sticker information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Sticker Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-gray-100 flex items-center justify-center p-4 rounded-lg">
                <div className="relative w-full h-full max-w-64 max-h-64">
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
              <div className="mt-4 text-sm text-gray-600">
                <p>Downloads: {sticker.download_count || 0}</p>
                <p>Created: {new Date(sticker.created_at).toLocaleDateString()}</p>
                {sticker.file_size && (
                  <p>Size: {(sticker.file_size / 1024).toFixed(1)} KB</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Edit Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sticker name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug
                </label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="sticker-slug"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <Button onClick={addTag} size="sm">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-red-100 hover:text-red-800"
                      onClick={() => removeTag(tag)}
                    >
                      {tag}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
                {tags.length === 0 && (
                  <p className="text-gray-500 text-sm">No tags added</p>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={saving || !name.trim()}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/admin/gallery")}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}