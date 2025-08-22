import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const ALLOWED_SCRIPTS = [
  'optimize-stickers',
  'upload-stickers', 
  'convert-webp-to-png'
];

export async function POST(request: NextRequest) {
  try {
    const { script } = await request.json();

    if (!script || !ALLOWED_SCRIPTS.includes(script)) {
      return NextResponse.json({ 
        error: 'Invalid script name',
        allowedScripts: ALLOWED_SCRIPTS 
      }, { status: 400 });
    }

    // Edge runtime limitation: Can't spawn processes
    // Return a mock response indicating the limitation
    return NextResponse.json({
      error: 'Script execution not available in edge runtime',
      script,
      message: 'Scripts must be run manually on server or use serverless functions',
      limitation: 'Cloudflare Edge Runtime does not support child_process'
    }, { status: 501 });

  } catch (error) {
    console.error('Run script error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - List available scripts
export async function GET() {
  return NextResponse.json({
    availableScripts: ALLOWED_SCRIPTS,
    descriptions: {
      'optimize-stickers': 'Converts source files to 512x512 WebP format',
      'upload-stickers': 'Uploads WebP files to Supabase with metadata',
      'convert-webp-to-png': 'Creates PNG versions for WhatsApp Web compatibility'
    }
  });
}