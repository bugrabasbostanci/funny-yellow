"use client";

export const runtime = 'edge';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  Save, 
  Package
} from "lucide-react";
import Link from "next/link";
import { DatabaseService } from "@/lib/database-service";
import Image from "next/image";
import { toast } from "sonner";

export default function CreatePackPage() {
  const router = useRouter();
  
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [packName, setPackName] = useState("");
  const [packDescription, setPackDescription] = useState("");
  const [packCharacter, setPackCharacter] = useState("");
  const [packThumbnail, setPackThumbnail] = useState("");

  const handleCreatePack = async () => {
    if (!packName.trim()) {
      toast.error("Pack adı gerekli", {
        description: "Please enter a name for the pack"
      });
      return;
    }

    try {
      setSaving(true);
      
      const newPack = await DatabaseService.createPack({
        name: packName,
        description: packDescription || null,
        character: packCharacter || null,
        thumbnail_url: packThumbnail || null
      });

      toast.success("Pack created successfully!", {
        description: "You can now add stickers to the pack"
      });
      
      // Redirect to edit page to add stickers
      router.push(`/admin/packs/edit/${newPack.id}`);
    } catch (error) {
      console.error("Error creating pack:", error);
      toast.error("Error creating pack", {
        description: "Please try again"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin/packs">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Create New Pack
              </h1>
              <p className="text-gray-600">
                Create a new sticker pack
              </p>
            </div>
          </div>
          
          <Button
            onClick={handleCreatePack}
            disabled={saving || !packName.trim()}
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Creating..." : "Create Pack"}
          </Button>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Pack Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Pack Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="pack-name">Pack Adı *</Label>
                <Input
                  id="pack-name"
                  value={packName}
                  onChange={(e) => setPackName(e.target.value)}
                  placeholder="Pack adını girin (örn: Sevimli Kediler)"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="pack-description">Description</Label>
                <Input
                  id="pack-description"
                  value={packDescription}
                  onChange={(e) => setPackDescription(e.target.value)}
                  placeholder="Short description about the pack (optional)"
                />
              </div>
              
              <div>
                <Label htmlFor="pack-character">Character</Label>
                <Input
                  id="pack-character"
                  value={packCharacter}
                  onChange={(e) => setPackCharacter(e.target.value)}
                  placeholder="Main character name (e.g., Kermit, Pepe)"
                />
              </div>

              <div>
                <Label htmlFor="pack-thumbnail">Thumbnail URL</Label>
                <Input
                  id="pack-thumbnail"
                  value={packThumbnail}
                  onChange={(e) => setPackThumbnail(e.target.value)}
                  placeholder="/stickers/source/sticker-name.png"
                />
                {packThumbnail && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-2">Önizleme:</p>
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={packThumbnail}
                        alt="Pack thumbnail preview"
                        width={64}
                        height={64}
                        priority={true}
                        className="object-contain w-auto h-auto"
                        onError={() => {
                          toast.error("Thumbnail could not be loaded", {
                            description: "Please enter a valid image URL"
                          });
                          setPackThumbnail("");
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">📝 Not</h4>
                <p className="text-sm text-blue-700">
                  You can add stickers on the edit page after creating the pack.
                  It is recommended to select one of the stickers in the pack as the thumbnail.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}