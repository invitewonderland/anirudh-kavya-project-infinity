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

1. **The impossible opening.** Thousands of gold fragments assemble a fluted palace arch around folded, shader-animated velvet. Touch the gyroscope seal to release the curtain and begin the score.
2. **The art of us.** All eight original portraits appear intact on a floating, gold-framed surface with subtle depth movement and a dark extended photographic field. Touch the memory gem to explore.
3. **A secret in the stars.** Scratch actual foil from a canvas inside a revolving 3D astrolabe. GPU gold dust follows the gesture; coverage triggers the astronomical reveal. An accessible one-touch alternative is included.
4. **Three worlds, one forever.** A refractive lantern, sculpted rose and crystal compass introduce three environments. Each object reveals its own celebration, date, time and venue. Water shimmer and organic filament transitions connect the worlds.
5. **The royal piano.** A beveled physical instrument surrounds thirteen live keys. Five detuned partials, natural decay, compression and convolution reverb accompany sound-reactive ribbons, butterflies and lighting. Play a tune, glissando or the original short melody.
6. **The wish garden.** Physical branches, leaves and sculpted flowers respond to a blessing with a cascading bloom. Touch the seed for an immediate wish or write your own. Up to seven wishes are saved only in this browser; nothing is transmitted or represented as a shared guestbook.
7. **The timeless promise.** Holding the seal traces a heart in light around the couple. Tap or Enter also completes the promise; cancellation and navigation clear pending holds.
8. **Into forever.** Ignite a 36,000-particle sky sequence, leave the final constellation glowing, share the invitation or replay. Invite Wonderland's Instagram credit and conversion link remain part of the ending.

Scene changes retire outgoing content immediately and cancel interrupted animations. Environment dissolves preserve the currently rendered blend. Text has stable, separate composition areas with continuous cinematic contrast grading.

Bottom chapter markers, next/back, background swipes and Left/Right keys navigate. Piano, scratch and form gestures do not trigger navigation swipes. The fullscreen icon requests native fullscreen where supported.

## Quality direction

The Three.js renderer uses native device pixel density, full-resolution source media, a half-float HDR render target, multisampling, ACES tone mapping, environment-lit physical materials, 4096-pixel shadow maps and bloom/film passes. It has 24,000 ambient GPU points, a 131,072-slot transient particle pool, fourteen procedural light ribbons and five atmospheric shader volumes. The pool is a stable allocation bound; it does not imply every particle is visible at all times.

There is **no automatic low-end quality tier**, device-memory detection, frame-rate throttle or low-resolution touch mode. Resolution limits come from actual WebGL texture limits. Instancing and GPU trajectories retain visual density while keeping the scene stable. The atmospheric volumes and folded-cloth deformation are procedural artistic simulations, rather than path tracing or a full cloth physics solver.

Reduced motion renders a still 3D composition and preserves every action. Hidden tabs suspend rendering and audio. Hidden scenes are inert; controls have accessible names and focus states. Scratch and promise actions have keyboard alternatives. Visual Viewport handling supports the blessing form when the software keyboard opens.

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
| `js/infinity.bundle.js` | Self-hosted production IIFE generated by esbuild |
| `js/app.js` | Scene state, touch/keyboard navigation, wishes and replay |
| `js/audio.js` | Soundtrack, synthesis, mix, analyser and melody lifecycle |
| `js/effects.js` | GPU adapter and functional Canvas fallback |
| `js/scratch.js` | Foil erasure, geometric coverage and resizing |
| `index.html`, `styles.css`, `infinity.css`, `polish.css` | Accessible touch stage and responsive art direction |
| `tests/` | Interaction/audio integration and real Three.js geometry tests |
| `qa/polish/` | Current screenshots, overlap/viewport checks and verification |

Change the illustrative date in `index.html` and `CONFIG.date` in `js/app.js`. Celebration data lives in `acts` in the same file. GPU media paths must match the HTML/app media paths.

## Recording and verification

[RECORDING.md](RECORDING.md) contains a 22-second shot list for this same experience. [qa/polish/VERIFICATION.md](qa/polish/VERIFICATION.md) records actual verification and its limits. Responsive browser testing does not replace an internal-audio screen recording on the specific phone. No website can guarantee Instagram reach or engagement.

## GitHub Pages

Publish to a **separate repository**. Required files are `index.html`, all three CSS files, `js/`, `assets/`, `THREE-LICENSE.txt` and `.nojekyll`. Enable Pages from the repository's main branch/root. Relative assets support project subpaths. Development dependencies, tests, source, QA and ZIPs are unnecessary for hosting. Once the public URL is known, set an absolute `og:image` URL. No changes or deployment were made to the original invitation's repository.

## Attribution

Three.js is MIT-licensed; see `THREE-LICENSE.txt` and the bundle notice. The fictional couple identities and illustrative venues/dates remain the existing concept. Portraits are reused intact. The soundtrack was supplied by the user. Brand links lead to https://www.instagram.com/invitewonderland.

