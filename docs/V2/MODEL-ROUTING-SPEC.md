# MODEL-ROUTING-SPEC.md
**Trending Society – Model Routing Specification**  
Location: `docs/MODEL-ROUTING-SPEC.md`

This document defines how we choose which model to call for a given task in the Creator OS and ProEditor.

---

## 1. Goals

- Use the **right model for the job** (latency vs. intelligence vs. cost).
- Provide a single routing surface for all agents and backend flows.
- Support multiple providers (OpenAI, Anthropic, Replicate, etc.).
- Keep routing declarative and data-driven.

---

## 2. Routing Dimensions

We route based on:

- **Task type** (chat, planning, code, vision, audio).
- **Latency requirement** (interactive vs background).
- **Cost sensitivity** (per-tenant budget or plan).
- **Context size** (short prompts vs long documents).
- **Copilot mode** (human-in-the-loop vs fully automated).

---

## 3. Provider Catalog

Example provider set:

- OpenAI (GPT‑4.1, GPT‑4.1‑mini, o3)
- Anthropic (Claude 3.5 family)
- Replicate (vision / video / generative models)
- ElevenLabs (voice)
- Tavily / Perplexity / Decart (search, research, analytics)

Each provider is wrapped in a small adapter implementing a shared interface:

```ts
interface LLMProvider {
  name: string;
  chat(opts: ChatOptions): Promise<ChatResult>;
  stream?(opts: ChatOptions): AsyncIterable<ChatChunk>;
}
```

---

## 4. Routing Table

### 4.1. Core Copilot Modes

| Mode | Description | Default Model |
|------|-------------|---------------|
| `realtime_assist` | Inline assistance, quick replies, small context | GPT‑4.1‑mini |
| `structured_planning` | Multi-step reasoning, tool planning, long context | GPT‑4.1 or Claude 3.5 |
| `timeline_doctor` | Timeline-specific reasoning, edits, suggestions | GPT‑4.1 (with ProEditor tools + timeline context) |
| `research_analyst` | External web/search/API heavy tasks | Tavily + Perplexity + Decart + GPT‑4.1 |
| `vision_editing` | Image/video prompts, keyframes, mask generation | Replicate models |
| `voice_generation` | Voiceovers, dubs | ElevenLabs |
| `system_optimizer` | Log analysis, performance debugging | GPT‑4.1 / Claude 3.5 over logs |

### 4.2. Non-Interactive / Background

| Task | Model / Path |
|------|--------------|
| Batch transcription | Provider-specific ASR model (e.g. Whisper) |
| Auto-clip suggestions | Replicate + GPT‑4.1 combination |
| Large-scale asset tagging | Cheapest model meeting quality threshold |

---

## 5. Tools & MCP Awareness

Routing is tightly coupled with tools:

- For tasks requiring external tools (Stripe, Airtable, Jira, etc.), we use MCP.
- Routing can annotate requests with `tools: [...]` and `mcpTools: [...]`.

Example:

```ts
route({
  mode: 'structured_planning',
  tools: ['timeline_commands', 'asset_graph'],
  mcpTools: ['stripe.billing', 'shopify.products']
});
```

The router chooses a model known to perform well with tools (e.g. GPT‑4.1).

---

## 6. Configuration & Overrides

- Per-tenant configuration for:
  - Max latency for interactive calls
  - Cost ceilings per month
  - Preferred providers (enterprise deals)
- Experiments / feature flags:
  - Try alternative models for a slice of traffic (via PostHog).

Routing configurations should live in a versioned config store (JSON/YAML) so we can iterate without code changes.

---

## 7. Telemetry & Feedback

For each request, capture:

- Model name and version
- Latency and token usage
- Tools invoked (MCP and internal)
- User/tenant, use case
- Outcome rating (explicit or inferred)

We use this for:

- Automatic fallback and retries
- Decommissioning underperforming models
- Justifying model spend per customer

---

## 8. Failure Modes

- Timeouts → fallback to a cheaper/faster model or degraded mode.
- Provider outage → reroute to backup provider when possible.
- Tool failures via MCP → return structured errors and avoid cascading failures.

Routing must degrade gracefully so the editor and Creator OS remain usable even during provider issues.
