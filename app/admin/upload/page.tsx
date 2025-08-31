"use client";

export const runtime = "edge";

import { useState } from "react";
import { useAdminAuth } from "@/lib/admin-auth-context";
import { AdminRouteGuard } from "@/components/admin-route-guard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  FileImage,
  Database,
  ImageIcon,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface StickerFile {
  file: File;
  name: string;
  tags: string[];
  optimizedFile?: File; // Client-side optimized version
  originalSize?: number;
  optimizedSize?: number;
}

interface ProcessingStep {
  id: string;
  name: string;
  description: string;
  status: "pending" | "processing" | "completed" | "failed";
  icon: React.ComponentType<{ className?: string }>;
}

interface ProcessingResult {
  originalName: string;
  status: "success" | "failed";
  error?: string;
  stickerId?: string;
  webpUrl?: string;
  pngUrl?: string;
}

// Client-side image optimization using Canvas API
const OPTIMIZATION_SETTINGS = {
  targetSize: 512,
  maxFileSizeKB: 200,
  qualityLevels: [0.95, 0.9, 0.85, 0.8, 0.75],
  outputFormat: 'webp' as const
};

// Optimize image to 512x512 WebP format
async function optimizeImageFile(file: File): Promise<{
  optimizedFile: File;
  originalSize: number;
  optimizedSize: number;
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = async () => {
      try {
        console.log(`🔄 Client-side optimizing: ${file.name}`);
        console.log(`   📐 Original: ${img.width}x${img.height}`);
        
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = OPTIMIZATION_SETTINGS.targetSize;
        canvas.height = OPTIMIZATION_SETTINGS.targetSize;
        const ctx = canvas.getContext('2d')!;
        
        // Clear canvas with transparent background
        ctx.clearRect(0, 0, OPTIMIZATION_SETTINGS.targetSize, OPTIMIZATION_SETTINGS.targetSize);
        
        // Calculate dimensions maintaining aspect ratio
        const aspectRatio = img.width / img.height;
        let drawX = 0;
        let drawY = 0;
        let drawWidth = OPTIMIZATION_SETTINGS.targetSize;
        let drawHeight = OPTIMIZATION_SETTINGS.targetSize;
        
        if (Math.abs(aspectRatio - 1) < 0.1) {
          // Nearly square - direct resize
          console.log(`   ↗️  Strategy: Direct resize (square-ish: ${aspectRatio.toFixed(2)})`);
        } else {
          // Not square - fit with padding to maintain aspect ratio
          console.log(`   📦 Strategy: Fit with padding (aspect: ${aspectRatio.toFixed(2)})`);
          
          if (aspectRatio > 1) {
            // Wider than tall
            drawHeight = Math.floor(OPTIMIZATION_SETTINGS.targetSize / aspectRatio);
            drawY = Math.floor((OPTIMIZATION_SETTINGS.targetSize - drawHeight) / 2);
          } else {
            // Taller than wide
            drawWidth = Math.floor(OPTIMIZATION_SETTINGS.targetSize * aspectRatio);
            drawX = Math.floor((OPTIMIZATION_SETTINGS.targetSize - drawWidth) / 2);
          }
        }
        
        // Draw the image onto canvas
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        
        // Try different quality levels to achieve target file size
        for (const quality of OPTIMIZATION_SETTINGS.qualityLevels) {
          try {
            const blob = await new Promise<Blob>((resolve) => {
              canvas.toBlob((blob) => {
                if (blob) resolve(blob);
              }, `image/${OPTIMIZATION_SETTINGS.outputFormat}`, quality);
            });
            
            const fileSizeKB = Math.round(blob.size / 1024);
            
            if (fileSizeKB <= OPTIMIZATION_SETTINGS.maxFileSizeKB || 
                quality === OPTIMIZATION_SETTINGS.qualityLevels[OPTIMIZATION_SETTINGS.qualityLevels.length - 1]) {
              
              console.log(`   ✅ Success: ${OPTIMIZATION_SETTINGS.targetSize}x${OPTIMIZATION_SETTINGS.targetSize} ${OPTIMIZATION_SETTINGS.outputFormat.toUpperCase()}`);
              console.log(`   📊 Quality: ${Math.round(quality * 100)}% | Size: ${fileSizeKB} KB`);
              
              // Create optimized File object
              const optimizedFileName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
              const optimizedFile = new File([blob], optimizedFileName, {
                type: `image/${OPTIMIZATION_SETTINGS.outputFormat}`,
                lastModified: Date.now()
              });
              
              resolve({
                optimizedFile,
                originalSize: file.size,
                optimizedSize: blob.size
              });
              return;
            } else {
              console.log(`   🔄 Quality ${Math.round(quality * 100)}%: ${fileSizeKB} KB (too large, trying lower quality)`);
            }
          } catch (error) {
            console.log(`   ❌ Failed at quality ${Math.round(quality * 100)}%: ${error}`);
            continue;
          }
        }
        
        reject(new Error('Unable to optimize image within size constraints'));
      } catch (error) {
        console.error(`   ❌ Error optimizing ${file.name}:`, error);
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

export default function AdminUpload() {
  const { getAuthHeader } = useAdminAuth();
  const [selectedFiles, setSelectedFiles] = useState<StickerFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState(0);
  const [processResults, setProcessResults] = useState<ProcessingResult[]>([]);
  const [currentBatch, setCurrentBatch] = useState<string | null>(null);

  const processingSteps: ProcessingStep[] = [
    {
      id: "validation",
      name: "Validation",
      description: "Checking file formats and sizes",
      status: "pending",
      icon: FileImage,
    },
    {
      id: "optimization",
      name: "Optimization",
      description: "Converting to WebP and PNG formats",
      status: "pending",
      icon: Zap,
    },
    {
      id: "storage",
      name: "Storage Upload",
      description: "Uploading to Supabase Storage",
      status: "pending",
      icon: Upload,
    },
    {
      id: "database",
      name: "Database Commit",
      description: "Saving metadata and URLs",
      status: "pending",
      icon: Database,
    },
    {
      id: "completion",
      name: "Completion",
      description: "Finalizing and cleanup",
      status: "pending",
      icon: CheckCircle,
    },
  ];

  const generateSmartTags = (fileName: string): string[] => {
    const tags: string[] = [];
    const lowerFileName = fileName.toLowerCase();

    // Character-based tags
    if (lowerFileName.includes("kermit")) tags.push("kermit");
    if (lowerFileName.includes("pingu")) tags.push("pingu");
    if (lowerFileName.includes("pepe")) tags.push("pepe");
    if (lowerFileName.includes("pocoyo")) tags.push("pocoyo");
    if (lowerFileName.includes("random")) tags.push("random");
    if (lowerFileName.includes("spongebob")) tags.push("spongebob");
    if (lowerFileName.includes("stickman")) tags.push("stickman");
    if (
      (lowerFileName.includes("tom") && lowerFileName.includes("jerry")) ||
      lowerFileName.includes("tomjerry") ||
      lowerFileName.includes("tom-jerry")
    )
      tags.push("tom and jerry");
    if (lowerFileName.includes("emoji")) tags.push("emoji");

    // Emotion-based tags
    if (
      lowerFileName.includes("happy") ||
      lowerFileName.includes("smile") ||
      lowerFileName.includes("smiling") ||
      lowerFileName.includes("joy")
    )
      tags.push("happy");
    if (
      lowerFileName.includes("sad") ||
      lowerFileName.includes("cry") ||
      lowerFileName.includes("crying") ||
      lowerFileName.includes("tear")
    )
      tags.push("sad");
    if (
      lowerFileName.includes("angry") ||
      lowerFileName.includes("mad") ||
      lowerFileName.includes("rage")
    )
      tags.push("angry");
    if (
      lowerFileName.includes("love") ||
      lowerFileName.includes("heart") ||
      lowerFileName.includes("kiss")
    )
      tags.push("love");
    if (
      lowerFileName.includes("funny") ||
      lowerFileName.includes("laugh") ||
      lowerFileName.includes("laughing") ||
      lowerFileName.includes("lol")
    )
      tags.push("funny");

    // Category-based tags
    if (
      lowerFileName.includes("animal") ||
      lowerFileName.includes("cat") ||
      lowerFileName.includes("dog") ||
      lowerFileName.includes("bird") ||
      lowerFileName.includes("fish") ||
      lowerFileName.includes("pet")
    )
      tags.push("animals");
    if (
      lowerFileName.includes("food") ||
      lowerFileName.includes("eat") ||
      lowerFileName.includes("drink") ||
      lowerFileName.includes("cake") ||
      lowerFileName.includes("pizza")
    )
      tags.push("food");
    if (
      lowerFileName.includes("party") ||
      lowerFileName.includes("celebrate") ||
      lowerFileName.includes("birthday")
    )
      tags.push("celebration");
    if (
      lowerFileName.includes("cool") ||
      lowerFileName.includes("awesome") ||
      lowerFileName.includes("nice")
    )
      tags.push("cool");
    if (
      lowerFileName.includes("nature") ||
      lowerFileName.includes("flower") ||
      lowerFileName.includes("tree")
    )
      tags.push("nature");
    if (lowerFileName.includes("meme") || lowerFileName.includes("viral"))
      tags.push("memes");

    // Object-based tags
    if (
      lowerFileName.includes("car") ||
      lowerFileName.includes("phone") ||
      lowerFileName.includes("computer") ||
      lowerFileName.includes("book") ||
      lowerFileName.includes("ball")
    )
      tags.push("objects");

    // Expression-based tags
    if (
      lowerFileName.includes("shock") ||
      lowerFileName.includes("surprise") ||
      lowerFileName.includes("wow") ||
      lowerFileName.includes("expression") ||
      lowerFileName.includes("face")
    )
      tags.push("expressions");

    // Reaction-based tags
    if (
      lowerFileName.includes("reaction") ||
      lowerFileName.includes("react") ||
      lowerFileName.includes("response") ||
      lowerFileName.includes("reply")
    )
      tags.push("reactions");

    return [...new Set(tags)]; // Remove duplicates
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Show loading for optimization
    setIsProcessing(true);
    setProcessingProgress(10);
    
    try {
      console.log(`🎯 Starting client-side optimization for ${files.length} files...`);
      
      const optimizedFiles: StickerFile[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`\n📸 Processing file ${i + 1}/${files.length}: ${file.name}`);
        
        try {
          // Optimize the image
          const { optimizedFile, originalSize, optimizedSize } = await optimizeImageFile(file);
          
          // Create StickerFile with optimization data
          const stickerFile: StickerFile = {
            file: optimizedFile, // Use optimized file
            name: file.name
              .split(".")[0]
              .replace(/[-_]/g, " ")
              .replace(/\b\w/g, (char) => char.toUpperCase()),
            tags: generateSmartTags(file.name),
            optimizedFile,
            originalSize,
            optimizedSize,
          };
          
          optimizedFiles.push(stickerFile);
          
          // Update progress
          setProcessingProgress(10 + (i + 1) * 80 / files.length);
          
        } catch (error) {
          console.error(`❌ Failed to optimize ${file.name}:`, error);
          toast.error(`Failed to optimize ${file.name}`, {
            description: error instanceof Error ? error.message : 'Optimization failed'
          });
        }
      }
      
      // Add optimized files to the list
      setSelectedFiles((prev) => [...prev, ...optimizedFiles]);
      setProcessingProgress(100);
      
      toast.success("Images optimized successfully!", {
        description: `${optimizedFiles.length} files ready for upload`
      });
      
    } catch (error) {
      console.error('❌ Optimization error:', error);
      toast.error("Optimization failed", {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setProcessingProgress(0);
      }, 1000);
    }
  };

  const updateSticker = (
    index: number,
    field: keyof StickerFile,
    value: string | string[]
  ) => {
    setSelectedFiles((prev) =>
      prev.map((sticker, i) =>
        i === index ? { ...sticker, [field]: value } : sticker
      )
    );
  };

  const removeSticker = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const addTag = (index: number, tag: string) => {
    if (tag.trim()) {
      updateSticker(index, "tags", [...selectedFiles[index].tags, tag.trim()]);
    }
  };

  const removeTag = (stickerIndex: number, tagIndex: number) => {
    const newTags = selectedFiles[stickerIndex].tags.filter(
      (_, i) => i !== tagIndex
    );
    updateSticker(stickerIndex, "tags", newTags);
  };

  // Removed unused simulateProcessingSteps function

  const handleBatchProcess = async () => {
    if (selectedFiles.length === 0) {
      toast.warning("Select files", {
        description: "Please select at least one file",
      });
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingStep(0);
    setProcessResults([]);
    setCurrentBatch(null);

    try {
      // Prepare FormData for batch processing
      const formData = new FormData();

      // Add optimized files (or original if optimization failed)
      selectedFiles.forEach((stickerFile) => {
        const fileToUpload = stickerFile.optimizedFile || stickerFile.file;
        formData.append("files", fileToUpload);
      });

      // Prepare metadata
      const metadata: Record<string, { name: string; tags: string[] }> = {};
      selectedFiles.forEach((stickerFile) => {
        metadata[stickerFile.file.name] = {
          name: stickerFile.name,
          tags: stickerFile.tags,
        };
      });
      formData.append("metadata", JSON.stringify(metadata));

      // Start visual progress simulation
      const progressInterval = setInterval(() => {
        setProcessingProgress((prev) => {
          if (prev >= 95) return prev;
          return prev + Math.random() * 10;
        });
      }, 500);

      const stepInterval = setInterval(() => {
        setProcessingStep((prev) => {
          if (prev >= processingSteps.length - 1) return prev;
          return prev + 1;
        });
      }, 1200);

      // Call the atomic batch processing API
      const response = await fetch("/api/admin/process-sticker-batch", {
        method: "POST",
        headers: {
          ...getAuthHeader(),
        },
        body: formData,
      });

      clearInterval(progressInterval);
      clearInterval(stepInterval);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Batch processing failed");
      }

      // Complete the progress
      setProcessingProgress(100);
      setProcessingStep(processingSteps.length);
      setCurrentBatch(result.batchId);
      setProcessResults(result.results || []);

      // Show success message
      const { summary } = result;
      toast.success("Batch operation completed!", {
        description: `Successful: ${summary.successful}, Failed: ${summary.failed}, Total: ${summary.total}`,
      });

      // Clear form on success
      if (summary.successful > 0) {
        setSelectedFiles([]);
      }
    } catch (error) {
      console.error("Batch processing error:", error);
      toast.error("Batch operation failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });

      // Reset progress on error
      setProcessingProgress(0);
      setProcessingStep(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < processingStep) return "completed";
    if (stepIndex === processingStep && isProcessing) return "processing";
    return "pending";
  };

  const getStepIcon = (step: ProcessingStep, stepIndex: number) => {
    const status = getStepStatus(stepIndex);
    const IconComponent = step.icon;

    if (status === "completed")
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (status === "processing")
      return <IconComponent className="h-5 w-5 text-blue-600 animate-pulse" />;
    return <IconComponent className="h-5 w-5 text-gray-400" />;
  };

  const getStepBadgeColor = (stepIndex: number) => {
    const status = getStepStatus(stepIndex);
    if (status === "completed") return "bg-green-100 text-green-800";
    if (status === "processing") return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-600";
  };

  return (
    <AdminRouteGuard>
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin Dashboard
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sticker Upload
          </h1>
          <p className="text-gray-600">Upload new stickers and add metadata</p>
        </div>

        {/* Single Column Layout for Better Focus */}
        <div className="space-y-6">
          {/* File Selection & Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileImage className="h-5 w-5" />
                Batch Sticker Upload
              </CardTitle>
              <CardDescription>
                Secure atomic processing - upload, optimize, and save in one
                operation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file-upload">Select Sticker Files</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="mt-1"
                    disabled={isProcessing}
                  />
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="space-y-1">
                    <p>• Supports: JPG, PNG, WebP, SVG</p>
                    <p>• Client-side optimizes to 512x512 WebP</p>
                    <p>• Aspect ratio preserved with padding</p>
                    <p>• Target size: 200KB max</p>
                  </div>
                  {selectedFiles.length > 0 && (
                    <Badge variant="secondary" className="ml-4">
                      {selectedFiles.length} files selected
                    </Badge>
                  )}
                </div>

                {selectedFiles.length > 0 && !isProcessing && (
                  <Button
                    onClick={handleBatchProcess}
                    className="w-full h-12 text-base font-medium"
                    size="lg"
                  >
                    <Zap className="h-5 w-5 mr-2" />
                    Process {selectedFiles.length} Stickers
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Processing Pipeline Visualization */}
          {isProcessing && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 animate-spin" />
                  Processing Pipeline
                </CardTitle>
                <CardDescription>
                  Batch ID: {currentBatch || "Generating..."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Overall Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Progress</span>
                      <span>{Math.round(processingProgress)}%</span>
                    </div>
                    <Progress value={processingProgress} className="h-2" />
                  </div>

                  {/* Step-by-Step Progress */}
                  <div className="space-y-3">
                    {processingSteps.map((step, index) => (
                      <div
                        key={step.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          getStepStatus(index) === "completed"
                            ? "bg-green-50 border-green-200"
                            : getStepStatus(index) === "processing"
                            ? "bg-blue-50 border-blue-200"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex-shrink-0">
                          {getStepIcon(step, index)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{step.name}</p>
                            <Badge
                              variant="secondary"
                              className={`text-xs ${getStepBadgeColor(index)}`}
                            >
                              {getStepStatus(index)}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Display */}
          {processResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Processing Results
                </CardTitle>
                <CardDescription>
                  Batch completed with detailed file-by-file results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {processResults.map((result, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        result.status === "success"
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {result.status === "success" ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                        <div>
                          <p className="font-medium text-sm">
                            {result.originalName}
                          </p>
                          {result.error && (
                            <p className="text-xs text-red-600 mt-1">
                              {result.error}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {result.status === "success" && (
                          <>
                            <Badge variant="outline" className="text-xs">
                              WebP
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              PNG
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              ID: {result.stickerId?.slice(0, 8)}
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* File Metadata Editing */}
          {selectedFiles.length > 0 && !isProcessing && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Customize Metadata (Optional)
                </CardTitle>
                <CardDescription>
                  Modify names and tags, or leave blank for auto-generation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {selectedFiles.map((sticker, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {sticker.file.name}
                          </p>
                          <div className="text-xs text-gray-500 space-y-1">
                            <p>
                              {(sticker.file.size / 1024).toFixed(1)} KB • {sticker.file.type}
                            </p>
                            {sticker.optimizedFile && sticker.originalSize && sticker.optimizedSize && (
                              <p className="text-green-600">
                                ✅ Optimized: {(sticker.originalSize / 1024).toFixed(1)} KB → {(sticker.optimizedSize / 1024).toFixed(1)} KB 
                                ({Math.round(((sticker.originalSize - sticker.optimizedSize) / sticker.originalSize) * 100)}% smaller)
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSticker(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`name-${index}`} className="text-xs">
                            Display Name
                          </Label>
                          <Input
                            id={`name-${index}`}
                            value={sticker.name}
                            onChange={(e) =>
                              updateSticker(index, "name", e.target.value)
                            }
                            placeholder="Auto-generated from filename"
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label className="text-xs">Tags</Label>
                          <div className="flex flex-wrap gap-1 mt-1 mb-2">
                            {sticker.tags.map((tag, tagIndex) => (
                              <Badge
                                key={tagIndex}
                                variant="secondary"
                                className="text-xs px-2 py-1 flex items-center gap-1"
                              >
                                {tag}
                                <button
                                  onClick={() => removeTag(index, tagIndex)}
                                  className="hover:text-red-600"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>

                          {/* Manual Tag Input */}
                          <div className="flex gap-2 mb-2">
                            <Input
                              placeholder="Add custom tag..."
                              className="text-xs"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  const input = e.target as HTMLInputElement;
                                  const tag = input.value.trim();
                                  if (tag && !sticker.tags.includes(tag)) {
                                    addTag(index, tag);
                                    input.value = "";
                                  }
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
    </AdminRouteGuard>
  );
}
