
# RENDER-ENGINE-SPEC.md  
**Creator Canvas Pro – Rendering Engine Specification**  
Location: `docs/RENDER-ENGINE-SPEC.md`

The rendering engine handles all real-time visual output and future export pipelines.

It is isolated under:
```
src/editor/pro/renderer
```

---

# 1. Core Responsibilities

- Load and cache media assets  
- Evaluate tracks + clips into render graph  
- Composite layers using Canvas2D  
- Render frames in sync with playback  
- Prepare for future WASM-based export engine  

---

# 2. RenderGraph

Renderer consumes:

```ts
type RenderGraphNode = {
  clipId: string;
  trackId: string;
  start: number;
  end: number;
  layer: number;
  type: 'video' | 'image' | 'effect';
  source: MediaSource;
};
```

Renderer must evaluate graph per frame.

---

# 3. Asset Preparation

Assets include:
- HTMLVideoElement  
- HTMLImageElement  
- OffscreenCanvas  
- Preallocated frame buffers  

Rules:
- Asset caching required  
- Loading must be asynchronous  
- No reloading on every frame  

---

# 4. Composition Pipeline

```
Frame → Clear Canvas  
→ Draw Video Layers  
→ Draw Image Layers  
→ Apply Effects (future)  
→ Present on MasterCanvas
```

Effects must be pure pixel transforms.

---

# 5. Render Loop

Driven via:

```
requestAnimationFrame(loop)
```

Rules:
- Never mutate timeline state  
- Must read currentTime from store  
- Must re-render only when needed  
- Must avoid layout thrashing  

---

# 6. Multi-Track Rendering

Each track is layered in order:
- Lower track = lower layer  
- Higher track = drawn later  

Timeline engine defines stacking; renderer respects it.

---

# 7. Real-Time Constraints

- Stable 60fps target  
- Batch work across frames  
- Avoid unnecessary frame evaluation  
- Cache all calculations possible  

---

# END OF RENDER ENGINE SPEC
