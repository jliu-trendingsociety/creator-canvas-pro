
# AGENT-INFERENCE-PLAN.md  
**Trending Society – Creator OS Agent Inference Plan**  
Location: `docs/AGENT-INFERENCE-PLAN.md`

This document defines how **agents** operate inside the Creator OS and ProEditor.

Agents are not just “chatbots.” They are **workflow operators** that:

- Call Commands Layer APIs
- Enqueue jobs
- Call AI providers
- Modify timelines
- Update project state
- Collaborate with other agents

---

# 1. Agent Types

## 1.1 Editor Agent
- Helps with edits, cuts, pacing.
- Uses:
  - Commands: `addClip`, `trimClip`, `moveClip`, `seek`
  - AI: LLM + Replicate for visual suggestions.

## 1.2 Research Agent
- Pulls in context from:
  - Perplexity
  - Tavily
  - Decart
  - Inoreader feeds
- Suggests overlays, context cards, explainers.

## 1.3 Automation Agent
- Runs multi-step workflows via n8n.
- Schedules jobs via Cloudflare Queues.

## 1.4 Monetization Agent
- Integrates with:
  - Stripe
  - Shopify
  - PayPal
- Suggests products, bundles, upsells.

---

# 2. Agent Action Layer

All agents use:

- `commands/` for state-changing actions.
- `src/server/ai` for model calls.
- `jobs/` for heavy tasks.

Agents **never**:
- touch Zustand directly
- mutate DB directly

---

# 3. Inference Flow

1. **Goal Received**
   - e.g. “Make a 60-second TikTok from this raw footage.”

2. **Planning (LLM)**
   - Decide steps:
     - segment clips
     - apply cuts
     - add captions
     - render preview

3. **Tool Calls**
   - Commands: manipulate timeline.
   - AI: Replicate for effects, OpenAI for copy/captions.

4. **Job Management**
   - Heavy tasks → enqueue via Cloudflare Queues.
   - n8n orchestrates long chains.

5. **Result Delivery**
   - Agent updates project + notifies user.

---

# 4. Observability for Agents

- Each agent run → Job ID in Supabase.
- Logs → Sentry for errors, PostHog for behavior.
- Metrics:
  - avg runtime
  - success/fail rate
  - time per step

---

# END OF AGENT INFERENCE PLAN
