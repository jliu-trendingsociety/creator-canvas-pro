import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Model {
  id: string;
  name: string;
  type: 'video' | 'image';
}

const MODELS: Model[] = [
  { id: 'kling-2.5-turbo', name: 'Kling 2.5 Turbo', type: 'video' },
  { id: 'runway-gen3', name: 'Runway Gen-3', type: 'video' },
  { id: 'pika-labs', name: 'Pika Labs', type: 'video' },
  { id: 'stable-video', name: 'Stable Video', type: 'video' },
  { id: 'midjourney-v6', name: 'Midjourney V6', type: 'image' },
  { id: 'dall-e-3', name: 'DALL-E 3', type: 'image' },
  { id: 'stable-diffusion-xl', name: 'Stable Diffusion XL', type: 'image' },
];

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
  filterType?: 'video' | 'image' | 'all';
}

export const ModelSelector = ({ value, onChange, filterType = 'all' }: ModelSelectorProps) => {
  const filteredModels = filterType === 'all' 
    ? MODELS 
    : MODELS.filter(m => m.type === filterType);

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground">Model</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-surface border-border hover:border-neon/50 transition-all rounded-xl h-11">
          <SelectValue placeholder="Select model" />
        </SelectTrigger>
        <SelectContent className="bg-surface border-border rounded-xl">
          {filteredModels.map((model) => (
            <SelectItem 
              key={model.id} 
              value={model.id}
              className="hover:bg-surface-elevated focus:bg-surface-elevated rounded-lg"
            >
              {model.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
