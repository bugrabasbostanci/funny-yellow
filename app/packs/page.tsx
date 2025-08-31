import dynamic from "next/dynamic";

// Lazy load PackGallery for better performance  
const PackGallery = dynamic(() => import("@/components/pack-gallery").then(mod => ({ default: mod.PackGallery })), {
  loading: () => (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted/50 rounded w-64 mx-auto"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-muted/50 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
});
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AdminAuthProvider } from "@/lib/admin-auth-context";

export const metadata = {
  title: "Sticker Packs - Funny Yellow",
  description: "Browse curated sticker packs organized by characters and themes. Download complete collections of Kermit, Pocoyo, Shrek, and more.",
};

export default function PacksPage() {
  return (
    <AdminAuthProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <PackGallery />
        </main>
        <Footer />
      </div>
    </AdminAuthProvider>
  );
}