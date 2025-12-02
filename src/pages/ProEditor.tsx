import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Upload,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Video,
  Film,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useVideoThumbnails } from '@/hooks/useVideoThumbnails';
import { useToast } from '@/hooks/use-toast';
import { useTimelineStore } from '@/editor/pro/timeline/state/timelineStore';
import { useEditorStore } from '@/editor/pro/state/editorStore';
import { RenderEngine as LegacyRenderEngine } from '@/editor/pro/renderer/RenderEngine';
import { RenderEngine } from '@/editor/pro/renderer/engine/RenderEngine';
import { MasterCanvas } from '@/editor/pro/renderer/components/MasterCanvas';
import { TimelineTrackData } from '@/editor/pro/renderer/engine/types';
import type { Track, Clip } from '@/editor/pro/timeline/state/timelineStore';
import { LeftPanel } from '@/editor/pro/layout/LeftPanel';
import { RightPanel } from '@/editor/pro/layout/RightPanel';
import { ViewerContainer } from '@/editor/pro/layout/ViewerContainer';
import { TimelineContainer as TimelineContainerLayout } from '@/editor/pro/layout/TimelineContainer';
import { TimelineContainer } from '@/editor/pro/timeline/ui/TimelineContainer';

// ========================
// Helper Functions
// ========================

/**
 * Maps timeline tracks to render engine format.
 * Used for both render preparation and MasterCanvas rendering.
 */
function mapTracksToRenderData(tracks: Track[]): TimelineTrackData[] {
  return tracks.flatMap((track) =>
    track.clips.map((clip) => ({
      id: clip.id,
      type:
        track.type === 'video'
          ? ('video' as const)
          : track.type === 'audio'
          ? ('audio' as const)
          : ('image' as const),
      startTime: clip.start,
      endTime: clip.end,
      src: clip.src,
    }))
  );
}

/**
 * Formats time in seconds to MM:SS format.
 */
function formatTime(time: number): string {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Determines media type from file MIME type.
 */
function detectAssetType(fileType: string): 'video' | 'image' | null {
  if (fileType.startsWith('video/')) return 'video';
  if (fileType.startsWith('image/')) return 'image';
  return null;
}

// ========================
// Main Component
// ========================

export default function ProEditor() {
  // ========================
  // State: Services & Refs
  // ========================
  const { toast } = useToast();
  const { tracks } = useTimelineStore();
  const {
    uploadedAssetUrl,
    assetType,
    leftPanelCollapsed,
    rightPanelCollapsed,
    viewerFocusMode,
    showSafeFrames,
    isUploadDragging,
    setUploadedAsset,
    clearUploadedAsset,
    setLeftPanelCollapsed,
    setRightPanelCollapsed,
    setViewerFocusMode,
    toggleViewerFocusMode,
    setShowSafeFrames,
    setIsUploadDragging,
  } = useEditorStore();

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const legacyRenderEngineRef = useRef<LegacyRenderEngine | null>(null);
  const renderEngine = useRef(new RenderEngine()).current;

  // ========================
  // State: Playback
  // ========================
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // ========================
  // State: Trim & Timeline
  // ========================
  const [startFrame, setStartFrame] = useState(0);
  const [endFrame, setEndFrame] = useState(0);

  // ========================
  // Effects: Engine Initialization
  // ========================

  /**
   * Initialize legacy render engine once on mount.
   */
  useEffect(() => {
    if (!legacyRenderEngineRef.current) {
      legacyRenderEngineRef.current = new LegacyRenderEngine();
      legacyRenderEngineRef.current.initCompositor(1920, 1080);
    }
  }, []);

  /**
   * Prepare render engine with timeline tracks whenever they change.
   */
  useEffect(() => {
    if (tracks.length > 0) {
      const renderTracks = mapTracksToRenderData(tracks);
      renderEngine.prepare(renderTracks);
    }
  }, [tracks, renderEngine]);

  /**
   * Handle ESC key to exit focus mode.
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && viewerFocusMode) {
        setViewerFocusMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewerFocusMode, setViewerFocusMode]);

  // ========================
  // Effects: Asset Thumbnail Extraction
  // ========================

  const { thumbnails, isExtracting } = useVideoThumbnails({
    videoElement: videoRef.current,
    duration,
    thumbnailCount: 25,
  });

  // ========================
  // Handlers: File Upload
  // ========================

  /**
   * Handle file drop event.
   */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsUploadDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  /**
   * Core file upload logic.
   * Detects asset type and creates object URL.
   */
  const handleFileUpload = (file: File) => {
    const type = detectAssetType(file.type);
    if (!type) return;

    const url = URL.createObjectURL(file);
    setUploadedAsset(url, type);
  };

  /**
   * Handle file input change event.
   */
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  /**
   * Handle drag over event for upload zone.
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsUploadDragging(true);
  };

  /**
   * Handle drag leave event for upload zone.
   */
  const handleDragLeave = () => {
    setIsUploadDragging(false);
  };

  /**
   * Handle upload button click to open file picker.
   */
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // ========================
  // Handlers: Playback
  // ========================

  /**
   * Toggle play/pause state.
   */
  const togglePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  /**
   * Unified time sync from video element.
   * Single source of truth for current playback time.
   */
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  /**
   * Handle metadata load (called when video duration is available).
   */
  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;

    const videoDuration = videoRef.current.duration;
    setDuration(videoDuration);
    setEndFrame(videoDuration);
    setCurrentTime(0);
  };

  /**
   * Unified seek handler.
   * Updates both video element and playback state.
   */
  const seekToTime = (time: number) => {
    const clampedTime = Math.max(0, Math.min(time, duration));

    if (videoRef.current) {
      videoRef.current.currentTime = clampedTime;
    }
    setCurrentTime(clampedTime);
  };

  /**
   * Handle playback scrub bar seek.
   */
  const handleSeek = (value: number[] | number) => {
    const time = Array.isArray(value) ? value[0] : value;
    seekToTime(time);
  };

  /**
   * Handle timeline click seek.
   */
  const handleTimelineSeek = (time: number) => {
    seekToTime(time);
  };

  // ========================
  // Handlers: Volume
  // ========================

  /**
   * Handle volume slider change.
   */
  const handleVolumeChange = (value: number[]) => {
    if (!videoRef.current) return;

    const newVolume = value[0];
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  /**
   * Toggle mute state.
   */
  const toggleMute = () => {
    if (!videoRef.current) return;

    const newMuted = !isMuted;
    setIsMuted(newMuted);
    videoRef.current.volume = newMuted ? 0 : volume;
  };

  /**
   * Request fullscreen playback.
   */
  const handleFullscreen = () => {
    if (videoRef.current) {
      videoRef.current.requestFullscreen();
    }
  };

  // ========================
  // Handlers: Trim
  // ========================

  /**
   * Handle trim start frame change.
   */
  const handleStartFrameChange = (value: number[]) => {
    const newStart = value[0];
    setStartFrame(newStart);
    seekToTime(newStart);
  };

  /**
   * Handle trim end frame change.
   */
  const handleEndFrameChange = (value: number[]) => {
    const newEnd = value[0];
    setEndFrame(newEnd);
    seekToTime(newEnd);
  };

  /**
   * Handle trim boundaries update from timeline.
   */
  const handleTrimChange = (start: number, end: number) => {
    setStartFrame(start);
    setEndFrame(end);
  };

  // ========================
  // Handlers: Rendering
  // ========================

  /**
   * Generate and log render graph from timeline.
   */
  const handleGenerateRenderPreview = () => {
    if (!legacyRenderEngineRef.current) {
      toast({
        title: 'Render engine not initialized',
        variant: 'destructive',
      });
      return;
    }

    const graph = legacyRenderEngineRef.current.evaluateTimeline(
      tracks,
      duration
    );

    console.log('[ProEditor] Render Graph Generated:', graph);

    toast({
      title: 'Render graph generated',
      description: `${graph.nodes.length} clips scheduled across ${graph.trackCount} tracks. Check console for details.`,
    });
  };

  // ========================
  // Layout Composition
  // ========================
  return (
    <div className='h-screen w-screen overflow-hidden bg-background flex flex-col'>
      {/* HEADER */}
      <div className='flex-shrink-0 border-b border-border/50 bg-surface p-4 md:p-6 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='w-8 h-8 bg-neon rounded-lg flex items-center justify-center'>
            <span className='text-xs font-bold text-background'>CC</span>
          </div>
          <h1 className='text-lg md:text-xl font-bold text-foreground'>
            Creator Canvas Pro
          </h1>
        </div>
        <div className='flex gap-2'>
          <Badge variant='outline' className='text-xs'>
            Pro Editor v1.0
          </Badge>
        </div>
      </div>

      {/* MAIN EDITOR LAYOUT - 4 Zones */}
      <div className='flex-1 flex min-w-0 min-h-0 overflow-hidden'>
        {/* LEFT PANEL */}
        <LeftPanel
          isCollapsed={leftPanelCollapsed}
          isUploadDragging={isUploadDragging}
          uploadedAssetUrl={uploadedAssetUrl}
          assetType={assetType}
          duration={duration}
          startFrame={startFrame}
          endFrame={endFrame}
          onToggleCollapse={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onUploadClick={handleUploadClick}
          onFileInput={handleFileInput}
          onStartFrameChange={handleStartFrameChange}
          onEndFrameChange={handleEndFrameChange}
          fileInputRef={fileInputRef}
        />

        {/* CENTER + BOTTOM - Video Canvas and Timeline */}
        <div className='flex-1 flex flex-col min-w-0 min-h-0'>
          {/* CENTER - Video Canvas */}
          <ViewerContainer
            isFocusMode={viewerFocusMode}
            showSafeFrames={showSafeFrames}
            uploadedAssetUrl={uploadedAssetUrl}
            assetType={assetType}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            isMuted={isMuted}
            onToggleFocusMode={toggleViewerFocusMode}
            onPlayPause={togglePlayPause}
            onSeek={handleSeek}
            onVolumeChange={handleVolumeChange}
            onToggleMute={toggleMute}
            onFullscreen={handleFullscreen}
            videoRef={videoRef}
            videoEventHandlers={{
              onTimeUpdate: handleTimeUpdate,
              onLoadedMetadata: handleLoadedMetadata,
            }}>
            {tracks.length > 0 ? (
              <MasterCanvas
                engine={renderEngine}
                getState={() => ({
                  currentTime,
                  tracks: mapTracksToRenderData(tracks),
                })}
              />
            ) : assetType === 'video' ? (
              <video
                ref={videoRef}
                src={uploadedAssetUrl || ''}
                className='w-full h-full object-contain'
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
              />
            ) : assetType === 'image' ? (
              <video
                ref={videoRef}
                src={uploadedAssetUrl || ''}
                className='w-full h-full object-contain'
              />
            ) : null}
          </ViewerContainer>

          {/* BOTTOM - Timeline */}
          <TimelineContainerLayout
            isFocusMode={viewerFocusMode}
            uploadedAssetUrl={uploadedAssetUrl}
            assetType={assetType}
            currentTime={currentTime}
            duration={duration}
            trackCount={tracks.length}
            isExtracting={isExtracting}
            onSeek={handleTimelineSeek}
            onTrimChange={handleTrimChange}>
            {uploadedAssetUrl && assetType === 'video' && (
              <div className='space-y-4 animate-in fade-in duration-500'>
                {/* Video Track with Thumbnails */}
                <div className='flex items-start gap-2 md:gap-4'>
                  <div className='w-16 md:w-20 text-xs text-muted-foreground font-medium pt-2 flex-shrink-0'>
                    Video
                  </div>
                  <TimelineContainer
                    thumbnails={thumbnails}
                    currentTime={currentTime}
                    duration={duration}
                    onSeek={handleTimelineSeek}
                    onTrimChange={handleTrimChange}
                    startFrame={startFrame}
                    endFrame={endFrame}
                  />
                </div>

                <div className='flex items-start gap-2 md:gap-4'>
                  <div className='w-16 md:w-20 text-xs text-muted-foreground font-medium pt-2 flex-shrink-0'>
                    Effects
                  </div>
                  <div className='flex-1 h-12 bg-surface rounded-lg border border-border/30 border-dashed min-w-0' />
                </div>

                <div className='flex items-start gap-2 md:gap-4'>
                  <div className='w-16 md:w-20 text-xs text-muted-foreground font-medium pt-2 flex-shrink-0'>
                    Text
                  </div>
                  <div className='flex-1 h-12 bg-surface rounded-lg border border-border/30 border-dashed min-w-0' />
                </div>
              </div>
            )}
          </TimelineContainerLayout>
        </div>

        {/* RIGHT PANEL - Prompt & Variations */}
        <RightPanel
          isCollapsed={rightPanelCollapsed}
          onToggleCollapse={() => setRightPanelCollapsed(!rightPanelCollapsed)}
          onGenerateRenderPreview={handleGenerateRenderPreview}
        />
      </div>
    </div>
  );
}
