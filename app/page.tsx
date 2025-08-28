import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { StickerGallery } from "@/components/sticker-gallery";
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
