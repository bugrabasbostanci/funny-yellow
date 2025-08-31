"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import dynamic from "next/dynamic";

// Lazy load AdminAuthModal - only used occasionally
const AdminAuthModal = dynamic(() => import("@/components/admin-auth-modal").then(mod => ({ default: mod.AdminAuthModal })), {
  loading: () => <div className="animate-spin w-4 h-4 border-2 border-muted border-t-primary rounded-full"></div>,
  ssr: false
});
import { useAdminAuth } from "@/lib/admin-auth-context";

// Client Component - handles interactive header elements
export function HeaderClient() {
  const { login } = useAdminAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          className="hidden sm:flex items-center space-x-2 text-muted-foreground hover:text-foreground h-11 px-4"
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
      </div>

      <AdminAuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        onAuthSuccess={login}
      />
    </>
  );
}