import { HeaderServer } from "@/components/header-server";
import { HeroSection } from "@/components/hero-section";
import { StickerGalleryServer } from "@/components/sticker-gallery-server";
import { Footer } from "@/components/footer";
import { ErrorBoundary } from "@/components/error-boundary";
import { AdminAuthProvider } from "@/lib/admin-auth-context";

export default function HomePage() {
  return (
    <AdminAuthProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Funny Yellow",
            "url": "https://funnyyellow.com",
            "description": "Download high-quality, funny stickers for WhatsApp instantly. 100% free sticker collection.",
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://funnyyellow.com/?search={search_term_string}"
              },
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />
      <div className="min-h-screen flex flex-col">
        <ErrorBoundary>
          <HeaderServer />
        </ErrorBoundary>
        <main className="flex-1">
          <ErrorBoundary>
            <HeroSection />
          </ErrorBoundary>
          <ErrorBoundary>
            <StickerGalleryServer />
          </ErrorBoundary>
        </main>
        <ErrorBoundary>
          <Footer />
        </ErrorBoundary>
      </div>
    </AdminAuthProvider>
  );
}
