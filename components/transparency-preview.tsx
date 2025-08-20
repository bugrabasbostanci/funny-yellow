"use client";

import type React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Grid3X3, 
  Palette, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff,
  RotateCcw
} from "lucide-react";
import { OptimizedImage } from "./optimized-image";

interface TransparencyPreviewProps {
  imageUrl: string;
  imageName?: string;
  className?: string;
  showAnalysis?: boolean;
  size?: number;
}

interface TransparencyAnalysis {
  hasTransparency: boolean;
  transparentPixels: number;
  totalPixels: number;
  transparencyRatio: number;
  averageAlpha: number;
  edgeTransparency: boolean;
}

const BACKGROUND_PATTERNS = [
  { name: 'Transparent', value: 'transparent', className: 'bg-transparent' },
  { name: 'White', value: 'white', className: 'bg-white' },
  { name: 'Black', value: 'black', className: 'bg-black' },
  { name: 'Gray', value: 'gray', className: 'bg-gray-500' },
  { name: 'Checkerboard', value: 'checkerboard', className: 'bg-checkerboard' },
  { name: 'Yellow', value: 'yellow', className: 'bg-yellow-100' },
  { name: 'Blue', value: 'blue', className: 'bg-blue-100' },
  { name: 'Green', value: 'green', className: 'bg-green-100' },
];

export function TransparencyPreview({ 
  imageUrl, 
  imageName = "Sticker", 
  className = "", 
  showAnalysis = true,
  size = 256 
}: TransparencyPreviewProps) {
  const [selectedBackground, setSelectedBackground] = useState('checkerboard');
  const [analysis, setAnalysis] = useState<TransparencyAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const analyzeTransparency = useCallback(async () => {
    setIsAnalyzing(true);
    
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        // Set canvas size for analysis (smaller for performance)
        const analysisSize = 100;
        canvas.width = analysisSize;
        canvas.height = analysisSize;

        ctx.drawImage(img, 0, 0, analysisSize, analysisSize);
        const imageData = ctx.getImageData(0, 0, analysisSize, analysisSize);
        const data = imageData.data;

        let transparentPixels = 0;
        let totalAlpha = 0;
        const totalPixels = data.length / 4;
        let edgeTransparency = false;

        for (let i = 0; i < data.length; i += 4) {
          const alpha = data[i + 3];
          totalAlpha += alpha;

          if (alpha < 255) {
            transparentPixels++;
          }

          // Check edges for transparency
          const pixelIndex = i / 4;
          const x = pixelIndex % analysisSize;
          const y = Math.floor(pixelIndex / analysisSize);
          
          if ((x === 0 || x === analysisSize - 1 || y === 0 || y === analysisSize - 1) && alpha < 255) {
            edgeTransparency = true;
          }
        }

        const analysisResult: TransparencyAnalysis = {
          hasTransparency: transparentPixels > 0,
          transparentPixels,
          totalPixels,
          transparencyRatio: transparentPixels / totalPixels,
          averageAlpha: totalAlpha / totalPixels,
          edgeTransparency,
        };

        setAnalysis(analysisResult);
        setIsAnalyzing(false);
      };

      img.onerror = () => {
        setIsAnalyzing(false);
        console.error('Failed to analyze image transparency');
      };

      img.src = imageUrl;
    } catch (error) {
      setIsAnalyzing(false);
      console.error('Transparency analysis failed:', error);
    }
  }, [imageUrl]);

  useEffect(() => {
    if (showAnalysis) {
      analyzeTransparency();
    }
  }, [imageUrl, showAnalysis, analyzeTransparency]);

  const getBackgroundClassName = (backgroundValue: string) => {
    if (backgroundValue === 'checkerboard') {
      return 'bg-checkerboard';
    }
    const pattern = BACKGROUND_PATTERNS.find(p => p.value === backgroundValue);
    return pattern?.className || 'bg-transparent';
  };

  const getTransparencyQuality = (): { level: string; color: string; icon: React.ReactNode } => {
    if (!analysis) return { level: 'Unknown', color: 'gray', icon: <AlertCircle className="w-4 h-4" /> };

    if (!analysis.hasTransparency) {
      return { level: 'No Transparency', color: 'red', icon: <AlertCircle className="w-4 h-4" /> };
    }

    if (analysis.transparencyRatio > 0.3) {
      return { level: 'High Transparency', color: 'green', icon: <CheckCircle2 className="w-4 h-4" /> };
    }

    if (analysis.transparencyRatio > 0.1) {
      return { level: 'Medium Transparency', color: 'yellow', icon: <CheckCircle2 className="w-4 h-4" /> };
    }

    return { level: 'Low Transparency', color: 'orange', icon: <AlertCircle className="w-4 h-4" /> };
  };

  const quality = getTransparencyQuality();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Hidden analysis canvas */}
      <canvas ref={canvasRef} className="hidden" />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Transparency Preview</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowGrid(!showGrid)}
                title={showGrid ? "Hide grid" : "Show grid"}
              >
                {showGrid ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <Grid3X3 className="w-4 h-4 ml-1" />
              </Button>
              {showAnalysis && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={analyzeTransparency}
                  disabled={isAnalyzing}
                  title="Reanalyze transparency"
                >
                  <RotateCcw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={selectedBackground} onValueChange={setSelectedBackground} className="w-full">
            <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full">
              {BACKGROUND_PATTERNS.map((pattern) => (
                <TabsTrigger
                  key={pattern.value}
                  value={pattern.value}
                  className="text-xs px-2"
                  title={pattern.name}
                >
                  {pattern.name === 'Checkerboard' ? (
                    <Grid3X3 className="w-3 h-3" />
                  ) : pattern.name === 'Transparent' ? (
                    <Eye className="w-3 h-3" />
                  ) : (
                    <Palette className="w-3 h-3" />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {BACKGROUND_PATTERNS.map((pattern) => (
              <TabsContent key={pattern.value} value={pattern.value} className="mt-4">
                <div 
                  className={`relative rounded-lg overflow-hidden ${getBackgroundClassName(pattern.value)} ${
                    showGrid ? 'grid-overlay' : ''
                  }`}
                  style={{ 
                    width: size, 
                    height: size,
                    margin: '0 auto',
                  }}
                >
                  {pattern.value === 'checkerboard' && (
                    <div 
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage: `
                          linear-gradient(45deg, #ccc 25%, transparent 25%), 
                          linear-gradient(-45deg, #ccc 25%, transparent 25%), 
                          linear-gradient(45deg, transparent 75%, #ccc 75%), 
                          linear-gradient(-45deg, transparent 75%, #ccc 75%)
                        `,
                        backgroundSize: '20px 20px',
                        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                      }}
                    />
                  )}
                  
                  <div className="relative w-full h-full p-4">
                    <OptimizedImage
                      src={imageUrl}
                      alt={`${imageName} transparency preview`}
                      fill
                      className="object-contain"
                      sizes={`${size}px`}
                      quality={95}
                    />
                  </div>

                  {showGrid && (
                    <div 
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        backgroundImage: `
                          linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: '20px 20px'
                      }}
                    />
                  )}
                </div>
                
                <div className="text-center mt-2 text-sm text-muted-foreground">
                  Background: {pattern.name}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* Transparency Analysis */}
          {showAnalysis && analysis && (
            <Card className="bg-muted/50">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Transparency Analysis</h4>
                  <Badge 
                    variant={quality.color === 'green' ? 'default' : quality.color === 'red' ? 'destructive' : 'secondary'}
                    className="flex items-center gap-1"
                  >
                    {quality.icon}
                    {quality.level}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Transparent Pixels</div>
                    <div className="font-medium">
                      {analysis.transparentPixels.toLocaleString()} / {analysis.totalPixels.toLocaleString()}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-muted-foreground">Transparency Ratio</div>
                    <div className="font-medium">
                      {(analysis.transparencyRatio * 100).toFixed(1)}%
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-muted-foreground">Average Alpha</div>
                    <div className="font-medium">
                      {Math.round(analysis.averageAlpha)}/255
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-muted-foreground">Edge Transparency</div>
                    <div className="font-medium">
                      {analysis.edgeTransparency ? (
                        <span className="text-green-600">✓ Yes</span>
                      ) : (
                        <span className="text-orange-600">✗ No</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quality Recommendations */}
                <div className="pt-2 border-t border-border">
                  <div className="text-xs text-muted-foreground">
                    {!analysis.hasTransparency && (
                      <p>⚠️ No transparency detected. Consider removing the background for better sticker quality.</p>
                    )}
                    {analysis.hasTransparency && analysis.transparencyRatio < 0.1 && (
                      <p>💡 Low transparency detected. The background removal might need improvement.</p>
                    )}
                    {analysis.hasTransparency && !analysis.edgeTransparency && (
                      <p>💡 No edge transparency. Consider feathering edges for better blending.</p>
                    )}
                    {analysis.hasTransparency && analysis.transparencyRatio > 0.1 && analysis.edgeTransparency && (
                      <p>✅ Excellent transparency quality! Perfect for sticker use.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <style jsx>{`
        .bg-checkerboard {
          background-image: 
            linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
            linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
            linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        }
        
        .grid-overlay {
          position: relative;
        }
      `}</style>
    </div>
  );
}