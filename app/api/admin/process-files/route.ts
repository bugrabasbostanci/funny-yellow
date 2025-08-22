import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';

const SCRIPT_PIPELINE = [
  'optimize-stickers',
  'upload-stickers', 
  'convert-webp-to-png'
];

async function runScript(scriptName: string): Promise<{success: boolean, output: string[], errors: string[]}> {
  return new Promise((resolve) => {
    const output: string[] = [];
    const errors: string[] = [];
    
    const isWindows = process.platform === 'win32';
    const command = isWindows ? 'npm.cmd' : 'npm';
    const args = ['run', scriptName];
    
    const child = spawn(command, args, {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe']
    });

    child.stdout?.on('data', (data) => {
      output.push(data.toString().trim());
    });

    child.stderr?.on('data', (data) => {
      errors.push(data.toString().trim());
    });

    child.on('close', (code) => {
      resolve({
        success: code === 0,
        output,
        errors
      });
    });

    child.on('error', (error) => {
      errors.push(`Process error: ${error.message}`);
      resolve({
        success: false,
        output,
        errors
      });
    });
  });
}

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

    const encoder = new TextEncoder();
    
    const readable = new ReadableStream({
      async start(controller) {
        // Send pipeline start message
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ 
            type: 'pipeline_start', 
            scripts,
            message: `Starting processing pipeline with ${scripts.length} steps...` 
          })}\n\n`)
        );

        let allSuccess = true;
        const results = [];

        // Run each script in sequence
        for (let i = 0; i < scripts.length; i++) {
          const script = scripts[i];
          
          // Send step start message
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ 
              type: 'step_start',
              step: i + 1,
              total: scripts.length,
              script,
              message: `Step ${i + 1}/${scripts.length}: Running ${script}...` 
            })}\n\n`)
          );

          const result = await runScript(script);
          results.push({ script, ...result });

          // Send step output
          for (const line of result.output) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ 
                type: 'step_output',
                script,
                data: line 
              })}\n\n`)
            );
          }

          // Send step errors  
          for (const error of result.errors) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ 
                type: 'step_error',
                script,
                data: error 
              })}\n\n`)
            );
          }

          // Send step completion
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ 
              type: 'step_complete',
              step: i + 1,
              script,
              success: result.success,
              message: result.success 
                ? `✅ Step ${i + 1} (${script}) completed successfully` 
                : `❌ Step ${i + 1} (${script}) failed`
            })}\n\n`)
          );

          if (!result.success) {
            allSuccess = false;
            break; // Stop pipeline on first failure
          }

          // Small delay between scripts
          if (i < scripts.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        // Send pipeline completion
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ 
            type: 'pipeline_complete',
            success: allSuccess,
            results,
            message: allSuccess 
              ? `✅ Processing pipeline completed successfully!` 
              : `❌ Processing pipeline failed`
          })}\n\n`)
        );

        controller.close();
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