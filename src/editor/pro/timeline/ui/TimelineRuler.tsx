import { useTimelineStore } from '../state/timelineStore';
import { timeToPx } from '../core/coordinateSystem';
import { formatTime } from '../utils/time';

interface TimelineRulerProps {
  duration: number;
}

export const TimelineRuler = ({ duration }: TimelineRulerProps) => {
  const { zoom, totalThumbnailWidth } = useTimelineStore();

  if (duration === 0 || totalThumbnailWidth === 0) return null;

  // Calculate tick interval based on zoom level
  const getTickInterval = () => {
    if (zoom >= 2) return 1; // Every second at high zoom
    if (zoom >= 1) return 5; // Every 5 seconds at medium zoom
    return 10; // Every 10 seconds at low zoom
  };

  const tickInterval = getTickInterval();
  const ticks: number[] = [];
  
  for (let time = 0; time <= duration; time += tickInterval) {
    ticks.push(time);
  }

  return (
    <div className="flex w-full h-7 border-b border-border/30 bg-surface/20">
      {/* Left spacer matching track header width */}
      <div className="w-40 flex-shrink-0 border-r border-border/30 bg-surface/30" />
      
      {/* Ruler ticks area */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0">
          {ticks.map((time) => {
            const left = timeToPx(time, { duration, totalWidth: totalThumbnailWidth, zoom });
            return (
              <div
                key={time}
                className="absolute top-0 flex flex-col items-start"
                style={{ left: `${left}px` }}
              >
                <span className="text-[10px] text-muted-foreground font-mono px-1">
                  {formatTime(time)}
                </span>
                <div className="w-px h-2 bg-border/50" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
