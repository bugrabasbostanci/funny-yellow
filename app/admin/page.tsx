"use client";

export const runtime = 'edge';

import { useState, useEffect } from "react";
import { AdminAuthModal } from "@/components/admin-auth-modal";
import { useAdminAuth } from "@/lib/admin-auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Image as ImageIcon, BarChart3, Clock, TrendingUp, Download, Package, Home, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Stats {
  totalStickers: number;
  totalDownloads: number;
  uniqueTags: number;
  averageDownloads: number;
}

interface RecentUpload {
  id: string;
  name: string;
  created_at: string;
  download_count: number;
}

interface PopularSticker {
  id: string;
  name: string;
  download_count: number;
}

export default function AdminPage() {
  const router = useRouter();
  const { isAuthenticated, login, logout, getAuthHeader } = useAdminAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentUploads, setRecentUploads] = useState<RecentUpload[]>([]);
  const [popularStickers, setPopularStickers] = useState<PopularSticker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Auth context zaten auth durumunu kontrol ediyor
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const loadDashboardData = async () => {
        try {
          const response = await fetch('/api/admin/stats', {
            headers: {
              'Content-Type': 'application/json',
              ...getAuthHeader(),
            },
          });
          if (!response.ok) {
            throw new Error('Failed to load stats');
          }
          const data = await response.json();
          
          setStats(data.stats);
          setRecentUploads(data.recentUploads);
          setPopularStickers(data.popularStickers);
        } catch (error) {
          console.error('Error loading dashboard data:', error);
        } finally {
          setLoading(false);
        }
      };

      loadDashboardData();
    }
  }, [isAuthenticated, getAuthHeader]);

  const handleAuthSuccess = (token: string) => {
    login(token);
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    logout();
    router.push("/");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Checking authorization...</p>
        </div>
      </div>
    );
  }

  if (isLoggingOut) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Signing out...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
        <AdminAuthModal 
          open={true} 
          onOpenChange={() => {}} 
          onAuthSuccess={handleAuthSuccess}
        />
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">Sticker management and upload operations</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button variant="outline" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Home
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Sticker Upload
              </CardTitle>
              <CardDescription>
                Upload new stickers and add metadata
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/upload">
                <Button className="w-full">Upload New Stickers</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Sticker Management
              </CardTitle>
              <CardDescription>
                View and edit existing stickers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/gallery">
                <Button variant="outline" className="w-full">
                  Manage Stickers
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Pack Management
              </CardTitle>
              <CardDescription>
                Organize stickers into themed packs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/packs">
                <Button variant="outline" className="w-full">
                  Manage Packs
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analytics
              </CardTitle>
              <CardDescription>
                Platform statistics and reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {loading ? (
                  <div className="text-sm text-gray-500">Loading...</div>
                ) : stats ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>Total Stickers</span>
                      <Badge variant="secondary">{stats.totalStickers}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total Downloads</span>
                      <Badge variant="secondary">{stats.totalDownloads}</Badge>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-red-500">Failed to load data</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Uploads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loading ? (
                  <div className="text-sm text-gray-500">Loading...</div>
                ) : recentUploads.length > 0 ? (
                  recentUploads.map((upload) => (
                    <div key={upload.id} className="flex justify-between items-center text-sm">
                      <div>
                        <p className="font-medium">{upload.name}</p>
                        <p className="text-xs text-gray-500">{formatDate(upload.created_at)}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {upload.download_count} dl
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">No uploads yet</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Popular Stickers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loading ? (
                  <div className="text-sm text-gray-500">Loading...</div>
                ) : popularStickers.length > 0 ? (
                  popularStickers.map((sticker, index) => (
                    <div key={sticker.id} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-yellow-100 text-yellow-800 rounded-full flex items-center justify-center text-xs font-semibold">
                          {index + 1}
                        </span>
                        <span className="font-medium">{sticker.name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {sticker.download_count}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">No popular stickers yet</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Overview */}
        {!loading && stats && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Platform Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{stats.totalStickers}</div>
                    <div className="text-sm text-gray-600">Total Stickers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalDownloads}</div>
                    <div className="text-sm text-gray-600">Total Downloads</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.uniqueTags}</div>
                    <div className="text-sm text-gray-600">Unique Tags</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.averageDownloads}</div>
                    <div className="text-sm text-gray-600">Average Downloads</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      </div>
  );
}
