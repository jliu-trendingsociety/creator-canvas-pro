import { useTimelineStore } from "../state/timelineStore";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface ZoomControlsProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

export const ZoomControls = ({ containerRef }: ZoomControlsProps) => {
  const { zoom, setZoom } = useTimelineStore();

  const handleZoom = (delta: number) => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const viewportWidth = container.clientWidth;
    const oldZoom = zoom;
    const newZoom = zoom + delta;

    // Calculate center point before zoom
    const center = (container.scrollLeft + viewportWidth / 2) / oldZoom;

    // Apply new zoom
    setZoom(newZoom);

    // Preserve scroll position after zoom using rounded values
    requestAnimationFrame(() => {
      const newScrollLeft = Math.round(center * newZoom - viewportWidth / 2);
      container.scrollLeft = Math.max(0, newScrollLeft);
    });
  };

  const handleReset = () => {
    setZoom(1.0);
    if (containerRef.current) {
      containerRef.current.scrollLeft = 0;
    }
  };

  const isMinZoom = zoom <= 0.2;
  const isMaxZoom = zoom >= 4.0;

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleZoom(-0.2)}
        disabled={isMinZoom}
        className="h-6 px-2 hover:bg-neon/10 hover:text-neon"
      >
        <ZoomOut className="w-3 h-3" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleReset}
        className="h-6 px-2 hover:bg-neon/10 hover:text-neon text-[10px] font-mono"
      >
        {(zoom * 100).toFixed(0)}%
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleZoom(0.2)}
        disabled={isMaxZoom}
        className="h-6 px-2 hover:bg-neon/10 hover:text-neon"
      >
        <ZoomIn className="w-3 h-3" />
      </Button>
    </div>
  );
};
