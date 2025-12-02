# CREATOR-OS-MODULE-MAP.md
**Trending Society – Creator OS Module Map**  
Location: `docs/CREATOR-OS-MODULE-MAP.md`

This document defines how **ProEditor (Module Zero)** fits into the larger architecture of the **Creator OS** being built by Trending Society.

Creator OS is a modular, agent-driven ecosystem with shared identity, assets, automation, monetization and collaboration. Every product we ship (internal or white-label) should map back to these modules.

---

## 1. Top-Level Modules

```text
Creator OS
│
├─ 01. Identity & Accounts
├─ 02. Asset Graph & Storage
├─ 03. Automation & Workflow Engine
├─ 04. Monetization & Commerce
├─ 05. Analytics & Observability
├─ 06. ProEditor (Module Zero)
├─ 07. Collaboration Engine (Liveblocks)
├─ 08. Agent Runtime (AI Copilots)
├─ 09. Distributed Compute & Job Queues
├─ 10. Toolgraph & MCP Connectors
└─ 11. Marketplace & Ecosystem
```

Each module is independently evolvable, but **must** integrate via:

- Shared identity (Creator Identity Graph)
- Shared asset graph (assets and metadata)
- Commands / events
- Observability and audit trail

---

## 2. Module Descriptions

### 01. Identity & Accounts (Creator Identity Graph)

**Purpose**

Single source of truth for:

- Users (creators, brands, agencies, collaborators)
- Teams & organizations
- Roles & permissions
- Auth providers (email, SSO, social logins)

**Key responsibilities**

- `user_id` and `org_id` assignment
- Permission checks across all other modules
- Session management
- Audit metadata (who did what, where, and when)

**Example tech**

Supabase Auth (primary), with room for OAuth/SSO on top.

---

### 02. Asset Graph & Storage

**Purpose**

Global registry for all assets in the Creator OS:

- Raw uploads (video, audio, image)
- Derived assets (thumbnails, renders, exports)
- Templates, presets, effects, agents, workflows

**Responsibilities**

- Asset metadata, ownership, lineage (which asset produced which)
- Storage location (Cloudinary / S3 / Supabase storage)
- Tagging and search (including vector embeddings)

**Consumers**

- ProEditor
- Marketplace
- Automation engine
- Agents

---

### 03. Automation & Workflow Engine

**Purpose**

No-code / low-code orchestration of actions across the OS.

**Responsibilities**

- Event-driven workflows (upload → process → publish)
- Integrations via n8n
- Scheduling (cron-like jobs)
- Long-running pipelines coordinated with Cloudflare Queues

**Notes**

- Automation definitions are themselves assets in the graph.
- All cross-system work should route through here wherever possible.

---

### 04. Monetization & Commerce

**Purpose**

Unified monetization infrastructure across Creator OS.

**Responsibilities**

- Stripe / PayPal / Shopify / TikTok Shop / Patreon style flows
- Product catalog (digital, physical, memberships, services)
- Pricing, discounts, bundles
- Payouts and rev-share models
- Affiliate tracking and performance attribution

**Notes**

- Must integrate with the Identity Graph for rev-share and equity pools.
- Commerce events should be observable from Analytics & Agents.

---

### 05. Analytics & Observability

**Purpose**

Feedback loop for product, agents and creators.

**Responsibilities**

- Event capture (PostHog)
- Error tracking and performance (Sentry)
- Experimentation hooks (feature flags, A/B tests)
- Creator-facing analytics dashboards

**Notes**

- Every major module should emit structured events here.
- Agent Runtime uses this data to improve decisions.

---

### 06. ProEditor (Module Zero)

**Purpose**

Core multi-track editor and rendering engine.

**Responsibilities**

- Multi-track timeline engine
- Canvas2D render engine (with future WASM export)
- Clip/effect graph mapping
- Real-time preview
- Commands interface for UI and AI agents

**Relations**

ProEditor feeds:

- Automation Engine (auto-editing, templated workflows)
- Asset Graph (timeline projects, renders)
- Collaboration Engine (Liveblocks presence & edits)
- Agent Runtime (timeline-aware agents)

---

### 07. Collaboration Engine (Liveblocks)

**Purpose**

Realtime, multiplayer collaboration for humans and AI.

**Responsibilities**

- Rooms, presence, awareness (cursors, viewports, playheads)
- Comments, threads, timeline markers
- Live view-following (follow another user or AI copilot)
- Notification hooks for important changes

**Notes**

- Liveblocks is **never** the source of truth.
- It carries ephemeral collaboration state; canonical data lives in stores/DB.

---

### 08. Agent Runtime (AI Copilots)

**Purpose**

Run AI assistants that operate as first-class participants in the OS.

**Responsibilities**

- Long-lived agent profiles and capabilities
- Access policies (what each agent may see or do)
- Prompt + tool orchestration (via MCP & Commands)
- State checkpoints and audit trails for all agent actions

**Relations**

- Reads/writes through Commands APIs
- Uses MCP Connectors to talk to external tools (e.g. Jira, GitHub, Stripe)
- Emits observability events and uses Analytics for feedback

---

### 09. Distributed Compute & Job Queues

**Purpose**

Durable, scalable execution of heavier tasks.

**Responsibilities**

- Asynchronous job dispatch via Cloudflare Queues
- Offloaded rendering, encoding, transcription, model inference
- Retries, dead-letter queues, backoff strategies
- Tenant-aware throttling and prioritization

**Notes**

- Agents and Automations must not block on heavy tasks; they queue jobs here.
- Results are written back into the Asset Graph or state stores.

---

### 10. Toolgraph & MCP Connectors

**Purpose**

Give agents and creators a unified way to connect external tools into Creator OS.

**Powered by**

- **Model Context Protocol (MCP)** as the standard interface for tools.

**Responsibilities**

- Catalog of available tools and integrations:
  - Stripe, Shopify, PayPal
  - Airtable, Google Workspace, Notion, Jira, Confluence
  - Discord, GitHub, Canva, Vercel, n8n, Cloudinary
  - Data providers (Tavily, Perplexity, Decart, Inoreader)
- Normalized auth and credential management
- Tool schema and capabilities registry
- Rate limiting and safety enforcement for external calls

**Notes**

- MCP tools should always be called through Commands or the Agent Runtime, never directly from UI.
- Tools are addressable by both human-defined workflows (Automation Engine) and AI agents.

---

### 11. Marketplace & Ecosystem

**Purpose**

Economic layer of the Creator OS.

**Responsibilities**

- Listing and selling:
  - Templates, timelines, effects, agents
  - Automations, workflows, data connectors, plugins
- Ratings, reviews, and discovery
- Revenue share back to creators and partners
- Licensing models (subscription, one-time, usage-based)

**Relations**

- Deeply integrated with:
  - Identity (who owns what)
  - Monetization & Commerce (how money flows)
  - Asset Graph (what is being sold)
  - MCP Connectors (distributing new tools/agents)

---

## 3. ProEditor’s Role in Creator OS

ProEditor is **Module Zero** and acts as:

- The primary **asset creation surface**
- The most sophisticated **agent playground** (timeline-aware agents)
- The heaviest **multiplayer canvas** via Liveblocks
- The reference implementation for Commands + Agent Runtime + MCP integration

Every improvement to ProEditor should be evaluated in terms of:

1. How it strengthens the Creator OS modules above.
2. How it increases switching costs for creators, agencies, and platforms.
3. How it unlocks new marketplace products (templates, effects, agents, workflows).

---

## 4. Design Principles (Global)

- **Agent-first**: Every feature must be addressable by agents via commands.
- **Multiplayer-native**: Designed for humans + AI together.
- **Composable**: Modules can be combined in new ways without tight coupling.
- **Observable**: All important actions emit analytics and logs.
- **Extensible**: New tools connect via MCP; new products ship via Marketplace.
- **Defensible**: Architecture intentionally hard to copy at scale.

This map should be updated whenever a new major module is introduced or when ProEditor’s responsibilities significantly expand.
