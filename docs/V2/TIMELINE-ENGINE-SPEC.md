# TIMELINE-ENGINE-SPEC.md
**ProEditor – Timeline Engine Specification**  
Location: `docs/TIMELINE-ENGINE-SPEC.md`

The Timeline Engine is the **authoritative source of truth** for all timeline-related behavior in ProEditor.  
UI components, Liveblocks collaboration, agents, and renderers talk to the timeline **through pure functions and store actions**, never by mutating raw state directly.

---

## 1. Core Responsibilities

- Represent multi-track timeline state (`tracks`, `clips`, `markers`, `effects`).
- Implement core editing behaviors as pure functions:
  - Select, move, trim, split clips
  - Manage tracks (add, delete, reorder, collapse)
  - Zoom and scroll logic
  - Snapping and magnetic behavior
- Provide mapping utilities between:
  - `time <-> frames <-> pixels`
  - `clip positions <-> render data`
- Serve as the single source of truth for playback-related timeline state.

Timeline Engine **does not** know about React, DOM, or Liveblocks. It is a deterministic, testable core.

---

## 2. State Model

Minimal model (conceptual):

```ts
type TrackType = 'video' | 'audio' | 'effect' | 'text';

interface Clip {
  id: string;
  trackId: string;
  srcAssetId: string;
  startTime: number;   // in seconds, timeline coordinates
  endTime: number;     // in seconds, timeline coordinates
  offset: number;      // in seconds, offset into src
  muted: boolean;
  locked: boolean;
  effects: EffectRef[];
}

interface Track {
  id: string;
  type: TrackType;
  name: string;
  order: number;
  collapsed: boolean;
  clips: Clip[];
}

interface TimelineState {
  tracks: Track[];
  duration: number;        // seconds
  currentTime: number;     // seconds
  zoom: number;            // 1.0 = default
  scrollLeft: number;      // pixels
  selection: SelectionState;
  markers: Marker[];
}
```

The actual implementation can extend this, but all behaviors must be expressible in terms of this core model.

---

## 3. Engine API (Pure Functions)

All editing behavior should be implemented as pure functions that take `TimelineState` (or subsets) and return **new state**.

Examples:

```ts
selectClip(state, clipId): TimelineState
moveClip(state, clipId, newStartTime): TimelineState
trimClip(state, clipId, edge, newTime): TimelineState
splitClip(state, clipId, atTime): TimelineState
addTrack(state, type): TimelineState
deleteTrack(state, trackId): TimelineState
reorderTrack(state, trackId, newIndex): TimelineState
toggleTrackCollapse(state, trackId): TimelineState
```

These functions are then wrapped by the Zustand timeline store actions.

---

## 4. Coordinate System

The engine must be compatible with the shared coordinate system used by UI and renderer:

- `timeToPx(time, ctx): number`
- `pxToTime(px, ctx): number`
- `indexToPx(index, ctx): number`

Where `ctx` includes:

```ts
interface TimelineCoordinateContext {
  duration: number;
  totalThumbnailWidth: number;
  zoom: number;
  scrollLeft: number;
  leftOffset: number; // TIMELINE_LEFT_OFFSET
}
```

No UI component should hand-roll pixel math. The Timeline Engine + coordinate helpers are the single source of truth.

---

## 5. Liveblocks “Intent Layer” Compatibility

To support multiplayer editing with Liveblocks, the engine must be able to accept **intents** from multiple users (and AI agents) in a safe, deterministic way.

### 5.1. Intent Model

Liveblocks carries ephemeral data such as:

```ts
type IntentType =
  | 'preview-move'
  | 'preview-trim'
  | 'selection-change'
  | 'marker-hover'
  | 'scrub-preview';

interface TimelineIntent {
  userId: string;          // human or agent
  type: IntentType;
  clipId?: string;
  trackId?: string;
  time?: number;
  positionPx?: number;
}
```

Intents are not applied directly as mutations. Instead, they are:

1. Mapped to engine operations (e.g. `preview-move` → compute potential new position).
2. Rendered in UI as **ghost states** (ghost clip, ghost playhead).
3. Only committed when the authoritative action is triggered (e.g. mouse up, confirm, or explicit command).

### 5.2. Rules

- Liveblocks never mutates timeline state directly.
- Timeline Engine provides helpers like:

```ts
projectIntentToGhostState(state, intent): GhostState
applyCommittedIntent(state, intent): TimelineState
```

- Agents use the same API surface; they just generate intents programmatically.
- Conflicts are resolved by last-write-wins at the **command level**, not at the Liveblocks presence layer.

---

## 6. Integration with Stores & Commands

### 6.1. Timeline Store (Zustand)

The store wraps engine functions:

```ts
const useTimelineStore = create<TimelineState & Actions>((set, get) => ({
  // state...

  moveClip: (clipId, newStart) =>
    set((state) => moveClip(state, clipId, newStart)),

  // etc...
}));
```

The store is the only place that is allowed to call engine functions for mutations.

### 6.2. Commands Layer

Commands expose a stable API for UI and agents:

```ts
commands.timeline.moveClip({ clipId, newStartTime });
commands.timeline.trimClip({ clipId, edge, newTime });
commands.timeline.seek({ time });
```

Timeline Engine should not depend on Commands, but Commands must depend on the engine.

---

## 7. Renderer Integration

Renderer expects a **render-ready view** of the timeline.

Introduce a mapper:

```ts
mapTracksToRenderData(state: TimelineState): RenderTrackData[]
```

This function:

- Normalizes track order.
- Ensures clips are non-overlapping on the same track.
- Produces a compact structure needed by the render engine.

Render Engine must treat this output as read-only.

---

## 8. Testing Strategy

- Unit tests for all pure functions (move, trim, split, zoom, scroll).
- Property-based tests for invariants:
  - `clip.startTime < clip.endTime`
  - `clips` on a track never overlap after operations.
- Fuzz tests with random operations sequences to ensure stability.

---

## 9. Non-Goals

Timeline Engine **does not** handle:

- Network transport (Liveblocks, WebSockets, etc.).
- DOM or React concerns.
- Auth, permissions, or business logic (e.g. billing gates).
- Long-running tasks or async jobs.

Those are handled by other modules (Collaboration Engine, Agent Runtime, Distributed Compute).

This spec should remain stable even as new UI layers, agents, or renderers are introduced.
