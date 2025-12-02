import React from 'react';

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
          {/* Placeholder - tab buttons will be moved in Phase 3B */}
          <button className='p-1'>Video</button>
          <button className='p-1'>Effects</button>
          <button className='p-1'>Text</button>
        </div>
      </div>

      {/* Timeline Track Container */}
      <div className='bg-surface-elevated/80 backdrop-blur rounded-xl p-4 md:p-6 border border-border/50 space-y-4'>
        {uploadedAssetUrl && assetType === 'video' ? (
          <div className='space-y-4 animate-in fade-in duration-500'>
            {/* Placeholder - timeline UI will be moved in Phase 3B */}
            {children}
          </div>
        ) : (
          <div className='h-full flex flex-col items-center justify-center'>
            <p className='text-muted-foreground/60 text-sm'>
              Timeline will appear after video upload
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
