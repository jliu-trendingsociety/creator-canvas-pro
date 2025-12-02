import React from 'react';

/**
 * ViewerContainer - Video canvas viewer with playback controls
 *
 * This is a layout-only component.
 * No business logic, state mutations, or pixel math allowed.
 * Canvas/video element rendering delegated to children.
 */

export interface ViewerContainerProps {
  // State
  isFocusMode: boolean;
  showSafeFrames: boolean;
  uploadedAssetUrl: string | null;
  assetType: 'video' | 'image' | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;

  // Actions
  onToggleFocusMode: () => void;
  onPlayPause: () => void;
  onSeek: (value: number[] | number) => void;
  onVolumeChange: (value: number[]) => void;
  onToggleMute: () => void;
  onFullscreen: () => void;

  // Refs
  videoRef: React.RefObject<HTMLVideoElement>;
  videoEventHandlers: {
    onTimeUpdate: () => void;
    onLoadedMetadata: () => void;
  };

  // Children - for MasterCanvas or video element
  children?: React.ReactNode;
}

/**
 * Viewer container layout component.
 * Renders video/canvas area with playback controls.
 */
export const ViewerContainer: React.FC<ViewerContainerProps> = ({
  isFocusMode,
  uploadedAssetUrl,
  onToggleFocusMode,
  onPlayPause,
  children,
}) => {
  return (
    <div
      className={`bg-background flex items-center justify-center transition-all duration-200 ease-in-out ${
        isFocusMode ? 'flex-1 p-5' : 'flex-[0.6] p-4 md:p-8'
      }`}>
      {uploadedAssetUrl ? (
        <div className='w-full h-full flex flex-col gap-4 animate-in fade-in duration-500'>
          {/* Placeholder - markup will be moved in Phase 3B */}
          <div className='flex items-center justify-between'>
            <span className='text-xs font-medium text-muted-foreground'>
              VIEWER
            </span>
            <button onClick={onToggleFocusMode} className='p-2'>
              Focus Mode
            </button>
          </div>

          {/* Canvas/Video Area */}
          <div className='relative w-full flex-1 flex items-center justify-center bg-surface rounded-xl overflow-hidden border border-border shadow-2xl'>
            {children}
          </div>

          {/* Playback Controls - Placeholder */}
          <div className='bg-surface-elevated/90 backdrop-blur-sm rounded-xl border border-border/50 p-2'>
            <button onClick={onPlayPause} className='p-2'>
              Play/Pause
            </button>
          </div>
        </div>
      ) : (
        <div className='text-center border-2 border-dashed border-border/50 rounded-xl p-16 max-w-2xl'>
          <p className='text-muted-foreground text-lg mb-2'>
            Upload a video or image to get started
          </p>
        </div>
      )}
    </div>
  );
};
