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
        description: "Lütfen pack için bir ad girin"
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

      toast.success("Pack başarıyla oluşturuldu!", {
        description: "Şimdi pack'e sticker ekleyebilirsiniz"
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
                Yeni Pack Oluştur
              </h1>
              <p className="text-gray-600">
                Yeni bir sticker pack&apos;i oluşturun
              </p>
            </div>
          </div>
          
          <Button
            onClick={handleCreatePack}
            disabled={saving || !packName.trim()}
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Oluşturuluyor..." : "Pack Oluştur"}
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
                <Label htmlFor="pack-description">Açıklama</Label>
                <Input
                  id="pack-description"
                  value={packDescription}
                  onChange={(e) => setPackDescription(e.target.value)}
                  placeholder="Pack hakkında kısa açıklama (isteğe bağlı)"
                />
              </div>
              
              <div>
                <Label htmlFor="pack-character">Karakter</Label>
                <Input
                  id="pack-character"
                  value={packCharacter}
                  onChange={(e) => setPackCharacter(e.target.value)}
                  placeholder="Ana karakter adı (örn: Kermit, Pepe)"
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
                        className="object-contain w-full h-full"
                        onError={() => {
                          toast.error("Thumbnail yüklenemedi", {
                            description: "Geçerli bir resim URL'si girin"
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
                  Pack oluşturduktan sonra düzenleme sayfasında sticker&apos;ları ekleyebilirsiniz.
                  Thumbnail olarak pack&apos;teki sticker&apos;lardan birini seçmeniz önerilir.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}