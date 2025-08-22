import { PackGallery } from "@/components/pack-gallery";
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