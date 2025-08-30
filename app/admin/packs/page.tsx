"use client";

export const runtime = 'edge';

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Package, 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  ArrowLeft,
  X 
} from "lucide-react";
import Link from "next/link";
import { DatabaseService } from "@/lib/database-service";
import { type Database } from "@/lib/supabase";
import Image from "next/image";
import { toast } from "sonner";

type PackData = Database["public"]["Tables"]["sticker_packs"]["Row"];

interface PackWithStats extends PackData {
  stickerCount: number;
  totalDownloads: number;
}

export default function AdminPacksPage() {
  const [packs, setPacks] = useState<PackWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [packToDelete, setPackToDelete] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    loadPacks();
  }, []);

  const loadPacks = async () => {
    try {
      setLoading(true);
      const packsData = await DatabaseService.getAllPacks();
      
      // Get stats for each pack
      const packsWithStats: PackWithStats[] = await Promise.all(
        packsData.map(async (pack) => {
          const stats = await DatabaseService.getPackStats(pack.id);
          return { 
            ...pack, 
            stickerCount: stats.stickerCount,
            totalDownloads: stats.totalDownloads
          };
        })
      );

      setPacks(packsWithStats);
    } catch (error) {
      console.error("Error loading packs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePack = useCallback(async () => {
    if (!packToDelete) return;

    try {
      await DatabaseService.deletePack(packToDelete.id);
      setPacks(prev => prev.filter(pack => pack.id !== packToDelete.id));
      toast.success("Pack başarıyla silindi", {
        description: `${packToDelete.name} pack has been removed from your system`
      });
      setPackToDelete(null);
    } catch (error) {
      console.error("Error deleting pack:", error);
      toast.error("Error deleting pack", {
        description: "Please try again or contact the system administrator"
      });
    }
  }, [packToDelete]);

  // packToDelete değiştiğinde silme işlemini gerçekleştir
  useEffect(() => {
    if (packToDelete) {
      handleDeletePack();
    }
  }, [packToDelete, handleDeletePack]);

  const filteredPacks = packs.filter(pack =>
    pack.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pack.character?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pack.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Pack&apos;ler yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Pack Yönetimi
            </h1>
            <p className="text-gray-600">
              Sticker pack&apos;lerini düzenle ve yönet
            </p>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Pack ara"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Create New Pack Button */}
          <Link href="/admin/packs/create">
            <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Pack Oluştur
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {packs.length}
              </div>
              <p className="text-sm text-gray-600">Toplam Pack</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {packs.reduce((sum, pack) => sum + pack.stickerCount, 0)}
              </div>
              <p className="text-sm text-gray-600">Toplam Sticker</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {packs.reduce((sum, pack) => sum + pack.totalDownloads, 0)}
              </div>
              <p className="text-sm text-gray-600">Toplam İndirme</p>
            </CardContent>
          </Card>
        </div>

        {/* Packs Grid */}
        {filteredPacks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPacks.map((pack) => (
              <Card key={pack.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Package className="w-5 h-5 text-yellow-600" />
                        {pack.name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {pack.description}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {pack.character}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Pack Preview */}
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                    {pack.thumbnail_url ? (
                      <Image
                        src={pack.thumbnail_url}
                        alt={pack.name}
                        width={100}
                        height={100}
                        priority={true}
                        className="object-contain"
                        onError={(e) => {
                          // If thumbnail fails to load, hide the image
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <Package className="w-12 h-12 text-gray-400" />
                    )}
                    {/* Fallback icon if image fails */}
                    <Package className="w-12 h-12 text-gray-400" style={{display: pack.thumbnail_url ? 'none' : 'block'}} />
                  </div>

                  {/* Pack Stats */}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sticker Sayısı:</span>
                    <Badge variant="outline">{pack.stickerCount}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Toplam İndirme:</span>
                    <Badge variant="outline">{pack.totalDownloads}</Badge>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Link href={`/admin/packs/edit/${pack.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="w-4 h-4 mr-2" />
                        Düzenle
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Pack&apos;i Sil</AlertDialogTitle>
                          <AlertDialogDescription>
                            <strong>{pack.name}</strong> pack&apos;ini silmek istediğinizden emin misiniz? 
                            Bu işlem geri alınamaz ve pack içindeki tüm sticker&apos;lar da silinecektir.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>İptal</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => setPackToDelete({ id: pack.id, name: pack.name })}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Sil
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery ? "Pack bulunamadı" : "Henüz pack yok"}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery 
                ? "Try changing your search criteria"
                : "İlk sticker pack&apos;inizi oluşturun"
              }
            </p>
            {searchQuery ? (
              <Button onClick={() => setSearchQuery("")}>
                Aramayı Temizle
              </Button>
            ) : (
              <Link href="/admin/packs/create">
                <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  İlk Pack&apos;i Oluştur
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}