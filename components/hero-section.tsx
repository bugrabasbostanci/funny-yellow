"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Package } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative py-12 sm:py-20 lg:py-24 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <Badge
            variant="secondary"
            className="mb-6 px-4 py-2 text-sm font-medium border border-primary rounded-full"
          >
            Free Sticker Platform
          </Badge>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 font-display">
            Make Chat <span className="text-primary relative">Fun Again!</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            High-quality, funny stickers for WhatsApp and beyond. Express
            yourself with free sticker collections that make every conversation
            memorable.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3"
              onClick={() =>
                document
                  .getElementById("sticker-gallery")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <Download className="w-5 h-5 mr-2" />
              Browse Stickers
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-3 font-semibold"
              onClick={() => window.open("/packs", "_self")}
            >
              <Package className="w-5 h-5 mr-2" />
              View Packs
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg mx-auto">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary font-display">
                80+
              </div>
              <div className="text-sm text-muted-foreground">Free Stickers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary font-display">
                100%
              </div>
              <div className="text-sm text-muted-foreground">Free Forever</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
