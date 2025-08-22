import { NextResponse } from 'next/server';

// Use Edge runtime for Cloudflare compatibility
export const runtime = 'edge';

export async function POST() {
  return NextResponse.json({
    error: "Batch processing not available in Edge Runtime",
    message: "This endpoint requires Sharp library for image processing which is not compatible with Cloudflare Edge Runtime",
    limitation: "Edge Runtime does not support binary dependencies like Sharp.js",
    alternatives: [
      "Use Cloudflare Images API for batch processing",
      "Pre-process images before upload using external tools",
      "Use server-side processing with Node.js runtime",
      "Implement client-side resizing before upload"
    ],
    suggested_workflow: [
      "1. Resize images to 512x512 before upload",
      "2. Use upload-source-files endpoint for direct storage",
      "3. Use upload-to-database endpoint for metadata creation"
    ]
  }, { status: 501 });
}

// GET endpoint for info
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/admin/process-sticker-batch',
    status: 'Edge Runtime - Limited functionality',
    message: 'Batch processing requires Node.js runtime for Sharp.js image processing',
    alternatives: [
      'Use individual upload endpoints',
      'Pre-process images externally',
      'Use Cloudflare Images API'
    ]
  });
}