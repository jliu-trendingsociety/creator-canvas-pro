import { useTimelineStore } from '../state/timelineStore';
import { timeToPx } from '../core/coordinateSystem';
import { formatTime } from '../utils/time';

interface TimelineRulerProps {
  duration: number;
}

export const TimelineRuler = ({ duration }: TimelineRulerProps) => {
  const { zoom, totalThumbnailWidth } = useTimelineStore();

  if (duration === 0 || totalThumbnailWidth === 0) return null;

  // Calculate intervals based on zoom level
  const getIntervals = () => {
    if (zoom >= 3) {
      return { minor: 0.1, major: 1 }; // 100ms minor, 1s major at high zoom
    } else if (zoom >= 1.5) {
      return { minor: 0.25, major: 1 }; // 250ms minor, 1s major at medium zoom
    } else {
      return { minor: 1, major: 5 }; // 1s minor, 5s major at low zoom
    }
  };

  const { minor, major } = getIntervals();
  const ticks: Array<{ time: number; isMajor: boolean }> = [];
  
  for (let time = 0; time <= duration; time += minor) {
    const isMajor = Math.abs(time % major) < 0.01; // Account for floating point precision
    ticks.push({ time, isMajor });
  }

  return (
    <div className="flex w-full h-8 border-b border-border/30 bg-surface/20 relative">
      {/* Left spacer matching track header width */}
      <div className="w-40 flex-shrink-0 border-r border-border/30 bg-surface/30 flex items-center px-3">
        <span className="text-[10px] text-muted-foreground font-mono">TIMECODE</span>
      </div>
      
      {/* Ruler ticks area - scrolls with content */}
      <div className="flex-1 relative overflow-hidden bg-surface/10">
        {ticks.map(({ time, isMajor }) => {
          const left = timeToPx(time, { duration, totalWidth: totalThumbnailWidth, zoom });
          
          return (
            <div
              key={time}
              className="absolute top-0 bottom-0 flex flex-col justify-start pointer-events-none"
              style={{ left: `${left}px` }}
            >
              {/* Tick mark */}
              <div 
                className={`w-px bg-border ${
                  isMajor ? 'h-3 bg-border/80' : 'h-1.5 bg-border/40'
                }`}
              />
              
              {/* Label for major ticks */}
              {isMajor && (
                <span className="text-[10px] text-foreground font-mono font-medium mt-0.5 ml-1">
                  {formatTime(time)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
