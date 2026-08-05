# You're not short — you're collapsed

**Slug:** `2026-08-05_youre-not-short-collapsed`
**Language:** EN · **Duration:** ~33s · **Format:** 9:16 vertical, 1080p
**Hook:** *"You're not short — you're collapsed."*

Short-form posture video for StandTall. Three **real** exercises pulled verbatim
from `lib/program.ts` — no invented movements.

## The 3 exercises (source of truth = `lib/program.ts`)

| Step | Exercise | `program.ts` id | Target zone | Active muscle (RED) |
|------|----------|-----------------|-------------|---------------------|
| 1 | **Chin tuck** | `rb-retraction-menton` / `ata-retraction-menton` | neck | deep neck flexors (front of neck) |
| 2 | **Wall angels (Y–W)** | `ata-anges-mur` | upper back | lower/mid traps + rhomboids |
| 3 | **Dead hang** | `rb-decompression` ("Dead hang or overhead reach") | spine | lats + full spinal column |

## Visual style (calibrated)

- **Character:** translucent glass figure, **white skeleton** visible inside, the
  **active muscle glows RED**. Consistency locked to `@image1` (the reference sheet).
- **Environments:** varied neon, one hue per beat — **cyan → violet → sun-gold → pink**.
- **Captions:** one-word ALL-CAPS karaoke, **LIME `#C9F73C`** with a black outline.
- **Badges:** `STEP 1/2/3` on each exercise beat.
- **Editing:** 1–2s cuts, multi-angle (A/B/C per exercise).
- **Ending:** open-loop CTA.

## Honesty charter (STRICT)

**Banned:** grow / gain / cm / grandir / "taller by X" / toise / height increase.
**Allowed register:** *stand taller, full height, posture, decompress, uncollapse,
realign, open up.*
Every line in `script.md`, `voice-over.txt`, `captions.txt` respects this.

## Files

| File | Purpose |
|------|---------|
| `script.md` | Full beat sheet: timing, VO, on-screen text, visuals, environment |
| `voice-over.txt` | Clean VO script for TTS / recording (EN) |
| `captions.txt` | One-word karaoke caption track (LIME `#C9F73C`) |
| `frames.md` | **10 image prompts** — 3 angles (A/B/C) × 3 exercises + 1 CTA frame. Nano Banana PRO, 1080p, 9:16. `@image1` = reference sheet |
| `kling.md` | Image-to-video animation prompts (one per selected frame) |
| `montage.md` | Edit / assembly instructions, caption + audio timeline |

## Pipeline status

- [x] Pack authored
- [ ] `@image1` reference sheet located in Higgsfield library
- [ ] Frames generated (Nano Banana PRO) — **not started (on hold per instruction)**
- [ ] Kling animation
- [ ] Montage
