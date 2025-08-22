import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const SCRIPT_PIPELINE = [
  'optimize-stickers',
  'upload-stickers', 
  'convert-webp-to-png'
];

// Edge runtime limitation: Can't use child_process
// This function would need to be implemented differently for production
// async function runScript(scriptName: string): Promise<{success: boolean, output: string[], errors: string[]}> {
//   // Simulate script execution for edge runtime compatibility
//   return {
//     success: false,
//     output: [],
//     errors: [`Edge runtime limitation: Cannot execute ${scriptName}`]
//   };
// }

export async function POST(request: NextRequest) {
  try {
    const { scripts = SCRIPT_PIPELINE } = await request.json();
    
    // Validate scripts
    const invalidScripts = scripts.filter((script: string) => !SCRIPT_PIPELINE.includes(script));
    if (invalidScripts.length > 0) {
      return NextResponse.json({ 
        error: 'Invalid script names',
        invalidScripts,
        allowedScripts: SCRIPT_PIPELINE 
      }, { status: 400 });
    }

    // Edge runtime limitation: Can't spawn processes
    return NextResponse.json({
      error: 'Pipeline execution not available in edge runtime',
      scripts,
      message: 'Processing pipeline must be run manually on server or use serverless functions',
      limitation: 'Cloudflare Edge Runtime does not support child_process',
      suggestedAlternatives: [
        'Run scripts manually via SSH/terminal',
        'Use GitHub Actions or CI/CD pipeline',
        'Implement as separate serverless functions'
      ]
    }, { status: 501 });

  } catch (error) {
    console.error('Process files error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - Get pipeline information
export async function GET() {
  return NextResponse.json({
    defaultPipeline: SCRIPT_PIPELINE,
    descriptions: {
      'optimize-stickers': 'Step 1: Converts source files to 512x512 WebP format',
      'upload-stickers': 'Step 2: Uploads WebP files to Supabase with metadata',
      'convert-webp-to-png': 'Step 3: Creates PNG versions for WhatsApp Web compatibility'
    }
  });
}