import { useTimelineStore } from "../state/timelineStore";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2, Minus, Plus } from "lucide-react";
import { useState, useCallback } from "react";

interface ZoomControlsProps {
  containerRef: React.RefObject<HTMLDivElement>;
  currentTime?: number;
  duration?: number;
}

export const ZoomControls = ({ containerRef, currentTime = 0, duration = 1 }: ZoomControlsProps) => {
  const { zoom, setZoom, totalThumbnailWidth } = useTimelineStore();
  const [isHovering, setIsHovering] = useState(false);

  /**
   * Professional zoom centered on playhead or cursor
   * Matches Adobe Premiere behavior
   */
  const handleZoom = useCallback((delta: number, centerOnPlayhead: boolean = true) => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const viewportWidth = container.clientWidth;
    const oldZoom = zoom;
    const newZoom = Math.max(0.25, Math.min(8.0, zoom + delta));
    
    if (oldZoom === newZoom) return;

    // Calculate the point to zoom around
    let centerPoint: number;
    
    if (centerOnPlayhead && currentTime !== undefined && duration > 0) {
      // Center on playhead position
      const playheadPx = (currentTime / duration) * totalThumbnailWidth * oldZoom;
      centerPoint = playheadPx;
    } else {
      // Center on viewport middle
      centerPoint = container.scrollLeft + viewportWidth / 2;
    }

    // Calculate what timeline moment this point represents (before zoom)
    const momentBeforeZoom = centerPoint / oldZoom;

    // Apply new zoom
    setZoom(newZoom);

    // Calculate new scroll position to keep the same moment centered
    requestAnimationFrame(() => {
      const newCenterPoint = momentBeforeZoom * newZoom;
      const newScrollLeft = Math.round(newCenterPoint - viewportWidth / 2);
      container.scrollLeft = Math.max(0, newScrollLeft);
    });
  }, [zoom, setZoom, containerRef, currentTime, duration, totalThumbnailWidth]);

  const handleReset = useCallback(() => {
    setZoom(1.0);
    if (containerRef.current) {
      containerRef.current.scrollLeft = 0;
    }
  }, [setZoom, containerRef]);

  const isMinZoom = zoom <= 0.25;
  const isMaxZoom = zoom >= 8.0;
  
  // Zoom preset levels
  const zoomPresets = [0.25, 0.5, 1, 2, 4, 8];
  const currentPresetIndex = zoomPresets.findIndex(preset => Math.abs(preset - zoom) < 0.01);

  return (
    <div 
      className="flex items-center gap-1 bg-surface/80 backdrop-blur-sm rounded-md px-2 py-1 border border-border/30"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Zoom Out */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleZoom(-0.25, true)}
        disabled={isMinZoom}
        className="h-7 w-7 p-0 hover:bg-neon/10 hover:text-neon disabled:opacity-30"
        title="Zoom Out (25%)"
      >
        <Minus className="w-3.5 h-3.5" />
      </Button>
      
      {/* Zoom Level Display */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleReset}
        className="h-7 px-3 hover:bg-neon/10 hover:text-neon text-[11px] font-mono font-medium min-w-[60px]"
        title="Reset to 100%"
      >
        {(zoom * 100).toFixed(0)}%
      </Button>
      
      {/* Zoom In */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleZoom(0.25, true)}
        disabled={isMaxZoom}
        className="h-7 w-7 p-0 hover:bg-neon/10 hover:text-neon disabled:opacity-30"
        title="Zoom In (25%)"
      >
        <Plus className="w-3.5 h-3.5" />
      </Button>

      {/* Separator */}
      <div className="w-px h-4 bg-border/50 mx-1" />

      {/* Fit to Timeline */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleReset}
        className="h-7 w-7 p-0 hover:bg-neon/10 hover:text-neon"
        title="Fit Timeline"
      >
        <Maximize2 className="w-3.5 h-3.5" />
      </Button>

      {/* Zoom Presets - Show on hover */}
      {isHovering && (
        <div className="flex items-center gap-0.5 ml-1 animate-in fade-in duration-150">
          {zoomPresets.map((preset, index) => (
            <Button
              key={preset}
              variant="ghost"
              size="sm"
              onClick={() => {
                setZoom(preset);
                if (containerRef.current) {
                  const container = containerRef.current;
                  const viewportWidth = container.clientWidth;
                  const momentBeforeZoom = (container.scrollLeft + viewportWidth / 2) / zoom;
                  requestAnimationFrame(() => {
                    const newCenterPoint = momentBeforeZoom * preset;
                    const newScrollLeft = Math.round(newCenterPoint - viewportWidth / 2);
                    container.scrollLeft = Math.max(0, newScrollLeft);
                  });
                }
              }}
              className={`h-6 px-2 text-[10px] font-mono ${
                currentPresetIndex === index 
                  ? 'bg-neon/20 text-neon' 
                  : 'hover:bg-neon/10 hover:text-neon'
              }`}
              title={`${preset * 100}%`}
            >
              {preset}x
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};
