import React from 'react';
import { Button } from '@/components/ui/button';
import { Video } from 'lucide-react';

/**
 * TimelineContainer - Multi-track timeline with thumbnails
 *
 * This is a layout-only component.
 * No business logic, state mutations, or pixel math allowed.
 * Timeline rendering delegated to TimelineUI component.
 */

export interface TimelineContainerProps {
  // State
  isFocusMode: boolean;
  uploadedAssetUrl: string | null;
  assetType: 'video' | 'image' | null;
  currentTime: number;
  duration: number;
  trackCount: number;
  isExtracting: boolean;

  // Actions
  onSeek: (time: number) => void;
  onTrimChange: (start: number, end: number) => void;
  onTabChange?: (tab: 'Video' | 'Effects' | 'Text') => void;

  // Children - for actual timeline UI component
  children?: React.ReactNode;
}

/**
 * Timeline container layout component.
 * Renders timeline area with track tabs and thumbnails.
 */
export const TimelineContainer: React.FC<TimelineContainerProps> = ({
  isFocusMode,
  uploadedAssetUrl,
  assetType,
  isExtracting,
  trackCount,
  onSeek,
  onTabChange,
  children,
}) => {
  return (
    <div
      className={`border-t border-border/50 bg-surface/50 backdrop-blur-sm p-3 md:p-6 transition-all duration-200 ease-in-out flex-shrink-0 ${
        isFocusMode
          ? 'h-32'
          : trackCount > 3
          ? 'h-96'
          : trackCount > 1
          ? 'h-80'
          : 'h-64'
      }`}>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-4'>
          <h3 className='text-xs font-bold text-neon tracking-wider'>
            TIMELINE
          </h3>
          {isExtracting && (
            <span className='text-xs text-muted-foreground animate-pulse'>
              Extracting frames...
            </span>
          )}
        </div>
        <div className='flex gap-2'>
          <Button
            size='sm'
            variant='ghost'
            onClick={() => onTabChange?.('Video')}
            className='text-foreground bg-neon/10 border border-neon/30 hover:bg-neon/20'>
            Video
          </Button>
          <Button
            size='sm'
            variant='ghost'
            onClick={() => onTabChange?.('Effects')}
            className='text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-all'>
            Effects
          </Button>
          <Button
            size='sm'
            variant='ghost'
            onClick={() => onTabChange?.('Text')}
            className='text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-all'>
            Text
          </Button>
        </div>
      </div>

      {/* Timeline Track Container */}
      <div className='bg-surface-elevated/80 backdrop-blur rounded-xl p-4 md:p-6 border border-border/50 space-y-4'>
        {uploadedAssetUrl && assetType === 'video' ? (
          <div className='space-y-4 animate-in fade-in duration-500'>
            {/* Timeline UI component rendered as children */}
            {children}
          </div>
        ) : (
          <div className='h-full flex flex-col items-center justify-center'>
            <Video className='w-12 h-12 text-muted-foreground/40 mb-3' />
            <p className='text-muted-foreground/60 text-sm'>
              Timeline will appear after video upload
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
