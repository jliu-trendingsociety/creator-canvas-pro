import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

interface Feature {
  name: string;
  description: string;
  icon?: string;
  badge?: string;
}

interface Model {
  name: string;
  description: string;
  badge?: string;
}

interface DropdownSection {
  title: string;
  features: Feature[];
  models: Model[];
}

const videoData: DropdownSection = {
  title: "Video",
  features: [
    { name: "Create Video", description: "Generate AI videos", badge: "NEW" },
    { name: "Edit Video", description: "Edit scenes, shots, elements" },
    { name: "Click to Ad", description: "Turn product URLs into video ads" },
    { name: "Lipsync Studio", description: "Create Talking Clips" },
    { name: "Draw to Video", description: "Sketch turns into a cinema" },
    { name: "Sketch to Video", description: "From sketch to video with Sora 2" },
    { name: "UGC Factory", description: "Build UGC video with avatar" },
    { name: "Video Upscale", description: "Enhance video quality" },
    { name: "Higgsfield Animate", description: "Video smart replacement" },
    { name: "Recast Studio", description: "Transform clips with style" },
  ],
  models: [
    { name: "Higgsfield DOP", description: "VFX and camera control" },
    { name: "Sora 2", description: "OpenAI's most advanced video model" },
    { name: "Google Veo 3.1", description: "Advanced AI video with sound" },
    { name: "Wan 2.5", description: "Next-gen video generation with sound" },
    { name: "Kling 2.5 Turbo", description: "Powerful creation, great value" },
    { name: "Kling O1 Edit", description: "Advanced video editing", badge: "NEW" },
    { name: "Minimax Hailuo O2", description: "Best high-dynamic video" },
    { name: "Seedance Pro", description: "Create multi-shot videos" },
    { name: "Kling Speak", description: "Next-gen talking avatars" },
  ],
};

const imageData: DropdownSection = {
  title: "Image",
  features: [
    { name: "Create Image", description: "Generate AI images" },
    { name: "Create Storyboard", description: "Design your story scenes" },
    { name: "Soul ID Character", description: "Create unique character" },
    { name: "Edit Image", description: "Change with inpainting" },
    { name: "Image Upscale", description: "Enhance image quality" },
    { name: "Face Swap", description: "Create Realistic Face Swaps" },
    { name: "Character Swap", description: "Create Realistic Character Swaps" },
    { name: "Draw to Edit", description: "From sketch to picture" },
    { name: "Instadump", description: "Turn a selfie into a full content library" },
    { name: "Photodump Studio", description: "Generate Your Aesthetic" },
    { name: "Fashion Factory", description: "Create fashion sets" },
  ],
  models: [
    { name: "Higgsfield Soul", description: "Ultra-realistic fashion visuals", badge: "BEST" },
    { name: "Higgsfield Popcorn", description: "Storyboard, edit, create" },
    { name: "Nano Banana Pro", description: "Best 4K image model ever", badge: "NEW" },
    { name: "FLUX.2", description: "Ultra-fast, detailed images", badge: "NEW" },
    { name: "Reve", description: "Advanced image editing model" },
    { name: "Seedream 4.0", description: "Advanced image editing" },
    { name: "Wan 2.2 Image", description: "Realistic images" },
    { name: "GPT Image", description: "Advanced OpenAI model" },
    { name: "Topaz", description: "High-resolution upscaler" },
  ],
};

const editData: DropdownSection = {
  title: "Edit",
  features: [
    { name: "Edit Image", description: "Edit scenes, shots, elements" },
    { name: "Edit Video", description: "Advanced video editing", badge: "NEW" },
    { name: "Banana Placement", description: "More control, more products" },
    { name: "Product Placement", description: "Place products in an image", badge: "NEW" },
    { name: "Upscale", description: "Enhance resolution and quality" },
    { name: "Higgsfield Angles", description: "Generate from different angles" },
  ],
  models: [
    { name: "Higgsfield Soul Inpaint", description: "Edit stylish visuals" },
    { name: "Flux Kontext", description: "Visual edits by prompt" },
    { name: "Nano Banana Edit", description: "Advanced image editing" },
    { name: "Kling O1 Edit", description: "Advanced video editing" },
    { name: "Topaz", description: "High-resolution upscaler" },
  ],
};

const characterData: DropdownSection = {
  title: "Character",
  features: [
    { name: "Face Swap", description: "Create Realistic Face Swaps" },
    { name: "Character Swap", description: "Create Realistic Character Swaps" },
    { name: "Video Face Swap", description: "Create Realistic Video Face Swaps" },
    { name: "Recast Studio", description: "Transform clips with style" },
  ],
  models: [
    { name: "Soul ID Character", description: "Create unique character" },
  ],
};

interface NavigationDropdownProps {
  label: string;
  data: DropdownSection;
}

export const NavigationDropdown = ({ label, data }: NavigationDropdownProps) => {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-transparent hover:bg-surface-elevated text-foreground font-normal px-4 py-2 h-auto">
            {label}
          </NavigationMenuTrigger>
          <NavigationMenuContent className="bg-sidebar border-border">
            <div className="grid grid-cols-2 gap-8 p-8 w-[600px]">
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-4 tracking-wide">
                  Features
                </h3>
                <div className="space-y-1">
                  {data.features.map((feature) => (
                    <button
                      key={feature.name}
                      className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-surface-elevated transition-colors group"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground group-hover:text-neon transition-colors">
                          {feature.name}
                        </span>
                        {feature.badge && (
                          <span className="text-[10px] font-bold bg-neon text-background px-1.5 py-0.5 rounded">
                            {feature.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {feature.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-4 tracking-wide">
                  Models
                </h3>
                <div className="space-y-1">
                  {data.models.map((model) => (
                    <button
                      key={model.name}
                      className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-surface-elevated transition-colors group"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground group-hover:text-neon transition-colors">
                          {model.name}
                        </span>
                        {model.badge && (
                          <span className="text-[10px] font-bold bg-neon text-background px-1.5 py-0.5 rounded">
                            {model.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {model.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export const navigationData = {
  video: videoData,
  image: imageData,
  edit: editData,
  character: characterData,
};
