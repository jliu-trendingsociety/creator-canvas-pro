
# ASSET-PROCESSING-PIPELINE.md  
**Trending Society – Asset Processing Pipeline for Creator OS**  
Location: `docs/ASSET-PROCESSING-PIPELINE.md`

This document defines how assets (video, audio, images, docs) are ingested, processed, transformed, and stored.

It connects:

- ProEditor
- Cloudinary
- Supabase
- Replicate
- ElevenLabs
- n8n
- Cloudflare Queues

---

# 1. Asset Lifecycle Overview

1. **Ingest**
   - From upload, Discord, Dropbox, Google Drive, etc.
2. **Normalize**
   - Convert to standard formats / codecs.
3. **Store**
   - Raw → Supabase or Cloudinary (depending on use).
4. **Process**
   - Thumbnails, waveforms, transcodes, AI transforms.
5. **Index**
   - Metadata + embeddings in Supabase.
6. **Use in ProEditor**
   - Timeline clips, overlays, effects.

---

# 2. Ingest

Sources:
- Direct upload in ProEditor
- Linked storage (Cloudinary URLs)
- External imports (YouTube, Discord, Google Drive, etc.)

Rules:
- Always assign a globally unique `asset_id`.
- Store canonical metadata in Supabase (`assets` table).

---

# 3. Storage Rules

- **Cloudinary**:
  - Public-facing, optimized media.
  - Transformations for thumbnails, previews.

- **Supabase Storage**:
  - Raw or semi-processed files.
  - Versioned if necessary.

URLs are always referenced via:
- `asset_id` → storage mapping

---

# 4. Processing Pipeline (Jobs)

Heavy operations:
- Video transcoding
- Background removal
- Upscaling
- Style transfer
- Caption generation
- Audio enhancement

These run as:

1. Job created in Supabase (`jobs` table)
2. Message sent to Cloudflare Queue
3. Worker:
   - Calls Replicate / ElevenLabs / ffmpeg / other APIs
   - Stores result in storage
   - Updates job + asset metadata

---

# 5. Metadata & Indexing

For each asset:
- MIME type  
- Duration (if media)  
- Dimensions  
- Source  
- Owner (creator)  
- Tags / labels  
- Embeddings (for search)  

All stored in Supabase.

---

# 6. ProEditor Usage

ProEditor never:
- reads raw storage directly
- performs heavy processing in the browser (beyond light WASM tasks)

It uses:
- asset metadata
- URLs for playback
- Commands to trigger processing jobs

---

# END OF ASSET PROCESSING PIPELINE SPEC
