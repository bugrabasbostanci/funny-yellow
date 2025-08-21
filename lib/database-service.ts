import { supabase, type Database } from "./supabase";
import crypto from "crypto";

type StickerInsert = Database["public"]["Tables"]["stickers"]["Insert"];

export class DatabaseService {
  // Fetch all stickers with optional filtering
  static async getStickers(options?: {
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = supabase
      .from("stickers")
      .select("*")
      .order("created_at", { ascending: false });

    if (options?.category && options.category !== "all") {
      query = query.eq("category", options.category);
    }

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

  // Get sticker categories with counts
  static async getCategories() {
    const { data, error } = await supabase
      .from("stickers")
      .select("category")
      .order("category");

    if (error) {
      console.error("Error fetching categories:", error);
      return [];
    }

    // Count stickers per category
    const categoryCounts = data.reduce((acc, sticker) => {
      acc[sticker.category] = (acc[sticker.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Map to the format expected by the UI
    const categoryMap: Record<string, string> = {
      emotions: "Emotions",
      reactions: "Reactions",
      gestures: "Gestures",
      characters: "Characters",
    };

    return Object.entries(categoryCounts).map(([id, count]) => ({
      id,
      name: categoryMap[id] || id,
      count,
      icon: "",
    }));
  }

  // Track a download
  static async trackDownload(
    stickerId: string,
    ipAddress: string,
    userAgent?: string
  ) {
    // Hash IP address for privacy
    const ipHash = crypto.createHash("sha256").update(ipAddress).digest("hex");

    const { error } = await supabase.from("downloads").insert({
      sticker_id: stickerId,
      ip_hash: ipHash,
      user_agent: userAgent || null,
    });

    if (error) {
      console.error("Error tracking download:", error);
      // Don't throw error for tracking failures
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
}
