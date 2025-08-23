"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Github, Heart, Settings, LogOut } from "lucide-react";
import Image from "next/image";
import { AdminAuthModal } from "@/components/admin-auth-modal";
import { useAdminAuth } from "@/lib/admin-auth-context";

export function Header() {
  const { isAuthenticated, login, logout } = useAdminAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleAdminClick = () => {
    if (isAuthenticated) {
      // If authenticated, navigate to admin
      window.location.href = "/admin";
    } else {
      // If not authenticated, show auth modal
      setShowAuthModal(true);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <Image
              src="/funny-yellow-logo.svg"
              alt="Funny Yellow Logo"
              width={64}
              height={64}
              className="w-16 h-16 transition-transform duration-200 hover:scale-110"
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


          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
              onClick={handleAdminClick}
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
            </Button>

            {isAuthenticated && (
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
                onClick={logout}
                title="Admin logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex items-center space-x-2 text-muted-foreground hover:text-foreground"
              onClick={() =>
                window.open(
                  "https://github.com/bugrabasbostanci/funny-yellow",
                  "_blank"
                )
              }
            >
              <Github className="h-4 w-4" />
              <span>GitHub</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex items-center space-x-2 bg-red-50 border-red-200 text-red-600 hover:bg-red-100 hover:border-red-300"
            >
              <Heart className="h-4 w-4" />
              <span>Support</span>
            </Button>
          </div>
        </div>
      </div>
      
      <AdminAuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        onAuthSuccess={login}
      />
    </header>
  );
}
