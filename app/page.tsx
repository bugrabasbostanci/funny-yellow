import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { StickerGallery } from "@/components/sticker-gallery";
import { Footer } from "@/components/footer";
import { ErrorBoundary } from "@/components/error-boundary";
import { AdminAuthProvider } from "@/lib/admin-auth-context";

export default function HomePage() {
  return (
    <AdminAuthProvider>
      <div className="min-h-screen flex flex-col">
        <ErrorBoundary>
          <Header />
        </ErrorBoundary>
        <main className="flex-1">
          <ErrorBoundary>
            <HeroSection />
          </ErrorBoundary>
          <ErrorBoundary>
            <StickerGallery />
          </ErrorBoundary>
        </main>
        <ErrorBoundary>
          <Footer />
        </ErrorBoundary>
      </div>
    </AdminAuthProvider>
  );
}
