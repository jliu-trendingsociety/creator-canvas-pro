import { Track, useTimelineStore } from '../state/timelineStore';
import { Clip } from './Clip';
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
      className="relative w-full border-b border-border/20 bg-background overflow-hidden flex"
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
        {track.clips.map((clip) => (
          <Clip
            key={clip.id}
            clip={clip}
            trackId={track.id}
            duration={duration}
            totalWidth={totalThumbnailWidth}
            zoom={zoom}
          />
        ))}
      </div>
    </div>
  );
};
