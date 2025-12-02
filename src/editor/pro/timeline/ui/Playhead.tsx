import { useEffect, useState } from "react";
import { timeToPx } from "../core/coordinateSystem";
import { useTimelineStore } from "../state/timelineStore";

interface PlayheadProps {
  currentTime: number;
  duration: number;
  height?: number;
}

export const Playhead = ({ currentTime, duration, height = 136 }: PlayheadProps) => {
  const { totalThumbnailWidth, zoom } = useTimelineStore();
  const [position, setPosition] = useState(0);

  useEffect(() => {
    if (totalThumbnailWidth === 0) return;
    const px = timeToPx(currentTime, { duration, totalWidth: totalThumbnailWidth, zoom });
    // Snap to pixel boundaries for crisp rendering
    setPosition(Math.round(px));
  }, [currentTime, duration, totalThumbnailWidth, zoom]);

  if (totalThumbnailWidth === 0) return null;

  return (
    <div
      className="absolute top-0 pointer-events-none z-50"
      style={{ 
        left: `${position}px`,
        width: '2px',
        height: `${height}px`,
      }}
    >
      {/* Playhead line - Premiere yellow */}
      <div className="w-full h-full bg-neon" />
      
      {/* Playhead head - triangle */}
      <div 
        className="absolute -top-1 left-1/2 -translate-x-1/2"
        style={{
          width: 0,
          height: 0,
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderTop: '6px solid hsl(var(--neon))',
        }}
      />
    </div>
  );
};
