"use client";

import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface ScrollToTopButtonProps {
  /**
   * Distance in pixels to scroll before showing button
   * @default 300
   */
  showAfter?: number;
  /**
   * Smooth scroll behavior when clicking button
   * @default true
   */
  smoothScroll?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

export function ScrollToTopButton({
  showAfter = 300,
  smoothScroll = true,
  className,
}: ScrollToTopButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  // Monitor scroll position to show/hide button
  useEffect(() => {
    const toggleVisibility = () => {
      const scrolled = window.scrollY;
      setIsVisible(scrolled > showAfter);
    };

    // Add scroll listener with throttling for performance
    let timeoutId: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(toggleVisibility, 10);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Check initial position
    toggleVisibility();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
    };
  }, [showAfter]);

  // Scroll to top functionality with manual smooth animation
  const scrollToTop = () => {
    if (isScrolling) return; // Prevent multiple clicks

    setIsScrolling(true);

    if (smoothScroll) {
      // Manual smooth scroll implementation (same as Browse Stickers button)
      const startPosition = window.pageYOffset;
      const distance = -startPosition; // Distance to top (0)
      const duration = 600;
      let start: number | null = null;

      function smoothStep(timestamp: number) {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);

        // Smooth easing function (ease-in-out)
        const ease =
          progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        window.scrollTo(0, startPosition + distance * ease);

        if (progress < 1) {
          requestAnimationFrame(smoothStep);
        } else {
          setIsScrolling(false);
        }
      }

      requestAnimationFrame(smoothStep);
    } else {
      // Fallback for non-smooth scroll
      window.scrollTo(0, 0);
      setIsScrolling(false);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Button
      onClick={scrollToTop}
      disabled={isScrolling}
      size="icon"
      className={cn(
        // Base positioning and layout
        "fixed bottom-6 right-4 z-50 size-12",
        "sm:bottom-8 sm:right-6 sm:size-14",

        // Yellow theme styling matching project palette
        "bg-primary text-primary-foreground",
        "shadow-lg hover:shadow-xl",

        // Smooth transitions and animations
        "transition-all duration-300 ease-out",
        "hover:bg-primary/90 hover:scale-110",
        "active:scale-95",

        // Enter animation when appearing
        "animate-in slide-in-from-bottom-2 fade-in-0",

        // Focus states for accessibility
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",

        // Loading state styling
        isScrolling && "animate-pulse scale-95",

        // Custom glow effect matching yellow theme
        "before:absolute before:inset-0 before:rounded-md before:bg-primary/20",
        "before:blur-sm before:-z-10 before:transition-opacity",
        "hover:before:opacity-100 before:opacity-0",

        className
      )}
      aria-label="Scroll to top of page"
      title="Back to top"
    >
      <ChevronUp
        className={cn(
          "size-5 sm:size-6 transition-transform duration-200",
          isScrolling && "animate-bounce-gentle"
        )}
      />
    </Button>
  );
}
