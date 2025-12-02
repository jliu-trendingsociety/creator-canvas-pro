# AI-INTEGRATION-SPEC.md
**Trending Society – AI Integration Specification**  
Location: `docs/AI-INTEGRATION-SPEC.md`

This document defines how AI capabilities are integrated into the Creator OS and ProEditor.  
It covers LLM usage, tool access, safety, and how agents coordinate with collaboration and infrastructure layers.

---

## 1. Goals

- Treat AI as **first-class collaborators**, not one-off features.
- Ensure deterministic, auditable behavior through Commands + Stores.
- Allow pluggable models (OpenAI, Claude, Replicate, etc.).
- Expose external tools via a unified protocol (**MCP**).
- Make AI deeply aware of timeline, assets, identity, and collaboration context.

---

## 2. Architectural Layers

1. **Agent Runtime** – Long-lived agents and copilots.
2. **Model Routing Layer** – Chooses the right model for each task.
3. **Toolgraph & MCP Connectors** – External tools exposed via Model Context Protocol.
4. **Commands Layer** – The only way AI mutates application state.
5. **Collaboration Engine (Liveblocks)** – AI appears as a participant.
6. **Distributed Compute (Cloudflare Queues)** – Heavy tasks offloaded from the request path.

---

## 3. Context Surfaces

Agents should be able to see:

- **Identity context**
  - Current user, team, roles, entitlements.
- **Project context**
  - Timeline structure, clips, markers, assets, comments.
- **Collaboration context**
  - Other participants in the room, their presence, and intents.
- **Asset context**
  - Asset metadata, embeddings, history, and relationships.
- **Analytics context**
  - Historical behavior, engagement metrics, and prior runs.

Context retrieval must be explicit and auditable.

---

## 4. MCP – Tool Integration Standard

We use **Model Context Protocol (MCP)** as the canonical way to expose tools to LLMs.

### 4.1. MCP Responsibilities

- Normalize access to:
  - Stripe, Shopify, PayPal
  - Airtable, Google Workspace, Jira, Confluence
  - Discord, GitHub, Vercel, Cloudinary, n8n
  - Tavily, Perplexity, Decart, Inoreader
  - Any future SaaS we integrate
- Enforce authentication, scopes, and rate limits.
- Provide structured tool schemas that LLMs can call.

### 4.2. Usage Pattern

1. Agent receives a task.
2. Agent selects tools via MCP (tool list / capabilities).
3. Agent invokes tools with structured arguments.
4. Tool responses are returned as JSON and logged.
5. Agent decides which **Commands** to call in the OS based on results.

UI must **never** call MCP tools directly; only Agents and Automation Engine should.

---

## 5. Model Usage Patterns

- **Fast reasoning / small edits** – GPT‑4.1‑mini or similar.
- **Heavier planning, complex workflows** – GPT‑4.1 / Claude 3.5.
- **Vision & image/video transformation prompts** – Replicate and other hosted models.
- **Search & trend analysis** – Tavily + Perplexity + Decart.

Model selection is described in `MODEL-ROUTING-SPEC.md`.

---

## 6. Commands as the Mutation Boundary

All AI write operations must pass through the **Commands Layer**:

```ts
commands.timeline.moveClip(...)
commands.timeline.trimClip(...)
commands.assets.createDerivedAsset(...)
commands.marketplace.publishTemplate(...)
```

Rules:

- Agents must **never** mutate Zustand stores directly.
- Any irreversible operation should have:
  - an audit log entry,
  - an optional dry-run mode,
  - and/or a “suggestion” path instead of immediate apply.

---

## 7. Liveblocks Integration (LLM-Driven Collaboration)

AI Copilots participate in rooms:

- Join via Liveblocks with `role: 'agent'`.
- Update `aiStatus` as `"thinking" | "editing" | "idle" | "error"`.
- Use comments and threads for:
  - Suggested cuts and transitions.
  - Script rewrites.
  - Feedback summaries.

Flow:

1. Agent inspects room context (presence, comments).
2. Agent posts suggestions via comments or AI threads.
3. On approval or auto-apply, agent issues Commands for mutations.

---

## 8. Cloudflare Queues & Long-Running Tasks

Heavy tasks (multi-minute inference, batch renders, ingest pipelines) must:

1. Be scheduled via **Cloudflare Queues**.
2. Report progress via:
   - Status records in Supabase
   - Optional Liveblocks status messages
3. Write final results back into the Asset Graph and Timeline/Project state.

Examples:

- Render full-resolution exports
- Generate multi-variant social clips
- Batch transcription/translation

---

## 9. Safety & Guardrails

- Enforce **role-based access controls** at the command layer.
- Tools via MCP must be permission-scoped per user/tenant.
- Rate limit high-impact operations.
- Maintain full audit logs:
  - Agent ID
  - Command called
  - Arguments (redacted where needed)
  - Tool invocations and responses

---

## 10. Testing & Evaluation

- Offline evaluation sets for core workflows (editing, summarizing, planning).
- Shadow/degraded modes where AI suggestions are logged but not executed.
- A/B tests for comparing models or strategies (via PostHog).

This spec should be updated whenever we add major new AI capabilities, new MCP tools, or new modules in the Creator OS.
