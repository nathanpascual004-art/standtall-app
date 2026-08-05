# Montage — assembly & edit

**Output:** 9:16, 1080×1920, ~33s, H.264/H.265, ~30fps (or 24fps cinematic).
**Sources:** Kling clips (`kling.md`) built from `frames.md` stills.
Audio: VO from `voice-over.txt`, karaoke captions from `captions.txt`.

## Timeline

| In | Out | Clip(s) | On-screen | ENV |
|----|-----|---------|-----------|-----|
| 0:00 | 0:03 | Hook (1A pre) | karaoke: NOT/SHORT/COLLAPSED | Cyan |
| 0:03 | 0:12 | 1A → 1B → 1C (≈3s each) | **STEP 1** badge · **NECK** label · karaoke | Cyan |
| 0:12 | 0:22 | 2A → 2B → 2C (≈3s each) | **STEP 2** badge · **UPPER BACK** label · karaoke | Violet |
| 0:22 | 0:30 | 3A → 3B → 3C (≈2–3s each) | **STEP 3** badge · **SPINE** label · karaoke | Sun-gold |
| 0:30 | 0:33 | CTA clip | karaoke: STAND/TALLER/DAY/ONE + app glyph | Pink |

Cut cadence: **1–2s** per angle inside each step; hard cuts on the beat. Optional
1–2 frame whip/glow transition between exercises (color shift cyan→violet→gold→pink).

## Captions (karaoke)

- Style: **one word, ALL CAPS, LIME `#C9F73C`**, bold condensed sans, black outline
  (~6px), subtle drop shadow. Center / lower-third.
- Reveal: word snaps in on its timecode (see `captions.txt`), scales 90%→100% pop,
  holds, cuts out on next word. Keep exactly ONE word on screen at a time.

## Badges & zone labels

- **STEP 1/2/3**: small pill, top-left, appears at each step's first frame, LIME
  accent to match captions, holds through the step.
- **Zone label** (NECK / UPPER BACK / SPINE): small caps under the badge, white.
- Never show a ruler, height chart, or measuring cue (honesty charter).

## Audio

- VO: calm/confident, dry then light room verb. Duck under nothing (no competing VO).
- Music: minimal pulsing electronic bed, low; sidechain slightly to VO.
- SFX: soft "snap/tick" on each caption word; low whoosh on step transitions; a
  gentle airy "release" swell on the dead-hang decompression (3A–3C).
- Final beat: let music breathe under the CTA for the open loop.

## CTA / open loop

End on the aligned figure + "the rest is in the app" beat. **No payoff shown** —
leave the loop open to drive the tap. App glyph bottom-center over the reserved
negative space in the CTA frame.

## QA checklist

- [ ] ~33s total, 9:16, 1080p
- [ ] Exactly one caption word at a time, LIME `#C9F73C` + black outline
- [ ] STEP 1/2/3 badges + zone labels present
- [ ] Cuts 1–2s, multi-angle A/B/C per exercise
- [ ] `@image1` character identical across all clips
- [ ] Env hues cyan → violet → gold → pink
- [ ] Honesty charter: zero grow/gain/cm/taller-by-X anywhere (VO, captions, visuals)
- [ ] Open-loop CTA (no payoff shown)
