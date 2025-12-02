# AGENT-INFERENCE-PLAN.md
**Trending Society – Agent Inference & Execution Plan**  
Location: `docs/AGENT-INFERENCE-PLAN.md`

This document describes how agents (AI Copilots, background workers) make decisions, call models, use tools, and execute actions in the Creator OS.

---

## 1. Objectives

- Provide a **deterministic, auditable pipeline** for agent behavior.
- Support both interactive copilots and background agents.
- Ensure agents respect permissions, quotas, and safety constraints.
- Integrate collaboration (Liveblocks), tools (MCP), and infra (Cloudflare Queues).

---

## 2. High-Level Flow

1. **Trigger**
   - User request (chat, button, hotkey)
   - System event (new asset, workflow step)
   - Scheduled job

2. **Context Gathering**
   - Identity & permissions
   - Project / timeline state
   - Asset metadata
   - Collaboration context (Liveblocks room)
   - Historical analytics (optional)

3. **Model Planning**
   - Route to appropriate model + mode (see `MODEL-ROUTING-SPEC.md`).
   - Produce a plan: steps, tools to call, commands to execute.

4. **Tool Calls via MCP**
   - Execute external operations via MCP tools (Stripe, Shopify, Jira, etc.).
   - Log all inputs/outputs.

5. **Commands Execution**
   - Mutate state via Commands only.
   - For heavy tasks: enqueue jobs via **Cloudflare Queues** and return handles.

6. **Collaboration Feedback**
   - Update Liveblocks presence (`aiStatus`) and comments/threads.
   - Notify users of suggested or completed changes.

7. **Logging & Metrics**
   - Emit analytics and audit events.

---

## 3. Agent Types

### 3.1. Interactive Copilots

- Run inside or adjacent to ProEditor.
- Low-latency requirements.
- Use:
  - Liveblocks for presence and communication.
  - Commands for immediate edits.
  - Cloudflare Queues for background work (renders, long transforms).

### 3.2. Background Agents

- Handle ingest, batch processing, reporting, auto-publishing.
- Primarily event- or schedule-driven.
- Expect to operate via Cloudflare Queues and Automation Engine.

---

## 4. Liveblocks Integration

Agents appear in Liveblocks rooms as participants:

```ts
role: 'agent';
aiStatus: 'thinking' | 'editing' | 'idle' | 'error';
```

Behavior:

- Set `aiStatus = 'thinking'` during planning/model calls.
- Temporarily set `aiStatus = 'editing'` while applying commands.
- Set `aiStatus = 'idle'` when finished.
- On error, set `aiStatus = 'error'` and post a comment with details where appropriate.

Agents may also:

- Add comments and threads for suggestions.
- Use markers for “planned edits” before applying them.

---

## 5. Cloudflare Queues – Job Execution Rules

Heavy or long-running tasks must not be executed inline.

Examples:

- High-resolution renders
- Multi-asset transformations
- External API operations with unpredictable latency
- Large-scale analysis/reporting

**Rule**

Agents must:

1. Create a job record (Supabase / job table).
2. Enqueue a message in **Cloudflare Queues** with job ID and payload.
3. Optionally update Liveblocks room with job status (e.g. “Export in progress”).
4. Worker processes job, writes results back to:
   - Asset Graph
   - Timeline/Project state
   - Job record (status, progress)
5. Notify users via:
   - Liveblocks comment/notification
   - Email/Discord via Automation Engine

---

## 6. MCP Tool Usage

Agents use MCP as the single interface for external tooling.

### 6.1. Examples

- Billing / monetization → Stripe MCP tools.
- Storefront ops → Shopify MCP tools.
- Project/task sync → Jira/Confluence MCP tools.
- Source control → GitHub MCP tools.
- Communications → Discord MCP tools.
- Internal infra → Vercel / n8n / Cloudinary MCP tools.

### 6.2. Rules

- Tools must be permission-scoped based on the initiating user/tenant.
- Sensitive outputs must be redacted in logs when necessary.
- Tool failures should be handled as soft failures with clear user feedback.

---

## 7. Commands Execution Strategy

- Commands are the only mutation boundary.
- Agents should favor **small, reversible steps** over massive transformations.
- For risky operations:
  - Use “suggestion mode” (comment with proposed changes).
  - Wait for user approval before execution.

Example categories:

- `timeline.*` – edits in ProEditor.
- `assets.*` – derive or tag assets.
- `commerce.*` – create offers, adjust pricing.
- `workflow.*` – modify automations.

---

## 8. Observability & Audit

Each agent run records:

- Agent ID and type
- Trigger and associated user/tenant
- Models called (name, version, token usage)
- MCP tools used (name, arguments, outcomes)
- Commands executed (names, parameters)
- Jobs enqueued (IDs, outcome)

We use this data to:

- Debug behavior
- Enforce rate limits
- Create trust signals for users
- Provide a replayable history for compliance and future training

---

## 9. Failure Handling & Degradation

- On model failure → retry with fallback model or reduced context.
- On MCP tool failure → surface clear error, avoid partial destructive changes.
- On Queue worker failure → retry with backoff; mark jobs as “needs attention” after threshold.
- On persistent issues → agents downgrade to “analysis-only” mode (no writes) until resolved.

This plan should be revisited whenever we add major agent capabilities, new queues/workers, or high-impact tools.
