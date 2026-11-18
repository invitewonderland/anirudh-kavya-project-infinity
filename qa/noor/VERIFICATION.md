# Noor Mahal — final verification

Verified 18 November 2026. The active invitation is Armaan Singh & Meher Kaur, independent of the original Project Infinity deployment.

## Build and automated checks

- Production esbuild bundle and the complete dist directory built successfully.
- Five active tests passed, including: all four December calendar instants in IST; UTF-8 iCalendar folding and property injection resistance; denied/corrupt/limited browser storage; all eight local portrait assets; GPU-free semantic navigation, event tabs, inert hidden scenes, blessing text safety, cover re-entry and replay.
- The test deliberately removes WebGL; Three.js reports its expected context warning and the Canvas/HTML path completes. The interactive browser run reported no console errors or warnings.

## Browser and visual checks

- All eight chapters reviewed at 1440 × 1000 desktop, 375 × 667 portrait and 844 × 390 landscape. Headings and action controls remained inside the viewport.
- Phone art direction also reviewed at 390 × 844. Selected compact chapters checked at 320 × 568.
- Portrait gallery: all eight supplied images decoded at original pixel dimensions: 1199 × 1312 or 1254 × 1254. Gallery images use contain rather than cropping faces.
- Corrected the opening's frame proportions, narrow-screen title wraps, landscape entry-button position and mustard-field face framing. Inspected the corrected versions.
- Fast chapter selections settled on the requested chapter with exactly one visible scene and every hidden scene inert.
- Verified score playback via the media element; played dhol pads and the original rhythm. Navigation stops the rhythm. Muting and page hiding also stop it.
- Submitted a test blessing, reloaded to verify private persistence, and removed the test blessing through the visible control. Blessings are not sent to a shared server.
- Downloaded and inspected Anand Karaj's calendar: 20 December 2026, 10 AM IST = 04:30 UTC, ending 06:30 UTC.
- Downloaded and visually inspected the 1200 × 1600 JPEG keepsake. Its dialog waits for image decoding before opening.
- Activated the finale's petal garden and three-strand light sculpture. Native dialogs, chapter navigation and replay were exercised.

## Performance evidence and limits

The opt-in 240-frame sample on the in-app desktop browser at a 390 × 844 viewport / DPR 1 measured median CPU render submission of 0.60 ms and p95 of 0.90 ms for the finale, with 6 draw calls and 22,560 triangles. This is a desktop browser CPU sample, not a physical-phone or GPU benchmark. It does not establish a frame-rate guarantee.

Rendering pauses in hidden pages. The full invitation has a Canvas fallback and reduced-motion path; the automated interaction test exercised the reduced-motion, no-WebGL path. Real iOS/Android browser chrome, internal-audio screen recording and social-platform compression require checking on the target phone.

## Packaging and publication

- Portable static ZIP integrity passed. Runtime directory: 33 files, 9,190,988 bytes. ZIP: 8,668,432 bytes.
- Root and publication runtime files matched by SHA-256. The isolated publication source was clean at commit 65a4f72cba236820b97d5df1df643eae66f65e78.
- The native Sites deployment reported succeeded. URL: https://armaan-meher-noor-mahal-2026.reliableemery2.chatgpt.site
- The hosted browser reached the expected owner sign-in gate. This browser did not have an authenticated OpenAI web session, so hosted page rendering after sign-in was not re-tested. The exact matching local deployment assets were visually and functionally checked.
- Original GitHub Pages hosting was not changed. No original PNG photograph was edited. Only optimised WebP copies are used in this deployment.
- Creative dates, family identities and venue are authorised concept content: 18–20 December 2026, Singh & Kaur families, an imagined Noor Mahal in Patiala.

Evidence: desktop, phone, compact and landscape JPEGs; gallery-check.json; layout JSON files; finale-profile.json; package-verification.json.


## GitHub Pages publication — 18 November 2026

At the user's request, Noor Mahal is now public on Invite Wonderland GitHub Pages:
https://invitewonderland.github.io/armaan-meher-noor-mahal/

Repository: https://github.com/invitewonderland/armaan-meher-noor-mahal
Source branch: codex/noor-mahal, root directory.
Commit: dbe08675e44f86da15f3a2bbf8623aa19c457439.

GitHub reported the Pages build as built. An unauthenticated HTTPS request returned 200 with the correct couple, canonical URL and all eight chapters. All 32 checked files (images, fonts, CSS, JavaScript, audio, manifest and licenses) returned 200 and matched local content; text line endings were normalised for comparison. The .nojekyll control file is not a browser runtime asset and was excluded from those requests.

All five active tests passed before uploading. Public metadata and the portable ZIP now use the GitHub Pages address. No change was made to the original Project Infinity repository or deployment. The previous private Sites preview remains a separate, historical publication.
