import { NextResponse } from "next/server";

// Use Node.js runtime for script execution
export const runtime = "nodejs";

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const SETTINGS = {
  targetSize: 512,
  maxFileSizeKB: 200,
  qualityLevels: [95, 90, 85, 80, 75],
};

async function optimizeImage(buffer: Buffer, fileName: string) {
  console.log(`🔄 Processing: ${fileName}`);

  // Try different quality levels to meet file size requirements
  for (const quality of SETTINGS.qualityLevels) {
    try {
      const optimizedBuffer = await sharp(buffer)
        .resize(SETTINGS.targetSize, SETTINGS.targetSize, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .webp({
          quality,
          effort: 6,
          alphaQuality: 100,
        })
        .toBuffer();

      const sizeKB = Math.round(optimizedBuffer.length / 1024);

      if (
        sizeKB <= SETTINGS.maxFileSizeKB ||
        quality === SETTINGS.qualityLevels[SETTINGS.qualityLevels.length - 1]
      ) {
        console.log(
          `✅ Optimized: ${SETTINGS.targetSize}x${SETTINGS.targetSize} WebP, ${sizeKB}KB (Q${quality})`
        );
        return optimizedBuffer;
      }
    } catch (qualityError) {
      console.error(`❌ Quality ${quality} failed:`, qualityError);
      continue;
    }
  }

  throw new Error("Optimization failed for all quality levels");
}

export async function POST() {
  try {
    console.log("🚀 Starting download and optimization process...");

    // Get files from Supabase Storage source folder
    const { data: files, error: listError } = await supabaseAdmin.storage
      .from("stickers")
      .list("source", {
        limit: 100,
        sortBy: { column: "name", order: "asc" },
      });

    if (listError) {
      return NextResponse.json(
        {
          error: "Failed to list files",
          details: listError.message,
        },
        { status: 500 }
      );
    }

    if (!files || files.length === 0) {
      return NextResponse.json({
        message: "No files found in source folder",
        processed: 0,
        successful: 0,
        failed: 0,
      });
    }

    console.log(`📋 Found ${files.length} files in storage`);

    const results = [];
    let successful = 0;
    let failed = 0;

    for (const file of files) {
      try {
        console.log(`📥 Processing: ${file.name}`);

        // Download file from Supabase
        const { data: fileData, error: downloadError } =
          await supabaseAdmin.storage
            .from("stickers")
            .download(`source/${file.name}`);

        if (downloadError) {
          console.error(`❌ Download failed for ${file.name}:`, downloadError);
          failed++;
          results.push({
            fileName: file.name,
            status: "failed",
            error: `Download failed: ${downloadError.message}`,
          });
          continue;
        }

        // Convert to buffer and optimize
        const buffer = Buffer.from(await fileData.arrayBuffer());
        const optimizedBuffer = await optimizeImage(buffer, file.name);

        // Generate output filename
        const baseName = file.name.replace(/\.[^/.]+$/, "");
        const outputFileName = `${baseName}.webp`;

        // Upload optimized file to webp folder
        const { error: uploadError } = await supabaseAdmin.storage
          .from("stickers")
          .upload(`webp/${outputFileName}`, optimizedBuffer, {
            contentType: "image/webp",
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) {
          console.error(`❌ Upload failed for ${outputFileName}:`, uploadError);
          failed++;
          results.push({
            fileName: file.name,
            status: "failed",
            error: `Upload failed: ${uploadError.message}`,
          });
          continue;
        }

        successful++;
        results.push({
          fileName: file.name,
          outputFileName,
          status: "success",
          sizeKB: Math.round(optimizedBuffer.length / 1024),
        });

        console.log(
          `✅ Successfully processed: ${file.name} → ${outputFileName}`
        );
      } catch (error) {
        console.error(`❌ Error processing ${file.name}:`, error);
        failed++;
        results.push({
          fileName: file.name,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      message: "Download and optimization completed",
      processed: files.length,
      successful,
      failed,
      results,
    });
  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
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
