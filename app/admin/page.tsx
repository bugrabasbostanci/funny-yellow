import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Image as ImageIcon, Settings } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">Sticker yönetimi ve upload işlemleri</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Sticker Upload
              </CardTitle>
              <CardDescription>
                Yeni sticker&apos;ları yükle ve metadata ekle
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/upload">
                <Button className="w-full">Yeni Sticker Yükle</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Sticker Yönetimi
              </CardTitle>
              <CardDescription>
                Mevcut sticker&apos;ları görüntüle ve düzenle
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/gallery">
                <Button variant="outline" className="w-full">
                  Sticker&apos;ları Yönet
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Script İşlemleri
              </CardTitle>
              <CardDescription>
                Optimize, upload ve convert script&apos;lerini çalıştır
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/scripts">
                <Button variant="outline" className="w-full">
                  Script&apos;leri Çalıştır
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Son İşlemler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span>Source klasöründeki dosyalar</span>
                  <span className="text-gray-500">Kontrol edilecek</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Optimize edilecek sticker&apos;lar</span>
                  <span className="text-gray-500">Beklemede</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Upload edilecek dosyalar</span>
                  <span className="text-gray-500">Beklemede</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hızlı İstatistikler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Toplam Sticker</span>
                  <span className="font-semibold">~40</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Popüler Taglar</span>
                  <span className="font-semibold">12+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Son Upload</span>
                  <span className="text-gray-500">Manual process</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
