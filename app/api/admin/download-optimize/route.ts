import { NextResponse } from "next/server";

// Use Edge runtime for Cloudflare compatibility
export const runtime = "edge";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Edge Runtime: Image optimization not available without Sharp
// This endpoint now serves as a status/info endpoint

export async function POST() {
  return NextResponse.json({
    error: "Image optimization not available in Edge Runtime",
    message: "This endpoint requires Sharp library which is not compatible with Cloudflare Edge Runtime",
    suggestion: "Use external image optimization service or server-side processing",
    alternatives: [
      "Use Cloudflare Images API for optimization",
      "Pre-process images before upload", 
      "Use serverless functions with Node.js runtime"
    ]
  }, { status: 501 });
}

// GET endpoint to check status
export async function GET() {
  try {
    // List files in both source and webp folders
    const [sourceFiles, webpFiles] = await Promise.all([
      supabaseAdmin.storage.from("stickers").list("source"),
      supabaseAdmin.storage.from("stickers").list("webp"),
    ]);

    return NextResponse.json({
      sourceFiles: sourceFiles.data?.length || 0,
      webpFiles: webpFiles.data?.length || 0,
      status: "ready",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to get status" },
      { status: 500 }
    );
  }
}
