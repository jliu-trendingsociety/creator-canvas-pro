import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";

interface AssetPack {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
}

const assetPacks: AssetPack[] = [
  {
    id: "winter-special",
    name: "Winter Special",
    description: "Cozy winter scenes and aesthetics",
    image: "https://images.unsplash.com/photo-1483086431886-3590a88317fe?w=400&h=300&fit=crop",
    category: "Seasonal",
  },
  {
    id: "looksmaxing",
    name: "Looksmaxing",
    description: "Fitness and lifestyle content",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop",
    category: "Lifestyle",
  },
  {
    id: "2000s-nostalgia",
    name: "2000s Nostalgia",
    description: "Y2K aesthetic vibes",
    image: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=400&h=300&fit=crop",
    category: "Aesthetic",
  },
  {
    id: "aura-farming",
    name: "Aura Farming",
    description: "Mystical and ethereal content",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=300&fit=crop",
    category: "Creative",
  },
  {
    id: "editorial-shots",
    name: "Editorial Shots",
    description: "Professional fashion photography",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=300&fit=crop",
    category: "Fashion",
  },
  {
    id: "cinematic",
    name: "Cinematic",
    description: "Film-quality video templates",
    image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=300&fit=crop",
    category: "Video",
  },
  {
    id: "product-ads",
    name: "Product Ads",
    description: "Commercial product showcases",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
    category: "Commercial",
  },
  {
    id: "viral-ads",
    name: "Viral Ads",
    description: "Trending advertisement styles",
    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop",
    category: "Social",
  },
  {
    id: "ugc",
    name: "UGC",
    description: "User-generated content templates",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop",
    category: "Social",
  },
];

const categories = ["All", "Seasonal", "Lifestyle", "Aesthetic", "Creative", "Fashion", "Video", "Commercial", "Social"];

interface AssetsBrowserProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AssetsBrowser = ({ open, onOpenChange }: AssetsBrowserProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredAssets = assetPacks.filter((pack) => {
    const matchesSearch = pack.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pack.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || pack.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[80vh] bg-background border-border p-0 z-50">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <DialogTitle className="text-2xl font-bold">Browse Assets</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Explore pre-made templates, presets, and asset packs
          </p>
        </DialogHeader>

        <div className="px-6 py-4 border-b border-border space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-surface border-border rounded-xl h-11"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? "bg-neon text-background"
                    : "bg-surface-elevated hover:bg-surface text-foreground"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {filteredAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-muted-foreground mb-2">No assets found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssets.map((pack) => (
                <Card
                  key={pack.id}
                  className="bg-card border-border overflow-hidden cursor-pointer group hover:border-neon/50 transition-all"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={pack.image}
                      alt={pack.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-foreground">{pack.name}</h3>
                        <span className="text-xs bg-surface-elevated text-muted-foreground px-2 py-1 rounded">
                          {pack.category}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{pack.description}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-card">
                    <Button
                      className="w-full bg-surface-elevated hover:bg-neon hover:text-background border border-border hover:border-neon transition-all font-semibold"
                      size="sm"
                    >
                      Select Pack
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border bg-surface/50 flex items-center justify-between">
          <Button
            variant="ghost"
            className="hover:bg-surface-elevated hover:text-neon"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button className="bg-neon text-background hover:bg-neon-glow font-semibold">
            <Plus className="w-4 h-4 mr-2" />
            Create Custom Pack
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
