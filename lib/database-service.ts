import { supabase, type Database } from "./supabase";
import { getStickersByPack, type StickerPack } from "./pack-definitions";

// Note: We're using the regular supabase client (anon key) from frontend
// If RLS policies prevent reading downloads, we'll use a different approach

type StickerInsert = Database["public"]["Tables"]["stickers"]["Insert"];
type StickerData = Database["public"]["Tables"]["stickers"]["Row"];
type PackData = Database["public"]["Tables"]["sticker_packs"]["Row"];
type PackInsert = Database["public"]["Tables"]["sticker_packs"]["Insert"];
type PackItemData = Database["public"]["Tables"]["sticker_pack_items"]["Row"];
// type PackItemInsert = Database["public"]["Tables"]["sticker_pack_items"]["Insert"];

// Track ongoing download operations to prevent race conditions
const pendingDownloads = new Set<string>();

export class DatabaseService {
  // Fetch all stickers with optional filtering
  static async getStickers(options?: {
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    
    let query = supabase
      .from("stickers")
      .select("*")
      .order("created_at", { ascending: false });

    if (options?.search) {
      query = query.or(
        `name.ilike.%${options.search}%,tags.cs.{${options.search}}`
      );
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(
        options.offset,
        options.offset + (options.limit || 10) - 1
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching stickers:", error);
      throw new Error("Failed to fetch stickers");
    }


    return data || [];
  }

  // Get stickers with pagination info (for infinite scroll)
  static async getStickersPaginated(options: {
    limit: number;
    offset: number;
    search?: string;
    tag?: string;
  }) {
    
    let query = supabase
      .from("stickers")
      .select("*", { count: 'exact' })
      .order("created_at", { ascending: false });

    // Apply search filter
    if (options.search) {
      query = query.or(
        `name.ilike.%${options.search}%,tags.cs.{${options.search}}`
      );
    }

    // Apply tag filter
    if (options.tag && options.tag !== "all") {
      query = query.contains('tags', [options.tag]);
    }

    // Apply pagination
    query = query.range(
      options.offset,
      options.offset + options.limit - 1
    );

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching paginated stickers:", error);
      throw new Error("Failed to fetch stickers");
    }

    const totalCount = count || 0;
    const hasMore = (options.offset + options.limit) < totalCount;

    console.log(
      `📊 Paginated fetch: ${data?.length || 0} stickers, total: ${totalCount}, hasMore: ${hasMore}`
    );

    return {
      stickers: data || [],
      totalCount,
      hasMore,
      currentOffset: options.offset,
      nextOffset: hasMore ? options.offset + options.limit : null,
    };
  }

  // Get a single sticker by ID
  static async getSticker(id: string) {
    const { data, error } = await supabase
      .from("stickers")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching sticker:", error);
      throw new Error("Sticker not found");
    }

    return data;
  }

  // Get popular tags for search suggestions
  static async getPopularTags() {
    const { data, error } = await supabase
      .from("stickers")
      .select("tags");

    if (error) {
      console.error("Error fetching tags:", error);
      return [];
    }

    // Flatten and count all tags
    const tagCounts = data.reduce((acc, sticker) => {
      if (sticker.tags) {
        sticker.tags.forEach((tag: string) => {
          acc[tag] = (acc[tag] || 0) + 1;
        });
      }
      return acc;
    }, {} as Record<string, number>);

    // Return sorted by popularity (most used first), limited to top 10
    return Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));
  }

  // Track a download
  static async trackDownload(
    stickerId: string,
    ipAddress: string,
    userAgent?: string
  ) {
    // Prevent race conditions - check if download is already being processed
    if (pendingDownloads.has(stickerId)) {
      console.log(`⚠️  Download already in progress for sticker ${stickerId}, skipping...`);
      return;
    }

    // Mark as pending
    pendingDownloads.add(stickerId);

    try {
      // Hash IP address for privacy
      const encoder = new TextEncoder();
      const data = encoder.encode(ipAddress);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const ipHash = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      console.log(`🔍 Starting atomic download tracking for sticker: ${stickerId}`);

      // First, insert the download record and get the inserted record back
      const { data: insertedRecord, error: downloadError } = await supabase
        .from("downloads")
        .insert({
          sticker_id: stickerId,
          ip_hash: ipHash,
          user_agent: userAgent || null,
        })
        .select("id")
        .single();

      if (downloadError) {
        console.error("❌ Error inserting download record:", downloadError);
        throw new Error("Failed to track download");
      }

      console.log(`✅ Download record inserted successfully with ID: ${insertedRecord.id}`);

      // Small delay to ensure read-after-write consistency
      await new Promise(resolve => setTimeout(resolve, 100));

      // Now get the actual count from downloads table (source of truth)
      // RLS policies should now allow this
      const { data: downloadRecords, error: countError } = await supabase
        .from("downloads")
        .select("id")
        .eq("sticker_id", stickerId);

      if (countError) {
        console.error("❌ Error fetching downloads:", countError);
        console.log("⚠️ Falling back to manual increment...");
        
        // Fallback to manual increment if counting still fails
        const { data: currentSticker, error: fetchError } = await supabase
          .from("stickers")
          .select("download_count")
          .eq("id", stickerId)
          .single();

        if (fetchError) {
          throw new Error("Failed to fetch sticker for fallback update");
        }

        const fallbackCount = (currentSticker.download_count || 0) + 1;
        console.log(`📊 Using fallback increment: ${currentSticker.download_count} → ${fallbackCount}`);
        
        // Update with fallback count and return early
        const { error: updateError } = await supabase
          .from("stickers")
          .update({ download_count: fallbackCount })
          .eq("id", stickerId);

        if (updateError) {
          throw new Error("Failed to update download count with fallback");
        }

        console.log(`✅ Fallback update completed: ${fallbackCount}`);
        return;
      }

      const newCount = downloadRecords?.length || 0;
      console.log(`📊 Actual download count from downloads table: ${newCount} (${downloadRecords?.length} records fetched)`);
      
      // Verify our inserted record is in the list
      if (downloadRecords && downloadRecords.length > 0) {
        const ourRecord = downloadRecords.find(r => r.id === insertedRecord.id);
        console.log(`✅ Our inserted record found in results:`, ourRecord ? 'YES' : 'NO');
      }

      // Update sticker with the actual count from downloads table
      const { data: updateResult, error: updateError } = await supabase
        .from("stickers")
        .update({ download_count: newCount })
        .eq("id", stickerId)
        .select();

      if (updateError) {
        console.error("❌ Error updating sticker download count:", updateError);
        throw new Error("Failed to update download count");
      }

      if (!updateResult || updateResult.length === 0) {
        console.error("⚠️ Update succeeded but no rows affected - possible RLS issue");
        
        // Try a direct count query to see if we can read the updated value
        const { data: countCheck } = await supabase
          .from("stickers")
          .select("download_count")
          .eq("id", stickerId)
          .single();
        
        console.log(`📊 Current download_count after update attempt: ${countCheck?.download_count}`);
      }

      console.log(`✅ Atomic download tracking completed successfully`);
      console.log(`📊 Sticker ${stickerId} download_count updated to: ${newCount}`);
    } catch (error) {
      console.error(`❌ Error tracking download for sticker ${stickerId}:`, error);
      throw error;
    } finally {
      // Always clean up pending state
      pendingDownloads.delete(stickerId);
    }
  }

  // Admin function to create a new sticker
  static async createSticker(stickerData: StickerInsert) {
    const { data, error } = await supabase
      .from("stickers")
      .insert(stickerData)
      .select()
      .single();

    if (error) {
      console.error("Error creating sticker:", error);
      throw new Error("Failed to create sticker");
    }

    return data;
  }

  // Admin function to update sticker
  static async updateSticker(id: string, updates: Partial<StickerInsert>) {
    const { data, error } = await supabase
      .from("stickers")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating sticker:", error);
      throw new Error("Failed to update sticker");
    }

    return data;
  }

  // Get popular stickers (by download count)
  static async getPopularStickers(limit = 10) {
    const { data, error } = await supabase
      .from("stickers")
      .select("*")
      .order("download_count", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching popular stickers:", error);
      return [];
    }

    return data || [];
  }

  // Get recent downloads for analytics
  static async getDownloadStats(days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from("downloads")
      .select("downloaded_at, sticker_id, stickers(name)")
      .gte("downloaded_at", startDate.toISOString())
      .order("downloaded_at", { ascending: false });

    if (error) {
      console.error("Error fetching download stats:", error);
      return [];
    }

    return data || [];
  }

  // Track bulk downloads efficiently
  static async trackBulkDownload(
    stickerIds: string[],
    ipAddress: string,
    userAgent?: string
  ) {
    if (stickerIds.length === 0) {
      console.log("⚠️ No stickers to track for bulk download");
      return [];
    }

    console.log(`🔄 Tracking bulk download for ${stickerIds.length} stickers`);

    // Filter out any stickers that are already being processed
    const availableStickers = stickerIds.filter(id => !pendingDownloads.has(id));
    
    if (availableStickers.length !== stickerIds.length) {
      console.log(`⚠️ ${stickerIds.length - availableStickers.length} stickers already being processed`);
    }

    if (availableStickers.length === 0) {
      console.log("⚠️ All requested stickers are already being processed");
      return [];
    }

    // Mark all stickers as pending
    availableStickers.forEach(id => pendingDownloads.add(id));

    try {
      // Hash IP address for privacy
      const encoder = new TextEncoder();
      const data = encoder.encode(ipAddress);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const ipHash = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // Insert all download records in batch
      const downloadRecords = availableStickers.map(stickerId => ({
        sticker_id: stickerId,
        ip_hash: ipHash,
        user_agent: userAgent || null,
      }));

      const { error: downloadError } = await supabase
        .from("downloads")
        .insert(downloadRecords);

      if (downloadError) {
        console.error("❌ Error tracking bulk downloads:", downloadError);
        throw new Error("Failed to track bulk downloads");
      }

      console.log(`✅ Successfully tracked ${availableStickers.length} download records`);

      // Small delay to ensure read-after-write consistency for bulk operations
      await new Promise(resolve => setTimeout(resolve, 150));

      // Get actual download counts for all stickers from downloads table (source of truth)
      console.log(`📊 Getting actual download counts from downloads table...`);

      // Update download counts in parallel based on actual downloads table counts
      const updatePromises = availableStickers.map(async (stickerId) => {
        try {
          // Get actual count from downloads table for this sticker
          const { data: downloadRecords, error: countError } = await supabase
            .from("downloads")
            .select("id")
            .eq("sticker_id", stickerId);

          if (countError) {
            console.error(`❌ Error fetching downloads for ${stickerId}:`, countError);
            console.log(`⚠️ Using fallback increment for ${stickerId}...`);
            
            // Fallback to manual increment
            const { data: currentSticker, error: fetchError } = await supabase
              .from("stickers")
              .select("download_count")
              .eq("id", stickerId)
              .single();

            if (fetchError) {
              console.error(`❌ Error fetching sticker for fallback ${stickerId}:`, fetchError);
              return null;
            }

            const fallbackCount = (currentSticker.download_count || 0) + 1;
            console.log(`📊 Sticker ${stickerId}: fallback increment ${currentSticker.download_count} → ${fallbackCount}`);
            
            const { data: updateResult, error: updateError } = await supabase
              .from("stickers")
              .update({ download_count: fallbackCount })
              .eq("id", stickerId)
              .select();

            if (updateError) {
              console.error(`❌ Error updating sticker ${stickerId} with fallback:`, updateError);
              return null;
            }

            return updateResult?.[0];
          }

          const newCount = downloadRecords?.length || 0;
          console.log(`📊 Sticker ${stickerId}: actual download count = ${newCount} (${downloadRecords?.length} records)`);
          
          const { data: updateResult, error: updateError } = await supabase
            .from("stickers")
            .update({ download_count: newCount })
            .eq("id", stickerId)
            .select();

          if (updateError) {
            console.error(`❌ Error updating sticker ${stickerId}:`, updateError);
            return null;
          }

          console.log(`📈 Updated ${stickerId} download_count to: ${newCount}`);
          return updateResult?.[0];
        } catch (error) {
          console.error(`❌ Error processing sticker ${stickerId}:`, error);
          return null;
        }
      });

      const results = await Promise.allSettled(updatePromises);
      const successfulUpdates = results.filter(r => r.status === 'fulfilled' && r.value).length;

      console.log(`✅ Bulk download tracking complete: ${successfulUpdates}/${availableStickers.length} successful`);
      
      return results
        .map(r => r.status === 'fulfilled' ? r.value : null)
        .filter(Boolean);
        
    } catch (error) {
      console.error("❌ Error in bulk download tracking:", error);
      throw error;
    } finally {
      // Clean up all pending states
      availableStickers.forEach(id => pendingDownloads.delete(id));
    }
  }

  // Get all available sticker packs (now uses database)
  static async getPacks(): Promise<StickerPack[]> {
    const { loadPacksFromDatabase } = await import("./pack-definitions");
    return loadPacksFromDatabase();
  }

  // Get stickers for a specific pack
  static async getPackStickers(packId: string): Promise<StickerData[]> {
    const allStickers = await this.getStickers();
    return getStickersByPack(packId, allStickers);
  }

  // Track pack download (downloads all stickers in a pack)
  static async trackPackDownload(
    packId: string,
    ipAddress: string,
    userAgent?: string
  ) {
    const packData = await this.getPackById(packId);
    if (!packData) {
      throw new Error("Pack not found");
    }

    console.log(`📦 Tracking pack download for ${packData.name} (${packData.stickers.length} stickers)`);
    
    const stickerIds = packData.stickers.map(sticker => sticker.id);

    if (stickerIds.length === 0) {
      console.log("⚠️ No stickers found for pack in database");
      return [];
    }

    return this.trackBulkDownload(stickerIds, ipAddress, userAgent);
  }

  // ===== PACK MANAGEMENT METHODS =====

  // Get all packs from database
  static async getAllPacks(): Promise<PackData[]> {
    const { data, error } = await supabase
      .from("sticker_packs")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching packs:", error);
      throw new Error("Failed to fetch packs");
    }

    return data || [];
  }

  // Get pack by ID with stickers
  static async getPackById(packId: string): Promise<PackData & { stickers: StickerData[] }> {
    const [packResponse, itemsResponse] = await Promise.all([
      supabase
        .from("sticker_packs")
        .select("*")
        .eq("id", packId)
        .eq("is_active", true)
        .single(),
      supabase
        .from("sticker_pack_items")
        .select(`
          display_order,
          stickers (*)
        `)
        .eq("pack_id", packId)
        .order("display_order", { ascending: true })
    ]);

    if (packResponse.error) {
      throw new Error("Pack not found");
    }

    if (itemsResponse.error) {
      console.error("Error fetching pack items:", itemsResponse.error);
      return { ...packResponse.data, stickers: [] };
    }

    const stickers = itemsResponse.data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ?.map((item: any) => item.stickers)
      .filter(Boolean) || [];

    return { ...packResponse.data, stickers };
  }

  // Create new pack
  static async createPack(packData: PackInsert): Promise<PackData> {
    const { data, error } = await supabase
      .from("sticker_packs")
      .insert(packData)
      .select()
      .single();

    if (error) {
      console.error("Error creating pack:", error);
      throw new Error("Failed to create pack");
    }

    return data;
  }

  // Update pack
  static async updatePack(packId: string, updates: Partial<PackInsert>): Promise<PackData> {
    const { data, error } = await supabase
      .from("sticker_packs")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", packId)
      .select()
      .single();

    if (error) {
      console.error("Error updating pack:", error);
      throw new Error("Failed to update pack");
    }

    return data;
  }

  // Delete pack (soft delete by setting is_active = false)
  static async deletePack(packId: string): Promise<void> {
    const { error } = await supabase
      .from("sticker_packs")
      .update({ is_active: false })
      .eq("id", packId);

    if (error) {
      console.error("Error deleting pack:", error);
      throw new Error("Failed to delete pack");
    }
  }

  // Add sticker to pack
  static async addStickerToPack(
    packId: string, 
    stickerId: string, 
    displayOrder?: number
  ): Promise<PackItemData> {
    // Get current max order if no order specified
    if (displayOrder === undefined) {
      const { data: items } = await supabase
        .from("sticker_pack_items")
        .select("display_order")
        .eq("pack_id", packId)
        .order("display_order", { ascending: false })
        .limit(1);
      
      displayOrder = (items?.[0]?.display_order || 0) + 1;
    }

    const { data, error } = await supabase
      .from("sticker_pack_items")
      .insert({
        pack_id: packId,
        sticker_id: stickerId,
        display_order: displayOrder,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding sticker to pack:", error);
      // Check if it's a unique constraint violation (duplicate)
      if (error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('already exists')) {
        throw new Error("Bu sticker zaten pack'te mevcut");
      }
      throw new Error("Sticker pack'e eklenirken hata oluştu");
    }

    return data;
  }

  // Remove sticker from pack
  static async removeStickerFromPack(packId: string, stickerId: string): Promise<void> {
    const { error } = await supabase
      .from("sticker_pack_items")
      .delete()
      .eq("pack_id", packId)
      .eq("sticker_id", stickerId);

    if (error) {
      console.error("Error removing sticker from pack:", error);
      throw new Error("Failed to remove sticker from pack");
    }
  }

  // Update pack item order (for drag & drop)
  static async updatePackItemOrder(
    packId: string, 
    stickerOrders: { stickerId: string; order: number }[]
  ): Promise<void> {
    const updatePromises = stickerOrders.map(({ stickerId, order }) =>
      supabase
        .from("sticker_pack_items")
        .update({ display_order: order })
        .eq("pack_id", packId)
        .eq("sticker_id", stickerId)
    );

    const results = await Promise.allSettled(updatePromises);
    const failures = results.filter(r => r.status === 'rejected');
    
    if (failures.length > 0) {
      console.error("Some order updates failed:", failures);
      throw new Error("Failed to update some sticker orders");
    }
  }

  // Get stickers not in any pack (for adding to packs)
  static async getUnassignedStickers(): Promise<StickerData[]> {
    const { data, error } = await supabase
      .from("stickers")
      .select(`
        *,
        sticker_pack_items!left (pack_id)
      `)
      .is("sticker_pack_items.pack_id", null);

    if (error) {
      console.error("Error fetching unassigned stickers:", error);
      throw new Error("Failed to fetch unassigned stickers");
    }

    return data || [];
  }

  // Get pack statistics
  static async getPackStats(packId: string): Promise<{ stickerCount: number; totalDownloads: number }> {
    const [stickerCount, totalDownloads] = await Promise.all([
      supabase
        .from("sticker_pack_items")
        .select("id")
        .eq("pack_id", packId),
      supabase
        .from("sticker_pack_items")
        .select(`
          stickers (download_count)
        `)
        .eq("pack_id", packId)
    ]);

    return {
      stickerCount: stickerCount.data?.length || 0,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      totalDownloads: totalDownloads.data?.reduce((sum: number, item: any) => 
        sum + (item.stickers?.download_count || 0), 0) || 0
    };
  }
}
