import { Track, Clip, useTimelineStore } from '../state/timelineStore';
import { ClipEngine } from '../engine/tracks/ClipEngine';
import { Video, Music, Sparkles } from 'lucide-react';

interface TimelineTrackRowProps {
  track: Track;
  yOffset: number;
}

export const TimelineTrackRow = ({ track, yOffset }: TimelineTrackRowProps) => {
  const { 
    activeTrackId, 
    setActiveTrack, 
    selectedClipId, 
    setSelectedClip,
    duration,
    totalThumbnailWidth,
    zoom,
  } = useTimelineStore();

  const isActive = activeTrackId === track.id;

  const handleTrackClick = () => {
    setActiveTrack(track.id);
  };

  const handleClipClick = (clipId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedClip(clipId);
    setActiveTrack(track.id);
  };

  const getTrackIcon = () => {
    switch (track.type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'audio':
        return <Music className="w-4 h-4" />;
      case 'effect':
        return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <div
      className="relative flex"
      style={{ height: `${track.height}px` }}
      onClick={handleTrackClick}
    >
      {/* Track Header */}
      <div
        className={`
          w-32 flex-shrink-0 border-r border-border/30 px-3 py-2
          flex items-center gap-2 cursor-pointer transition-colors
          ${isActive ? 'bg-neon/10 border-neon/50' : 'bg-surface/50 hover:bg-surface/80'}
        `}
      >
        <div className="text-foreground/60">{getTrackIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-foreground truncate">
            {track.type.charAt(0).toUpperCase() + track.type.slice(1)} {track.clips.length > 0 && `(${track.clips.length})`}
          </div>
        </div>
      </div>

      {/* Track Content Area */}
      <div className="flex-1 relative bg-surface/20">
        {track.clips.map((clip) => {
          const { left, width } = ClipEngine.getClipPosition(
            clip,
            duration,
            totalThumbnailWidth,
            zoom
          );
          const isSelected = selectedClipId === clip.id;

          return (
            <div
              key={clip.id}
              className={`
                absolute top-1 bottom-1 rounded cursor-pointer transition-all
                ${isSelected
                  ? 'bg-neon/20 border-2 border-neon shadow-[0_0_12px_hsl(var(--neon)/0.4)]'
                  : 'bg-primary/40 border border-primary/60 hover:bg-primary/60'
                }
              `}
              style={{
                left: `${left}px`,
                width: `${width}px`,
              }}
              onClick={(e) => handleClipClick(clip.id, e)}
            >
              <div className="px-2 py-1 h-full flex items-center">
                <span className="text-xs text-foreground/80 truncate font-medium">
                  {clip.src.split('/').pop()?.split('.')[0] || 'Clip'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
