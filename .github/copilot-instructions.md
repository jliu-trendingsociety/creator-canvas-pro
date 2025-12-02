# Creator Canvas Pro – Copilot Master Instructions
This file lives at .github/copilot-instructions.md and is the single source of truth for AI behavior in this repo.

## Purpose

This file serves as the canonical **AI Developer Guide** for Copilot, ChatGPT, and any future AI agents interacting with the Creator Canvas Pro codebase. It defines architecture, rules, constraints, workflows, and patterns required to safely evolve ProEditor into **Module Zero of the Trending Society Creator OS**.

It ensures:

- safe refactors
- predictable behavior
- scalability
- clear separation of concerns
- multi-track timeline integrity
- rendering pipeline correctness
- long-term maintainability
- agent compatibility

All AI agents MUST follow this file strictly.

---

# 1. System Overview

Creator Canvas Pro is a professional, browser-based video editor with:

- Multi-track timeline
- Real-time Canvas2D rendering engine
- Asset ingestion (images/videos)
- AI prompt panel for transformations
- Playhead, thumbnails, trim handles
- Collapsible layout panels
- Legacy render engine (preview-only)
- New compositing engine (future path)

Built with:

- React 18
- TypeScript
- Vite
- Zustand
- Tailwind + shadcn/ui
- Canvas2D

---

# 2. ProEditor Architecture (Module Zero)

`src/pages/ProEditor.tsx` is the central composition shell.

It defines four workspace zones:

1. **Left Panel**  
   Assets, uploads, project config.

2. **Center Viewer Panel**  
   `<video>` or `<MasterCanvas>` with real-time rendering.

3. **Right AI Panel**  
   AI prompt input, agent tools, transformations.

4. **Timeline Area**  
   Multi-track component, thumbnails, frame mapping.

### Strict Rule:

**ProEditor.tsx may NOT contain complex business logic.**  
It orchestrates state, renderer, timeline, and layout only.

---

# 3. Core Architectural Domains

## 3.1 Timeline State Management

Located at: `src/editor/pro/timeline/state/timelineStore.ts`

This is the **single source of truth** for:

- Tracks
- Clips
- Current time
- Duration
- Zoom
- Scroll
- Thumbnail width
- Selected clip
- Hovered frame
- Trim boundaries

All timeline mutations MUST go through store actions.  
**Never mutate state directly.**

---

## 3.2 Timeline Coordinate System

Located at: `src/editor/pro/timeline/core/coordinateSystem.ts`

ALL conversions between time and pixels MUST use:

- `timeToPx()`
- `pxToTime()`
- `indexToPx()`
- `TIMELINE_LEFT_OFFSET`

No custom pixel math is allowed anywhere else.

---

## 3.3 Rendering Pipeline

### Legacy Render Engine (preview-only)

Files:

- `RenderEngine.ts`
- `FFmpegService.ts`

Produces:

```ts
type RenderGraphOutput = {
  duration: number;
  nodes: RenderClipNode[];
  trackCount: number;
};
```

Legacy engine is ONLY for debugging / previews.  
Do NOT extend it or rely on it for new features.

---

### New Render Engine (primary)

Files:

- `engine/RenderEngine.ts`
- `engine/types.ts`
- `Compositor.ts`
- `components/MasterCanvas.tsx`

Responsibilities:

- Asset preparation
- Clip evaluation
- Track compositing
- Real-time Canvas2D frame rendering
- Render loop driven by requestAnimationFrame

The future:  
**AI agents will call command APIs to build render graphs automatically.**

---

# 4. Key Patterns & Conventions

## 4.1 Single Source of Truth for Playback Time

Only ONE playback clock exists:

**`<video>.currentTime` is authoritative.**

Zustand store mirrors it.

Allowed functions:

- `handleTimeUpdate()`
- `seekToTime()`
- `handleTimelineSeek()`

Forbidden:

- Additional independent playback timers
- State-based frame timers

---

## 4.2 Strict Immutability in Zustand

All updates must return new objects.

Example:

```ts
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
  }));
```

No mutation under ANY circumstance.

---

## 4.3 Import Aliasing

Always use:

```ts
import { useTimelineStore } from '@/editor/pro/timeline/state/timelineStore';
```

Never use multi-level relative paths.

---

## 4.4 Layout Components MUST NOT contain logic

`layout/*` is for display only.

Forbidden in layout components:

- Zustand access
- Timeline modifications
- Direct DOM manipulation
- Pixel/time computation

---

# 5. Developer Workflows

## 5.1 Install & Run

```
npm i
npm run dev
npm run build
npm run lint
```

## 5.2 Adding Features

- UI uses `src/components/ui` (shadcn)
- Timeline: update store actions + coordinate helpers
- Rendering: extend new engine, NOT legacy engine

## 5.3 Testing

- Test timeline interactions manually
- Validate coordinate alignment
- Confirm renderer draws correctly via MasterCanvas

---

# 6. Integration Data Flow

## 6.1 File Upload → Timeline

Steps:

1. Upload file
2. Detect asset type
3. Create ObjectURL
4. Store asset reference
5. On metadata load: set duration
6. Generate thumbnails
7. Insert clips into tracks

---

## 6.2 Timeline → Playback

1. User interacts with timeline
2. Calls `handleTimelineSeek()`
3. Delegates to `seekToTime()`
4. Updates both store + `<video>` element

---

## 6.3 Render Preview

1. Button triggers preview
2. Legacy engine builds graph
3. Console output + toast
4. New engine handles real-time rendering

---

# 7. Critical Files Overview

- `src/pages/ProEditor.tsx`
- `src/editor/pro/timeline/state/timelineStore.ts`
- `src/editor/pro/timeline/core/coordinateSystem.ts`
- `src/editor/pro/renderer/engine/RenderEngine.ts`
- `src/editor/pro/renderer/Compositor.ts`
- `src/editor/pro/renderer/components/MasterCanvas.tsx`
- `vite.config.ts`
- `tailwind.config.ts`
- `tsconfig.json`

---

# 8. Common Pitfalls (AI MUST avoid)

## ❌ Do NOT:

- Duplicate track → render mapping logic
- Hardcode pixel formulas
- Add new playback timers
- Mutate Zustand state
- Mix legacy and new engine logic
- Put logic inside layout components

## ✔ DO:

- Use coordinate helpers
- Use store actions
- Wrap legacy engine behind helpers
- Keep renderer + timeline concerns separated
- Maintain folder boundaries
- Prepare for commands API

---

# 9. Refactor Strategy (Phased)

### Phase 1: ProEditor.tsx cleanup

- Convert to pure composition shell
- Move logic to state/timeline/renderer folders

### Phase 2: Extract state

- Move editor-specific state to `editor/state`
- Keep timeline state in timelineStore

### Phase 3: Extract layout

- Move left/right panels, viewer frame, timeline container to `layout/*`

### Phase 4: Isolate timeline engine

- Move timeline rendering logic to `timeline/engine/*`

### Phase 5: Isolate renderer

- Move all rendering concerns to `renderer/*`

### Phase 6: Introduce `commands/` layer

- All UI and agents use commands to mutate state or trigger engine actions

---

# 10. Commands API (future-facing)

The `commands/` folder will expose mutation-safe calls:

Examples:

```ts
commands.addClip(trackId, clipData);
commands.trimClip(clipId, bounds);
commands.moveClip(clipId, newStart);
commands.seek(time);
commands.renderFrame();
commands.exportProject();
```

AI agents will use these instead of touching state directly.

---

# 11. Safety Constraints (Copilot MUST follow)

### Do NOT:

- Change public component props without updating all callers
- Introduce new dependencies
- Modify state structure without explicit instruction
- Break multi-track ordering
- Touch legacy engine internals

### Do:

- Follow all architectural boundaries
- Maintain invariants
- Provide summaries for changes
- Keep refactors small and safe

---

# End of Copilot Master Instructions
