import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  span: "small" | "medium" | "large";
}

const galleryImages: GalleryImage[] = [
  {
    id: "1",
    url: "https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=800&h=1200&fit=crop",
    alt: "Dark forest with red atmospheric lighting",
    span: "large",
  },
  {
    id: "2",
    url: "https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=800&h=600&fit=crop",
    alt: "Modern library with curved architecture",
    span: "medium",
  },
  {
    id: "3",
    url: "https://images.unsplash.com/photo-1547637589-f54c34f5d7a4?w=800&h=600&fit=crop",
    alt: "Racing cars on track",
    span: "medium",
  },
  {
    id: "4",
    url: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=800&h=600&fit=crop",
    alt: "Urban city street at night",
    span: "medium",
  },
  {
    id: "5",
    url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=1200&fit=crop",
    alt: "Modern house exterior at dusk",
    span: "large",
  },
  {
    id: "6",
    url: "https://images.unsplash.com/photo-1587613863965-7ff64bc06f90?w=800&h=600&fit=crop",
    alt: "Peeled banana on purple background",
    span: "small",
  },
  {
    id: "7",
    url: "https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=800&h=800&fit=crop",
    alt: "Astronaut comic illustration",
    span: "medium",
  },
  {
    id: "8",
    url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=1000&fit=crop",
    alt: "Golden sunset over field",
    span: "medium",
  },
  {
    id: "9",
    url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
    alt: "Retro television sets display",
    span: "medium",
  },
];

export const GallerySection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-8">
        <h2 className="text-5xl font-bold mb-12 text-neon tracking-tight">
          NANO BANANA PRO GALLERY
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {galleryImages.map((image) => (
            <div
              key={image.id}
              className={`group relative overflow-hidden rounded-xl cursor-pointer ${
                image.span === "large"
                  ? "row-span-2"
                  : image.span === "medium"
                  ? "row-span-1"
                  : "row-span-1"
              }`}
            >
              <img
                src={image.url}
                alt={image.alt}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ExternalLink className="w-8 h-8 text-neon" />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <Button
            className="bg-transparent border-2 border-neon text-neon hover:bg-neon hover:text-background font-bold px-8 py-6 text-base rounded-xl transition-all"
          >
            View all Nano Banana Pro Gallery
          </Button>
        </div>
      </div>
    </section>
  );
};
