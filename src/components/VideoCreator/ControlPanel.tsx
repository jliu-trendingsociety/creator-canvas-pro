import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ModelSelector } from "./ModelSelector";
import { Upload, Sparkles } from "lucide-react";

export const ControlPanel = () => {
  const [model, setModel] = useState("kling-2.5-turbo");
  const [duration, setDuration] = useState("5s");
  const [resolution, setResolution] = useState("1080p");
  const [enhancePrompt, setEnhancePrompt] = useState(true);
  const [prompt, setPrompt] = useState("");

  return (
    <aside className="w-[340px] bg-sidebar border-r border-sidebar-border p-6 space-y-6 overflow-y-auto">
      <div>
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2 text-muted-foreground">
          <span className="text-neon">●</span> Video
        </h2>
        <div className="flex gap-2 text-sm">
          <button className="px-4 py-2 rounded-md bg-surface-elevated border border-border hover:border-neon/50 transition-colors font-medium">
            Draw to Video
          </button>
          <button className="px-4 py-2 rounded-md hover:bg-surface-elevated border border-transparent hover:border-border transition-colors">
            Sketch to Video
          </button>
        </div>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Start frame</Label>
          <div className="relative">
            <div className="h-36 bg-surface-elevated rounded-xl border-2 border-dashed border-border hover:border-neon/50 transition-all flex flex-col items-center justify-center cursor-pointer group">
              <Upload className="w-7 h-7 mb-2 text-muted-foreground group-hover:text-neon transition-colors" />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors font-medium">Upload image</span>
            </div>
          </div>
          <span className="text-xs text-muted-foreground font-medium">Required</span>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">End frame</Label>
          <div className="relative">
            <div className="h-36 bg-surface rounded-xl border-2 border-dashed border-border hover:border-neon/50 transition-all flex flex-col items-center justify-center cursor-pointer group">
              <Upload className="w-7 h-7 mb-2 text-muted-foreground group-hover:text-neon transition-colors" />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors font-medium">Upload image</span>
            </div>
          </div>
          <span className="text-xs text-muted-foreground font-medium">Optional</span>
        </div>

        <div className="space-y-2">
          <Label htmlFor="prompt" className="text-sm font-medium text-foreground">Prompt</Label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the scene you imagine, with details..."
            className="w-full h-28 px-4 py-3 bg-surface border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-neon/50 hover:border-neon/50 transition-all text-sm"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="enhance" className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-neon" />
            Enhance
          </Label>
          <Switch
            id="enhance"
            checked={enhancePrompt}
            onCheckedChange={setEnhancePrompt}
          />
        </div>

        <ModelSelector value={model} onChange={setModel} filterType="video" />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Duration</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="bg-surface border-border hover:border-neon/50 transition-all rounded-xl h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-surface border-border rounded-xl">
                <SelectItem value="5s" className="rounded-lg">5s</SelectItem>
                <SelectItem value="10s" className="rounded-lg">10s</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Resolution</Label>
            <Select value={resolution} onValueChange={setResolution}>
              <SelectTrigger className="bg-surface border-border hover:border-neon/50 transition-all rounded-xl h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-surface border-border rounded-xl">
                <SelectItem value="720p" className="rounded-lg">720p</SelectItem>
                <SelectItem value="1080p" className="rounded-lg">1080p</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button className="w-full bg-neon text-background hover:bg-neon-glow font-bold py-7 neon-glow transition-all rounded-xl text-base">
          Generate
          <Sparkles className="ml-2 w-5 h-5" />
          <span className="ml-1 text-sm opacity-90">6</span>
        </Button>
      </div>
    </aside>
  );
};
