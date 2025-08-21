"use client";

import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export function Header() {

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">😄</div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-primary font-display tracking-tight">
                Funny Yellow
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block font-medium">
                Make Chat Fun Again!
              </p>
            </div>
          </div>

          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search funny stickers..."
                className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 rounded-full border border-transparent hover:border-primary/20 focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-200 placeholder:text-muted-foreground/70"
              />
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {/* Mobile search button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
