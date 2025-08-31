"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import { AdminAuthModal } from "@/components/admin-auth-modal";
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