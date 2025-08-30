"use client";

export const runtime = "edge";

import { useState } from "react";
import { useAdminAuth } from "@/lib/admin-auth-context";
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newStickerFiles: StickerFile[] = files.map((file) => ({
      file,
      name: file.name
        .split(".")[0]
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase()),
      tags: generateSmartTags(file.name),
    }));
    setSelectedFiles((prev) => [...prev, ...newStickerFiles]);
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
      toast.warning("Dosya seçin", {
        description: "Lütfen en az bir dosya seçin",
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

      // Add files
      selectedFiles.forEach((stickerFile) => {
        formData.append("files", stickerFile.file);
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
      toast.success("Batch işlemi tamamlandı!", {
        description: `Başarılı: ${summary.successful}, Başarısız: ${summary.failed}, Toplam: ${summary.total}`,
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
                    <p>• Auto-optimizes to 512x512 WebP + PNG</p>
                    <p>• Generates metadata automatically</p>
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
                          <p className="text-xs text-gray-500">
                            {(sticker.file.size / 1024).toFixed(1)} KB •{" "}
                            {sticker.file.type}
                          </p>
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
  );
}
