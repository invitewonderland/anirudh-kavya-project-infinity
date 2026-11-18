# Noor Mahal / The Living Heirloom — release review

Eight tests pass: photo-aspect fitting, complete packaging, new self-hosted WOFF2 typography/environment assets, India-time ICS correctness with UTF-8 escaping/folding, individual embroidery geometry and text wrapping, corrupt/denied/bounded local storage, geometry batching with independent hinges, and the complete semantic reduced-motion/GPU-free journey. The animated-path regression checks opening suppression at 1.8 seconds and its cleanup after the old room is hidden. The explicit sealed/opening/journey phases prevent an old prologue from becoming visible in later scenes. The intentional WebGL-free test logs a context creation error; the real browser did not.

All eight production portraits were checked again against their original PNGs: dimensions and every decoded RGB pixel are identical. Source hashes are in portrait-integrity.json. Browser checks for all eight verify natural dimensions, source-ratio display, contain fitting, caption separation and zero stage scroll. The portrait itself opens its full-image dialog.

Reviewed all seven rooms at 320x568, 375x667, 390x844, 820x1180, 844x390 and 1440x1000 CSS pixels. Saved screenshots and layout JSON record the observations. The review caught and fixed a scrollable cinematic veil, landscape letter overflow, caption overlap and short-phone letter spacing. The final landscape letter and compact letter were rechecked. No headings, actions, fields or important copy remained outside the reviewed stages. The typography uses Bodoni Moda and DM Sans, with Noto Serif Gurmukhi for the Punjabi dedication.

Real browser interactions exercised responsive palace water, all eight gallery selections and direct-image viewing, all four celebrations and event detail dialogs, custom dhol composition/playback and stop-on-exit, live embroidery preview, save/clear, PNG and JPEG exports, link copying, final lotus flight and replay. The generated 1200x1600 keepsakes were downloaded and visually reviewed after the typography changes. QA sample blessings were cleared from the local preview.

Rendering uses one renderer and one animation loop, bounded geometry, instancing and a maximum pixel ratio of 2. The new foreground columns, cut-glass lanterns, light shafts, responsive platform and lotus add 5–10 draw calls over the foundation. At 390x844, DPR 1, 240-sample CPU submission measurements were: gate median 0.6 ms / p95 0.9 ms / 20 calls; dhol 0.6 / 1.0 ms / 23 calls; finale 0.5 / 0.9 ms / 16 calls. These measure the current desktop browser's CPU submission, not GPU time, physical-phone frame rate or recording performance. Source: profile.json.

Reduced motion, page-hide rendering/audio suspension, WebGL fallback, denied storage and browser fullscreen fallbacks remain supported. New chapter sound cues share a bounded reverb bus; mute and room navigation stop rhythm playback. No analytics, remote forms or runtime font/CDN dependencies were introduced.

Original environment prompts and generated source paths are documented in assets/beyond/ARTWORK-V4.md. The user-authorised dates, family labels and imagined venues are unchanged. The original Project Infinity repository is not the publication target.

The root workspace mirrors the release. The standalone ZIP passes CRC validation and contains the new active stylesheet, fonts, artwork and runtime. GitHub publication and HTTP verification follow below.

## Progressive loading refinement

A fresh public-visit review exposed an entry wait for the 2.3 MB lossless original. The opening now waits for a complete 840-pixel optimized preview (about 312 KB for the first portrait), while the lossless master upgrades it in the background. Adjacent prefetch uses a small preview. Full-photo dialogs open immediately with a complete preview and upgrade to the original. A quality rank prevents a delayed preview from replacing an already-loaded original. The ceremony accent uses the same progressive path. The original lossless files are unchanged; export continues to use the master.

The semantic regression explicitly holds the lossless master unresolved, then verifies entry still reaches the story and shows the complete preview. It releases the master and completes the remaining journey. The final release remains eight passing tests. A late keepsake export stays associated with the wedding letter and shows preparation feedback.

The public progressive-loading edition completed the opening-to-settled-story transition in approximately 3.6 seconds after the seal click in the review browser. The complete 840-pixel portrait appeared while the original downloaded. This is a review-session timing, not a physical-device or cold-load guarantee. The public viewer opened promptly, all seven rooms were traversed, the live ceremony time was correct, custom dhol playback worked and stopped on exit, the map retained readable ink in the night scene, the keepsake dialog opened, the canonical link copied, and replay returned to sealed. No invitation console errors or warnings appeared. Viewport overrides were reset and the public tab retained.

The final regression additionally verifies that releasing the held original upgrades the initial portrait after entry. This keeps fast entry and the complete original together.

## Final publication

Live edition: https://invitewonderland.github.io/armaan-meher-noor-mahal/?edition=living-heirloom

Final commit: `30ebf69d0a13502a0a2b71196e8123f63f2cc4fd`, branch `codex/noor-mahal`. GitHub Pages reports built. All **61 runtime files** returned HTTP 200 and matched the final release, with CRLF/LF normalisation only for text. The root workspace runtime matches every publication file. The refreshed standalone ZIP contains 61 files and passes CRC validation. See public-assets.json, github-pages-deployment.json and package.json.

The complete progressive public journey was reviewed with the new typography, WebGL environment and interactions. Subsequent final loading refinements were covered by the held-master regression and final public asset verification. No application console errors or warnings were observed in the public browser. The browser was left on the public invitation, replayed to the sealed opening, with sound stopped and the viewport override reset.

Saved public screenshots: public-0.jpg, public-1.jpg, public-3.jpg and public-6.jpg. The combined public-preview.jpg shows three observed scenes. Original generated artwork and prompts remain in the workspace. The original Project Infinity Git remote was not used for publication.
