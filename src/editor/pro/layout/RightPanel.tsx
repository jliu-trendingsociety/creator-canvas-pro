import React from 'react';
import { Button } from '@/components/ui/button';
import {
  ChevronRight,
  ChevronLeft,
  Sparkles,
  RotateCcw,
  Film,
} from 'lucide-react';

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
      {/* Collapse Toggle */}
      <button
        onClick={onToggleCollapse}
        className='absolute left-1 top-4 z-10 bg-surface-elevated border border-border rounded p-1 hover:bg-muted transition-colors'
        title={isCollapsed ? 'Expand panel' : 'Collapse panel'}>
        {isCollapsed ? (
          <ChevronLeft className='w-4 h-4 text-muted-foreground' />
        ) : (
          <ChevronRight className='w-4 h-4 text-muted-foreground' />
        )}
      </button>

      <div className={`p-6 space-y-6 ${isCollapsed ? 'hidden' : ''}`}>
        {/* STEP 3 — AI TRANSFORMATION */}
        <div className='space-y-4'>
          <h3 className='text-xs font-bold text-neon tracking-wider'>
            STEP 3 — AI TRANSFORMATION
          </h3>

          <div className='space-y-3'>
            <label className='text-sm text-foreground font-medium block'>
              Prompt
            </label>
            <textarea
              placeholder='Describe the video transformation you want...'
              className='w-full min-h-[240px] bg-surface-elevated border border-border/50 rounded-xl p-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-neon focus:border-neon resize-none transition-all'
            />
          </div>

          <div className='space-y-3'>
            <label className='text-sm text-foreground font-medium block'>
              Suggested Variants
            </label>
            <div className='flex flex-wrap gap-2'>
              {[
                'Cinematic',
                'Slow Motion',
                'Fast Forward',
                'Color Grade',
                'Stabilize',
              ].map((preset) => (
                <Button
                  key={preset}
                  size='sm'
                  variant='outline'
                  className='border-neon/30 bg-neon/5 text-foreground hover:bg-neon hover:text-background hover:shadow-[0_0_15px_rgba(186,230,55,0.3)] transition-all'>
                  {preset}
                </Button>
              ))}
            </div>
          </div>

          <div className='space-y-3 pt-4'>
            <Button className='w-full bg-transparent border-2 border-neon text-neon hover:bg-neon hover:text-background font-bold transition-all hover:shadow-[0_0_20px_rgba(186,230,55,0.3)]'>
              <RotateCcw className='w-4 h-4 mr-2' />
              Rewrite Prompt
            </Button>

            <Button className='w-full bg-neon text-background hover:bg-neon-glow font-bold py-6 text-lg transition-all hover:shadow-[0_0_30px_rgba(186,230,55,0.4)] hover:scale-[1.02]'>
              <Sparkles className='w-5 h-5 mr-2' />
              Generate Pro Video
            </Button>

            <Button
              onClick={onGenerateRenderPreview}
              className='w-full bg-surface/80 hover:bg-surface text-foreground font-medium py-3 transition-all border border-border/30 flex items-center justify-center gap-2'>
              <Film className='w-4 h-4' />
              Generate Render Preview
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
};
