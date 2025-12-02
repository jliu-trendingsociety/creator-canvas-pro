import { create } from 'zustand';

export interface EffectInstance {
  id: string;
  type: string;
  params: Record<string, any>;
}

export interface Clip {
  id: string;
  src: string;
  start: number;
  end: number;
  offset: number;
  thumbnails?: string[];
  effects: EffectInstance[];
}

export interface Track {
  id: string;
  type: 'video' | 'audio' | 'effect';
  height: number;
  clips: Clip[];
  locked?: boolean;
  visible?: boolean;
}

export interface TimelineState {
  // Playback state
  duration: number;
  currentTime: number;
  isPlaying: boolean;

  // UNIFIED COORDINATE SYSTEM - Single source of truth
  zoom: number;              // Zoom multiplier (0.2x - 4.0x)
  scrollLeft: number;        // Horizontal scroll offset in pixels
  totalThumbnailWidth: number; // Base width before zoom (calculated from thumbnails)

  // Multi-track state
  tracks: Track[];
  activeTrackId: string | null;

  // Selection state
  selectedClipId: string | null;
  selectedFrameIndex: number | null;
  hoveredFrameIndex: number | null;

  // Trim state
  trimStart: number;
  trimEnd: number;

  // Track actions
  addTrack: (type: Track['type']) => void;
  removeTrack: (trackId: string) => void;
  setActiveTrack: (trackId: string | null) => void;
  reorderTracks: (fromIndex: number, toIndex: number) => void;

  // Clip actions
  addClip: (trackId: string, clip: Clip) => void;
  updateClip: (trackId: string, clipId: string, data: Partial<Clip>) => void;
  removeClip: (trackId: string, clipId: string) => void;
  moveClip: (trackId: string, clipId: string, newStart: number) => void;
  setSelectedClip: (clipId: string | null) => void;

  // Legacy actions
  setDuration: (duration: number) => void;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setZoom: (zoom: number) => void;
  setScrollLeft: (scrollLeft: number) => void;
  setTotalThumbnailWidth: (width: number) => void;
  setSelectedFrameIndex: (index: number | null) => void;
  setHoveredFrameIndex: (index: number | null) => void;
  setTrimStart: (time: number) => void;
  setTrimEnd: (time: number) => void;
  resetTimeline: () => void;
}

export const useTimelineStore = create<TimelineState>((set) => ({
  // Initial state
  duration: 0,
  currentTime: 0,
  isPlaying: false,
  zoom: 1,
  scrollLeft: 0,
  totalThumbnailWidth: 0,
  tracks: [],
  activeTrackId: null,
  selectedClipId: null,
  selectedFrameIndex: null,
  hoveredFrameIndex: null,
  trimStart: 0,
  trimEnd: 0,

  // Track actions
  addTrack: (type) =>
    set((state) => ({
      tracks: [
        ...state.tracks,
        {
          id: `track-${Date.now()}`,
          type,
          height: type === 'video' ? 80 : type === 'audio' ? 60 : 40,
          clips: [],
          locked: false,
          visible: true,
        },
      ],
    })),

  removeTrack: (trackId) =>
    set((state) => ({
      tracks: state.tracks.filter((t) => t.id !== trackId),
      activeTrackId: state.activeTrackId === trackId ? null : state.activeTrackId,
    })),

  setActiveTrack: (activeTrackId) => set({ activeTrackId }),

  reorderTracks: (fromIndex, toIndex) =>
    set((state) => {
      const newTracks = [...state.tracks];
      const [removed] = newTracks.splice(fromIndex, 1);
      newTracks.splice(toIndex, 0, removed);
      return { tracks: newTracks };
    }),

  // Clip actions
  addClip: (trackId, clip) =>
    set((state) => ({
      tracks: state.tracks.map((track) =>
        track.id === trackId
          ? { ...track, clips: [...track.clips, clip] }
          : track
      ),
    })),

  updateClip: (trackId, clipId, data) =>
    set((state) => ({
      tracks: state.tracks.map((track) =>
        track.id === trackId
          ? {
              ...track,
              clips: track.clips.map((clip) =>
                clip.id === clipId ? { ...clip, ...data } : clip
              ),
            }
          : track
      ),
    })),

  removeClip: (trackId, clipId) =>
    set((state) => ({
      tracks: state.tracks.map((track) =>
        track.id === trackId
          ? { ...track, clips: track.clips.filter((c) => c.id !== clipId) }
          : track
      ),
      selectedClipId: state.selectedClipId === clipId ? null : state.selectedClipId,
    })),

  moveClip: (trackId, clipId, newStart) =>
    set((state) => ({
      tracks: state.tracks.map((track) =>
        track.id === trackId
          ? {
              ...track,
              clips: track.clips.map((clip) =>
                clip.id === clipId
                  ? { ...clip, start: newStart, end: newStart + (clip.end - clip.start) }
                  : clip
              ),
            }
          : track
      ),
    })),

  setSelectedClip: (selectedClipId) => set({ selectedClipId }),

  // Legacy actions
  setDuration: (duration) => set({ duration, trimEnd: duration }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setZoom: (zoom) => set({ zoom: Math.max(0.2, Math.min(4.0, zoom)) }),
  setScrollLeft: (scrollLeft) => set({ scrollLeft }),
  setTotalThumbnailWidth: (totalThumbnailWidth) => set({ totalThumbnailWidth }),
  setSelectedFrameIndex: (selectedFrameIndex) => set({ selectedFrameIndex }),
  setHoveredFrameIndex: (hoveredFrameIndex) => set({ hoveredFrameIndex }),
  setTrimStart: (trimStart) => set({ trimStart }),
  setTrimEnd: (trimEnd) => set({ trimEnd }),
  resetTimeline: () =>
    set({
      duration: 0,
      currentTime: 0,
      isPlaying: false,
      zoom: 1,
      scrollLeft: 0,
      totalThumbnailWidth: 0,
      tracks: [],
      activeTrackId: null,
      selectedClipId: null,
      selectedFrameIndex: null,
      hoveredFrameIndex: null,
      trimStart: 0,
      trimEnd: 0,
    }),
}));
