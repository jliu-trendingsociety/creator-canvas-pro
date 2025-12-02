import React from 'react';

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

  // Additional props for rendering
  startFrame: number;
  endFrame: number;
}

/**
 * Left panel layout component.
 * Renders upload zone, asset metadata, and frame controls.
 */
export const LeftPanel: React.FC<LeftPanelProps> = ({
  isCollapsed,
  onToggleCollapse,
}) => {
  return (
    <aside
      className={`border-r border-border/50 bg-surface overflow-y-auto transition-all duration-200 ease-in-out relative ${
        isCollapsed ? 'w-8' : 'w-[280px]'
      }`}>
      {/* Placeholder - markup will be moved in Phase 3B */}
      <button onClick={onToggleCollapse} className='p-2'>
        Toggle
      </button>
    </aside>
  );
};
