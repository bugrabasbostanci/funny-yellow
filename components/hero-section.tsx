import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Star, Zap } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative py-12 sm:py-20 lg:py-24 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-100/50 to-orange-100/30" />
      <div className="absolute top-10 left-10 text-6xl opacity-10 animate-bounce-gentle">😂</div>
      <div
        className="absolute top-32 right-16 text-4xl opacity-10 animate-bounce-gentle"
        style={{ animationDelay: "0.5s" }}
      >
        🤣
      </div>
      <div
        className="absolute bottom-20 left-20 text-5xl opacity-10 animate-bounce-gentle"
        style={{ animationDelay: "1s" }}
      >
        😍
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium">
            <Star className="w-4 h-4 mr-2 text-yellow-500" />
            Free Sticker Platform
          </Badge>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 font-display">
            Make Chat{" "}
            <span className="text-primary relative">
              Fun Again!
              <div className="absolute -top-2 -right-2 text-2xl animate-bounce-gentle">✨</div>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            High-quality, funny stickers for WhatsApp and beyond. Express yourself with free sticker collections that
            make every conversation memorable.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3 animate-pulse-yellow"
            >
              <Download className="w-5 h-5 mr-2" />
              Browse Stickers
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-3 font-semibold bg-transparent">
              <Zap className="w-5 h-5 mr-2" />
              Create Pack
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary font-display">50K+</div>
              <div className="text-sm text-muted-foreground">Happy Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary font-display">10K+</div>
              <div className="text-sm text-muted-foreground">Quality Stickers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary font-display">1M+</div>
              <div className="text-sm text-muted-foreground">Downloads</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
