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
import { TimelineContainer } from '@/editor/pro/timeline/ui/TimelineContainer';
import { useToast } from '@/hooks/use-toast';
import { useTimelineStore } from '@/editor/pro/timeline/state/timelineStore';
import { RenderEngine as LegacyRenderEngine } from '@/editor/pro/renderer/RenderEngine';
import { RenderEngine } from '@/editor/pro/renderer/engine/RenderEngine';
import { MasterCanvas } from '@/editor/pro/renderer/components/MasterCanvas';
import { TimelineTrackData } from '@/editor/pro/renderer/engine/types';
import type { Track, Clip } from '@/editor/pro/timeline/state/timelineStore';

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

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const legacyRenderEngineRef = useRef<LegacyRenderEngine | null>(null);
  const renderEngine = useRef(new RenderEngine()).current;

  // ========================
  // State: Video Asset
  // ========================
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);
  const [assetType, setAssetType] = useState<'video' | 'image' | null>(null);

  // ========================
  // State: Playback
  // ========================
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // ========================
  // State: UI Layout
  // ========================
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [viewerFocusMode, setViewerFocusMode] = useState(false);
  const [showSafeFrames, setShowSafeFrames] = useState(false);

  // ========================
  // State: Trim & Timeline
  // ========================
  const [isDragging, setIsDragging] = useState(false);
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
  }, [viewerFocusMode]);

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
    setIsDragging(false);

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
    const assetType = detectAssetType(file.type);
    if (!assetType) return;

    setAssetType(assetType);
    const url = URL.createObjectURL(file);
    setUploadedVideo(url);
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
    <div className='min-h-screen w-full flex flex-col bg-background'>
      {/* Top Header */}
      <header className='h-14 md:h-16 border-b border-border flex items-center justify-between px-3 md:px-6 bg-surface shadow-lg'>
        <div className='flex items-center gap-2 md:gap-3'>
          <h1 className='text-lg md:text-2xl font-bold text-neon'>
            PRO EDITOR
          </h1>
          <Badge className='bg-neon/20 text-neon border-neon/50 hover:bg-neon/30 text-xs'>
            <Sparkles className='w-2.5 h-2.5 md:w-3 md:h-3 mr-1' />
            PRO
          </Badge>
        </div>
        <Button className='bg-neon text-background hover:bg-neon-glow font-bold transition-all hover:shadow-[0_0_20px_rgba(186,230,55,0.4)] text-xs md:text-sm px-3 md:px-4'>
          Export
        </Button>
      </header>

      {/* Main Layout */}
      <div className='flex-1 flex flex-row min-h-0'>
        {/* LEFT PANEL - Control Panel */}
        <aside
          className={`border-r border-border/50 bg-surface overflow-y-auto transition-all duration-200 ease-in-out relative ${
            leftPanelCollapsed ? 'w-8' : 'w-[280px]'
          }`}>
          {/* Collapse Toggle */}
          <button
            onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
            className='absolute right-1 top-4 z-10 bg-surface-elevated border border-border rounded p-1 hover:bg-muted transition-colors'
            title={leftPanelCollapsed ? 'Expand panel' : 'Collapse panel'}>
            {leftPanelCollapsed ? (
              <ChevronRight className='w-4 h-4 text-muted-foreground' />
            ) : (
              <ChevronLeft className='w-4 h-4 text-muted-foreground' />
            )}
          </button>

          <div
            className={`p-6 space-y-6 ${leftPanelCollapsed ? 'hidden' : ''}`}>
            {/* STEP 1 — VIDEO INPUT */}
            <div className='space-y-4'>
              <h3 className='text-xs font-bold text-neon tracking-wider'>
                STEP 1 — VIDEO INPUT
              </h3>
              {/* Upload Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-neon bg-neon/10 shadow-[0_0_20px_rgba(186,230,55,0.2)]'
                    : 'border-border hover:border-neon/50 hover:bg-surface-elevated'
                }`}>
                <Upload className='w-12 h-12 mx-auto mb-4 text-neon animate-pulse' />
                <p className='text-foreground font-medium mb-2'>
                  Upload Video or Image
                </p>
                <p className='text-sm text-muted-foreground'>
                  Drop files here or click to browse
                </p>
                <p className='text-xs text-muted-foreground mt-2'>
                  Supports: .mp4, .mov, .webm, .png, .jpg
                </p>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='video/*,image/*'
                  onChange={handleFileInput}
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
            {uploadedVideo && (
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
                          <span className='text-muted-foreground'>
                            Duration:
                          </span>
                          <span className='text-foreground font-medium'>
                            {formatTime(duration)}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-muted-foreground'>
                            Resolution:
                          </span>
                          <span className='text-foreground font-medium'>
                            1920×1080
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-muted-foreground'>FPS:</span>
                          <span className='text-foreground font-medium'>
                            30
                          </span>
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
                        onValueChange={handleStartFrameChange}
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
                        onValueChange={handleEndFrameChange}
                        className='[&_[role=slider]]:border-neon [&_[role=slider]]:bg-neon'
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* CENTER + BOTTOM - Video Canvas and Timeline */}
        <div className='flex-1 flex flex-col min-w-0 min-h-0'>
          {/* CENTER - Video Canvas */}
          <div
            className={`bg-background flex items-center justify-center transition-all duration-200 ease-in-out ${
              viewerFocusMode ? 'flex-1 p-5' : 'flex-[0.6] p-4 md:p-8'
            }`}>
            {uploadedVideo ? (
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
                    onClick={() => setViewerFocusMode(!viewerFocusMode)}
                    className='text-foreground hover:text-neon hover:bg-neon/10 transition-all'
                    title={
                      viewerFocusMode
                        ? 'Exit Focus Mode (ESC)'
                        : 'Enter Focus Mode'
                    }>
                    {viewerFocusMode ? (
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
                    className={`w-full ${
                      viewerFocusMode ? 'h-full' : 'aspect-video'
                    }`}>
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
                        src={uploadedVideo}
                        className='w-full h-full object-contain'
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                      />
                    ) : assetType === 'image' ? (
                      <video
                        ref={videoRef}
                        src={uploadedVideo}
                        className='w-full h-full object-contain'
                      />
                    ) : null}
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
                      onClick={togglePlayPause}
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
                      onValueChange={handleSeek}
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
                        onClick={toggleMute}
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
                        onValueChange={handleVolumeChange}
                        disabled={assetType !== 'video'}
                        className='w-16 md:w-24 [&_[role=slider]]:border-neon [&_[role=slider]]:bg-neon disabled:opacity-30'
                      />
                    </div>

                    <Button
                      size='icon'
                      variant='ghost'
                      onClick={handleFullscreen}
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

          {/* BOTTOM - Timeline */}
          <div
            className={`border-t border-border/50 bg-surface/50 backdrop-blur-sm p-3 md:p-6 transition-all duration-200 ease-in-out flex-shrink-0 ${
              viewerFocusMode
                ? 'h-32'
                : tracks.length > 3
                ? 'h-96'
                : tracks.length > 1
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
                  className='text-foreground bg-neon/10 border border-neon/30 hover:bg-neon/20'>
                  Video
                </Button>
                <Button
                  size='sm'
                  variant='ghost'
                  className='text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-all'>
                  Effects
                </Button>
                <Button
                  size='sm'
                  variant='ghost'
                  className='text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-all'>
                  Text
                </Button>
              </div>
            </div>

            {/* Timeline Track */}
            <div className='bg-surface-elevated/80 backdrop-blur rounded-xl p-4 md:p-6 border border-border/50 space-y-4'>
              {uploadedVideo && assetType === 'video' ? (
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
        </div>

        {/* RIGHT PANEL - Prompt & Variations */}
        <aside
          className={`bg-surface overflow-y-auto transition-all duration-200 ease-in-out relative ${
            rightPanelCollapsed ? 'w-8' : 'w-[320px]'
          }`}>
          {/* Collapse Toggle */}
          <button
            onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
            className='absolute left-1 top-4 z-10 bg-surface-elevated border border-border rounded p-1 hover:bg-muted transition-colors'
            title={rightPanelCollapsed ? 'Expand panel' : 'Collapse panel'}>
            {rightPanelCollapsed ? (
              <ChevronLeft className='w-4 h-4 text-muted-foreground' />
            ) : (
              <ChevronRight className='w-4 h-4 text-muted-foreground' />
            )}
          </button>

          <div
            className={`p-6 space-y-6 ${rightPanelCollapsed ? 'hidden' : ''}`}>
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
                  onClick={handleGenerateRenderPreview}
                  className='w-full bg-surface/80 hover:bg-surface text-foreground font-medium py-3 transition-all border border-border/30 flex items-center justify-center gap-2'>
                  <Film className='w-4 h-4' />
                  Generate Render Preview
                </Button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
