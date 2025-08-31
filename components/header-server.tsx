import Image from "next/image";
import { HeaderClient } from "./header-client";

// Server Component - handles static header elements
export function HeaderServer() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Title - Static, server-rendered */}
          <div className="flex items-center space-x-3">
            <Image
              src="/funny-yellow-logo.svg"
              alt="Funny Yellow Logo"
              width={64}
              height={64}
              className="w-16 h-16 transition-transform duration-200 hover:scale-110"
              priority
            />
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-primary font-display tracking-tight">
                Funny Yellow
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block font-medium">
                Free Stickers
              </p>
            </div>
          </div>

          {/* Interactive elements - Client-rendered */}
          <HeaderClient />
        </div>
      </div>
    </header>
  );
}