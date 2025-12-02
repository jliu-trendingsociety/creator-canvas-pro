import { TimelineState } from './timelineStore';

/**
 * Memoized selectors for timeline state
 */
export const timelineSelectors = {
  // Playback selectors
  playbackState: (state: TimelineState) => ({
    currentTime: state.currentTime,
    duration: state.duration,
    isPlaying: state.isPlaying,
  }),

  // Visual selectors
  visualState: (state: TimelineState) => ({
    zoom: state.zoom,
    scrollLeft: state.scrollLeft,
    totalThumbnailWidth: state.totalThumbnailWidth,
  }),

  // Selection selectors
  selectionState: (state: TimelineState) => ({
    selectedFrameIndex: state.selectedFrameIndex,
    hoveredFrameIndex: state.hoveredFrameIndex,
  }),

  // Trim selectors
  trimState: (state: TimelineState) => ({
    trimStart: state.trimStart,
    trimEnd: state.trimEnd,
  }),

  // Track selectors
  trackState: (state: TimelineState) => ({
    tracks: state.tracks,
    activeTrackId: state.activeTrackId,
  }),

  // Clip selectors
  clipState: (state: TimelineState) => ({
    selectedClipId: state.selectedClipId,
  }),
};
