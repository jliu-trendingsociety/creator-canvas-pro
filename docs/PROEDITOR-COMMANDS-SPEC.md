
# PROEDITOR-COMMANDS-SPEC.md  
**Creator Canvas Pro – Commands Layer Specification**  
Location: `docs/PROEDITOR-COMMANDS-SPEC.md`

The **Commands Layer** is the official API that UI components, automation systems, and future Creator OS agents must use to modify state or trigger editor actions.

No UI component or AI agent may mutate Zustand state directly once this layer is active.

---

# 1. Purpose of the Commands Layer

Commands provide:
- A **safe, validated** interface for modifying editor state.  
- A **unified control surface** for UI, hotkeys, automation, and agents.  
- A **stable contract** that remains backward compatible.  
- A future foundation for Creator OS agents to script workflows.

Commands are the *only* allowed mutation path.

---

# 2. Command Categories

## 2.1 Timeline Navigation
```
commands.seek(time: number)
commands.scrub(time: number)
commands.play()
commands.pause()
```

Rules:
- Must clamp time to `[0, duration]`
- Must update both store and `<video>.currentTime`

---

## 2.2 Track Management
```
commands.createTrack(type: 'video' | 'audio' | 'effect' | 'text')
commands.deleteTrack(trackId: string)
commands.reorderTracks(trackIds: string[])
```

Rules:
- Track ordering must remain stable.
- Deleting a track deletes its clips.

---

## 2.3 Clip Management
```
commands.addClip(trackId, clipData)
commands.removeClip(trackId, clipId)
commands.updateClip(trackId, clipId, partialData)
commands.moveClip(trackId, clipId, newStartTime)
```

Rules:
- No overlapping clips unless track type allows stacking.
- Moving clips must trigger timeline recalculation.

---

## 2.4 Trimming & Editing
```
commands.trimClip(clipId, bounds)
commands.setInPoint(time)
commands.setOutPoint(time)
```

Rules:
- Must validate trim boundaries.
- Timeline UI receives updates from events, not direct mutations.

---

## 2.5 Effects / Transforms (Future)
```
commands.applyEffect(clipId, effectConfig)
commands.removeEffect(clipId, effectId)
commands.updateEffect(clipId, effectId, params)
```

Rules:
- Effects must be pure functions `frame → frame'`.
- Effects stack order matters.

---

## 2.6 Rendering
```
commands.renderFrame()
commands.renderPreview(start, end)
commands.exportProject(format)
```

Rules:
- Rendering engine must never modify state.
- Commands act as orchestrators between state and renderer.

---

# 3. Internal Command Shape

Commands follow this structure:

```ts
type Command = (...args: any[]) => void | Promise<void>;
```

Each command:
- Validates input
- Applies mutations via store actions
- Optionally triggers render engine

---

# 4. Implementation Rules

1. Commands must never embed UI logic.  
2. Commands may not reach into DOM.  
3. Commands call store actions, not the other way around.  
4. Commands must be idempotent where possible.  
5. Commands must return nothing unless asynchronous.  
6. All new features require a command entry point.

---

# 5. Future Extensions

- Agent-driven batch commands  
- Scripted editing  
- Undo/redo command history  
- Macro recording  

---

# END OF COMMANDS SPEC
