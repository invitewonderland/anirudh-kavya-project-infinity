# Engine optimization verification — version 2.2

Verified on 14 November 2026 against the separate Project Infinity repository and local preview at `http://127.0.0.1:4187/`.

## Measured outcome and limits

GPU mean frame cost fell by **36–46% across all eight settled scenes** in the matched portrait-load benchmark. Garden draw submissions fell from **757 to 100**. Full-capacity particle preparation moves off the input/render thread, and the same 36,000-particle emission CPU microbenchmark fell from **7.04 ms to 0.62 ms** median.

These are desktop-browser measurements on **AMD Radeon 780M, ANGLE / Direct3D 11**, not a physical Samsung Galaxy A56 test. The user identified the A56 5G as the target; ADB detected no attached devices. No phone FPS, thermal behavior, Samsung Internet compatibility or recording stability is claimed as measured. Browser viewport overrides do not emulate the phone GPU. The PC also has a discrete GPU, but the measured browser reported the integrated Radeon.

The high portrait-load opening still averages approximately **49 FPS**; it does not meet 60 FPS at that 3.24-million-pixel test load. Its mean GPU cost nevertheless fell from 30.92 ms to 19.66 ms without reducing quality settings. Capable-device 60 FPS remains a target, not a guaranteed result. Frame-interval p95 values include host scheduling and browser automation noise; these captures are not a laboratory sustained-load study.

## Matched portrait-load results

Before: commit `88eebba98c3a2e0d0a20ab9bcf73a4a547ba8d8b` with the same opt-in profiler added before changing engine behavior. After: version 2.2 production source. Both use a **1080×1920 CSS viewport**, browser DPR **1.25**, and **1350×2400 native render buffers**. Each scene starts with 30 warm-up frames, then 180–240 rolling measured frames. This is settled-scene data; it is not an average of every transition, piano glissando or finale burst.

GPU queries use asynchronous `EXT_disjoint_timer_query_webgl2` sampling every fourth frame. Results are read only after availability; disjoint measurements are discarded. They time renderer work, not HTML compositing or screen recording. The extension behavior follows the [Khronos specification](https://registry.khronos.org/webgl/extensions/EXT_disjoint_timer_query_webgl2/).

| Scene | GPU before ms | GPU after ms | GPU reduction | Draw calls before → after | After frame mean / p95 ms |
| --- | ---: | ---: | ---: | ---: | ---: |
| Palace opening | 30.92 | 19.66 | 36.4% | 190 → 79 | 20.52 / 35.40 |
| Couple portraits | 16.88 | 9.05 | 46.4% | 28 → 25 | 9.91 / 20.90 |
| Date astrolabe | 19.56 | 10.66 | 45.5% | 67 → 64 | 11.68 / 20.90 |
| Celebrations | 21.68 | 12.62 | 41.8% | 70 → 67 | 13.19 / 27.80 |
| Royal piano | 19.05 | 10.79 | 43.4% | 116 → 97 | 11.37 / 20.90 |
| Wish garden | 25.35 | 16.09 | 36.5% | 757 → 100 | 16.44 / 21.00 |
| Timeless promise | 17.90 | 10.63 | 40.6% | 42 → 39 | 11.13 / 27.90 |
| Grand finale | 17.86 | 10.48 | 41.3% | 42 → 40 | 11.08 / 20.90 |

Raw data: `before-portrait.json`, `after-portrait.json`, `summary.json`. Garden combined CPU update plus submission time fell from approximately **6.15 ms to 3.51 ms**. Its update portion alone increased because batched transforms are synchronized explicitly; the much larger submission reduction yields the net improvement. Submitted idle point count fell from 155,072 to 24,000 because dead slots are no longer drawn. Visible density, live particles and the 131,072-slot transient capacity remain unchanged.

## Desktop regression check

After-only desktop capture: **1440×900 CSS**, **1800×1125 render buffer**. This verifies current desktop operation and pacing; there is no matched desktop-before capture at this size, so it is not a desktop speedup claim.

| Scene | GPU mean ms | Frame mean ms | Frame p95 ms |
| --- | ---: | ---: | ---: |
| Palace opening | 10.43 | 11.26 | 20.90 |
| Couple portraits | 3.62 | 6.96 | 7.10 |
| Date astrolabe | 4.37 | 6.96 | 7.10 |
| Celebrations | 5.33 | 6.96 | 7.10 |
| Royal piano | 4.51 | 6.96 | 7.10 |
| Wish garden | 7.27 | 8.33 | 14.00 |
| Timeless promise | 4.03 | 6.99 | 7.10 |
| Grand finale | 4.28 | 6.99 | 7.10 |

Raw data: `after-desktop.json`. The measured desktop journey remained responsive; mean frame intervals range from approximately 7 to 11.3 ms.

## Changes and retained appearance

- **Settled background fast path:** once a dissolve finishes, sample only the current background. The complete dual-image, filament/noise dissolve remains during transformations, including the existing ping-pong snapshot path for interruptions.
- **Fused final output:** the original chromatic samples, grain and film treatment now sample the scene plus the existing bloom texture directly before ACES/sRGB output. All bloom mip blur passes, kernels, strength, threshold and radius remain. This eliminates redundant full-resolution HDR writes and resolves. Four-sample scene MSAA remains; only the final screen quad's redundant canvas antialias buffer is removed. Floating-point operation order can produce tiny rounding differences; this is not a bit-identical framebuffer claim. Renderer/output behavior was checked against the installed Three.js implementation and [official renderer documentation](https://threejs.org/docs/pages/WebGLRenderer).
- **Draw batching:** identical rose/tree/wish geometry uses instancing; rigid palace/piano parts share merged meshes. Original vertices, UVs, materials, botanical petal motion and individual vibrating piano strings remain. Wish selection and placement invalidate only affected matrices. Hidden wish roots are masked; no unplanted flowers leak into the scene.
- **Conservative particle spans:** a doubled static index ring draws only potentially live spans. Expiration accounts for delayed birth and maximum lifetime, and ring wrap/overwrite never drops a live vertex. Scene retirement clears the ledger immediately instead of uploading the complete lifetime buffer. All original event counts are retained, including 24,000 ambient points and the 36,000-particle finale.
- **Off-thread trajectory bank:** a same-origin Worker prepares 131,072 stochastic trajectories in a transferable buffer. Emissions use scalar typed-array writes without per-particle allocation, trigonometry or random sampling. Fresh per-emission rotation preserves isotropic distribution; random arrangements naturally vary. The original direct computation remains a fallback if the Worker is unavailable.
- **Active scheduling:** skip invisible object animation/matrix traversal, reuse scratch matrices/vectors, compute note decay once, and stop repeated settled portrait dataset writes. All visible effects still animate on every rendered frame; there is no frame cap or quality tier.
- **Resize and scratch:** window/Visual Viewport resize events coalesce into the next animation frame, and identical sizes do not reallocate render targets. The unused fallback canvas does not allocate full-resolution storage while WebGL is active. Scratch coverage tests only cells intersecting the brush's bounds with the original exact predicates; foil appearance, brush shape and dust emissions remain.

Native DPR, all eight full-resolution portraits, full source scene textures, physical materials, HDR, four-sample scene MSAA, 4096×4096 PCF shadows, all fourteen ribbons, five atmospheric volumes, every emission amount, audio behavior and interaction remain. No lossy re-encoding, texture resizing, particle-density reduction or low-device quality tier was introduced.

## CPU emission benchmark

`node scripts/benchmark-emission.mjs` compares the baseline's actual `emit` method with the prepared-bank method using the same capacity, typed attributes and emission sizes. Fifteen measured samples follow warm-up. This is a Node CPU microbenchmark; it excludes worker startup, GPU uploads, rendering, audio and browser scheduling. It does not establish mobile touch latency or phone FPS.

| Particles per emission | Before median ms | After median ms |
| --- | ---: | ---: |
| 1,100 | 0.261 | 0.075 |
| 8,200 | 1.832 | 0.342 |
| 11,500 | 2.145 | 0.191 |
| 36,000 | 7.039 | 0.620 |

Raw data: `emission-benchmark.json`. The worker also adds a roughly 4.5 MiB reusable Float32 bank and a 1 MiB doubled index buffer; this trades modest stable memory for reduced input-thread work. Existing large render targets and source textures retain their resolution.

## Profile-led decisions

`shadow-cost.json` isolates shadow GPU time at approximately 0.13–0.18 ms, a small part of the frame. Shadow resolution and update fidelity were retained. An experimental per-frame background cache made the measured scenes slower (portal about 24.03 → 24.43 ms, garden 18.45 → 19.18 ms at that intermediate revision), so it was removed. `after-first-pass.json` is historical intermediate data, not the final result. No claim is made that every conceivable optimization has been exhausted.

## Functional and visual verification

**31 automated tests pass**; complete output is `tests.txt`. Coverage includes ring wrap/expiration over 1,500 steps, retained world transforms and masked wish roots, complete transformed rigid geometry, fused shader inputs/output transforms, full-capacity bounded/isotropic worker trajectories, exact scratch-coverage equivalence over 500 marks, and existing navigation, interruption, audio, piano, portrait-entry and lifecycle checks.

The production preview was visually inspected through the complete journey at 450×800. Actions included real pointer scratching, the one-touch reveal alternative, all three celebration objects/details, white and black piano keys, native pointer glissando, the melody, quick and typed blessings, selecting a saved wish, a 1.5-second held promise, the full sky finale and replay through the opening. The score was confirmed playing and looping from the audio element. Audibility and internal-audio screen-recorder routing still require listening/recording on the target phone; oscillator/mix behavior is covered by automated tests.

Twenty-four additional scene/viewport checks cover all eight scenes at **360×640, 393×852 and 1440×900**. Each had exactly one visible scene, zero document overflow and zero window scroll offsets (`responsive-checks.json`). Six rapid interrupted jumps also retained one visible scene with no hidden DOM leakage (`rapid-navigation.json`). This supplements the earlier 56 composition cases in `../polish/`; it does not assert universal pixel perfection.

The final production walkthrough reported **no console warnings or errors** (`browser-console.json`). Actual browser screenshots: `date-mobile.png`, `piano-mobile.png`, `garden-mobile.png`, `finale-mobile.png`. Browser testing used the local preview because saved browser permissions block the public GitHub Pages origin; that restriction was not bypassed.

## Isolation, delivery and reproduction

`original-integrity.json` records SHA-256 comparisons against the pre-work 38-file original-project baseline, copied media integrity and the original Git status. The separate source is at `C:\Invite Wonderland\Wedding Kavya Reel Style`. The original project and original hosting were not modified.

Normal page visits do not run timing queries. Append `?profile=1` for opt-in rolling metrics in `#world[data-profile]`, wait for `data-profile-ready="true"`, and measure each scene after settling. `?profile=shadow` isolates shadow work. Reports remain local DOM data; there is no telemetry endpoint. Repeat on the A56's actual browser, at its native DPR and with screen recording both off and on, before claiming sustained phone 60 FPS.

The ready-built static site includes the Worker under `js/`; GitHub Pages requires no build server. The local ZIP includes source, tests, QA and the built site, excluding dependencies, Git metadata and other archives. Deployment is verified separately through the repository's Pages build API.
