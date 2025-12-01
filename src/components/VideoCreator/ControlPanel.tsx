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
    <aside className="w-80 bg-sidebar border-r border-sidebar-border p-6 space-y-6 overflow-y-auto">
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-neon">●</span> Video
        </h2>
        <div className="flex gap-2 text-sm">
          <button className="px-3 py-1.5 rounded-md bg-surface-elevated border border-border hover:border-neon/50 transition-colors">
            Draw to Video
          </button>
          <button className="px-3 py-1.5 rounded-md hover:bg-surface-elevated transition-colors">
            Sketch to Video
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Start frame</Label>
          <div className="relative">
            <div className="h-32 bg-surface-elevated rounded-lg border-2 border-dashed border-border hover:border-neon/50 transition-colors flex flex-col items-center justify-center cursor-pointer group">
              <Upload className="w-6 h-6 mb-2 text-muted-foreground group-hover:text-neon transition-colors" />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Upload image</span>
            </div>
          </div>
          <span className="text-xs text-muted-foreground">Required</span>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">End frame</Label>
          <div className="relative">
            <div className="h-32 bg-surface rounded-lg border border-border hover:border-neon/50 transition-colors flex flex-col items-center justify-center cursor-pointer group">
              <Upload className="w-6 h-6 mb-2 text-muted-foreground group-hover:text-neon transition-colors" />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Upload image</span>
            </div>
          </div>
          <span className="text-xs text-muted-foreground">Optional</span>
        </div>

        <div className="space-y-2">
          <Label htmlFor="prompt" className="text-sm font-medium">Prompt</Label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the scene you imagine, with details..."
            className="w-full h-24 px-3 py-2 bg-surface border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-neon/50 hover:border-neon/50 transition-colors"
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
            <Label className="text-sm font-medium">Duration</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="bg-surface border-border hover:border-neon/50 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-surface border-border">
                <SelectItem value="5s">5s</SelectItem>
                <SelectItem value="10s">10s</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Resolution</Label>
            <Select value={resolution} onValueChange={setResolution}>
              <SelectTrigger className="bg-surface border-border hover:border-neon/50 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-surface border-border">
                <SelectItem value="720p">720p</SelectItem>
                <SelectItem value="1080p">1080p</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button className="w-full bg-neon text-primary-foreground hover:bg-neon-glow font-semibold py-6 neon-glow transition-all">
          Generate
          <span className="ml-2 text-sm opacity-80">6</span>
        </Button>
      </div>
    </aside>
  );
};
