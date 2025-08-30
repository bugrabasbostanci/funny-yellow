"use client";

import { useState, useEffect } from "react";
import { PerformanceTestGrid } from "@/components/performance-test-grid";
import { DatabaseService } from "@/lib/database-service";
import { type Database } from "@/lib/supabase";

type StickerData = Database["public"]["Tables"]["stickers"]["Row"];

export default function LazyLoadingTest() {
  const [stickers, setStickers] = useState<StickerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTestData = async () => {
      try {
        setLoading(true);
        
        // Load first 48 stickers for testing (2 pages worth)
        const paginatedData = await DatabaseService.getStickersPaginated({
          limit: 48,
          offset: 0,
        });

        setStickers(paginatedData.stickers);
        console.log(`🧪 Loaded ${paginatedData.stickers.length} stickers for lazy loading test`);
      } catch (error) {
        console.error("❌ Test data loading failed:", error);
        setError("Failed to load test data");
      } finally {
        setLoading(false);
      }
    };

    loadTestData();
  }, []);

  const handleDownload = (stickerId: string) => {
    console.log(`🔽 Test download for sticker: ${stickerId}`);
  };

  const handlePreview = () => {
    console.log("👁️ Test preview");
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading Test Data...</h1>
          <div className="animate-pulse">Testing lazy loading approaches...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <h1 className="text-2xl font-bold mb-4">Test Error</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Lazy Loading Performance Test</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Compare Native Browser Lazy Loading vs Manual Intersection Observer approach. 
          Open DevTools Network tab and scroll to see the differences in loading behavior.
        </p>
      </div>

      <PerformanceTestGrid
        displayedStickers={stickers}
        onDownload={handleDownload}
        onPreview={handlePreview}
      />
      
      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Performance Analysis</h2>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <h3 className="font-medium mb-2">Native Lazy Loading (Current Implementation)</h3>
            <ul className="space-y-1 text-gray-600">
              <li>✅ Browser-optimized intersection detection</li>
              <li>✅ Works seamlessly with Next.js Image optimization</li>
              <li>✅ Automatic WebP/AVIF format selection</li>
              <li>✅ Built-in loading placeholders</li>
              <li>⚠️ Less control over loading behavior</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Manual Intersection Observer</h3>
            <ul className="space-y-1 text-gray-600">
              <li>✅ Fine-grained control over loading timing</li>
              <li>✅ Custom loading states and animations</li>
              <li>✅ Better debugging capabilities</li>
              <li>⚠️ Additional JavaScript overhead</li>
              <li>⚠️ Need to manage intersection detection manually</li>
              <li>⚠️ Potential conflicts with Next.js optimizations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}