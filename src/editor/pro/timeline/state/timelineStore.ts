import { create } from 'zustand';

export interface TimelineState {
  // Playback state
  duration: number;
  currentTime: number;
  isPlaying: boolean;

  // Visual state
  zoom: number;
  scrollLeft: number;
  totalThumbnailWidth: number;

  // Track state
  trackHeights: Record<string, number>;
  activeTrack: string | null;

  // Selection state
  selectedFrameIndex: number | null;
  hoveredFrameIndex: number | null;

  // Trim state
  trimStart: number;
  trimEnd: number;

  // Actions
  setDuration: (duration: number) => void;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setZoom: (zoom: number) => void;
  setScrollLeft: (scrollLeft: number) => void;
  setTotalThumbnailWidth: (width: number) => void;
  setTrackHeight: (trackId: string, height: number) => void;
  setActiveTrack: (trackId: string | null) => void;
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
  trackHeights: {},
  activeTrack: null,
  selectedFrameIndex: null,
  hoveredFrameIndex: null,
  trimStart: 0,
  trimEnd: 0,

  // Actions
  setDuration: (duration) => set({ duration, trimEnd: duration }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setZoom: (zoom) => set({ zoom: Math.max(0.2, Math.min(4.0, zoom)) }),
  setScrollLeft: (scrollLeft) => set({ scrollLeft }),
  setTotalThumbnailWidth: (totalThumbnailWidth) => set({ totalThumbnailWidth }),
  setTrackHeight: (trackId, height) =>
    set((state) => ({
      trackHeights: { ...state.trackHeights, [trackId]: height }
    })),
  setActiveTrack: (activeTrack) => set({ activeTrack }),
  setSelectedFrameIndex: (selectedFrameIndex) => set({ selectedFrameIndex }),
  setHoveredFrameIndex: (hoveredFrameIndex) => set({ hoveredFrameIndex }),
  setTrimStart: (trimStart) => set({ trimStart }),
  setTrimEnd: (trimEnd) => set({ trimEnd }),
  resetTimeline: () => set({
    duration: 0,
    currentTime: 0,
    isPlaying: false,
    zoom: 1,
    scrollLeft: 0,
    totalThumbnailWidth: 0,
    trackHeights: {},
    activeTrack: null,
    selectedFrameIndex: null,
    hoveredFrameIndex: null,
    trimStart: 0,
    trimEnd: 0,
  }),
}));
