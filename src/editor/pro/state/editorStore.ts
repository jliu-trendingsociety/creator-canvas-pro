import { create } from 'zustand';

/**
 * Editor-level UI state for ProEditor.
 * Handles:
 * - Uploaded asset metadata (URL, type)
 * - Panel collapse/expand state
 * - Viewer focus mode
 * - Visual overlays (safe frames)
 * - Upload drag interaction
 *
 * This is SEPARATE from timeline state (which lives in timelineStore.ts).
 * Playback state (isPlaying, currentTime, duration, volume) remain local to ProEditor.
 */

export interface EditorState {
  // Asset upload
  uploadedAssetUrl: string | null;
  assetType: 'video' | 'image' | null;

  // Panel state
  leftPanelCollapsed: boolean;
  rightPanelCollapsed: boolean;

  // Viewer state
  viewerFocusMode: boolean;
  showSafeFrames: boolean;

  // Interaction state
  isUploadDragging: boolean;

  // Actions
  setUploadedAsset: (url: string, type: 'video' | 'image') => void;
  clearUploadedAsset: () => void;
  setLeftPanelCollapsed: (value: boolean) => void;
  setRightPanelCollapsed: (value: boolean) => void;
  setViewerFocusMode: (value: boolean) => void;
  toggleViewerFocusMode: () => void;
  setShowSafeFrames: (value: boolean) => void;
  setIsUploadDragging: (value: boolean) => void;
}

/**
 * Zustand store for editor UI state.
 * All mutations use immutable patterns (no direct object mutation).
 */
export const useEditorStore = create<EditorState>((set) => ({
  // Initial state
  uploadedAssetUrl: null,
  assetType: null,
  leftPanelCollapsed: false,
  rightPanelCollapsed: false,
  viewerFocusMode: false,
  showSafeFrames: false,
  isUploadDragging: false,

  // Asset actions
  setUploadedAsset: (url: string, type: 'video' | 'image') =>
    set({
      uploadedAssetUrl: url,
      assetType: type,
    }),

  clearUploadedAsset: () =>
    set({
      uploadedAssetUrl: null,
      assetType: null,
    }),

  // Panel actions
  setLeftPanelCollapsed: (value: boolean) => set({ leftPanelCollapsed: value }),

  setRightPanelCollapsed: (value: boolean) =>
    set({ rightPanelCollapsed: value }),

  // Viewer actions
  setViewerFocusMode: (value: boolean) => set({ viewerFocusMode: value }),

  toggleViewerFocusMode: () =>
    set((state) => ({ viewerFocusMode: !state.viewerFocusMode })),

  setShowSafeFrames: (value: boolean) => set({ showSafeFrames: value }),

  // Interaction actions
  setIsUploadDragging: (value: boolean) => set({ isUploadDragging: value }),
}));
