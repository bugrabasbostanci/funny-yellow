"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Package, 
  X, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from "lucide-react";
import { BulkDownloadService, type StickerForDownload } from "@/lib/bulk-download-utils";

interface BulkDownloadBarProps {
  selectedStickers: StickerForDownload[];
  onClearSelection: () => void;
  onDeselectSticker?: (stickerId: string) => void;
}

type DownloadState = 'idle' | 'downloading' | 'success' | 'error';

interface ProgressInfo {
  completed: number;
  total: number;
  current: string;
}

export function BulkDownloadBar({ 
  selectedStickers, 
  onClearSelection
}: BulkDownloadBarProps) {
  const [downloadState, setDownloadState] = useState<DownloadState>('idle');
  const [progress, setProgress] = useState<ProgressInfo>({ completed: 0, total: 0, current: '' });
  const [error, setError] = useState<string>('');
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    const handleProgress = (event: CustomEvent<ProgressInfo>) => {
      setProgress(event.detail);
    };

    window.addEventListener('bulkDownloadProgress', handleProgress as EventListener);
    return () => {
      window.removeEventListener('bulkDownloadProgress', handleProgress as EventListener);
    };
  }, []);


  const handleDownloadAsWhatsApp = async () => {
    const validation = BulkDownloadService.validateSelection(selectedStickers, 'whatsapp-pack');
    
    if (!validation.isValid) {
      setError(validation.error || 'Invalid selection');
      setDownloadState('error');
      return;
    }

    setDownloadState('downloading');
    setError('');
    setShowOptions(false);

    try {
      await BulkDownloadService.downloadAsWhatsAppPack(
        selectedStickers,
        `My Sticker Pack - ${new Date().toLocaleDateString()}`
      );
      setDownloadState('success');
      setTimeout(() => {
        setDownloadState('idle');
        onClearSelection();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'WhatsApp pack creation failed');
      setDownloadState('error');
    }
  };

  const handleDownloadIndividual = async () => {
    setDownloadState('downloading');
    setError('');
    setShowOptions(false);

    try {
      await BulkDownloadService.downloadIndividualStickers(selectedStickers);
      setDownloadState('success');
      setTimeout(() => {
        setDownloadState('idle');
        onClearSelection();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Individual download failed');
      setDownloadState('error');
    }
  };

  if (selectedStickers.length === 0) {
    return null;
  }

  const progressPercentage = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;
  const categories = [...new Set(selectedStickers.map(s => s.category))];

  return (
    <>
      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Selection Info */}
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="px-3 py-1">
                {selectedStickers.length} selected
              </Badge>
              <div className="hidden sm:flex gap-1">
                {categories.slice(0, 3).map(category => (
                  <Badge key={category} variant="outline" className="text-xs">
                    {category}
                  </Badge>
                ))}
                {categories.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{categories.length - 3}
                  </Badge>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {downloadState === 'downloading' ? (
                <div className="flex items-center gap-3">
                  <div className="text-sm text-muted-foreground">
                    {progress.current && (
                      <span className="hidden sm:inline">Downloading: {progress.current}</span>
                    )}
                  </div>
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              ) : downloadState === 'success' ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Downloaded!</span>
                </div>
              ) : downloadState === 'error' ? (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Error</span>
                </div>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowOptions(true)}
                    className="hidden sm:flex"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                  
                  {/* Quick download for recommended format */}
                  <Button
                    size="sm"
                    onClick={handleDownloadIndividual}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Download All</span>
                  </Button>
                </>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                disabled={downloadState === 'downloading'}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          {downloadState === 'downloading' && (
            <div className="mt-3">
              <Progress value={progressPercentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{progress.completed} / {progress.total}</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Download Options Dialog */}
      <Dialog open={showOptions} onOpenChange={setShowOptions}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Download Options</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {selectedStickers.length} stickers selected from {categories.length} categories
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Error</span>
                </div>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            )}

            <div className="grid gap-3">
              {/* Individual Downloads - Primary option */}
              <Button
                variant="outline"
                className="justify-start h-auto p-4 border-2 border-primary/20 hover:border-primary/40"
                onClick={handleDownloadIndividual}
                disabled={downloadState === 'downloading'}
              >
                <div className="flex items-start gap-3">
                  <Download className="w-5 h-5 mt-0.5 text-primary" />
                  <div className="text-left">
                    <div className="font-medium text-primary">Download All Stickers</div>
                    <div className="text-xs text-muted-foreground">
                      Each sticker downloads separately - works on all devices
                    </div>
                  </div>
                </div>
              </Button>

              {/* WhatsApp Pack - Secondary option */}
              <Button
                variant="outline"
                className="justify-start h-auto p-4"
                onClick={handleDownloadAsWhatsApp}
                disabled={downloadState === 'downloading' || selectedStickers.length > 30}
              >
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 mt-0.5 text-green-600" />
                  <div className="text-left">
                    <div className="font-medium">WhatsApp Sticker Pack</div>
                    <div className="text-xs text-muted-foreground">
                      {selectedStickers.length > 30 
                        ? 'Maximum 30 stickers allowed' 
                        : 'Optimized for WhatsApp (includes instructions)'
                      }
                    </div>
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bottom spacing to prevent content overlap */}
      <div className="h-20" />
    </>
  );
}