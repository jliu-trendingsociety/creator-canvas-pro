# ASSET-PROCESSING-PIPELINE.md
**Trending Society – Asset Processing Pipeline**  
Location: `docs/ASSET-PROCESSING-PIPELINE.md`

This document defines how assets (video, audio, images, documents, templates, etc.) flow through the Creator OS from upload to publish.

---

## 1. Goals

- Provide a consistent, observable pipeline for all asset types.
- Make assets immediately useful to ProEditor, agents, and marketplace.
- Enable advanced search, recommendation, and automation using metadata and embeddings.
- Support distributed processing via Cloudflare Queues.

---

## 2. High-Level Stages

1. **Ingest**
2. **Validation & Normalization**
3. **Transcode / Derive**
4. **Thumbnail & Preview Generation**
5. **Metadata & Embedding Indexing**
6. **Storage & Graph Registration**
7. **Publication & Distribution**

---

## 3. Stage Details

### 3.1. Ingest

Triggered by:

- Direct uploads from ProEditor or web UI.
- Imports from connected platforms (e.g. Dropbox, Google Drive) via MCP tools.
- Automation workflows (e.g. watch a folder, ingest from RSS/Inoreader).

Responsibilites:

- Accept file or remote URL.
- Create temporary ingest record.
- Enqueue processing job in **Cloudflare Queues**.

### 3.2. Validation & Normalization

- Validate file type, size, and integrity.
- Normalize container/codec when needed.
- Extract basic technical metadata:
  - Duration
  - Resolution
  - Frame rate
  - Audio channels

Failures at this stage mark ingest records as errored and notify the user.

### 3.3. Transcode / Derive

Based on asset type and target use cases:

- Generate web-friendly mezzanine formats.
- Optionally keep archival/original formats.
- For audio:
  - Normalize loudness.
  - Extract mono/surround tracks if needed.

This stage is heavily queue-driven.

### 3.4. Thumbnail & Preview Generation

- Generate poster frames and timeline thumbnails.
- Generate low-resolution preview streams for fast editing.
- For templates/effects:
  - Generate preview images or short demo clips.

All preview URLs are stored in the Asset Graph.

### 3.5. Metadata & Embedding Indexing

This stage makes assets **intelligent** and searchable.

**Metadata**

- Human-visible:
  - Title, description, tags, language.
- Technical:
  - Codec, bitrate, duration, resolution, framerate.

**Semantic data**

For each asset, we may compute:

```ts
embeddings: number[];            // vector representation
semanticLabels: string[];        // e.g. ['talking head', 'coding', 'night city']
detectedFaces?: DetectedFace[];  // if allowed
detectedObjects?: string[];
transcriptId?: string;           // for speech ASR
```

Embedding and labeling models are chosen via `MODEL-ROUTING-SPEC.md`.

Outputs are stored in:

- Vector index (for semantic search & recommendations)
- Metadata tables (for filtering and rules)

### 3.6. Storage & Graph Registration

- Upload finalized variants and previews to storage (Cloudinary / Supabase / S3).
- Register assets in the **Asset Graph**:
  - Assign `asset_id`.
  - Record lineage (which ingest job produced this asset).
  - Link to owner and organization.
  - Link to any parent assets (e.g. derived from original footage).

### 3.7. Publication & Distribution

Assets can then be:

- Used in ProEditor timelines.
- Offered as templates/packs in the Marketplace.
- Published to external platforms:
  - YouTube, TikTok, Instagram, etc. via MCP tools and Automation Engine.
- Embedded into white-label creator portals.

Publication events are logged for analytics and may trigger further automations.

---

## 4. Integration Points

- **Automation Engine** – defines pipelines for ingestion and publication.
- **Agent Runtime** – can reason over assets using metadata/embeddings, then propose edits or distributions.
- **ProEditor** – consumes thumbnails, mezzanines, and metadata for timeline UX.
- **Marketplace** – uses metadata & vectors for discovery and recommendation.
- **Toolgraph (MCP)** – connects intake and distribution to external ecosystems.

---

## 5. Observability

For each asset/job we track:

- Job status (`pending`, `processing`, `completed`, `failed`)
- Steps completed and durations
- Errors (via Sentry)
- Usage metrics (how often asset is used, reused, sold, or derived from)

This allows us to tune infrastructure (Cloudflare Queues, storage tiers) and optimize creator experience.

---

## 6. Future Extensions

- Per-tenant or per-project pipelines (custom steps per channel).
- On-the-fly, just-in-time transcoding for certain workloads.
- Active learning loops where agent feedback improves tagging and recommendations.

This pipeline is the backbone for all media in the Creator OS. Changes here must be made carefully and documented for downstream teams and agents.
