# Cinematic art direction and rendering verification - version 2.3

Verified on 14 November 2026 in the separate project at `C:\Invite Wonderland\Wedding Kavya Reel Style`.

## Result and scope

The reported first-tap flash and expanding circular transition artifact were reproduced in the actual browser, traced to their sources and corrected. Every scene was visually reviewed, including all eight original photographs. The pass also found and corrected lighting, material, gallery, scratch lifecycle and responsive-layout issues beyond the reported faults.

This report describes the checks actually performed. It is not a claim of universal perfection, accessibility certification, Instagram performance or sustained Galaxy A56 frame rates. No physical phone was attached; testing used the local browser on AMD Radeon 780M / ANGLE / Direct3D 11. The public GitHub Pages origin remains blocked by saved browser permissions, so browser testing used the authorized local preview. That restriction was not bypassed; deployment is verified through the repository's Pages build API.

## Diagnosed causes and corrections

1. **Opening overexposure:** the seam widened by a factor approaching 100 while a concentrated additive particle source, global lighting kick and bloom all brightened together. It now remains a fine pair of edges following the parted cloth. The 8,200 gold particles are distributed along the architecture and staggered. The 3,600 physical arch fragments finish assembling early when touched and remain architectural instead of scattering through the opening.
2. **Opening timing and readiness:** a frame-integrated spring and an independent 1.1-second DOM timer could disagree after a slow first frame. A bounded 1.5-second wall-clock curve now matches the handoff. Early input waits for asset/shader readiness, retains its gesture-unlocked soundtrack and has a visible awakening state. Scene epochs invalidate pending callbacks after replay. The physical seal and its light traces retire together.
3. **Radial transition patches:** the background shader explicitly expanded a luminous circular edge across the screen. A directional, softly modulated silk-like transformation replaces that field. Forward/back direction is respected, including celebration changes. Interrupted transitions retain the existing HDR ping-pong snapshot behavior, so a new dissolve starts from the displayed mixture.
4. **Incorrect shadows:** atmospheric shader cones inherited solid shadow casting. They no longer occlude physical objects. The curtain's shadow now uses the same deformation uniforms and vertex movement as the visible cloth. Coincident duplicate arch geometry was removed without removing a visible arch.
5. **Piano glare:** per-material environment intensity was being superseded by the shared scene environment. The ebony material now has its own environment binding and calibrated reflection intensity. Actual uploaded intensity was verified as 0.035, matching its authored value. The instrument retains physical clearcoat, reflections, beveled geometry and gold strings.
6. **Gallery discontinuity and disconnected effects:** GPU photographs previously changed immediately while a hidden HTML image received the animation. The visible surface now dissolves over 720 ms. Interrupted dissolves snapshot the current texture mixture into alternating native-source-size HDR targets. The portrait remains fully fitted; controls sit beneath it. Full-count gold glints now follow the frame rather than an obsolete top-right coordinate. Old photo-emission spans retire when a new memory begins.
7. **Scratch lifecycle and resizing:** a captured gesture could outlive the scene and continue emitting into the next world. Exit, visibility changes and lost capture now release it. Resizing replays normalized smooth brush paths rather than exposing square coverage-grid cutouts, and unchanged dimensions with a changed DPR correctly redraw at native density. Coverage tests and brush dimensions are retained. Engraved bronze lettering remains legible on the brightest foil.
8. **Exposure and composition:** blurred local scrim patches were removed in favor of continuous environmental grading. Lighting accents retain material detail. Scene-specific formations keep dense emissions away from inscriptions and faces. Long portrait captions have a fixed reserved gap above the memory control. The landscape garden and reduced-height post-submit garden now reserve separate regions for model, form and message.
9. **Repeated actions:** the opening, event disclosure and finale are idempotent. Repeated taps cannot accumulate equivalent light bursts. Celebration disclosure has correct expanded state. Scene exit cancels scratch capture, piano melody, old animation ownership and local effects. Reduced-motion changes cancel in-flight DOM animations.

## Distinct visual journey

- Palace: woven teal velvet, glinting architectural fragments, disappearing seal and light following the parting edges.
- Portraits: original photographs in a fine gold frame, continuous dissolves, perimeter glints and clear romantic captions.
- Date: engraved tactile foil, revolving astrolabe and 11,500 particles distributed around the inscription.
- Celebrations: refractive welcome lantern, opening ivory rose with a page-wide petal cascade, and a crystal moonlight compass in three environments.
- Piano: ebony and gold instrument, all thirteen keys, rising musical-note sprites, reactive ribbons and the existing polyphonic score.
- Garden: sculpted branches and flowers, spatial butterfly blooms, locally saved wishes and a stable form during reduced viewport height.
- Promise: a held gesture writes a finely separated heart in light and reveals the couple's signature.
- Finale: a golden infinity constellation, overhead 36,000-particle sky sequence, clear closing copy and Invite Wonderland credit.

Native device pixel density, all eight full-resolution original photographs, scene textures, half-float HDR, four-sample scene MSAA, all five bloom mip levels, ACES/sRGB output, 4096-square shadow maps, 24,000 ambient points, 131,072 transient slots, fourteen ribbons and five atmospheric volumes remain. No automatic low-quality tier, texture downscaling or reduction of event particle counts was added. Brightness, placement and choreography were deliberately art-directed; they are not claimed to be visually identical to the earlier design.

## Compositor fidelity calibration

`fidelity-audit.json` records an actual GPU comparison of the original UnrealBloomPass + Film ShaderPass + OutputPass chain against the retained fused output. Both process the same spatial HDR calibration field, the same chromatic samples, bloom settings, tone mapping and exposure.

- Calibration size: **128 x 128**, **49,152 RGB channel samples**.
- Maximum difference: **1** in 8-bit output code values.
- Mean difference: **0.02647**.
- Channels differing by more than one value: **0**.

This supports retaining the efficient compositor. It tests this defined calibration field on the local GPU; it is not proof of bit-identical images for every material, transition or driver. `lighting-audit.json` independently records the ebony environment uniform and disabled beam shadows.

## Matched performance comparison

The baseline is published commit `281e79f6181355ef05ec5d767def7c73335220a6`. A temporary local archive of that commit was served separately; only the profiler's stable-age metadata was updated to match the current instrumentation. Both captures used the same browser/GPU, **1080 x 1920 CSS and native render dimensions**, DPR **1**, the same score and seven local wishes. Waited at least eight seconds after scene entry before sampling rolling metrics, so entrance effects were retired. Final infinity geometry was recaptured after its last change.

The profiler uses asynchronous GPU timer queries and rolling CPU/rAF measurements. rAF intervals include browser/host scheduling, and GPU times exclude HTML composition and screen recording. These are single short captures, not statistically controlled sustained thermal tests.

| Scene | GPU before ms | GPU after ms | Draw calls before -> after | After frame mean / p95 ms |
| --- | ---: | ---: | ---: | ---: |
| Palace | 14.51 | 13.96 | 79 -> 74 | 14.61 / 27.90 |
| Portraits | 6.32 | 6.41 | 25 -> 25 | 7.07 / 7.10 |
| Date | 7.50 | 7.07 | 64 -> 59 | 7.80 / 13.90 |
| Celebrations | 8.71 | 8.14 | 67 -> 62 | 9.02 / 14.00 |
| Piano | 7.58 | 7.18 | 97 -> 92 | 7.80 / 13.90 |
| Garden | 11.06 | 10.71 | 100 -> 95 | 11.30 / 14.00 |
| Promise | 7.36 | 6.82 | 39 -> 34 | 7.59 / 13.90 |
| Finale | 7.61 | 6.78 | 39 -> 34 | 7.77 / 14.00 |

The seven non-portrait GPU means fell by approximately 3-11%; the portrait mean rose by about 0.09 ms (1.4%), a small difference within the practical variability of these short runs. No statistical significance is claimed. All eight settled mean frame intervals were below 16.7 ms on this local test GPU; some p95 intervals exceed that threshold. This does not guarantee locked 60 FPS during every burst or on the Galaxy A56.

Raw data: `performance-before.json`, `performance-after.json`, `summary.json`. Earlier rolling captures are under `iterations/`. Do not compare these timings directly with `../performance/`, which used DPR 1.25, 1350 x 2400 render buffers and a different capture procedure. The normal invitation performs no timer queries or calibration readbacks.

## Automated and actual interaction checks

**37 tests pass**, with complete output in `tests.txt`. Coverage includes bounded/skipped-frame opening timing, full-count formation slots and staggered lifetimes, loading/replay epoch ownership, duplicate-action protection, interrupted photograph snapshots and native target dimensions, cancelled scratch capture, smooth stroke retention, DPR redraw, scene retirement, animation ownership, piano/mix/voice limits, reduced motion and existing geometry invariants.

Actual browser actions included:

- First opening, replay through the curtain, the 1.45-second initial portrait arrival, all eight photographs and rapid interrupted memory taps.
- Native horizontal swipe navigation and real pointer scratching, plus the one-touch reveal alternative.
- All three event objects, times, venues and expanded disclosure state (`celebrations-verified.json`).
- All thirteen piano keys, native glissando, melody, synchronized piano/mixer controls and desktop A/W keyboard input. Desktop keyboard input emitted exactly 3,300 particles for two notes. The soundtrack element was confirmed playing and looping.
- Quick and typed wishes, selection of saved wishes, focused reduced-height form, post-submit reflow, held promise, finale and replay.
- Exact event counts: **11,500** for the one-touch date reveal, **36,000** for the finale, and **0** additional finale particles on repeated activation (`emission-check.json`).
- Eleven rapid interrupted chapter jumps, plus previous/next navigation. Every sample had exactly one visible scene, no hidden DOM leakage and zero scroll offsets (`rapid-navigation.json`).

Audibility, internal-audio recorder routing, touch hardware, Samsung Internet/iPhone browser behavior and thermal throttling were not physically tested. DOM/audio tests and a desktop browser are not substitutes for recording on the intended phone.

## Composition matrix and visual evidence

The final record contains **52 composition checks**, with zero remaining failures in the selected regions: no document overflow, no offscreen active controls, one visible scene, zero scroll offsets and no tested region overlaps. Actual recorded viewports: 320 x 568, 394 x 500, 394 x 852, 450 x 800, 844 x 390, 1440 x 900. Requested reduced width 393 was rounded to 394 in that viewport override; raw dimensions are retained.

The matrix includes every scene at five main sizes, a long portrait caption and revealed-date state at each size, plus corrected reduced-height garden cases. One landscape tree/message overlap and reduced-height post-submit overlaps were found, fixed and rechecked. `composition-audit.json` is the final record; the initial failing matrix is preserved under `iterations/`.

The final browser run recorded **no warnings or errors** (`browser-console.json`). Canonical captures include `curtain-parting.png`, `portrait-1.png` through `portrait-8.png`, `gold-seal.png`, `wedding-reveal.png`, `piano.png`, `piano-desktop.png`, `garden-landscape-corrected.png`, `garden-reduced-height.png` and `finale.png`. Other scene captures document the walkthrough; files under `iterations/` are explicitly historical, not the delivered appearance.

## Isolation and delivery

The original project's **38 files** match the pre-work SHA-256 baseline and its Git working tree is clean. **25 copied media files** match their original hashes (`original-integrity.json`). The original repository and hosting were not changed.

The separate invitation remains a single fullscreen, no-scroll journey. The normal page has no mode selector. `?profile=1` and `?audit=1` are local diagnostic queries with read-only DOM reports and no telemetry endpoint. A ready-built static bundle, source, tests and QA are included in the refreshed ZIP, excluding dependencies, Git metadata and other ZIPs. GitHub Pages deploys the separate `codex/infinity` branch.
