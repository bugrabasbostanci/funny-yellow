import { removeBackground, Config } from '@imgly/background-removal';

export interface BackgroundRemovalOptions {
  progress?: (key: string, current: number, total: number, ...args: unknown[]) => void;
  debug?: boolean;
}

export interface BackgroundRemovalResult {
  blob: Blob;
  url: string;
  originalSize: number;
  processedSize: number;
  processingTime: number;
}

export class BackgroundRemovalService {

  // Remove background from image URL or File/Blob
  static async removeBackground(
    input: string | File | Blob,
    options: BackgroundRemovalOptions = {}
  ): Promise<BackgroundRemovalResult> {
    const startTime = Date.now();

    try {

      // Get original size for comparison
      let originalSize = 0;
      if (input instanceof File || input instanceof Blob) {
        originalSize = input.size;
      } else if (typeof input === 'string' && input.startsWith('http')) {
        try {
          const response = await fetch(input, { method: 'HEAD' });
          const contentLength = response.headers.get('content-length');
          if (contentLength) {
            originalSize = parseInt(contentLength, 10);
          }
        } catch (error) {
          console.warn('Could not get original file size:', error);
        }
      }

      const config: Config = {
        progress: options.progress,
        debug: options.debug || false,
      };

      // Remove background
      console.log('Starting background removal...');
      const blob = await removeBackground(input, config);
      
      if (!blob || !(blob instanceof Blob)) {
        throw new Error('Background removal did not return a valid blob');
      }
      
      console.log('Background removal completed, creating URL...');
      const url = URL.createObjectURL(blob);
      
      const processingTime = Date.now() - startTime;
      
      return {
        blob,
        url,
        originalSize,
        processedSize: blob.size,
        processingTime,
      };
    } catch (error) {
      console.error('Background removal failed:', error);
      throw new Error(`Background removal failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Process multiple images in batch
  static async processBatch(
    inputs: Array<string | File | Blob>,
    options: BackgroundRemovalOptions = {}
  ): Promise<BackgroundRemovalResult[]> {
    const results: BackgroundRemovalResult[] = [];
    
    // Process sequentially to avoid overwhelming the browser
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      
      try {
        const batchProgress = options.progress ? 
          (key: string, current: number, total: number) => {
            const progressRatio = current / total;
            const totalProgress = (i / inputs.length + progressRatio / inputs.length) * 100;
            options.progress!(key, totalProgress, 100);
          } : undefined;

        const result = await this.removeBackground(input, {
          ...options,
          progress: batchProgress,
        });
        
        results.push(result);
      } catch (error) {
        console.error(`Failed to process image ${i + 1}:`, error);
        // Continue with other images even if one fails
        continue;
      }
    }

    return results;
  }

  // Create a transparent PNG with the same dimensions
  static async createTransparentSticker(
    input: string | File | Blob,
    targetSize: number = 512,
    options: BackgroundRemovalOptions = {}
  ): Promise<BackgroundRemovalResult> {
    try {
      console.log('Creating transparent sticker...');
      const result = await this.removeBackground(input, options);
      
      console.log('Resizing to target size...');
      // Resize to target size if needed
      const processedBlob = await this.resizeImage(result.blob, targetSize, targetSize);
      
      // Clean up the original URL before creating new one
      URL.revokeObjectURL(result.url);
      
      return {
        ...result,
        blob: processedBlob,
        url: URL.createObjectURL(processedBlob),
        processedSize: processedBlob.size,
      };
    } catch (error) {
      console.error('Error creating transparent sticker:', error);
      throw error;
    }
  }

  // Resize image to specific dimensions
  private static async resizeImage(blob: Blob, width: number, height: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        canvas.width = width;
        canvas.height = height;

        const objectUrl = URL.createObjectURL(blob);
        
        img.onload = () => {
          // Clean up URL after loading
          URL.revokeObjectURL(objectUrl);
          
          try {
            // Clear canvas with transparent background
            ctx.clearRect(0, 0, width, height);

            // Calculate dimensions to fit image while maintaining aspect ratio
            const aspectRatio = img.width / img.height;
            let drawWidth = width;
            let drawHeight = height;
            let offsetX = 0;
            let offsetY = 0;

            if (aspectRatio > 1) {
              // Landscape
              drawHeight = height / aspectRatio;
              offsetY = (height - drawHeight) / 2;
            } else {
              // Portrait or square
              drawWidth = width * aspectRatio;
              offsetX = (width - drawWidth) / 2;
            }

            ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

            canvas.toBlob(
              (resizedBlob) => {
                if (resizedBlob) {
                  resolve(resizedBlob);
                } else {
                  reject(new Error('Failed to create resized blob'));
                }
              },
              'image/png'
            );
          } catch (error) {
            reject(new Error(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`));
          }
        };

        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          reject(new Error('Failed to load image for resizing'));
        };
        
        img.src = objectUrl;
      } catch (error) {
        reject(new Error(`Failed to setup image resizing: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    });
  }

  // Validate if an image needs background removal
  static async needsBackgroundRemoval(input: string | File | Blob): Promise<boolean> {
    try {
      // Create a small canvas to analyze the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      return new Promise((resolve) => {
        img.onload = () => {
          try {
            if (!ctx) {
              resolve(true); // Assume it needs processing if we can't analyze
              return;
            }

            // Use small canvas for analysis
            canvas.width = 50;
            canvas.height = 50;
            ctx.drawImage(img, 0, 0, 50, 50);

            const imageData = ctx.getImageData(0, 0, 50, 50);
            const data = imageData.data;

            // Check for transparency
            let transparentPixels = 0;
            const totalPixels = data.length / 4;

            for (let i = 3; i < data.length; i += 4) {
              if (data[i] < 255) {
                transparentPixels++;
              }
            }

            // If more than 10% pixels are already transparent, might not need processing
            const transparencyRatio = transparentPixels / totalPixels;
            resolve(transparencyRatio < 0.1);
          } catch (error) {
            console.error('Error analyzing transparency:', error);
            resolve(true);
          }
        };

        img.onerror = () => resolve(true);
        
        if (typeof input === 'string') {
          img.crossOrigin = 'anonymous';
          img.src = input;
        } else {
          const objectUrl = URL.createObjectURL(input);
          img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            // Call the original onload handler
            img.onload!(new Event('load'));
          };
          img.src = objectUrl;
        }
      });
    } catch (error) {
      console.error('Error analyzing image transparency:', error);
      return true; // Assume it needs processing if analysis fails
    }
  }

  // Get quality metrics for processed image
  static getQualityMetrics(result: BackgroundRemovalResult): {
    compressionRatio: number;
    processingSpeed: string;
    sizeDifference: string;
  } {
    const compressionRatio = result.originalSize > 0 ? 
      result.processedSize / result.originalSize : 1;

    const processingSpeed = result.processingTime < 1000 ? 
      'Fast' : result.processingTime < 5000 ? 'Normal' : 'Slow';

    const sizeDiff = result.processedSize - result.originalSize;
    const sizeDifference = sizeDiff > 0 ? 
      `+${(sizeDiff / 1024).toFixed(1)}KB` : 
      `${(sizeDiff / 1024).toFixed(1)}KB`;

    return {
      compressionRatio,
      processingSpeed,
      sizeDifference,
    };
  }

  // Clean up created URLs to prevent memory leaks
  static cleanupUrl(url: string): void {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }
}