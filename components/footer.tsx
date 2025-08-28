export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between py-6 space-y-4 sm:space-y-0">
          <div className="text-sm text-muted-foreground">
            © 2025 Funny Yellow. All rights reserved.
          </div>

          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <a href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="/terms" className="hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="/contact" className="hover:text-foreground transition-colors">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
