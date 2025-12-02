import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ChevronRight, ChevronLeft, Video, Upload } from 'lucide-react';

/**
 * LeftPanel - Assets, uploads, project config
 *
 * This is a layout-only component.
 * No business logic, state mutations, or pixel math allowed.
 */

export interface LeftPanelProps {
  // State
  isCollapsed: boolean;
  isUploadDragging: boolean;
  uploadedAssetUrl: string | null;
  assetType: 'video' | 'image' | null;
  duration: number;
  startFrame: number;
  endFrame: number;

  // Actions
  onToggleCollapse: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onUploadClick: () => void;
  onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStartFrameChange: (value: number[]) => void;
  onEndFrameChange: (value: number[]) => void;

  // Refs
  fileInputRef: React.RefObject<HTMLInputElement>;
}

/**
 * Format time in seconds to MM:SS format
 * Moved from ProEditor.tsx
 */
const formatTime = (seconds: number): string => {
  if (!isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Left panel layout component.
 * Renders upload zone, asset metadata, and frame controls.
 */
export const LeftPanel: React.FC<LeftPanelProps> = ({
  isCollapsed,
  isUploadDragging,
  uploadedAssetUrl,
  assetType,
  duration,
  startFrame,
  endFrame,
  onToggleCollapse,
  onDragOver,
  onDragLeave,
  onDrop,
  onUploadClick,
  onFileInput,
  onStartFrameChange,
  onEndFrameChange,
  fileInputRef,
}) => {
  return (
    <aside
      className={`bg-surface overflow-y-auto transition-all duration-200 ease-in-out relative ${
        isCollapsed ? 'w-8' : 'w-[320px]'
      }`}>
      {/* Collapse Toggle */}
      <button
        onClick={onToggleCollapse}
        className='absolute left-1 top-4 z-10 bg-surface-elevated border border-border rounded p-1 hover:bg-muted transition-colors'
        title={isCollapsed ? 'Expand panel' : 'Collapse panel'}>
        {isCollapsed ? (
          <ChevronRight className='w-4 h-4 text-muted-foreground' />
        ) : (
          <ChevronLeft className='w-4 h-4 text-muted-foreground' />
        )}
      </button>

      <div className={`p-6 space-y-6 ${isCollapsed ? 'hidden' : ''}`}>
        {/* STEP 1 — UPLOAD */}
        <div className='space-y-4'>
          <h3 className='text-xs font-bold text-neon tracking-wider'>
            STEP 1 — UPLOAD
          </h3>

          {/* Upload Zone */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={onUploadClick}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isUploadDragging
                ? 'border-neon bg-neon/5'
                : 'border-border/50 bg-surface-elevated hover:border-neon/50 hover:bg-neon/5'
            }`}>
            <Upload className='w-8 h-8 mx-auto mb-2 text-muted-foreground' />
            <p className='text-sm font-medium text-foreground'>
              Drag video here
            </p>
            <p className='text-xs text-muted-foreground mt-2'>
              Supports: .mp4, .mov, .webm, .png, .jpg
            </p>
            <input
              ref={fileInputRef}
              type='file'
              accept='video/*,image/*'
              onChange={onFileInput}
              className='hidden'
            />
          </div>

          {/* Import from Previous Generation */}
          <Button
            variant='outline'
            className='w-full border-border/50 text-muted-foreground hover:text-foreground hover:border-neon/50 transition-all'>
            <Video className='w-4 h-4 mr-2' />
            Import from Previous Generation
          </Button>
        </div>

        {/* STEP 2 — VIDEO SETTINGS */}
        {uploadedAssetUrl && (
          <div className='space-y-4 animate-in fade-in duration-500'>
            <h3 className='text-xs font-bold text-neon tracking-wider pt-4 border-t border-border/50'>
              STEP 2 — VIDEO SETTINGS
            </h3>

            {/* Metadata Readout */}
            <div className='p-4 bg-surface-elevated rounded-xl border border-border/50'>
              <p className='text-xs text-muted-foreground mb-3'>
                Asset Information
              </p>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Type:</span>
                  <span className='text-foreground font-medium capitalize'>
                    {assetType}
                  </span>
                </div>
                {assetType === 'video' && duration > 0 && (
                  <>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Duration:</span>
                      <span className='text-foreground font-medium'>
                        {formatTime(duration)}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Resolution:</span>
                      <span className='text-foreground font-medium'>
                        1920×1080
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>FPS:</span>
                      <span className='text-foreground font-medium'>30</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Frame Controls */}
            {assetType === 'video' && (
              <div className='space-y-4'>
                <div>
                  <label className='text-sm text-foreground font-medium block mb-3 flex items-center justify-between'>
                    <span>Start Frame</span>
                    <span className='text-xs text-neon'>
                      {formatTime(startFrame)}
                    </span>
                  </label>
                  <Slider
                    value={[startFrame]}
                    max={duration}
                    step={0.1}
                    onValueChange={onStartFrameChange}
                    className='[&_[role=slider]]:border-neon [&_[role=slider]]:bg-neon'
                  />
                </div>
                <div>
                  <label className='text-sm text-foreground font-medium block mb-3 flex items-center justify-between'>
                    <span>End Frame</span>
                    <span className='text-xs text-neon'>
                      {formatTime(endFrame)}
                    </span>
                  </label>
                  <Slider
                    value={[endFrame]}
                    max={duration}
                    step={0.1}
                    onValueChange={onEndFrameChange}
                    className='[&_[role=slider]]:border-neon [&_[role=slider]]:bg-neon'
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
