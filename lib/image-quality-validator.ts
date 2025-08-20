export interface ImageValidationResult {
  isValid: boolean;
  issues: string[];
  recommendations: string[];
  quality: {
    hasTransparency: boolean;
    dimensions: { width: number; height: number };
    fileSize: number;
    format: string;
    aspectRatio: number;
    pixelDensity: number;
    colorDepth: number;
  };
  whatsappCompatibility: {
    compatible: boolean;
    issues: string[];
    optimizedSize: boolean;
  };
}

export interface ValidationOptions {
  requireTransparency?: boolean;
  minWidth?: number;
  minHeight?: number;
  maxFileSize?: number; // in bytes
  allowedFormats?: string[];
  strictWhatsAppMode?: boolean;
}

export class ImageQualityValidator {
  static readonly DEFAULT_OPTIONS: ValidationOptions = {
    requireTransparency: true,
    minWidth: 128,
    minHeight: 128,
    maxFileSize: 1024 * 1024, // 1MB
    allowedFormats: ['png', 'webp', 'jpg', 'jpeg', 'gif'],
    strictWhatsAppMode: false,
  };

  static readonly WHATSAPP_REQUIREMENTS = {
    idealSize: { width: 512, height: 512 },
    maxSize: { width: 512, height: 512 },
    minSize: { width: 96, height: 96 },
    maxFileSize: 100 * 1024, // 100KB for WhatsApp
    preferredFormats: ['webp', 'png'],
  };

  // Main validation function
  static async validateImage(
    source: File | Blob | string,
    options: ValidationOptions = {}
  ): Promise<ImageValidationResult> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    
    try {
      // Load image and get basic info
      const imageInfo = await this.analyzeImage(source);
      const issues: string[] = [];
      const recommendations: string[] = [];

      // Validate dimensions
      this.validateDimensions(imageInfo, opts, issues, recommendations);
      
      // Validate file size
      this.validateFileSize(imageInfo, opts, issues, recommendations);
      
      // Validate format
      this.validateFormat(imageInfo, opts, issues, recommendations);
      
      // Validate transparency
      this.validateTransparency(imageInfo, opts, issues, recommendations);
      
      // Check WhatsApp compatibility
      const whatsappCompatibility = this.checkWhatsAppCompatibility(imageInfo);
      
      // Add WhatsApp-specific issues to main issues
      issues.push(...whatsappCompatibility.issues);

      const isValid = issues.length === 0;

      return {
        isValid,
        issues,
        recommendations,
        quality: {
          hasTransparency: imageInfo.hasTransparency,
          dimensions: imageInfo.dimensions,
          fileSize: imageInfo.fileSize,
          format: imageInfo.format,
          aspectRatio: imageInfo.dimensions.width / imageInfo.dimensions.height,
          pixelDensity: this.calculatePixelDensity(imageInfo.dimensions),
          colorDepth: imageInfo.colorDepth || 24,
        },
        whatsappCompatibility,
      };
    } catch (error) {
      return {
        isValid: false,
        issues: [`Failed to validate image: ${error instanceof Error ? error.message : 'Unknown error'}`],
        recommendations: ['Please check if the image file is valid and accessible'],
        quality: {
          hasTransparency: false,
          dimensions: { width: 0, height: 0 },
          fileSize: 0,
          format: 'unknown',
          aspectRatio: 1,
          pixelDensity: 0,
          colorDepth: 24,
        },
        whatsappCompatibility: {
          compatible: false,
          issues: ['Unable to analyze image'],
          optimizedSize: false,
        },
      };
    }
  }

  // Analyze image properties
  private static async analyzeImage(source: File | Blob | string): Promise<{
    dimensions: { width: number; height: number };
    hasTransparency: boolean;
    fileSize: number;
    format: string;
    colorDepth?: number;
  }> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        const dimensions = {
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height,
        };

        // Create small canvas for transparency analysis
        canvas.width = Math.min(dimensions.width, 100);
        canvas.height = Math.min(dimensions.height, 100);
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Analyze transparency
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const hasTransparency = this.hasTransparentPixels(imageData);

        // Get file info
        let fileSize = 0;
        let format = 'unknown';

        if (source instanceof File) {
          fileSize = source.size;
          format = this.getFormatFromFile(source);
        } else if (source instanceof Blob) {
          fileSize = source.size;
          format = this.getFormatFromBlob(source);
        } else if (typeof source === 'string') {
          format = this.getFormatFromUrl(source);
          // File size will be 0 for URLs unless we fetch it
        }

        resolve({
          dimensions,
          hasTransparency,
          fileSize,
          format,
          colorDepth: 24, // Assume 24-bit color depth
        });
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      
      if (typeof source === 'string') {
        img.crossOrigin = 'anonymous';
        img.src = source;
      } else {
        img.src = URL.createObjectURL(source);
      }
    });
  }

  // Check for transparent pixels
  private static hasTransparentPixels(imageData: ImageData): boolean {
    const data = imageData.data;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 255) {
        return true;
      }
    }
    return false;
  }

  // Validate image dimensions
  private static validateDimensions(
    imageInfo: { dimensions: { width: number; height: number } },
    options: ValidationOptions,
    issues: string[],
    recommendations: string[]
  ): void {
    const { width, height } = imageInfo.dimensions;
    
    if (options.minWidth && width < options.minWidth) {
      issues.push(`Image width (${width}px) is below minimum (${options.minWidth}px)`);
    }
    
    if (options.minHeight && height < options.minHeight) {
      issues.push(`Image height (${height}px) is below minimum (${options.minHeight}px)`);
    }

    // Check aspect ratio
    const aspectRatio = width / height;
    if (aspectRatio < 0.5 || aspectRatio > 2.0) {
      recommendations.push('Consider using a more square aspect ratio for better sticker appearance');
    }

    // Recommend optimal dimensions
    if (width !== 512 || height !== 512) {
      recommendations.push('Optimal sticker size is 512×512 pixels for WhatsApp compatibility');
    }
  }

  // Validate file size
  private static validateFileSize(
    imageInfo: { fileSize: number },
    options: ValidationOptions,
    issues: string[],
    recommendations: string[]
  ): void {
    if (options.maxFileSize && imageInfo.fileSize > options.maxFileSize) {
      issues.push(`File size (${(imageInfo.fileSize / 1024).toFixed(1)}KB) exceeds maximum (${(options.maxFileSize / 1024).toFixed(1)}KB)`);
      recommendations.push('Consider compressing the image or using WebP format for smaller file size');
    }

    // WhatsApp size recommendations
    if (imageInfo.fileSize > this.WHATSAPP_REQUIREMENTS.maxFileSize) {
      recommendations.push(`File size should be under ${(this.WHATSAPP_REQUIREMENTS.maxFileSize / 1024).toFixed(0)}KB for optimal WhatsApp performance`);
    }
  }

  // Validate image format
  private static validateFormat(
    imageInfo: { format: string; fileSize: number },
    options: ValidationOptions,
    issues: string[],
    recommendations: string[]
  ): void {
    if (options.allowedFormats && !options.allowedFormats.includes(imageInfo.format.toLowerCase())) {
      issues.push(`Format '${imageInfo.format}' is not allowed`);
    }

    // Format-specific recommendations
    switch (imageInfo.format.toLowerCase()) {
      case 'jpg':
      case 'jpeg':
        if (options.requireTransparency) {
          issues.push('JPEG format does not support transparency');
          recommendations.push('Use PNG or WebP format for transparency support');
        }
        break;
      case 'gif':
        recommendations.push('Consider converting GIF to WebP for better compression and quality');
        break;
      case 'png':
        if (imageInfo.fileSize > 50 * 1024) {
          recommendations.push('Consider converting to WebP for smaller file size while maintaining transparency');
        }
        break;
    }
  }

  // Validate transparency
  private static validateTransparency(
    imageInfo: { hasTransparency: boolean },
    options: ValidationOptions,
    issues: string[],
    recommendations: string[]
  ): void {
    if (options.requireTransparency && !imageInfo.hasTransparency) {
      issues.push('Image does not have transparency but transparency is required');
      recommendations.push('Remove the background or add transparency to create a proper sticker');
    }

    if (imageInfo.hasTransparency) {
      recommendations.push('Great! Image has transparency which is perfect for stickers');
    }
  }

  // Check WhatsApp compatibility
  private static checkWhatsAppCompatibility(
    imageInfo: { dimensions: { width: number; height: number }; fileSize: number; format: string }
  ): {
    compatible: boolean;
    issues: string[];
    optimizedSize: boolean;
  } {
    const issues: string[] = [];
    const { width, height } = imageInfo.dimensions;
    const req = this.WHATSAPP_REQUIREMENTS;

    // Size requirements
    if (width > req.maxSize.width || height > req.maxSize.height) {
      issues.push(`Dimensions (${width}×${height}) exceed WhatsApp maximum (${req.maxSize.width}×${req.maxSize.height})`);
    }
    
    if (width < req.minSize.width || height < req.minSize.height) {
      issues.push(`Dimensions (${width}×${height}) below WhatsApp minimum (${req.minSize.width}×${req.minSize.height})`);
    }

    // File size
    if (imageInfo.fileSize > req.maxFileSize) {
      issues.push(`File size (${(imageInfo.fileSize / 1024).toFixed(1)}KB) exceeds WhatsApp recommended maximum (${(req.maxFileSize / 1024).toFixed(0)}KB)`);
    }

    // Format preference
    if (!req.preferredFormats.includes(imageInfo.format.toLowerCase())) {
      issues.push(`Format '${imageInfo.format}' is not optimal for WhatsApp (prefer WebP or PNG)`);
    }

    const optimizedSize = (width === req.idealSize.width && height === req.idealSize.height);
    const compatible = issues.length === 0;

    return {
      compatible,
      issues,
      optimizedSize,
    };
  }

  // Helper functions
  private static getFormatFromFile(file: File): string {
    return file.type.split('/')[1] || 'unknown';
  }

  private static getFormatFromBlob(blob: Blob): string {
    return blob.type.split('/')[1] || 'unknown';
  }

  private static getFormatFromUrl(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase();
    return extension || 'unknown';
  }

  private static calculatePixelDensity(dimensions: { width: number; height: number }): number {
    return dimensions.width * dimensions.height;
  }

  // Batch validation
  static async validateBatch(
    sources: Array<File | Blob | string>,
    options: ValidationOptions = {}
  ): Promise<Array<ImageValidationResult & { index: number }>> {
    const results: Array<ImageValidationResult & { index: number }> = [];
    
    for (let i = 0; i < sources.length; i++) {
      try {
        const result = await this.validateImage(sources[i], options);
        results.push({ ...result, index: i });
      } catch (error) {
        results.push({
          index: i,
          isValid: false,
          issues: [`Failed to validate image ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`],
          recommendations: [],
          quality: {
            hasTransparency: false,
            dimensions: { width: 0, height: 0 },
            fileSize: 0,
            format: 'unknown',
            aspectRatio: 1,
            pixelDensity: 0,
            colorDepth: 24,
          },
          whatsappCompatibility: {
            compatible: false,
            issues: ['Unable to analyze'],
            optimizedSize: false,
          },
        });
      }
    }

    return results;
  }

  // Generate optimization suggestions
  static getOptimizationSuggestions(result: ImageValidationResult): string[] {
    const suggestions: string[] = [];
    
    if (!result.quality.hasTransparency && result.quality.format !== 'webp') {
      suggestions.push('Remove background and save as PNG or WebP with transparency');
    }

    if (result.quality.dimensions.width !== 512 || result.quality.dimensions.height !== 512) {
      suggestions.push('Resize to 512×512 pixels for optimal WhatsApp compatibility');
    }

    if (result.quality.fileSize > this.WHATSAPP_REQUIREMENTS.maxFileSize) {
      suggestions.push('Compress image or convert to WebP format to reduce file size');
    }

    if (result.quality.format === 'jpg' || result.quality.format === 'jpeg') {
      suggestions.push('Convert to PNG or WebP format for transparency support');
    }

    return suggestions;
  }
}