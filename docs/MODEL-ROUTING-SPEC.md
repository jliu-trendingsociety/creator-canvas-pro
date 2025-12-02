
# MODEL-ROUTING-SPEC.md  
**Trending Society – Model Routing & Provider Strategy**  
Location: `docs/MODEL-ROUTING-SPEC.md`

This document defines **which provider is used for which job type**, with a focus on:

- Performance  
- Cost  
- Quality  
- Future-proofing  

---

# 1. Model Routing Strategy

We route calls based on **job type**, not provider preference.

## 1.1 Text Reasoning / General LLM Work

Default:
- `GPT-4.1-mini` or similar (OpenAI) for:
  - prompts
  - suggestions
  - refactors
  - basic reasoning

Premium:
- `GPT-4.1` or `Claude` for:
  - high-stakes reasoning
  - architectural decisions
  - multi-step planning

---

## 1.2 Web / Context Retrieval

- **Perplexity**: deep web search + citations  
- **Tavily**: targeted retrieval (e.g. finance, news, docs)  
- **Decart**: structured data analytics / financial modeling

Use pattern:
- LLM → calls retrieval tool → merges context → produces result.

---

## 1.3 Media & Vision Jobs

- **Replicate**:
  - background removal
  - style transfer
  - upscaling
  - generative fill
  - video models

Model choices stored in a config map:

```ts
const MODEL_ROUTING = {
  backgroundRemoval: "replicate/your-model-id",
  upscaling: "replicate/your-upscale-model",
  styleTransfer: "replicate/your-style-model",
};
```

---

## 1.4 Audio / Voice

- **ElevenLabs**:
  - voiceover
  - speech synthesis
  - dubbing

---

# 2. Routing Configuration

Configuration lives in:

- `src/server/config/model-routing.ts`

Example structure:

```ts
export const MODEL_ROUTING = {
  llm: {
    default: "openai:gpt-4.1-mini",
    premium: "openai:gpt-4.1",
    alt: "anthropic:claude-3.5",
  },
  retrieval: {
    web: "perplexity",
    deep: "tavily",
    finance: "decart",
  },
  media: {
    backgroundRemoval: "replicate:model-a",
    upscaling: "replicate:model-b",
  },
  voice: {
    default: "elevenlabs:default",
  },
};
```

---

# 3. Fallback Logic

If a provider fails:

1. Retry with backoff (Cloudflare Queue or n8n).
2. If persistent:
   - Switch to backup provider if configured.
   - Mark job as errored and log to Sentry.

---

# 4. Future-Proofing

- New models are added to routing config, not hard-coded.  
- No UI component references model names directly.  
- All jobs go through a **router function** that consults `MODEL_ROUTING`.

---

# END OF MODEL ROUTING SPEC
