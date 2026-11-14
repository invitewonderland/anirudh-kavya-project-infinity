# Project Infinity verification

Verified 14 November 2026 in the local ChatGPT in-app Chromium browser against the separate project at `http://127.0.0.1:4187/`.

## Automated checks

`node --test tests/*.test.cjs tests/*.test.mjs`: **15 tests pass**. The Happy DOM integration suite covers scene lifecycle and rapid navigation, eight portraits, gesture-gated/blocked audio, scratch geometry, three event datasets, thirteen piano notes and voice bounds, score ducking and volume synchronisation, safe local wishes, promise, replay and reduced-motion behavior. The real Three.js geometry suite verifies finite surfaces/normals, valid indices/bounds, invertible instance transforms, palace fragments/cloth, piano, celebration objects and botanical batching.

Happy DOM does not render WebGL or reproduce physical mobile audio hardware. GPU rendering was checked separately in the real browser.

The final scratch regression also checks a 3× device-pixel ratio without a 2× canvas cap, and replay restores the opening announcement for assistive technology. These two final refinements passed the same 15-test suite after the browser captures; the captured browser used a 1× pixel ratio.

## Browser checks

- WebGL2/HDR renderer initialised successfully; native-resolution rendering reported by the page.
- Real pointer strokes scratched foil and triggered the complete date reveal, including the changed title and date announcement.
- All three celebration objects revealed the corresponding time, date and venue.
- Individual white/black keys, pointer glissando and the original melody activated sound-driven particles. Leaving the scene stopped the melody.
- Both sound-level sliders changed their readouts and kept the duplicate piano controls synchronised. The integration test also verifies that ducking never raises a quiet or zero score.
- Quick and written blessings were saved locally and triggered the GPU bloom wave. The browser's emitted-particle counter increased; the renderer remained active.
- An 850 ms pointer hold completed the promise. Keyboard/tap alternatives and reset are covered by the integration suite.
- The final sky action changed its button state and emitted its constellation sequence. Replay restored the opening and could start the journey again.
- Background playback was observed running after the opening gesture. Native screen-recorder audio capture was not tested on a physical phone.
- After the final fixes, no browser warnings or errors were recorded during the checked journey (see `console-check.json`).

## Layout checks

All eight scenes were measured at **390×844, 430×932, 844×390, 390×693, 320×568 and 1440×900**: **48 scene/viewport checks**. The 390×693 size approximates a 9:16 recording area. Each check found one active scene after transition completion, no horizontal/vertical document overflow and no measured active controls outside the viewport. Overlap of the outgoing and incoming scenes during their transition is intentional.

Results: `viewport-checks.json`. These are desktop-browser viewport checks, not physical Android/iPhone certification or a simulated mobile GPU.

## Rendering sample

`renderer-sample.json` records a 1440×900 piano sample: native-resolution WebGL2/HDR, 116 render calls, 103,337 triangles and a rolling 120 fps estimate in this browser. A 390×844 sample reported 144 fps. Estimates come from recent animation-frame intervals and are not a sustained device benchmark. Browser window scheduling and GPU hardware influence these values. No automatic quality tier was enabled.

The scene has 24,000 ambient GPU points and a 131,072-slot transient ring buffer. The 155,072 combined capacity is not a count of simultaneously visible particles. Instancing and analytical GPU trajectories preserve the chosen density without thousands of DOM elements.

## Isolation and delivery

`original-integrity.json` compares all 38 original files against the pre-work SHA-256 baseline. No changes, deletions or additions were found; the original Git working tree remained clean. No hosting changes were made to the original repository.

The archive includes the ready-built static bundle, full source, assets, tests, build instructions and these QA artifacts. Development dependencies and previous ZIP archives are excluded. The project uses relative asset paths for GitHub Pages subpaths.

## Practical limits

The high-end presentation intentionally uses native device pixel density and full source images. A final recording on the intended device is still needed to assess its particular thermal behavior and OS audio capture. Reduced motion and the Canvas fallback are accessibility/reliability paths, not automatically selected low-end quality tiers. Shared wish storage and a backend are outside this local invitation: wishes remain in the current browser. Native sharing is platform-dependent. Reach and engagement cannot be guaranteed.

Procedural light volumes, environment reflections, bloom and cloth vertex deformation are implemented. The project does not claim path-traced lighting, complete cloth physics or photogrammetry.

## Technical references

Implementation uses the official [EffectComposer](https://threejs.org/docs/pages/EffectComposer), [UnrealBloomPass](https://threejs.org/docs/pages/UnrealBloomPass) and [MeshPhysicalMaterial](https://threejs.org/docs/pages/MeshPhysicalMaterial) APIs, bundled locally. See `THREE-LICENSE.txt` for the library license.
