import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST() {
  // Redirect to the new upload-source-files endpoint
  return NextResponse.json({
    error: 'This endpoint is deprecated. Use /api/admin/upload-source-files instead.',
    redirect: '/api/admin/upload-source-files'
  }, { status: 301 });
}