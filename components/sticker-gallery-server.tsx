import { DatabaseService } from "@/lib/database-service";
import { StickerGalleryClient } from "./sticker-gallery-client";

// Server Component - handles initial data fetching
export async function StickerGalleryServer() {
  try {
    // Fetch initial data on server
    const [initialData, popularTags] = await Promise.all([
      DatabaseService.getStickersPaginated({
        limit: 24,
        offset: 0,
      }),
      DatabaseService.getPopularTags(),
    ]);

    return (
      <StickerGalleryClient 
        initialStickers={initialData.stickers}
        initialTotalCount={initialData.totalCount}
        initialHasMore={initialData.hasMore}
        initialNextOffset={initialData.nextOffset || 0}
        popularTags={popularTags}
      />
    );
  } catch (error) {
    console.error("❌ Server-side data loading failed:", error);
    
    // Fallback to client-only mode with empty data
    return (
      <StickerGalleryClient 
        initialStickers={[]}
        initialTotalCount={0}
        initialHasMore={false}
        initialNextOffset={0}
        popularTags={[]}
        serverError="Unable to load stickers from database. Please try refreshing the page."
      />
    );
  }
}