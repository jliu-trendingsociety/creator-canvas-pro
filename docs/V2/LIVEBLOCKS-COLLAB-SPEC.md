# LIVEBLOCKS-COLLAB-SPEC.md
**ProEditor – Liveblocks Collaboration Specification**  
Location: `docs/LIVEBLOCKS-COLLAB-SPEC.md`

Liveblocks provides the **collaboration fabric** for ProEditor and, by extension, the Creator OS.  
It handles realtime presence, awareness, comments, and AI copilot participation, while **never acting as the canonical source of truth** for timeline or project state.

---

## 1. Goals

- Multiplayer by default: multiple humans and AI agents editing the same project.
- Low-latency awareness: cursors, playheads, selections, and active tools.
- Contextual communication: comments, threads, and markers attached to timeline entities.
- Safe integration: all authoritative mutations go through Commands + Stores, not Liveblocks.

---

## 2. Room Model

### 2.1. Room ID

```text
roomId = project_id (UUID from Creator Identity / Asset Graph)
```

One ProEditor project → one Liveblocks room.

### 2.2. Participants

- Human users (creators, editors, reviewers)
- AI Copilots (agents running in the Agent Runtime)

Each participant has:

```ts
interface ParticipantPresence {
  userId: string;
  displayName: string;
  role: 'owner' | 'editor' | 'reviewer' | 'viewer' | 'agent';
  color: string;                 // assigned once per room
  timelineTime?: number;         // current playhead position (seconds)
  focusedTrackId?: string;
  focusedClipId?: string;
  viewport: ViewportState;
  tool?: 'selection' | 'blade' | 'trim' | 'hand' | 'comment' | string;
  aiStatus?: 'thinking' | 'editing' | 'idle' | 'error';  // for agents
}
```

`aiStatus` is optional for humans and required for AI participants.

---

## 3. Liveblocks Storage

We use Liveblocks Storage for **ephemeral collaboration state** that must be shared but not canonical:

- Comment threads
- Draft markers
- Temporary selections for review sessions
- AI suggestion metadata

Structure:

```ts
RoomStorage {
  comments: CommentThread[];
  reviewMarkers: ReviewMarker[];
  aiThreads: AIThread[];
}
```

Canonical decisions (accepted edits, final markers) are persisted via Supabase / Asset Graph, not Liveblocks alone.

---

## 4. Presence Features (Levels)

We implement collaboration in levels, so we can ship incrementally.

### Level 1 – Awareness

- Show avatars of connected users.
- Show presence in a top bar (names, colors, roles).
- Ghost playheads for other users:
  - Render lines at `timelineTime` for each participant.

### Level 2 – Shared Selection & Follow Mode

- Show which clip/track each user has selected.
- “Follow user” mode:
  - Local viewport follows selected participant’s `viewport`.
- Good for review sessions and teaching.

### Level 3 – Comments & Markers

- Comment threads attached to:
  - Time ranges
  - Clips
  - Tracks
- Review markers as a lightweight approval/revision workflow.
- AI Copilots can:
  - Add comments describing suggested changes.
  - Tag them with `role: 'agent'` and `aiStatus`.

### Level 4 – Collaborative Editing + AI Copilot

- Concurrent edits (optimistic UI, command queue reconciliation).
- AI Copilot appears as another participant:
  - AI cursor and playhead.
  - Comments and suggested edits.
  - `aiStatus` indicates whether it is planning, editing, idle, or hit an error.
- Human users can accept/reject AI-suggested edits (commands).

---

## 5. Authority & Safety Rules

- Liveblocks **never** writes to timeline or project state directly.
- All mutations go through:
  - Timeline store (Zustand) + Timeline Engine
  - Commands layer for higher-level operations

Flow:

1. User or agent interacts → generates an intent.
2. Intent is mirrored in Liveblocks (for ghost UI).
3. On commit, a command is issued:
   - `commands.timeline.moveClip(...)`
   - `commands.timeline.trimClip(...)`
4. The resulting state change is reflected through normal React/Zustand flow.
5. Liveblocks then simply updates presence/ghost visuals.

If Liveblocks disconnects or lags, the editor remains authoritative.

---

## 6. AI Copilot Behavior

AI Copilots join Liveblocks rooms as **first-class participants**:

```ts
role: 'agent'
aiStatus: 'thinking' | 'editing' | 'idle' | 'error'
```

Capabilities:

- Read participants’ presence (who is where, doing what).
- Add comments and suggestions.
- Move their own ghost playhead / selection during planning.
- Issue commands when “editing,” always through the Commands API.

Rules:

- Copilots must never bypass permission rules.
- All Copilot actions are logged in Analytics & Audit trails.
- Copilots should announce key actions in comments (e.g. “Suggested cut at 00:12.500”).

---

## 7. Integration with Commands & Timeline Engine

- Liveblocks carries **presence** and **intents**.
- Commands execute the **mutations**.
- Timeline Engine enforces invariants and performs the real math.

Example:

1. User drags a clip:
   - Presence updates `focusedClipId` and `timelineTime`.
   - Optional: local Liveblocks storage adds a `draftTransform` for ghost visuals.
2. On mouse up:
   - UI issues `commands.timeline.moveClip`.
   - Timeline Engine computes new state.
   - UI re-renders with canonical state; Liveblocks ghost is cleared.

Same flow applies for agents, except intents originate from the Agent Runtime.

---

## 8. Notifications & Integrations

Liveblocks events can drive:

- In-app toasts (someone joined, left, or requested review).
- External notifications:
  - Email / Discord / Slack via Automation Engine.
- Analytics events:
  - Collaboration session started/ended
  - Comment threads created/resolved
  - AI Copilot participation stats

These should be routed through the Automation & Analytics modules, not directly from the UI.

---

## 9. Performance & Limits

- Throttle presence updates (e.g. playhead scrubbing) to a sensible rate (e.g. 10–15 Hz).
- Avoid storing large payloads in Liveblocks Storage (links to assets instead of blobs).
- Use room-level permissions to protect sensitive projects.

---

## 10. Future Extensions

- Named “Scenes” in the timeline, with presence per scene.
- Cross-project rooms for live teaching / coaching sessions.
- Shared “Session Notes” document powered by the Toolgraph (e.g. syncing with Google Docs via MCP).
- Real-time moderation tools for collaborative rooms.

Liveblocks should remain the **collaboration surface**, while Creator OS modules below remain the backbone for state, assets, and business logic.
