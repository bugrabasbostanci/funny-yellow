import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { StickerGallery } from "@/components/sticker-gallery";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <StickerGallery />
      </main>
    </div>
  );
}
