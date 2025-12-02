import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Upload,
} from 'lucide-react';
import { MasterCanvas } from '@/editor/pro/renderer/components/MasterCanvas';

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
 * Format time in seconds to MM:SS format
 */
const formatTime = (seconds: number): string => {
  if (!isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Viewer container layout component.
 * Renders video/canvas area with playback controls.
 */
export const ViewerContainer: React.FC<ViewerContainerProps> = ({
  isFocusMode,
  showSafeFrames,
  uploadedAssetUrl,
  assetType,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  onToggleFocusMode,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onFullscreen,
  videoRef,
  videoEventHandlers,
  children,
}) => {
  return (
    <div
      className={`bg-background flex items-center justify-center transition-all duration-200 ease-in-out ${
        isFocusMode ? 'flex-1 p-5' : 'flex-[0.6] p-4 md:p-8'
      }`}>
      {uploadedAssetUrl ? (
        <div className='w-full h-full flex flex-col gap-4 animate-in fade-in duration-500'>
          {/* Video Canvas Header with Focus Mode Toggle */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <span className='text-xs font-medium text-muted-foreground'>
                VIEWER
              </span>
            </div>
            <Button
              size='sm'
              variant='ghost'
              onClick={onToggleFocusMode}
              className='text-foreground hover:text-neon hover:bg-neon/10 transition-all'
              title={
                isFocusMode ? 'Exit Focus Mode (ESC)' : 'Enter Focus Mode'
              }>
              {isFocusMode ? (
                <>
                  <Minimize2 className='w-4 h-4 mr-2' />
                  Exit Focus
                </>
              ) : (
                <>
                  <Maximize2 className='w-4 h-4 mr-2' />
                  Focus Mode
                </>
              )}
            </Button>
          </div>

          {/* Video Canvas - MasterCanvas Compositor */}
          <div className='relative w-full flex-1 flex items-center justify-center bg-surface rounded-xl overflow-hidden border border-border shadow-2xl'>
            <div
              className={`w-full ${isFocusMode ? 'h-full' : 'aspect-video'}`}>
              {children}
            </div>

            {/* Safe Frame Overlay */}
            {showSafeFrames && (
              <div className='absolute inset-0 pointer-events-none'>
                <div className='absolute inset-[10%] border-2 border-neon/30 border-dashed' />
                <div className='absolute inset-[5%] border border-neon/20' />
              </div>
            )}
          </div>

          {/* Playback Toolbar - Always visible when video is uploaded */}
          <div className='bg-surface-elevated/90 backdrop-blur-sm rounded-xl border border-border/50 p-2 md:p-4 shadow-lg animate-in fade-in duration-300'>
            <div className='flex items-center gap-1 md:gap-4'>
              <Button
                size='icon'
                variant='ghost'
                onClick={onPlayPause}
                disabled={assetType !== 'video'}
                className='text-foreground hover:text-neon hover:bg-neon/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed'>
                {isPlaying ? (
                  <Pause className='w-5 h-5' />
                ) : (
                  <Play className='w-5 h-5' />
                )}
              </Button>

              <span className='text-xs md:text-sm text-neon font-mono min-w-[50px] md:min-w-[60px]'>
                {formatTime(currentTime)}
              </span>

              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={0.1}
                onValueChange={onSeek}
                disabled={assetType !== 'video'}
                className='flex-1 [&_[role=slider]]:border-neon [&_[role=slider]]:bg-neon disabled:opacity-30'
              />

              <span className='text-xs md:text-sm text-muted-foreground font-mono min-w-[50px] md:min-w-[60px]'>
                {formatTime(duration)}
              </span>

              <div className='flex items-center gap-2'>
                <Button
                  size='icon'
                  variant='ghost'
                  onClick={onToggleMute}
                  disabled={assetType !== 'video'}
                  className='text-foreground hover:text-neon hover:bg-neon/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed'>
                  {isMuted || volume === 0 ? (
                    <VolumeX className='w-4 h-4' />
                  ) : (
                    <Volume2 className='w-4 h-4' />
                  )}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.1}
                  onValueChange={onVolumeChange}
                  disabled={assetType !== 'video'}
                  className='w-16 md:w-24 [&_[role=slider]]:border-neon [&_[role=slider]]:bg-neon disabled:opacity-30'
                />
              </div>

              <Button
                size='icon'
                variant='ghost'
                onClick={onFullscreen}
                disabled={assetType !== 'video'}
                className='text-foreground hover:text-neon hover:bg-neon/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed'>
                <Maximize className='w-4 h-4' />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className='text-center border-2 border-dashed border-border/50 rounded-xl p-16 max-w-2xl'>
          <div className='w-20 h-20 mx-auto mb-4 rounded-full bg-surface-elevated flex items-center justify-center'>
            <Upload className='w-10 h-10 text-muted-foreground' />
          </div>
          <p className='text-muted-foreground text-lg mb-2'>
            Upload a video or image to get started
          </p>
          <p className='text-muted-foreground/60 text-sm'>
            Drag and drop or use the upload button on the left
          </p>
        </div>
      )}
    </div>
  );
};
