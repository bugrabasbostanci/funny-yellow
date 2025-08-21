import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { StickerGallery } from "@/components/sticker-gallery";
import { Footer } from "@/components/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <StickerGallery />
      </main>
      <Footer />
    </div>
  );
}
