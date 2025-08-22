import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // For MVP, we'll keep it simple without user sessions
  },
});

// Database types for better TypeScript support
export type Database = {
  public: {
    Tables: {
      stickers: {
        Row: {
          id: string;
          name: string;
          slug: string;
          tags: string[] | null;
          file_url: string;
          thumbnail_url: string;
          file_size: number;
          file_format: string;
          width: number;
          height: number;
          download_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          tags?: string[] | null;
          file_url: string;
          thumbnail_url: string;
          file_size: number;
          file_format: string;
          width: number;
          height: number;
          download_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          tags?: string[] | null;
          file_url?: string;
          thumbnail_url?: string;
          file_size?: number;
          file_format?: string;
          width?: number;
          height?: number;
          download_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      downloads: {
        Row: {
          id: string;
          sticker_id: string;
          ip_hash: string;
          user_agent: string | null;
          downloaded_at: string;
        };
        Insert: {
          id?: string;
          sticker_id: string;
          ip_hash: string;
          user_agent?: string | null;
          downloaded_at?: string;
        };
        Update: {
          id?: string;
          sticker_id?: string;
          ip_hash?: string;
          user_agent?: string | null;
          downloaded_at?: string;
        };
      };
      sticker_packs: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          character: string | null;
          thumbnail_url: string | null;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          character?: string | null;
          thumbnail_url?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          character?: string | null;
          thumbnail_url?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      sticker_pack_items: {
        Row: {
          id: string;
          pack_id: string;
          sticker_id: string;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          pack_id: string;
          sticker_id: string;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          pack_id?: string;
          sticker_id?: string;
          display_order?: number;
          created_at?: string;
        };
      };
    };
  };
};