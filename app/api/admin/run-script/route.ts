import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';

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

    // Use ReadableStream for server-sent events style response
    const encoder = new TextEncoder();
    
    const readable = new ReadableStream({
      start(controller) {
        // Send initial status
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ 
            type: 'start', 
            script, 
            message: `Starting ${script}...` 
          })}\n\n`)
        );

        const isWindows = process.platform === 'win32';
        const command = isWindows ? 'npm.cmd' : 'npm';
        const args = ['run', script];
        
        const child = spawn(command, args, {
          cwd: process.cwd(),
          stdio: ['pipe', 'pipe', 'pipe']
        });

        // Handle stdout
        child.stdout?.on('data', (data) => {
          const output = data.toString();
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ 
              type: 'stdout', 
              data: output.trim() 
            })}\n\n`)
          );
        });

        // Handle stderr
        child.stderr?.on('data', (data) => {
          const output = data.toString();
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ 
              type: 'stderr', 
              data: output.trim() 
            })}\n\n`)
          );
        });

        // Handle process completion
        child.on('close', (code) => {
          const success = code === 0;
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ 
              type: 'end', 
              success,
              exitCode: code,
              message: success 
                ? `✅ ${script} completed successfully` 
                : `❌ ${script} failed with exit code ${code}`
            })}\n\n`)
          );
          controller.close();
        });

        // Handle errors
        child.on('error', (error) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ 
              type: 'error', 
              message: `Process error: ${error.message}` 
            })}\n\n`)
          );
          controller.close();
        });
      }
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

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