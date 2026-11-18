# Beyond Infinity — verification

Release review: 18 November 2026. Armaan Singh & Meher Kaur, Invite Wonderland.

## Source photographs

All eight lossless WebP production portraits retain the original PNG dimensions and every decoded RGB pixel. Verified using Pillow ImageChops on decoded source/production images. `portrait-integrity.json` records dimensions, asset sizes and SHA-256 hashes. The originals are untouched. Main portrait boxes preserve the source aspect; all image containers use contain and have no clipping. Enlarge controls sit within the caption mat, outside the photograph. Full-image dialogs were reviewed for all eight images.

## Automated checks

`node --test tests/beyond.test.mjs`: **7 tests passed, 0 failed**, in both the publication checkout and mirrored workspace. The deliberate GPU-free fixture prints Three.js's expected context-creation error, then verifies the fully functional HTML/reduced-motion path. It is not a browser runtime error.

Checks cover source-ratio photo fitting, asset packaging, India-time calendar instants and UTF-8 folding/escaping, deterministic individual embroidery geometry, long-word text wrapping, corrupt/denied/bounded local storage, vertex-preserving geometry batching with independent hinges, all seven rooms, event tabs, safe blessing rendering, clearing, modal galleries, copying the canonical share URL and replay.

`node scripts/build.cjs` completed. The root and publication runtime directories match across all 44 files. `git diff --check` passed. The standalone ZIP passed CRC verification and excludes stale legacy bundles/styles. See `package-verification.json`.

## Real-browser review

Reviewed the complete seven-room journey in the in-app Chromium browser at **390 × 844, 375 × 667, 320 × 568, 844 × 390, 820 × 1180 and 1440 × 1000** CSS pixels. The saved screenshots and contact sheets show each room. The layout records report no document overflow or out-of-viewport headings, buttons, fields or photographs at those dimensions.

Reviewed all eight gallery photographs, their titles and fitted mats; all four event states; all eight full-photo views; opening, unfolding letter, dhol, embroidered blessing, final flight and replay. The smaller opening doors now fit between the introductory copy and seal. Caption controls no longer cover photographs. Full-image mats fit the image rather than leaving a tall empty panel.

Exercised gallery/viewer arrow keys, celebration End/Home/arrow navigation, custom dhol playback, original celebration playback, mute/exit cleanup, rapid navigation with the final requested room winning, the palace map, event details, the portrait keepsake, download actions, the private blessing store/clear flow and link-copy feedback. Only the active room remains visible; all hidden rooms carry the inert attribute.

Downloaded and visually reviewed the 1200 × 1600 portrait JPEG and personal embroidery PNG. Exported stitches are clipped to the fabric rectangle and leave the lettered margins clean. An actual Anand Karaj ICS download has DTSTART 20261220T043000Z, corresponding to 10:00 AM India time, and the expected venue/name.

The final mobile browser run reported **no console errors or warnings**. The native share sheet and native fullscreen presentation remain host/browser features; a visible share dialog supplies a working copyable link and clipboard feedback independently. A fullscreen fallback message appears if the browser retains its own presentation controls.

## Performance evidence and limits

Opt-in 240-sample CPU render diagnostics at 390 × 844, pixel ratio 1: gate median **0.6 ms**, p95 **1.0 ms**, 15 draw calls; dhol median **0.5 ms**, p95 **0.8 ms**, 13 calls; finale median **0.4 ms**, p95 **0.6 ms**, 6 calls. Source: `profile-final-heavy.json`. These are renderer CPU submission measurements in the current desktop browser viewport, not GPU measurements, frame-rate guarantees or physical-phone benchmarks.

Static geometry is batched by material, repeated light points/inlay are instanced and pixel ratio is capped at 2. One adjacent portrait is prefetched as the gallery is explored. Rendering and rhythm stop when the page is hidden. Reduced motion and WebGL failure retain navigation, content and keepsake controls. Hardware touch, mobile keyboard behaviour, Safari-specific fullscreen, recording/audio capture and social-platform compression still require review on the actual target device.

## Creative content

Dates, family labels and venues follow the user's permission to choose: 18–20 December 2026, Singh & Kaur families, an imagined Noor Mahal in Patiala. No venue booking is implied. Original dawn/evening palace artwork and final prompts are documented in `assets/beyond/ARTWORK.md`; no generated alteration was made to the supplied couple photographs.

GitHub deployment details and the public asset verification are recorded separately after publication.

## Published release

Live: https://invitewonderland.github.io/armaan-meher-noor-mahal/

Commit `d3a0abd5ef9d75d5a57a8c66bfa989838352e126`, branch `codex/noor-mahal`. GitHub Pages build and deployment succeeded. All **44 runtime files** returned HTTP 200 and matched the release, allowing only CRLF/LF normalisation for text. All eight full-resolution lossless portraits, both original palace plates, all fonts, audio, scripts and styles were included. See `public-assets.json`.

The public browser rendered the new title and physical opening, then completed all seven rooms. Verified the lossless 1199 × 1312 couple image, ceremony date/time, custom rhythm and stop-on-exit, keepsake dialog, finale, working link-copy feedback and clean replay. No public console errors or warnings. The viewport override was reset and the live tab was retained as a deliverable. Public screenshots are `public-0.jpg`, `public-1.jpg`, `public-3.jpg` and `public-6.jpg`; `public-preview.jpg` combines three observed views.

The source/runtime were mirrored into the user's main workspace. The standalone `exports/Armaan-Meher-Beyond-Infinity.zip` is approximately 28.3 MB and passed ZIP CRC validation. The original Infinity Git repository was not pushed or rewritten.

A fresh-public-visit thumbnail delay was corrected in the final release: all eight small rail photographs load eagerly during the sealed opening. The public browser confirmed all eight decoded thumbnails before entry, and the complete rail after opening. `public-thumbnail-check.json` records the result. The final build again passed all seven tests, the mirrored runtime/ZIP were refreshed, and all 44 public assets were rechecked against this commit.
