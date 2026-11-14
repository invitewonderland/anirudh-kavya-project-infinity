# Anirudh & Kavya — Project Infinity

Live invitation: https://invitewonderland.github.io/anirudh-kavya-project-infinity/

A separate fullscreen interactive wedding theatre by Invite Wonderland. The original invitation and its hosting remain untouched. All eight original portraits, Greek coastal scenery and the selected “A Canopy of White Roses” soundtrack are independent local copies.

## Run

The ready-built site is included. Serve this folder and open http://127.0.0.1:4187/:

```powershell
cd "C:\Invite Wonderland\Wedding Kavya Reel Style"
python -m http.server 4187 --bind 127.0.0.1
```

There is one manually controlled journey with no scrolling or mode selector. WebGL2 provides the complete Infinity rendering. A semantic HTML/Canvas version keeps interactions available if WebGL cannot initialise or loses its context. Fonts request Google Fonts; local serif/sans fallbacks remain available.

## Eight connected scenes

1. **The impossible opening.** Thousands of gold fragments assemble a fluted palace arch around woven, shader-animated velvet. Touch the gyroscope seal to release the curtain and begin the score. The seal dissolves, fine light follows the parting edges, and architectural gold stays on the arch. The 1.5-second wall-clock opening and matching cloth shadows remain coherent after a delayed first frame. An early tap waits for GPU assets without losing the gesture.
2. **The art of us.** All eight original portraits appear intact on a floating, gold-framed surface with subtle depth movement and a dark extended photographic field. A memory control beneath the portrait keeps both faces clear. Photographs dissolve continuously; rapid taps snapshot the current mixture into alternating native-source-size HDR targets. Gold follows the frame rather than accumulating in a corner.
3. **A secret in the stars.** Scratch engraved foil inside a revolving 3D astrolabe. GPU gold dust follows the gesture; 11,500 particles orbit the inscription when the date emerges. Brush paths retain smooth edges across resizing, and leaving the scene releases the gesture. An accessible one-touch alternative is included.
4. **Three worlds, one forever.** A refractive lantern, sculpted rose and crystal compass introduce three environments. Each object reveals its own celebration, date, time and venue. Wedding petals cascade across the world; title entrances, water shimmer and directional silk-like transitions connect the acts. Repeated taps do not stack disclosures or bursts.
5. **The royal piano.** A beveled ebony instrument surrounds thirteen live keys. Five detuned partials, natural decay, compression and convolution reverb accompany sound-reactive ribbons, rising musical notes and lighting. Play a tune, glissando or the original short melody. The instrument uses an explicit environment reflection intensity so its gold strings remain visible.
6. **The wish garden.** Physical branches, leaves and sculpted flowers respond to a blessing with a cascading bloom. Touch the seed for an immediate wish or write your own. Up to seven wishes are saved only in this browser; nothing is transmitted or represented as a shared guestbook.
7. **The timeless promise.** Holding the seal traces a heart in light around the couple. Tap or Enter also completes the promise; cancellation and navigation clear pending holds.
8. **Into forever.** Ignite a 36,000-particle overhead sky sequence around a golden infinity constellation, distinct from the promise's heart. Closing words and the brand remain below the light paths. Share the invitation or replay; Invite Wonderland's Instagram credit and conversion link remain part of the ending.

Scene changes retire outgoing content immediately and cancel interrupted animations. Environment dissolves preserve the currently rendered blend. Text has stable, separate composition areas with continuous cinematic contrast grading.

Version 2.3 removes the expanding radial transition flash, oversized opening seam, stale curtain shadows, atmospheric-beam shadows, concentrated reveal flashes and blurred patches behind copy. Lighting, materials, formations and composition were art-directed while retaining the full particle counts, source images and rendering quality settings. See the current visual and performance evidence below.

Bottom chapter markers, next/back, background swipes and Left/Right keys navigate. Piano, scratch and form gestures do not trigger navigation swipes. The fullscreen icon requests native fullscreen where supported.

## Quality direction

The Three.js renderer uses native device pixel density, full-resolution source media, a half-float HDR render target with four-sample scene multisampling, ACES tone mapping, environment-lit physical materials, 4096-pixel shadow maps and bloom/film processing. It has 24,000 ambient GPU points, a 131,072-slot transient particle pool, fourteen procedural light ribbons and five atmospheric shader volumes. The pool is a stable allocation bound; it does not imply every particle is visible at all times.

There is **no automatic low-end quality tier**, device-memory detection, frame-rate throttle or low-resolution touch mode. Resolution limits come from actual WebGL texture limits. Instancing and GPU trajectories retain visual density while keeping the scene stable. The atmospheric volumes and folded-cloth deformation are procedural artistic simulations, rather than path tracing or a full cloth physics solver.

Reduced motion renders a still 3D composition and preserves every action. Hidden tabs suspend rendering and audio. Hidden scenes are inert; controls have accessible names and focus states. Scratch and promise actions have keyboard alternatives. Visual Viewport handling supports the blessing form when the software keyboard opens.

Version 2.2 improves rendering without introducing quality tiers. It instances matching botanical parts, merges rigid geometry, skips invisible scene updates and expired particle slots, and prepares trajectories in a same-origin Worker. A fused screen pass combines the original bloom, film and output transforms; all bloom mip levels remain. Resize events are coalesced, and scratch coverage uses the same geometric test over only intersecting grid cells. The direct particle-preparation path remains available when Workers cannot initialize.

## Sound

The supplied MP3 starts on the opening gesture and loops. Blocked playback retries on the next gesture. The small sound-level panel sets score and piano levels; there is no separate music on/off mode. Piano volume is also beside the keyboard. Piano playing ducks the score proportionally without raising a quiet or zero level. Synthesis is bounded at 160 oscillators (32 five-partial notes); leaving the room cancels the melody.

Piano ivory keys: **A S D F G H J K**. Black keys: **W E T Y U**. Device volume and screen-recording audio routing remain OS-controlled.

## Maintain and build

```powershell
npm ci
npm run build
npm test
```

Use Node 20 or newer. The browser bundle includes Three.js and postprocessing; it does not fetch a runtime JavaScript CDN. Rebuild after changing source, interaction code or styles: the build updates content-based URLs for every JavaScript/CSS file to prevent stale mixed versions. The included bundle works without installing development dependencies.

| Location | Purpose |
| --- | --- |
| `src/infinity/director.mjs` | Renderer, camera, choreography, particles and input reactions |
| `src/infinity/objects.mjs` | Procedural palace, instrument, astrolabe, crystal and botanical geometry |
| `src/infinity/shaders.mjs` | Environments, transitions, particles, ribbons and film shader |
| `src/infinity/batching.mjs`, `static-geometry.mjs` | Preserve geometry and transforms while reducing draw submissions |
| `src/infinity/particle-ledger.mjs` | Conservative live spans in the full-capacity particle ring |
| `src/infinity/film-output.mjs` | Fused film, bloom addition, ACES and sRGB screen output |
| `src/infinity/choreography.mjs` | Bounded opening timing and distinct full-count particle formations |
| `src/infinity/fidelity-audit.mjs` | Opt-in GPU comparison with the original postprocessing chain |
| `src/infinity/profiler.mjs` | Opt-in asynchronous GPU and CPU measurements |
| `js/infinity.bundle.js` | Self-hosted production IIFE generated by esbuild |
| `js/particle-random.worker.js` | Off-thread particle preparation; include this file when hosting |
| `js/app.js` | Scene state, touch/keyboard navigation, wishes and replay |
| `js/audio.js` | Soundtrack, synthesis, mix, analyser and melody lifecycle |
| `js/effects.js` | GPU adapter and functional Canvas fallback |
| `js/scratch.js` | Foil erasure, geometric coverage and resizing |
| `index.html`, `styles.css`, `infinity.css`, `polish.css` | Accessible touch stage and responsive art direction |
| `tests/` | Interaction/audio integration and real Three.js geometry tests |
| `qa/art-direction/` | Current visual audit, compositor comparison, screenshots and matched performance data |
| `qa/performance/` | Historical engine-optimization measurements and verification |
| `qa/polish/`, `qa/portrait-entry/` | Earlier layout, lifecycle and portrait-entry verification |

Change the illustrative date in `index.html` and `CONFIG.date` in `js/app.js`. Celebration data lives in `acts` in the same file. GPU media paths must match the HTML/app media paths.

## Recording and verification

[RECORDING.md](RECORDING.md) contains a 22-second shot list for this same experience. [qa/art-direction/VERIFICATION.md](qa/art-direction/VERIFICATION.md) records the current visual audit, original/optimized compositor comparison, matched performance timings and their limits. Responsive browser testing does not replace an internal-audio screen recording on the specific phone. No website can guarantee Instagram reach or engagement.

For local profiling, append `?profile=1`. After 30 warm-up frames and at least 180 measured frames, `#world` exposes JSON in `data-profile` and marks `data-profile-ready="true"`. `data-profile-stable="true"` additionally requires eight seconds since scene entry; use it for settled comparisons. Navigate to measure each scene separately. `?profile=shadow` isolates shadow rendering. GPU timing requires `EXT_disjoint_timer_query_webgl2`; unsupported browsers still report CPU/frame data. Append `?audit=1` for the isolated compositor calibration in `data-fidelity-audit` and lighting checks in `data-material-audit`. These diagnostics are off on the normal invitation, add no visible mode selector and send no telemetry. For particle-emission CPU comparisons, run `node scripts/benchmark-emission.mjs` in this Git checkout.

## GitHub Pages

Publish to a **separate repository**. Required files are `index.html`, all three CSS files, `js/` (including the particle Worker), `assets/`, `THREE-LICENSE.txt` and `.nojekyll`. This repository publishes Pages from `codex/infinity`, root `/`. Relative assets support project subpaths. Development dependencies, tests, source, QA and ZIPs are unnecessary for hosting. No changes or deployment were made to the original invitation's repository.

## Attribution

Three.js is MIT-licensed; see `THREE-LICENSE.txt` and the bundle notice. The fictional couple identities and illustrative venues/dates remain the existing concept. Portraits are reused intact. The soundtrack was supplied by the user. Brand links lead to https://www.instagram.com/invitewonderland.

