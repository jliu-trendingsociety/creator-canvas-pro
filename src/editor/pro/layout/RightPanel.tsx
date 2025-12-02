import React from 'react';

/**
 * RightPanel - AI prompt input, agent tools, transformations
 *
 * This is a layout-only component.
 * No business logic, state mutations, or pixel math allowed.
 */

export interface RightPanelProps {
  // State
  isCollapsed: boolean;

  // Actions
  onToggleCollapse: () => void;
  onGenerateRenderPreview: () => void;
}

/**
 * Right panel layout component.
 * Renders AI transformation prompts and generation controls.
 */
export const RightPanel: React.FC<RightPanelProps> = ({
  isCollapsed,
  onToggleCollapse,
  onGenerateRenderPreview,
}) => {
  return (
    <aside
      className={`bg-surface overflow-y-auto transition-all duration-200 ease-in-out relative ${
        isCollapsed ? 'w-8' : 'w-[320px]'
      }`}>
      {/* Placeholder - markup will be moved in Phase 3B */}
      <button onClick={onToggleCollapse} className='p-2'>
        Toggle
      </button>
      <button onClick={onGenerateRenderPreview} className='p-2'>
        Generate Preview
      </button>
    </aside>
  );
};
