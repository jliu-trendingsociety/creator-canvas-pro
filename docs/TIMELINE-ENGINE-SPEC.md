
# TIMELINE-ENGINE-SPEC.md  
**Creator Canvas Pro – Timeline Engine Specification**  
Location: `docs/TIMELINE-ENGINE-SPEC.md`

The Timeline Engine is responsible for all timeline behavior, including:  
- pixel → time mapping  
- drag, trim, move interactions  
- track stacking  
- zoom + scroll  
- frame indexing  
- snapping  

This engine contains **no React**, **no DOM**, and **no rendering**.

---

# 1. Core Responsibilities

1. Convert timeline state into renderable track/clip positions.  
2. Handle all interactions as pure functions.  
3. Maintain consistent coordinate conversions.  
4. Provide deterministic timeline behavior.

---

# 2. Coordinate System

All conversions must be done through:

```
timeToPx(time, zoom, totalWidth)
pxToTime(px, zoom, scroll)
indexToPx(index, thumbnailWidth)
```

Global invariant:

```
TIMELINE_LEFT_OFFSET = 0
```

No component may calculate pixels manually.

---

# 3. Interaction Engine

## 3.1 Clip Dragging

Input:
- mouseDownX
- mouseMoveX
- track bounds
- scroll offset

Output:
- newStartTime
- snapping adjustments

Rules:
- Cannot drag clip to negative time.
- Must snap to:
  - clip boundaries  
  - timeline markers  
  - nearest frame  

---

## 3.2 Trimming

Input:
- trimStart, trimEnd
- clip duration
- drag delta

Rules:
- trimStart must not exceed trimEnd.
- Must preserve minimum frame unit.
- Timeline UI cannot override logic.

---

## 3.3 Track Stacking

Rules:
- Tracks are vertical containers.
- Dragging clips between tracks must preserve order.
- Track expansion/collapse is a UI-only concern.

---

## 3.4 Zoom + Scroll

Zoom changes:
- visible time range  
- pixel density  

Scroll changes:
- pixel window  

The engine calculates visible range and timeline bounds.

---

# 4. Clip Evaluation

Timeline Engine produces:

```
{
  tracks: [
    {
      id,
      type,
      clips: [
        { id, startTime, endTime, effects }
      ]
    }
  ],
  duration,
  fps
}
```

Renderer consumes this output.

---

# 5. State Integration

Timeline Engine must use:
- `timelineStore.ts` as source of truth  
- store actions only  

It must NOT:
- mutate DOM  
- access components  
- reach into renderer  

---

# END OF TIMELINE ENGINE SPEC
