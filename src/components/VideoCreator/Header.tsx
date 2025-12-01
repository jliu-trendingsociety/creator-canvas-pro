import { Button } from "@/components/ui/button";
import { NavigationDropdown, navigationData } from "./NavigationDropdown";

export const Header = () => {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="w-full px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="text-neon">●</span>
            CreatorStudio
          </h1>
          <nav className="hidden md:flex items-center gap-1">
            <Button variant="ghost" size="sm" className="hover:text-neon hover:bg-surface-elevated">
              Explore
            </Button>
            <NavigationDropdown label="Image" data={navigationData.image} />
            <NavigationDropdown label="Video" data={navigationData.video} />
            <NavigationDropdown label="Edit" data={navigationData.edit} />
            <NavigationDropdown label="Character" data={navigationData.character} />
            <Button variant="ghost" size="sm" className="hover:text-neon hover:bg-surface-elevated">
              Sora 2 Trends
            </Button>
            <Button variant="ghost" size="sm" className="hover:text-neon hover:bg-surface-elevated">
              Assist
            </Button>
            <Button variant="ghost" size="sm" className="hover:text-neon hover:bg-surface-elevated">
              Popcorn
            </Button>
            <Button variant="ghost" size="sm" className="hover:text-neon hover:bg-surface-elevated">
              Community
            </Button>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="hover:text-neon hover:bg-surface-elevated">
            Pricing
          </Button>
          <Button variant="ghost" size="sm" className="hover:text-neon hover:bg-surface-elevated">
            Login
          </Button>
          <Button size="sm" className="bg-neon text-background hover:bg-neon-glow font-semibold">
            Sign up
          </Button>
        </div>
      </div>
    </header>
  );
};
