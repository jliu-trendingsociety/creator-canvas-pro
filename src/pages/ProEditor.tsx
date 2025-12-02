import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Play, Pause, Volume2, Maximize, RotateCcw } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export default function ProEditor() {
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);
  const [assetType, setAssetType] = useState<"video" | "image" | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.volume = value[0];
      setVolume(value[0]);
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
      <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-surface">
        <h1 className="text-2xl font-bold text-neon">PRO EDITOR</h1>
        <Button className="bg-neon text-background hover:bg-neon-glow font-bold">
          Export Video
        </Button>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL - Control Panel */}
        <aside className="w-80 border-r border-border bg-surface overflow-y-auto">
          <div className="p-6 space-y-6">
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
                  ? "border-neon bg-neon/10"
                  : "border-border hover:border-neon/50"
              }`}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-neon" />
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

            {uploadedVideo && (
              <div className="p-4 bg-surface-elevated rounded-xl border border-border">
                <p className="text-sm text-muted-foreground mb-2">Asset Type</p>
                <p className="text-foreground font-medium capitalize">{assetType}</p>
              </div>
            )}

            {/* Video Inspector Placeholder */}
            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-bold text-neon mb-4">VIDEO SETTINGS</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground block mb-2">
                    Start Frame
                  </label>
                  <Slider disabled defaultValue={[0]} max={100} step={1} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-2">
                    End Frame
                  </label>
                  <Slider disabled defaultValue={[100]} max={100} step={1} />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* CENTER + BOTTOM - Video Canvas and Timeline */}
        <div className="flex-1 flex flex-col">
          {/* CENTER - Video Canvas */}
          <div className="flex-1 bg-background flex items-center justify-center p-8">
            {uploadedVideo ? (
              <div className="relative w-full max-w-5xl aspect-video bg-surface rounded-xl overflow-hidden border border-border">
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

                {/* Video Controls Overlay */}
                {assetType === "video" && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-4">
                    <div className="flex items-center gap-4">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={togglePlayPause}
                        className="text-foreground hover:text-neon"
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5" />
                        )}
                      </Button>

                      <span className="text-sm text-foreground">
                        {formatTime(currentTime)}
                      </span>

                      <Slider
                        value={[currentTime]}
                        max={duration || 100}
                        step={0.1}
                        onValueChange={handleSeek}
                        className="flex-1"
                      />

                      <span className="text-sm text-foreground">
                        {formatTime(duration)}
                      </span>

                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-foreground" />
                        <Slider
                          value={[volume]}
                          max={1}
                          step={0.1}
                          onValueChange={handleVolumeChange}
                          className="w-24"
                        />
                      </div>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleFullscreen}
                        className="text-foreground hover:text-neon"
                      >
                        <Maximize className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Upload a video or image to get started
                </p>
              </div>
            )}
          </div>

          {/* BOTTOM - Timeline */}
          <div className="h-48 border-t border-border bg-surface p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-neon">TIMELINE</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" className="text-foreground">
                  Video
                </Button>
                <Button size="sm" variant="ghost" className="text-muted-foreground">
                  Effects
                </Button>
                <Button size="sm" variant="ghost" className="text-muted-foreground">
                  Text
                </Button>
              </div>
            </div>

            {/* Timeline Track */}
            <div className="bg-surface-elevated rounded-lg p-4 h-24 border border-border">
              {uploadedVideo && assetType === "video" ? (
                <div className="h-full flex items-center">
                  <div className="w-full h-12 bg-card rounded border border-neon/30 flex items-center px-4">
                    <span className="text-sm text-foreground">Video Track</span>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  Timeline will appear after video upload
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - Prompt & Variations */}
        <aside className="w-96 border-l border-border bg-surface overflow-y-auto">
          <div className="p-6 space-y-6">
            <h3 className="text-sm font-bold text-neon">AI PROMPT</h3>
            
            <textarea
              placeholder="Describe the video transformation you want..."
              className="w-full min-h-[200px] bg-surface-elevated border border-border rounded-xl p-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-neon resize-none"
            />

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Suggested Prompts</p>
              <div className="flex flex-wrap gap-2">
                {["Cinematic", "Slow Motion", "Fast Forward", "Color Grade", "Stabilize"].map(
                  (preset) => (
                    <Button
                      key={preset}
                      size="sm"
                      variant="outline"
                      className="border-neon/30 text-foreground hover:bg-neon hover:text-background"
                    >
                      {preset}
                    </Button>
                  )
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Button className="w-full bg-transparent border-2 border-neon text-neon hover:bg-neon hover:text-background font-bold">
                <RotateCcw className="w-4 h-4 mr-2" />
                Rewrite Prompt
              </Button>
              
              <Button className="w-full bg-neon text-background hover:bg-neon-glow font-bold py-6 text-lg">
                Generate Pro Video
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
