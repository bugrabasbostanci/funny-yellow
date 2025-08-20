"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Smartphone,
  Monitor,
  MessageCircle,
  ExternalLink,
  Play,
  Plus,
  HelpCircle,
} from "lucide-react";
import { useState } from "react";

interface HowToGuideProps {
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function HowToGuide({ trigger, isOpen, onOpenChange }: HowToGuideProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<
    "mobile" | "desktop"
  >("mobile");

  const defaultTrigger = (
    <Button
      variant="outline"
      size="sm"
      className="bg-yellow-50 hover:bg-yellow-100 border-yellow-200"
    >
      <HelpCircle className="w-4 h-4 mr-2" />
      How to Add Stickers?
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-center">
            📱 How to Add Stickers to WhatsApp
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Platform Selection */}
          <div className="flex justify-center gap-2">
            <Button
              variant={selectedPlatform === "mobile" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPlatform("mobile")}
              className="flex items-center gap-2"
            >
              <Smartphone className="w-4 h-4" />
              Mobile
            </Button>
            <Button
              variant={selectedPlatform === "desktop" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPlatform("desktop")}
              className="flex items-center gap-2"
            >
              <Monitor className="w-4 h-4" />
              Desktop
            </Button>
          </div>

          {/* Mobile Instructions */}
          {selectedPlatform === "mobile" && (
            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <div className="flex items-center gap-2 mb-4">
                <Smartphone className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-green-800">
                  Mobile (Android/iOS)
                </h3>
              </div>

              <div className="space-y-4">
                <div className="bg-white/70 rounded-lg p-4 border border-green-200">
                  <h4 className="font-medium text-green-800 mb-3 flex items-center gap-2">
                    <span className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </span>
                    Download a Sticker Maker App
                  </h4>
                  <p className="text-sm text-green-700 mb-3">
                    First, you&apos;ll need a sticker maker app. We recommend
                    these popular options:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-700"
                    >
                      📱 Sticker Maker
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-700"
                    >
                      📱 Personal Stickers for WhatsApp
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-700"
                    >
                      📱 Stickify
                    </Badge>
                  </div>
                </div>

                <div className="bg-white/70 rounded-lg p-4 border border-green-200">
                  <h4 className="font-medium text-green-800 mb-3 flex items-center gap-2">
                    <span className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </span>
                    Download Your Sticker
                  </h4>
                  <p className="text-sm text-green-700">
                    Click the{" "}
                    <span className="font-semibold">
                      WhatsApp download button
                    </span>{" "}
                    on any sticker to save it to your device as a WebP file.
                  </p>
                </div>

                <div className="bg-white/70 rounded-lg p-4 border border-green-200">
                  <h4 className="font-medium text-green-800 mb-3 flex items-center gap-2">
                    <span className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </span>
                    Import to Sticker Maker
                  </h4>
                  <p className="text-sm text-green-700">
                    Open your sticker maker app and import the downloaded WebP
                    files. The app will automatically resize them for WhatsApp.
                  </p>
                </div>

                <div className="bg-white/70 rounded-lg p-4 border border-green-200">
                  <h4 className="font-medium text-green-800 mb-3 flex items-center gap-2">
                    <span className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                      4
                    </span>
                    Add to WhatsApp
                  </h4>
                  <p className="text-sm text-green-700">
                    Create your sticker pack and tap &quot;Add to
                    WhatsApp&quot;. The stickers will appear in your WhatsApp
                    sticker collection!
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-yellow-100 rounded-lg border border-yellow-300">
                <p className="text-xs text-yellow-800">
                  💡 <strong>Pro Tip:</strong> You can add multiple stickers to
                  create themed packs. Most apps require at least 3 stickers per
                  pack.
                </p>
              </div>
            </Card>
          )}

          {/* Desktop Instructions */}
          {selectedPlatform === "desktop" && (
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <div className="flex items-center gap-2 mb-4">
                <Monitor className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-800">
                  Desktop/Web WhatsApp
                </h3>
              </div>

              <div className="space-y-4">
                <div className="bg-white/70 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                    <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </span>
                    Download Sticker
                  </h4>
                  <p className="text-sm text-blue-700">
                    Click the{" "}
                    <span className="font-semibold">
                      WhatsApp download button
                    </span>{" "}
                    to save the sticker as a WebP file to your computer.
                  </p>
                </div>

                <div className="bg-white/70 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                    <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </span>
                    Open WhatsApp Web/Desktop
                  </h4>
                  <p className="text-sm text-blue-700">
                    Go to{" "}
                    <span className="font-semibold">web.whatsapp.com</span> or
                    open WhatsApp Desktop app and scan the QR code with your
                    phone.
                  </p>
                </div>

                <div className="bg-white/70 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                    <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </span>
                    Send as Sticker
                  </h4>
                  <p className="text-sm text-blue-700 mb-2">
                    Open any chat, click the emoji button, then the sticker tab,
                    and click the <Plus className="w-4 h-4 inline" /> button.
                  </p>
                  <p className="text-sm text-blue-700">
                    Select your downloaded WebP file and it will be sent as a
                    sticker!
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-yellow-100 rounded-lg border border-yellow-300">
                <p className="text-xs text-yellow-800">
                  💡 <strong>Note:</strong> Desktop WhatsApp doesn&apos;t save
                  stickers permanently. You&apos;ll need to re-upload them each
                  time you want to use them.
                </p>
              </div>
            </Card>
          )}

          {/* Additional Tips */}
          <Card className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-3 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Quick Tips
            </h4>
            <ul className="space-y-2 text-sm text-yellow-700">
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-0.5">•</span>
                All our stickers are pre-optimized for WhatsApp (512x512 WebP
                format)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-0.5">•</span>
                Stickers work best with transparent backgrounds
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-0.5">•</span>
                You can download as many stickers as you want - they&apos;re all
                free!
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-0.5">•</span>
                Create themed packs for better organization
              </li>
            </ul>
          </Card>

          {/* Video Tutorial Link */}
          <div className="text-center">
            <Button
              variant="outline"
              className="bg-white hover:bg-gray-50"
              asChild
            >
              <a
                href="https://www.youtube.com/results?search_query=how+to+add+stickers+whatsapp"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Play className="w-4 h-4 mr-2" />
                Watch Video Tutorial
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
