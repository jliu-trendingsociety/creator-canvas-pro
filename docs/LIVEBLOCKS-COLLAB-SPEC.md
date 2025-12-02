
# LIVEBLOCKS-COLLAB-SPEC.md
**Trending Society – Live Collaboration & AI Copilot Spec (Creator OS + ProEditor)**  
Location: `docs/LIVEBLOCKS-COLLAB-SPEC.md`

This document defines how **Liveblocks** is used across:

- ProEditor (Creator Canvas Pro – Module Zero)
- Creator OS workspaces
- Future “rooms” for agents, creators, editors, and clients

It aligns with:

- `PROEDITOR-ARCHITECTURE.md`
- `PROEDITOR-REFACTOR-PLAN.md`
- `PROEDITOR-COMMANDS-SPEC.md`
- `TIMELINE-ENGINE-SPEC.md`
- `RENDER-ENGINE-SPEC.md`
- `AI-INTEGRATION-SPEC.md`
- `AGENT-INFERENCE-PLAN.md`

The goal is to create **Figma-level collaboration** for video & creator workflows, not just “online presence.”

---

# 1. Concepts & Terminology

- **Room** – Liveblocks room, 1:1 mapped to a **Project Session**:
  - `roomId = project_id` (or `project_id:variant` for sub-rooms)
- **Presence** – Ephemeral per-user state (cursor, playhead, selection)
- **Storage** – Shared CRDT data (comments, markers, live edit metadata)
- **Notifications** – Liveblocks notifications / hooks surfaced into Creator OS
- **AI Copilot** – An “agent user” that appears inside a room, using Liveblocks presence + commands.

---

# 2. Collaboration Levels

We define four collaboration levels. Each level must be **stable** before moving to the next.

## Level 1 – Presence & Basic Multiplayer Awareness

Features:

- Who’s in the room (name, avatar/color)
- Optional: “following” state (who you’re following)

Data:

```ts
type Presence = {
  userId: string;
  displayName: string;
  color: string;
  currentTime?: number; // seconds
  focusedClipId?: string | null;
  viewport?: {
    scrollLeft: number;
    zoom: number;
  };
  followingUserId?: string | null;
};
```

Rules:

- Presence lives only in Liveblocks, never persisted to DB.
- Timeline & playback state **remain owned** by `timelineStore` / Supabase.
- Presence is read-only in UI; commands still drive real state.

Deliverables:

- Presence bar in ProEditor header.
- Optional: ghost playhead or outline representing each user.

---

## Level 2 – Shared Selection & View Sync

Features:

- When a user selects a clip, others see:
  - lightly colored border with user’s color/initials.
- “Follow user” mode:
  - When enabled, viewer & timeline scroll sync to that user’s viewport & time.

Storage:

- Still presence-only for selections:
  - `focusedClipId` and `viewport` live in presence.
- No persistent storage yet.

Rules:

- Never override a user’s local view unless they explicitly hit “Follow X”.
- If two users are following each other, break the cycle (only one-directional follow allowed).

---

## Level 3 – Comments, Markers & Review Mode

Features:

- Timeline comments:
  - time-based markers on the ruler
  - comment threads in side panel
- Clip comments:
  - attach comment threads to specific clip IDs

Data model (Liveblocks storage, mirrored to Supabase):

```ts
type Comment = {
  id: string;
  createdAt: string;
  createdBy: string;
  target:
    | { type: "time"; time: number }
    | { type: "clip"; clipId: string };
  text: string;
  resolved: boolean;
};

type CommentsStorage = {
  comments: Comment[];
};
```

Rules:

- Liveblocks Storage = **live working set**.
- Supabase = **persistent source of truth**.
- Sync directional rules:
  - On room join: fetch comments from Supabase → seed storage.
  - On create/update/resolve in Liveblocks: enqueue mutation to Supabase.
- No direct DB writes from UI; always go through a `comments` service or n8n workflow.

Review Mode:

- “Review Session” toggles:
  - locks timeline mutations for reviewers without edit permission.
  - allows comments and markers only.

---

## Level 4 – Concurrent Editing & AI Copilots (Advanced)

Features:

- Multiple editors performing timeline mutations concurrently.
- AI Copilot appears as another “user” in the room:
  - Presence + name (e.g. “TS Copilot”)
  - Timeline actions executed via **Commands Layer**.

CRDT Constraints:

- Liveblocks storage MAY hold **intent** or **draft** state, but:
  - Timeline state remains in `timelineStore` + Supabase.
  - Commands API is the single mutation interface.
- If conflicting edits occur:
  - Commands must implement last-write-wins or command queue with server-side ordering.

AI Copilot Behavior:

- Agent joins room with its own presence.
- When a user asks the Copilot to act:
  - Agent plans via LLM.
  - Agent issues commands (`seek`, `addClip`, etc.).
  - Agent updates its presence (e.g. “focusing clip X, time Y”).
- Copilot comments:
  - May add markers/comments with suggestions (“Try a J-cut here”).

---

# 3. Integration with Commands & Timeline Engine

Liveblocks must never directly mutate timeline or renderer state.

Flow for a user action:

1. User clicks / drags / invokes a command in the UI.
2. UI calls **Commands Layer** (`commands/*`).
3. Commands:
   - update store
   - persist to Supabase
   - optionally emit a Liveblocks event or mutate storage if needed (e.g. new comment).
4. Other clients receive:
   - state updates via Supabase sync / queries
   - presence / storage updates via Liveblocks

Flow for AI Copilot:

1. Copilot reads room presence + storage (who is online, what’s selected).
2. Copilot receives a high-level request (from chat or button).
3. Copilot plans using LLM (OpenAI/Claude).
4. Copilot executes Commands.
5. Copilot updates its own presence so humans can “see” what it’s doing.

---

# 4. Data Privacy & Access Control

- Liveblocks room access tied to:
  - Creator OS workspace membership
  - Project-level permissions (owner, editor, reviewer, viewer)
- Permissions:

| Role    | Presence | Comments | Timeline Mutations | Commands | AI Control |
|---------|----------|----------|--------------------|----------|-----------|
| Owner   | ✅       | ✅       | ✅                 | ✅       | ✅        |
| Editor  | ✅       | ✅       | ✅                 | ✅       | ✅        |
| Reviewer| ✅       | ✅       | ❌                 | ❌       | ❌        |
| Viewer  | ✅       | ❌       | ❌                 | ❌       | ❌        |

- AI Copilot cannot bypass permissions:
  - Commands executed by Copilot must be authorized as the **requesting user** or a service role with explicit scopes.

---

# 5. Observability & Metrics

We track collaboration impact via:

- PostHog:
  - `collab_session_started` (room has >1 human user)
  - `comment_created`
  - `follow_mode_enabled`
  - `ai_copilot_action_executed`

- Sentry:
  - sync failures between Liveblocks ↔ Supabase
  - command conflicts / race conditions

Key KPIs:

- % of sessions with collaboration
- Retention for collaborative projects vs solo
- Comment activity vs project completion rate
- Copilot-involved sessions vs export volume

---

# 6. Implementation Roadmap

1. **MVP (Level 1)**  
   - Add Liveblocks provider to ProEditor page.
   - Implement presence bar + colors.
   - Optional ghost playhead.

2. **Shared Selection (Level 2)**  
   - Wire focusedClipId + viewport into presence.
   - Show colored borders on selected clips.
   - Implement “Follow user” toggle.

3. **Comments & Markers (Level 3)**  
   - Timeline markers + comment panel.
   - Sync to Supabase.
   - Basic notifications (e.g. in-app toasts on being mentioned).

4. **Copilot as a Room Participant (Level 4)**  
   - Represent AI as a distinct user in presence.
   - Allow users to request Copilot actions (via chat or UI shortcuts).
   - Copilot uses Commands + presence to drive edits.

---

# 7. Non‑Goals (for now)

- No full CRDT-based timeline state; we keep store+DB as source of truth.
- No end-user configuration of Liveblocks internals; all decisions come from this spec.
- No “anonymous” guests editing projects.

---

# END OF LIVEBLOCKS COLLAB SPEC
