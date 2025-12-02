import { create } from 'zustand';

export interface TimelineState {
  // Visual state
  zoom: number;
  scrollLeft: number;
  totalThumbnailWidth: number;
  
  // Track state
  trackHeights: Record<string, number>;
  activeTrack: string | null;
  
  // Actions
  setZoom: (zoom: number) => void;
  setScrollLeft: (scrollLeft: number) => void;
  setTotalThumbnailWidth: (width: number) => void;
  setTrackHeight: (trackId: string, height: number) => void;
  setActiveTrack: (trackId: string | null) => void;
  resetTimeline: () => void;
}

export const useTimelineStore = create<TimelineState>((set) => ({
  // Initial state
  zoom: 1,
  scrollLeft: 0,
  totalThumbnailWidth: 0,
  trackHeights: {},
  activeTrack: null,
  
  // Actions
  setZoom: (zoom) => set({ zoom }),
  setScrollLeft: (scrollLeft) => set({ scrollLeft }),
  setTotalThumbnailWidth: (totalThumbnailWidth) => set({ totalThumbnailWidth }),
  setTrackHeight: (trackId, height) => 
    set((state) => ({
      trackHeights: { ...state.trackHeights, [trackId]: height }
    })),
  setActiveTrack: (activeTrack) => set({ activeTrack }),
  resetTimeline: () => set({
    zoom: 1,
    scrollLeft: 0,
    totalThumbnailWidth: 0,
    trackHeights: {},
    activeTrack: null,
  }),
}));
