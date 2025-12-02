import { useEffect, useState } from "react";
import { timeToPx } from "../coordinateSystem";
import { useTimelineStore } from "../timelineStore";

interface PlayheadProps {
  currentTime: number;
  duration: number;
}

export const Playhead = ({ currentTime, duration }: PlayheadProps) => {
  const { totalThumbnailWidth, scrollLeft, zoom } = useTimelineStore();
  const [position, setPosition] = useState(0);

  useEffect(() => {
    if (totalThumbnailWidth === 0) return;
    const px = timeToPx(currentTime, { duration, totalWidth: totalThumbnailWidth, zoom });
    setPosition(px);
  }, [currentTime, duration, totalThumbnailWidth, zoom]);

  if (totalThumbnailWidth === 0) return null;

  return (
    <div
      className="absolute top-0 w-0.5 bg-neon shadow-[0_0_10px_hsl(var(--neon)/0.6)] pointer-events-none z-50"
      style={{ 
        left: `${position}px`,
        height: '40px'
      }}
    >
      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-neon rounded-full shadow-[0_0_8px_hsl(var(--neon)/0.8)]" />
    </div>
  );
};
