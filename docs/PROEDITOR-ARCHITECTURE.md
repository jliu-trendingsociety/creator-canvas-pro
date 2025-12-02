
# PROEDITOR-ARCHITECTURE.md  
**Creator Canvas Pro – ProEditor Architecture Specification (Module Zero of the Trending Society Creator OS)**

This document defines the complete, long-term architectural blueprint for **ProEditor**, the core module (Module Zero) of the Creator OS.  
It is the reference architecture for all developers, AI agents, copilots, and contributors.

---

# 1. Purpose

ProEditor is the **foundational editing engine** for the entire Creator OS.  
Everything in the ecosystem – multi-agent workflows, creator automation, marketplace modules, licensing partners, render graphs, and future plugins – depends on this being:

- Predictable  
- Extensible  
- Modular  
- Agent-friendly  
- Fully refactorable  
- Multi-track capable  
- Consistent across all layers  

It must exhibit **zero fragmentation**, **strict boundaries**, and **clean separation** of all concerns.

---

# 2. Architectural Pillars

ProEditor is built on **five stable, non-negotiable pillars**:

1. **State Layer**  
2. **Timeline Engine**  
3. **Rendering Engine**  
4. **Layout Layer**  
5. **Commands Layer (future)**

These pillars define how the system scales, how agents interact with it, and how future modules (effects, transitions, transformations, plugins) integrate safely.

---

# 3. Layer-by-Layer Architecture

---

## 3.1 State Layer (Single Source of Truth)

Location:  
`src/editor/pro/timeline/state/`

Characteristics:

- Zustand store defines all editor + timeline state.  
- No other component or module may create timeline state.  
- All timeline mutations must go through store actions.  
- No direct state mutation is allowed.

State includes:

- Tracks  
- Clips  
- Duration  
- Current time  
- Selection  
- Zoom / scroll  
- Trim boundaries  
- Timeline layout values  
- Mutations (addClip, moveClip, updateClip, etc.)

Rules:

- State must be serializable.  
- Actions must be pure.  
- No circular dependencies.  
- Timeline state MUST NOT depend on React component hierarchy.

Future:

- Will support time-based deltas.  
- Will support agent-readable render graph generation.

---

## 3.2 Timeline Engine (Playback & Editing Logic)

Location:  
`src/editor/pro/timeline/`

Purpose:

- Converts raw state into **timeline behavior**.  
- Handles mapping between time, pixels, track positions, scroll, and zoom.  
- Manages interactions: dragging, trimming, selecting, snapping.

Submodules:

1. **Coordinate System**  
   - Controls time ↔ pixel conversions  
   - Must always be used for playhead, clips, thumbnails, trim handles  
   - Enforces left offset = 0  
   - Guarantees consistency across all timeline components

2. **Track/Clip Model**  
   - Defines how clips exist within tracks  
   - Tracks can be reordered, collapsed, or expanded (future)

3. **Interaction Handlers**  
   - Dragging  
   - Trimming  
   - Selection  
   - Hover behavior  
   - Timeline seek behavior  
   - Zoom scroll behavior

4. **Rendering Preparation**  
   - Prepares track evaluation for the new rendering engine  
   - Converts track/clip state into renderable structures

Rules:

- Timeline engine must NOT contain UI logic.  
- It must be pure, deterministic, and testable.  
- No DOM access.  
- No rendering logic.

---

## 3.3 Rendering Engine (Canvas2D Compositor)

Location:  
`src/editor/pro/renderer/`

Responsibilities:

- Load and prepare video/image assets  
- Maintain a cache of playable media  
- Render frames with a compositing pipeline  
- Evaluate tracks into render operations  
- Drive real-time playback inside `MasterCanvas`

Subsystems:

### 3.3.1 Asset Preparation  
Loads, caches, and maintains:

- HTMLVideoElements  
- HTMLImageElements  
- Off-screen canvases  
- Frame buffers  

### 3.3.2 RenderGraph Evaluation  
Steps:

- Interpret tracks & clips  
- Create ordered render nodes  
- Generate a render plan for each frame  

### 3.3.3 Compositor  
Combines:

- Video frames  
- Images  
- Effects  
- Blend modes (future)  
- Color transforms (future)  
- Multi-layer composition (future)

### 3.3.4 MasterCanvas  
Displays the rendered output:

- Integrates with React  
- Handles playback  
- Calls `renderFrame()` on each animation tick  
- Syncs with store’s `currentTime`  

Rules:

- Rendering engine must NEVER modify timeline state.  
- Rendering engine must be stateless between frames (deterministic).  
- Rendering engine must be UI-agnostic.

---

## 3.4 Layout Layer (Panels, Viewer, Structure)

Location:  
`src/editor/pro/layout/` (to be created)

Handles:

- Flexbox/grid structure  
- Resizable/collapsible panels  
- Sidebars  
- Viewer container  
- Timeline container  
- Styling  
- Responsiveness  
- No logic beyond layout & events

Rules:

- No access to store directly.  
- No rendering logic.  
- No timeline logic.  
- No engine logic.  
- Layout should be fully replaceable without affecting behavior.

---

## 3.5 Commands Layer (Future AI + UI API)

Location:  
`src/editor/pro/commands/` (to be created)

Purpose:

This layer exposes safe, deterministic functions for:

- Adding clips  
- Moving clips  
- Trimming  
- Seeking  
- Creating tracks  
- Issuing render operations  
- Invoking transformations  
- Exporting compositions  

Examples (future):

```ts
commands.seek(time)
commands.addClip(trackId, clipData)
commands.trimClip(clipId, { start, end })
commands.moveClip(clipId, newStart)
commands.applyEffect(clipId, effect)
commands.exportProject()
```

Why this matters:

- UI components never touch raw state.  
- AI agents never mutate state directly.  
- Future automation systems (Creator OS Agents) rely on this layer.  
- Creates a stable contract between UI and engine.

---

# 4. Data Flow Architecture

---

## 4.1 Upload Pipeline

```
User Upload → File Handler → Object URL → Metadata → Duration → State Update → Thumbnails → Timeline
```

Rules:

- No rendering during upload pipeline.  
- Duration MUST be set before timeline UI renders.  
- Thumbnails must sync with timeline state.

---

## 4.2 Playback Flow

```
User Input → seekToTime() → store.currentTime → <video>.currentTime → Renderer
```

Rules:

- `<video>` element time is the source of truth.  
- Renderer must always follow store currentTime.  
- No frame skipping logic inside UI components.

---

## 4.3 Timeline Interaction Flow

```
Timeline UI → Interaction Handler → Coordinate System → Commands → State → UI Update
```

UI may not mutate state directly.

---

## 4.4 Rendering Flow

```
State → Track Evaluation → RenderGraph → Compositor → MasterCanvas
```

Renderer is a pure consumer of state.

---

# 5. File & Folder Structure (Expected End State)

```
src/editor/pro/
    layout/
        LeftPanel.tsx
        RightPanel.tsx
        ViewerContainer.tsx
        TimelineContainer.tsx
        ...
    state/
        editorStore.ts
        timelineStore.ts
    timeline/
        core/
            coordinateSystem.ts
        engine/
            timelineEvaluation.ts
            interactions.ts
        ui/
            Playhead.tsx
            TimelineTrack.tsx
            ThumbnailStrip.tsx
            TrimHandles.tsx
            ...
    renderer/
        engine/
            RenderEngine.ts
            types.ts
        compositor/
            Compositor.ts
            layers/
                VideoLayer.ts
                ImageLayer.ts
        components/
            MasterCanvas.tsx
    commands/
        index.ts
        clip.ts
        track.ts
        timeline.ts
        render.ts
```

---

# 6. Architectural Constraints (Unbreakable)

- Timeline state must remain serializable.  
- Rendering engine must not mutate state.  
- Layout must not perform logic.  
- Commands must become the ONLY mutation path (future).  
- Coordinate system must remain the canonical source of pixel math.  
- ProEditor must remain a composition shell.  
- No cross-imports between layout ↔ renderer.  
- No direct manipulation of DOM from engine or timeline.

---

# 7. Long-Term Vision

ProEditor evolves into:

- The **visual editing module** for the Creator OS  
- The **render graph generator** for Creator Agents  
- A **plugin-ready** architecture (effects, overlays, transitions)  
- A **multi-format export engine**  
- A **white-label module** for partners and collaborators  

This is the backbone of the ecosystem.  
All new features MUST follow this architecture.

---

# END OF PROEDITOR ARCHITECTURE SPEC
