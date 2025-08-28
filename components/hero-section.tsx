"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Package } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative py-8 sm:py-16 lg:py-20 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <Badge
            variant="secondary"
            className="mb-4 sm:mb-6 px-3 py-1.5 text-xs sm:text-sm font-medium border border-primary rounded-full"
          >
            Free Sticker Platform
          </Badge>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6 font-display leading-tight">
            Make Chat <span className="text-primary relative">Fun Again!</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-xl sm:max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
            High-quality, funny stickers for WhatsApp and beyond. Express
            yourself with free sticker collections.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12">
            <Button
              size="default"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 sm:px-8 w-full sm:w-auto"
              onClick={() => {
                const element = document.getElementById("sticker-gallery");
                if (element) {
                  // Manual smooth scroll implementation
                  const targetPosition = element.offsetTop - 80; // 80px offset for header
                  const startPosition = window.pageYOffset;
                  const distance = targetPosition - startPosition;
                  const duration = 600;
                  let start: number | null = null;

                  function smoothStep(timestamp: number) {
                    if (!start) start = timestamp;
                    const progress = Math.min((timestamp - start) / duration, 1);
                    
                    // Smooth easing function
                    const ease = progress < 0.5 
                      ? 2 * progress * progress 
                      : 1 - Math.pow(-2 * progress + 2, 2) / 2;
                    
                    window.scrollTo(0, startPosition + distance * ease);
                    
                    if (progress < 1) {
                      requestAnimationFrame(smoothStep);
                    }
                  }
                  
                  requestAnimationFrame(smoothStep);
                }
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Browse Stickers
            </Button>
            <Button
              variant="outline"
              size="default"
              className="px-6 sm:px-8 font-semibold w-full sm:w-auto"
              onClick={() => window.open("/packs", "_self")}
            >
              <Package className="w-4 h-4 mr-2" />
              View Packs
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 max-w-xs sm:max-w-lg mx-auto">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-primary font-display">
                80+
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                Stickers
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-primary font-display">
                100%
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                Free
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
