import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, ChevronLeft, ChevronRight, Sparkles, Video } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useVideoThumbnails } from "@/hooks/useVideoThumbnails";
import { TimelineTrack } from "@/components/VideoCreator/TimelineTrack";

export default function ProEditor() {
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);
  const [assetType, setAssetType] = useState<"video" | "image" | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [showSafeFrames, setShowSafeFrames] = useState(false);
  const [startFrame, setStartFrame] = useState(0);
  const [endFrame, setEndFrame] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract thumbnails from the uploaded video
  const { thumbnails, isExtracting } = useVideoThumbnails({
    videoElement: videoRef.current,
    duration,
    thumbnailCount: 25,
  });

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = (file: File) => {
    const fileType = file.type;
    
    if (fileType.startsWith("video/")) {
      setAssetType("video");
    } else if (fileType.startsWith("image/")) {
      setAssetType("image");
    } else {
      return;
    }
    
    const url = URL.createObjectURL(file);
    setUploadedVideo(url);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const videoDuration = videoRef.current.duration;
      setDuration(videoDuration);
      setEndFrame(videoDuration);
    }
  };

  const handleSeek = (value: number[] | number) => {
    if (videoRef.current) {
      const time = Array.isArray(value) ? value[0] : value;
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.volume = value[0];
      setVolume(value[0]);
      setIsMuted(value[0] === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      setIsMuted(newMuted);
      videoRef.current.volume = newMuted ? 0 : volume;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-background overflow-hidden">
      {/* Top Header */}
      <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-surface shadow-lg">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-neon">PRO EDITOR</h1>
          <Badge className="bg-neon/20 text-neon border-neon/50 hover:bg-neon/30">
            <Sparkles className="w-3 h-3 mr-1" />
            PRO
          </Badge>
        </div>
        <Button className="bg-neon text-background hover:bg-neon-glow font-bold transition-all hover:shadow-[0_0_20px_rgba(186,230,55,0.4)]">
          Export Video
        </Button>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL - Control Panel */}
        <aside 
          className={`border-r border-border/50 bg-surface overflow-y-auto transition-all duration-300 ${
            leftPanelCollapsed ? 'w-0' : 'w-80'
          }`}
        >
          <div className="p-6 space-y-6">
            {/* Collapse Toggle */}
            <button
              onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
              className="absolute -right-3 top-20 z-10 bg-surface-elevated border border-border rounded-full p-1 hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* STEP 1 — VIDEO INPUT */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-neon tracking-wider">STEP 1 — VIDEO INPUT</h3>
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
                    ? "border-neon bg-neon/10 shadow-[0_0_20px_rgba(186,230,55,0.2)]"
                    : "border-border hover:border-neon/50 hover:bg-surface-elevated"
                }`}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-neon animate-pulse" />
                <p className="text-foreground font-medium mb-2">Upload Video or Image</p>
                <p className="text-sm text-muted-foreground">
                  Drop files here or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Supports: .mp4, .mov, .webm, .png, .jpg
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*,image/*"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>

              {/* Import from Previous Generation */}
              <Button 
                variant="outline" 
                className="w-full border-border/50 text-muted-foreground hover:text-foreground hover:border-neon/50 transition-all"
              >
                <Video className="w-4 h-4 mr-2" />
                Import from Previous Generation
              </Button>
            </div>

            {/* STEP 2 — VIDEO SETTINGS */}
            {uploadedVideo && (
              <div className="space-y-4 animate-in fade-in duration-500">
                <h3 className="text-xs font-bold text-neon tracking-wider pt-4 border-t border-border/50">
                  STEP 2 — VIDEO SETTINGS
                </h3>

                {/* Metadata Readout */}
                <div className="p-4 bg-surface-elevated rounded-xl border border-border/50">
                  <p className="text-xs text-muted-foreground mb-3">Asset Information</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="text-foreground font-medium capitalize">{assetType}</span>
                    </div>
                    {assetType === "video" && duration > 0 && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="text-foreground font-medium">{formatTime(duration)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Resolution:</span>
                          <span className="text-foreground font-medium">1920×1080</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">FPS:</span>
                          <span className="text-foreground font-medium">30</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Frame Controls */}
                {assetType === "video" && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-foreground font-medium block mb-3 flex items-center justify-between">
                        <span>Start Frame</span>
                        <span className="text-xs text-neon">{formatTime(startFrame)}</span>
                      </label>
                      <Slider 
                        value={[startFrame]} 
                        max={duration} 
                        step={0.1}
                        onValueChange={(value) => setStartFrame(value[0])}
                        className="[&_[role=slider]]:border-neon [&_[role=slider]]:bg-neon"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-foreground font-medium block mb-3 flex items-center justify-between">
                        <span>End Frame</span>
                        <span className="text-xs text-neon">{formatTime(endFrame)}</span>
                      </label>
                      <Slider 
                        value={[endFrame]} 
                        max={duration} 
                        step={0.1}
                        onValueChange={(value) => setEndFrame(value[0])}
                        className="[&_[role=slider]]:border-neon [&_[role=slider]]:bg-neon"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Collapse Toggle for Left Panel (when collapsed) */}
        {leftPanelCollapsed && (
          <button
            onClick={() => setLeftPanelCollapsed(false)}
            className="absolute left-0 top-20 z-10 bg-surface-elevated border border-border rounded-r-lg p-2 hover:bg-muted transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        )}

        {/* CENTER + BOTTOM - Video Canvas and Timeline */}
        <div className="flex-1 flex flex-col border-r border-border/50">
          {/* CENTER - Video Canvas */}
          <div className="flex-1 bg-background flex flex-col items-center justify-center p-8">
            {uploadedVideo ? (
              <div className="w-full max-w-5xl space-y-4 animate-in fade-in duration-500">
                {/* Video Canvas */}
                <div className="relative w-full aspect-video bg-surface rounded-xl overflow-hidden border border-border shadow-2xl">
                  {assetType === "video" ? (
                    <video
                      ref={videoRef}
                      src={uploadedVideo}
                      className="w-full h-full object-contain"
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                    />
                  ) : (
                    <img
                      src={uploadedVideo}
                      alt="Uploaded"
                      className="w-full h-full object-contain"
                    />
                  )}

                  {/* Safe Frame Overlay */}
                  {showSafeFrames && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-[10%] border-2 border-neon/30 border-dashed" />
                      <div className="absolute inset-[5%] border border-neon/20" />
                    </div>
                  )}
                </div>

                {/* Playback Toolbar - Always visible when video is uploaded */}
                <div className="bg-surface-elevated/90 backdrop-blur-sm rounded-xl border border-border/50 p-4 shadow-lg animate-in fade-in duration-300">
                  <div className="flex items-center gap-4">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={togglePlayPause}
                      disabled={assetType !== "video"}
                      className="text-foreground hover:text-neon hover:bg-neon/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                    </Button>

                    <span className="text-sm text-neon font-mono min-w-[60px]">
                      {formatTime(currentTime)}
                    </span>

                    <Slider
                      value={[currentTime]}
                      max={duration || 100}
                      step={0.1}
                      onValueChange={handleSeek}
                      disabled={assetType !== "video"}
                      className="flex-1 [&_[role=slider]]:border-neon [&_[role=slider]]:bg-neon disabled:opacity-30"
                    />

                    <span className="text-sm text-muted-foreground font-mono min-w-[60px]">
                      {formatTime(duration)}
                    </span>

                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={toggleMute}
                        disabled={assetType !== "video"}
                        className="text-foreground hover:text-neon hover:bg-neon/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="w-4 h-4" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                      </Button>
                      <Slider
                        value={[isMuted ? 0 : volume]}
                        max={1}
                        step={0.1}
                        onValueChange={handleVolumeChange}
                        disabled={assetType !== "video"}
                        className="w-24 [&_[role=slider]]:border-neon [&_[role=slider]]:bg-neon disabled:opacity-30"
                      />
                    </div>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleFullscreen}
                      disabled={assetType !== "video"}
                      className="text-foreground hover:text-neon hover:bg-neon/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Maximize className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center border-2 border-dashed border-border/50 rounded-xl p-16 max-w-2xl">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-surface-elevated flex items-center justify-center">
                  <Upload className="w-10 h-10 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-lg mb-2">
                  Upload a video or image to get started
                </p>
                <p className="text-muted-foreground/60 text-sm">
                  Drag and drop or use the upload button on the left
                </p>
              </div>
            )}
          </div>

          {/* BOTTOM - Timeline */}
          <div className="h-80 border-t border-border/50 bg-surface/50 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h3 className="text-xs font-bold text-neon tracking-wider">TIMELINE</h3>
                {isExtracting && (
                  <span className="text-xs text-muted-foreground animate-pulse">
                    Extracting frames...
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-foreground bg-neon/10 border border-neon/30 hover:bg-neon/20"
                >
                  Video
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-all"
                >
                  Effects
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-all"
                >
                  Text
                </Button>
              </div>
            </div>

            {/* Timeline Track */}
            <div className="bg-surface-elevated/80 backdrop-blur rounded-xl p-6 h-52 border border-border/50">
              {uploadedVideo && assetType === "video" ? (
                <div className="h-full space-y-4 animate-in fade-in duration-500">
                  {/* Video Track with Thumbnails */}
                  <div className="flex items-center gap-4">
                    <div className="w-20 text-xs text-muted-foreground font-medium">Video</div>
                    <TimelineTrack
                      thumbnails={thumbnails}
                      currentTime={currentTime}
                      duration={duration}
                      onSeek={handleSeek}
                      onTrimChange={(start, end) => {
                        setStartFrame(start);
                        setEndFrame(end);
                      }}
                      startFrame={startFrame}
                      endFrame={endFrame}
                    />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-20 text-xs text-muted-foreground font-medium">Effects</div>
                    <div className="flex-1 h-12 bg-surface rounded-lg border border-border/30 border-dashed" />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-20 text-xs text-muted-foreground font-medium">Text</div>
                    <div className="flex-1 h-12 bg-surface rounded-lg border border-border/30 border-dashed" />
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center">
                  <Video className="w-12 h-12 text-muted-foreground/40 mb-3" />
                  <p className="text-muted-foreground/60 text-sm">
                    Timeline will appear after video upload
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - Prompt & Variations */}
        <aside 
          className={`border-l border-border/50 bg-surface overflow-y-auto transition-all duration-300 ${
            rightPanelCollapsed ? 'w-0' : 'w-96'
          }`}
        >
          <div className="p-6 space-y-6">
            {/* Collapse Toggle */}
            <button
              onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
              className="absolute -left-3 top-20 z-10 bg-surface-elevated border border-border rounded-full p-1 hover:bg-muted transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* STEP 3 — AI TRANSFORMATION */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-neon tracking-wider">STEP 3 — AI TRANSFORMATION</h3>
              
              <div className="space-y-3">
                <label className="text-sm text-foreground font-medium block">Prompt</label>
                <textarea
                  placeholder="Describe the video transformation you want..."
                  className="w-full min-h-[240px] bg-surface-elevated border border-border/50 rounded-xl p-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-neon focus:border-neon resize-none transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm text-foreground font-medium block">Suggested Variants</label>
                <div className="flex flex-wrap gap-2">
                  {["Cinematic", "Slow Motion", "Fast Forward", "Color Grade", "Stabilize"].map(
                    (preset) => (
                      <Button
                        key={preset}
                        size="sm"
                        variant="outline"
                        className="border-neon/30 bg-neon/5 text-foreground hover:bg-neon hover:text-background hover:shadow-[0_0_15px_rgba(186,230,55,0.3)] transition-all"
                      >
                        {preset}
                      </Button>
                    )
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <Button className="w-full bg-transparent border-2 border-neon text-neon hover:bg-neon hover:text-background font-bold transition-all hover:shadow-[0_0_20px_rgba(186,230,55,0.3)]">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Rewrite Prompt
                </Button>
                
                <Button className="w-full bg-neon text-background hover:bg-neon-glow font-bold py-6 text-lg transition-all hover:shadow-[0_0_30px_rgba(186,230,55,0.4)] hover:scale-[1.02]">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Pro Video
                </Button>
              </div>
            </div>
          </div>
        </aside>

        {/* Collapse Toggle for Right Panel (when collapsed) */}
        {rightPanelCollapsed && (
          <button
            onClick={() => setRightPanelCollapsed(false)}
            className="absolute right-0 top-20 z-10 bg-surface-elevated border border-border rounded-l-lg p-2 hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>
    </div>
  );
}
