
# PROEDITOR-REFACTOR-PLAN.md
**Creator Canvas Pro – Full-System Refactor Plan**  
**Module Zero of the Trending Society Creator OS**

This document defines the complete, phased refactor strategy for ProEditor.  
It is the companion to `PROEDITOR-ARCHITECTURE.md` and `.github/copilot-instructions.md`.

This plan ensures:
- No behavioral regressions  
- Zero fragmentation  
- Clean separation of concerns  
- Timeline + Rendering + Layout independence  
- Agent-ready architecture  
- Multi-track scalability  
- Future commands-layer compatibility  

All AI agents and developers MUST follow these phases **in order**.

---

# 1. Refactor Philosophy

ProEditor is evolving into:
- A **composition shell**
- A **multi-track editing engine**
- A **Canvas2D render engine**
- A **command-driven module** for future agents

The goal of this refactor is to modernize, stabilize, and modularize without breaking:
- Timeline behavior  
- Viewer behavior  
- Playback logic  
- Rendering  
- Layout  

This refactor is **behavior-neutral** unless otherwise stated.

---

# 2. Refactor Phases (Mandatory Order)

Below is the canonical sequence all refactors must follow.

---

# Phase 1 — ProEditor.tsx Cleanup (Non-breaking)

Purpose:
- Convert `ProEditor.tsx` into a pure composition shell.
- Remove inline logic that belongs in:  
  - state  
  - timeline  
  - renderer  
  - helpers

Tasks:
1. Add semantic sections (`// State`, `// Effects`, `// Layout`).
2. Extract inline helper functions (e.g., clip→render mapping).
3. Remove redundant variables and dead code.
4. Ensure:
   - No pixel math inside ProEditor  
   - No timeline state duplication  
   - No renderer logic inside JSX  

Output:
- A cleaner, more readable `ProEditor.tsx` ready for modular extraction.

---

# Phase 2 — State Layer Extraction

Purpose:
Move all editor-specific state into a dedicated `editor/state` module.

Tasks:
1. Create `src/editor/pro/state/editorStore.ts`.
2. Move:
   - Uploaded asset state  
   - Asset type  
   - Duration initialization rules  
   - Viewer mode (video vs canvas)  
   - UI flags (collapsed panels, focus mode)  
3. Keep timeline-specific state in `timelineStore.ts`.

Rules:
- No UI state is allowed inside timeline state.
- State must remain serializable and pure.

---

# Phase 3 — Layout Layer Extraction

Purpose:
Make layout modular, consistent, maintainable, and logic-free.

Create:
```
src/editor/pro/layout/
    LeftPanel.tsx
    RightPanel.tsx
    ViewerContainer.tsx
    TimelineContainer.tsx
    HeaderBar.tsx (future)
```

Tasks:
- Move markup-only sections from ProEditor.tsx.
- Panels become thin wrappers around props + events.
- Zero business logic allowed (no state/store/renderer).

Output:
- A flexible layout system that future themes + plugins can modify.

---

# Phase 4 — Timeline Engine Isolation

Purpose:
Separate timeline **behavior** from timeline **UI**.

Create:
```
src/editor/pro/timeline/engine/
```

Move logic into isolated modules:
- Clip selection logic
- Trim logic
- Drag logic
- Zoom logic
- Scroll behavior
- Track stacking logic
- Time→pixel interaction mapping

Rules:
- No React in the engine.
- No DOM access.
- Pure functions only.

Also:
- Add unit-testable interaction functions.
- Ensure Timeline UI calls engine functions + state actions.

---

# Phase 5 — Renderer Engine Consolidation

Purpose:
Create a unified, predictable rendering pipeline.

Tasks:
1. Move all rendering code to:
   ```
   src/editor/pro/renderer/engine/
   ```
2. Move MasterCanvas to:
   ```
   src/editor/pro/renderer/components/
   ```
3. Ensure:
   - Canvas loop is isolated  
   - Asset loading is cached  
   - RenderGraph evaluation is pure  
   - Rendering is driven by timeline state  

Deprecate:
- All legacy engine usage except debug preview.

---

# Phase 6 — Commands Layer (AI + UI Control)

Purpose:
Introduce the future API that agents + UI will share.

Create:
```
src/editor/pro/commands/
```

Commands:
- `seek(time)`
- `addClip(trackId, data)`
- `moveClip(clipId, time)`
- `trimClip(clipId, bounds)`
- `createTrack(type)`
- `deleteTrack(id)`
- `applyEffect(clipId, effect)`
- `renderFrame()`
- `exportProject()`

Rules:
- Commands call store actions + rendering engine.
- No UI component may mutate state directly once commands exist.
- AI agents will call these commands for automation.

---

# Phase 7 — Multi-Track Enhancement + Effects Layer

Purpose:
Prepare ProEditor for Creator OS production workloads.

Add:
- Track collapsing/expansion  
- Effects stack (JSON-based)  
- Editable transitions  
- Audio waveform support  
- Layer blending modes  
- Plugin registration system  

Rules:
- All effects are pure functions:  
  `frame → frame'`
- Effects must be chainable.

---

# Phase 8 — Export Pipeline Unification

Purpose:
Move ProEditor toward full export capability.

Tasks:
- Integrate render graph with compositor loop  
- Add offscreen render capability  
- Add frame encoder (future WASM module)  
- Time-based downsampling rules  

Output:
- Full rendering pipeline ready for Creator OS distribution.

---

# 3. Phase Summary Table

| Phase | Title | Breaking? | Output |
|------|-------|-----------|--------|
| 1 | Clean up ProEditor.tsx | No | Composition shell |
| 2 | Extract State Layer | No | editorStore + cleaned timelineStore |
| 3 | Extract Layout Layer | No | layout/ folder |
| 4 | Isolate Timeline Engine | No | timeline/engine |
| 5 | Consolidate Renderer | No | renderer/engine |
| 6 | Add Commands Layer | No | commands/ |
| 7 | Multi-Track Enhancements | Yes (optional) | Advanced timeline |
| 8 | Export Unification | Yes (optional) | End-to-end export engine |

---

# 4. AI Refactor Command Protocol

When Copilot or any AI agent is asked to refactor:

1. Identify which phase the request belongs to.  
2. List the files you will modify.  
3. Confirm that behavior will not change unless the phase specifically allows it.  
4. Perform the changes.  
5. Provide a structured summary:  
   - What changed  
   - Why  
   - Next steps  
6. Validate type-safety + build success.

---

# 5. Final Notes

- Phases **must not** be skipped.  
- Behavior must not change until phases 7–8.  
- All new modules MUST follow architecture rules.  
- All rendering code must consolidate into the new renderer.  
- All timeline logic must consolidate into the timeline engine.  
- `commands/` is required before AI-agent migration.  

This document will evolve as Creator Canvas Pro scales into the Creator OS.

---

# END OF PROEDITOR REFACTOR PLAN
