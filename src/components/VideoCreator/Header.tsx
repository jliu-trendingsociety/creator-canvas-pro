import { Button } from "@/components/ui/button";
import { Home, Users, Library, User } from "lucide-react";

export const Header = () => {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="text-neon">●</span>
            CreatorStudio
          </h1>
          <nav className="hidden md:flex items-center gap-1">
            <Button variant="ghost" size="sm" className="hover:text-neon">
              Explore
            </Button>
            <Button variant="ghost" size="sm" className="hover:text-neon">
              Image
            </Button>
            <Button variant="ghost" size="sm" className="bg-surface-elevated hover:bg-surface-elevated hover:text-neon">
              Video
            </Button>
            <Button variant="ghost" size="sm" className="hover:text-neon">
              Edit
            </Button>
            <Button variant="ghost" size="sm" className="hover:text-neon">
              Community
            </Button>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="hover:text-neon">
            Pricing
          </Button>
          <Button variant="ghost" size="sm" className="hover:text-neon">
            Login
          </Button>
          <Button size="sm" className="bg-neon text-primary-foreground hover:bg-neon-glow font-semibold">
            Sign up
          </Button>
        </div>
      </div>
    </header>
  );
};
