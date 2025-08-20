"use client";

import type React from "react";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Download, 
  Trash2, 
  Check, 
  AlertCircle,
  Loader2
} from "lucide-react";
import { BackgroundRemovalService, type BackgroundRemovalResult } from "@/lib/background-removal";
import { OptimizedImage } from "@/components/optimized-image";

interface ProcessedSticker {
  id: string;
  name: string;
  category: string;
  originalUrl?: string;
  originalFile?: File;
  processed?: BackgroundRemovalResult;
  pngBlob?: Blob;
  webpBlob?: Blob;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
  metadata: {
    originalSize: number;
    processedSize: number;
    dimensions: { width: number; height: number };
    hasTransparency: boolean;
    processingTime: number;
  };
}

const STICKER_CATEGORIES = [
  "Funny Emoji",
  "Reactions", 
  "Memes",
  "Expressions",
  "Animals",
  "Love",
  "Party",
  "Gestures",
  "Food",
  "Sports"
];

export function StickerProcessor() {
  const [stickers, setStickers] = useState<ProcessedSticker[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [batchProgress, setBatchProgress] = useState(0);
  
  // Form state
  const [stickerName, setStickerName] = useState("");
  const [stickerCategory, setStickerCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const addSticker = useCallback((name: string, category: string, source: File | string) => {
    const id = `sticker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newSticker: ProcessedSticker = {
      id,
      name: name.trim() || (source instanceof File ? source.name.replace(/\.[^/.]+$/, "") : "Unnamed Sticker"),
      category: category || "Expressions",
      originalFile: source instanceof File ? source : undefined,
      originalUrl: typeof source === 'string' ? source : undefined,
      status: 'pending',
      metadata: {
        originalSize: source instanceof File ? source.size : 0,
        processedSize: 0,
        dimensions: { width: 0, height: 0 },
        hasTransparency: false,
        processingTime: 0,
      }
    };

    setStickers(prev => [...prev, newSticker]);
    return id;
  }, []);

  const handleFileUpload = useCallback((files: FileList) => {
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        addSticker(
          stickerName || file.name.replace(/\.[^/.]+$/, ""),
          stickerCategory || "Expressions",
          file
        );
      }
    });
    
    // Clear form
    setStickerName("");
  }, [stickerName, stickerCategory, addSticker]);

  const handleUrlAdd = useCallback(() => {
    if (imageUrl.trim() && stickerName.trim()) {
      addSticker(stickerName, stickerCategory || "Expressions", imageUrl.trim());
      
      // Clear form
      setStickerName("");
      setImageUrl("");
    }
  }, [imageUrl, stickerName, stickerCategory, addSticker]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, [handleFileUpload]);

  const processSticker = async (stickerId: string): Promise<void> => {
    const stickerIndex = stickers.findIndex(s => s.id === stickerId);
    if (stickerIndex === -1) return;

    const sticker = stickers[stickerIndex];
    
    // Update status to processing
    setStickers(prev => prev.map(s => 
      s.id === stickerId ? { ...s, status: 'processing' as const } : s
    ));

    try {
      const source = sticker.originalFile || sticker.originalUrl;
      if (!source) throw new Error('No source available');

      // Remove background
      const result = await BackgroundRemovalService.createTransparentSticker(
        source,
        512,
        {
          progress: (key, current, total) => setProgress((current / total) * 100),
        }
      );

      // Create WebP version
      const webpBlob = await createWebPBlob(result.blob);
      
      // Update sticker with results
      setStickers(prev => prev.map(s => 
        s.id === stickerId ? {
          ...s,
          status: 'completed' as const,
          processed: result,
          pngBlob: result.blob,
          webpBlob,
          metadata: {
            ...s.metadata,
            processedSize: result.blob.size,
            processingTime: result.processingTime,
            hasTransparency: true,
            dimensions: { width: 512, height: 512 },
          }
        } : s
      ));

    } catch (error) {
      console.error(`Error processing sticker ${stickerId}:`, error);
      setStickers(prev => prev.map(s => 
        s.id === stickerId ? { 
          ...s, 
          status: 'error' as const, 
          error: error instanceof Error ? error.message : 'Processing failed'
        } : s
      ));
    }
  };

  const processAllStickers = async () => {
    const pendingStickers = stickers.filter(s => s.status === 'pending');
    if (pendingStickers.length === 0) return;

    setProcessing(true);
    setBatchProgress(0);

    for (let i = 0; i < pendingStickers.length; i++) {
      const sticker = pendingStickers[i];
      await processSticker(sticker.id);
      setBatchProgress(((i + 1) / pendingStickers.length) * 100);
    }

    setProcessing(false);
    setProgress(0);
    setBatchProgress(0);
  };

  const createWebPBlob = async (pngBlob: Blob): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      canvas.width = 512;
      canvas.height = 512;

      img.onload = () => {
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.clearRect(0, 0, 512, 512);
        ctx.drawImage(img, 0, 0, 512, 512);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create WebP blob'));
            }
          },
          'image/webp',
          0.9
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(pngBlob);
    });
  };

  const downloadSticker = (sticker: ProcessedSticker, format: 'png' | 'webp') => {
    const blob = format === 'png' ? sticker.pngBlob : sticker.webpBlob;
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sticker.name.replace(/\s+/g, '_')}_sticker.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const removeSticker = (stickerId: string) => {
    setStickers(prev => prev.filter(s => s.id !== stickerId));
  };

  const exportAllStickers = async () => {
    const completedStickers = stickers.filter(s => s.status === 'completed');
    
    for (const sticker of completedStickers) {
      if (sticker.pngBlob) {
        downloadSticker(sticker, 'png');
        await new Promise(resolve => setTimeout(resolve, 200)); // Small delay between downloads
      }
      if (sticker.webpBlob) {
        downloadSticker(sticker, 'webp');
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sticker Processor</h1>
        <div className="flex gap-2">
          <Button
            onClick={processAllStickers}
            disabled={processing || stickers.filter(s => s.status === 'pending').length === 0}
          >
            {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Process All ({stickers.filter(s => s.status === 'pending').length})
          </Button>
          <Button
            variant="outline"
            onClick={exportAllStickers}
            disabled={stickers.filter(s => s.status === 'completed').length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {processing && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Batch Progress</span>
                <span>{Math.round(batchProgress)}%</span>
              </div>
              <Progress value={batchProgress} />
              {progress > 0 && (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span>Current Sticker</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Add Stickers</TabsTrigger>
          <TabsTrigger value="process">Process Queue ({stickers.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Stickers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Sticker Name</Label>
                  <Input
                    id="name"
                    value={stickerName}
                    onChange={(e) => setStickerName(e.target.value)}
                    placeholder="Enter sticker name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={stickerCategory} onValueChange={setStickerCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {STICKER_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Tabs defaultValue="file" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="file">Upload Files</TabsTrigger>
                  <TabsTrigger value="url">From URL</TabsTrigger>
                </TabsList>
                
                <TabsContent value="file">
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      dragActive
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">
                      Drop images here or click to upload
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Supports PNG, JPG, GIF, WebP formats
                    </p>
                    <Input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button asChild>
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Files
                      </label>
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="url">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="url">Image URL</Label>
                      <div className="flex gap-2">
                        <Input
                          id="url"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="https://example.com/image.png"
                        />
                        <Button onClick={handleUrlAdd} disabled={!imageUrl.trim() || !stickerName.trim()}>
                          <LinkIcon className="w-4 h-4 mr-2" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="process">
          {stickers.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <ImageIcon className="w-12 h-12 mx-auto mb-4" />
                  <p>No stickers in queue. Upload some images to get started.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {stickers.map((sticker) => (
                <Card key={sticker.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg flex items-center justify-center">
                        {sticker.processed?.url ? (
                          <OptimizedImage
                            src={sticker.processed.url}
                            alt={sticker.name}
                            fill
                            className="object-contain rounded-lg"
                          />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{sticker.name}</h3>
                          <Badge variant="outline">{sticker.category}</Badge>
                          <Badge variant={
                            sticker.status === 'completed' ? 'default' :
                            sticker.status === 'processing' ? 'secondary' :
                            sticker.status === 'error' ? 'destructive' : 'outline'
                          }>
                            {sticker.status === 'processing' && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
                            {sticker.status === 'completed' && <Check className="w-3 h-3 mr-1" />}
                            {sticker.status === 'error' && <AlertCircle className="w-3 h-3 mr-1" />}
                            {sticker.status}
                          </Badge>
                        </div>
                        
                        {sticker.status === 'completed' && (
                          <div className="text-xs text-muted-foreground">
                            {(sticker.metadata.originalSize / 1024).toFixed(1)}KB → {(sticker.metadata.processedSize / 1024).toFixed(1)}KB
                            • {sticker.metadata.processingTime}ms
                            • 512×512px
                          </div>
                        )}
                        
                        {sticker.error && (
                          <div className="text-xs text-red-600">
                            Error: {sticker.error}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {sticker.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => processSticker(sticker.id)}
                            disabled={processing}
                          >
                            Process
                          </Button>
                        )}
                        
                        {sticker.status === 'completed' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadSticker(sticker, 'png')}
                            >
                              PNG
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadSticker(sticker, 'webp')}
                            >
                              WebP
                            </Button>
                          </>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeSticker(sticker.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}