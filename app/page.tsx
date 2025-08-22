import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { StickerGallery } from "@/components/sticker-gallery";
import { Footer } from "@/components/footer";
import { AdminAuthProvider } from "@/lib/admin-auth-context";

export default function HomePage() {
  return (
    <AdminAuthProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <HeroSection />
          <StickerGallery />
        </main>
        <Footer />
      </div>
    </AdminAuthProvider>
  );
}
