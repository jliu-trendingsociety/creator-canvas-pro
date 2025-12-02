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
    const px = timeToPx(currentTime, { duration, totalWidth: totalThumbnailWidth, zoom });
    setPosition(px);
  }, [currentTime, duration, totalThumbnailWidth, zoom]);

  if (totalThumbnailWidth === 0) return null;

  return (
    <div
      className="absolute top-0 bottom-0 w-0.5 bg-neon shadow-[0_0_10px_rgba(186,230,55,0.6)] pointer-events-none z-30"
      style={{ left: `${position}px` }}
    >
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-neon rounded-full shadow-[0_0_8px_rgba(186,230,55,0.8)]" />
    </div>
  );
};
