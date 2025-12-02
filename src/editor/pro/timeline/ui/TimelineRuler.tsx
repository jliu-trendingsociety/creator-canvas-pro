/**
 * TimelineRuler
 * Displays time markers and tick marks along the timeline
 */

import { formatTime } from "../utils/time";

interface TimelineRulerProps {
  zoom: number;
  duration: number;
  totalWidth: number;
}

export const TimelineRuler = ({ zoom, duration, totalWidth }: TimelineRulerProps) => {
  if (duration === 0 || totalWidth === 0) return null;

  // Calculate tick interval based on zoom
  const baseInterval = 1; // 1 second
  const tickInterval = baseInterval / zoom;
  const tickCount = Math.ceil(duration / tickInterval);
  
  const ticks = [];
  for (let i = 0; i <= tickCount; i++) {
    const time = i * tickInterval;
    if (time > duration) break;
    
    const left = (time / duration) * totalWidth * zoom;
    
    ticks.push(
      <div
        key={i}
        className="absolute top-0 h-full flex flex-col items-center text-[10px] text-muted-foreground"
        style={{ left: `${left}px` }}
      >
        <div className="w-px h-2 bg-border" />
        <span className="mt-0.5">{formatTime(time)}</span>
      </div>
    );
  }

  return (
    <div className="absolute top-0 left-0 w-full h-6 bg-background/50 border-b border-border/30 pointer-events-none z-10">
      {ticks}
    </div>
  );
};
