
# AI-INTEGRATION-SPEC.md  
**Trending Society – AI Integration Specification for Creator OS & ProEditor**  
Location: `docs/AI-INTEGRATION-SPEC.md`

This document defines how AI services are integrated into **Creator Canvas Pro (ProEditor)** and the broader **Trending Society Creator OS**, using a future-proof, multi-provider stack:

- OpenAI + Anthropic (Claude) – core reasoning, agents, instructions
- Perplexity + Tavily + Decart – retrieval, research, data enrichment
- Replicate – heavy model inference (vision, video, diffusion, upscaling)
- ElevenLabs – voice generation
- Decart AI – structured financial / data analysis (as per platform.decart.ai)
- n8n – automation & orchestration
- Cloudflare Queues + Workers – background jobs & edge orchestration
- Supabase – storage, auth, vector search
- Cloudinary – media CDN + transformations

This spec sits on top of:

- `.github/copilot-instructions.md`  
- `PROEDITOR-ARCHITECTURE.md`  
- `PROEDITOR-REFACTOR-PLAN.md`  
- `PROEDITOR-COMMANDS-SPEC.md`  
- `TIMELINE-ENGINE-SPEC.md`  
- `RENDER-ENGINE-SPEC.md`  

---

# 1. AI Roles & Responsibilities

We treat AI services as **roles**, not just APIs.

## 1.1 Core Reasoning & Orchestration

**Providers:**
- OpenAI (GPT-4.x, 4.1 mini)
- Anthropic (Claude)

Uses:
- Editor assistants (contextual help, prompts)
- Agent orchestration (deciding which tools to call)
- Transform recipes (e.g. “turn this clip into X style”)
- System planning (long-running workflows)

## 1.2 Web & Data Retrieval

**Providers:**
- Perplexity
- Tavily
- Decart (for financial / trading / numeric context)
- Inoreader (RSS/content feeds)

Uses:
- Trend analysis
- Market sentiment
- Contextual overlays and explainers
- “Smart” assist panels in Creator OS
- Auto-tagging, captioning, contextual metadata generation

## 1.3 Media Intelligence & Generation

**Providers:**
- Replicate
- ElevenLabs
- Future: additional Replicate-hosted custom models

Uses:
- Background removal, segmentation
- Upscaling, interpolation
- Video style transfer
- Voice-over generation / dubbing
- Audio enhancement

---

# 2. Integration Principles

1. **No direct calls from UI:**  
   All AI interactions go through:
   - `agent-services/` modules, or  
   - n8n workflows via HTTP / Webhooks, or  
   - backend endpoints (Supabase functions / Vercel API routes / Cloudflare Workers).

2. **Stateless frontends:**  
   ProEditor and Creator OS frontends pass:
   - job descriptions  
   - references (IDs, URLs)  
   - desired outputs  

3. **Job-based workflow:**  
   Heavy tasks use:
   - Cloudflare Queues + Workers  
   - n8n for high-level orchestration  

4. **Observability required:**  
   - Sentry for errors  
   - PostHog for usage analytics / funnels  

---

# 3. AI Call Path Patterns

## 3.1 Light, synchronous tasks (sub-2s)

Examples:
- “Rewrite this title”
- “Generate 5 hook variations”
- “Summarize this transcript chunk”

Flow:
Frontend → Vercel API Route / Supabase Function → OpenAI/Claude → Response → UI

No queue used.

---

## 3.2 Medium tasks (2–10s, not critical)

Examples:
- Short audio generation with ElevenLabs  
- Image upscaling via Replicate  
- Small caption generation batch  

Flow:
Frontend → API → Provider  
UI shows spinner, but no persistent job record required.

---

## 3.3 Heavy or batch tasks (10s+ or large)

Examples:
- Full video stylization
- Multi-clip processing
- Large transcription or multi-model pipelines

Flow:
1. Frontend creates job record in Supabase (`jobs` table).
2. API pushes message to **Cloudflare Queue** with job ID.
3. Cloudflare Worker pulls message, runs n8n or direct provider calls.
4. Job result stored in Supabase (status + result payload / asset URLs).
5. Frontend polls job or uses WebSocket for updates.

This is the backbone pattern for Creator OS AI workflows.

---

# 4. Environment & Secrets

Environment variables must be:

- UPPER_SNAKE_CASE
- Grouped by provider
- Never referenced directly in frontend

Examples:

```
OPENAI_API_KEY
ANTHROPIC_API_KEY
REPLICATE_API_TOKEN
ELEVENLABS_API_KEY
PERPLEXITY_API_KEY
TAVILY_API_KEY
DECART_API_KEY

POSTHOG_API_KEY
SENTRY_DSN

CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN
CLOUDFLARE_QUEUES_NAMESPACE

SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY

CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

---

# 5. Integration Targets in Codebase

- `src/server/ai/` – primary AI orchestration layer
- `src/server/jobs/` – job enqueue/dequeue logic
- `src/server/agents/` – agent behaviors / tool definitions
- `n8n workflows` – multi-step orchestration for complex flows

---

# 6. Safety & Cost Controls

- Rate limiting via Cloudflare / API layer  
- Cost-aware routing (e.g. use GPT-4.1-mini by default)  
- Guardrails on max input size, max output size  
- Timeouts with retries via Cloudflare Queues / n8n  

---

# END OF AI INTEGRATION SPEC
