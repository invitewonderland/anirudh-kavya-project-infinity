# Readability and transition polish

Verified 14 November 2026 against the separate Infinity project at `http://127.0.0.1:4187/`.

## Root causes and corrections

- The outgoing DOM fade lasted 450 ms, but hiding waited until 680 ms. Its animation had no retained final state, so content could reappear in that gap. Scene visibility is now committed atomically; only the destination is visible/inert-active at any point. Owned animations are cancelled on exit, interruption and replay. Hidden scenes cannot start new entrance animations.
- Parent scale/translation/clip animations changed the rectangles used to position 3D objects. The touch stage now keeps stable geometry and uses a controlled opacity entrance. Camera depth stays stable while anchors are measured. Resize/font observers refresh the layout.
- Interrupting an environment dissolve previously started from the abandoned destination texture. Two HDR render targets now preserve the current blended background before starting the next dissolve, without render-target feedback.
- Old particles could survive a scene switch. Retirement now expires the entire GPU lifetime buffer and forces a full upload, including when a new emission adds a partial update before the next frame. Scene changes also clear Canvas particles, old note energy and deferred sound accents.
- `overflow:hidden` still allowed programmatic scrolling inside fixed containers. Focus could move the stage independently of its renderer. Modern clipping and explicit offset reset keep the body, world and stage aligned at zero scroll offset. The navigation scrim stays within its container.
- The date title, orbit, and after-text now occupy separate responsive rows on portrait and desktop screens. Heading line height, inscription scale, ring placement and contrast are explicit. The foil fades without the overexposed brightness flash; scratching cannot select the revealed date text.
- Portraits use a continuous lower tonal gradient. Celebration typography uses cinematic grading rather than isolated dark patches. Main copy, event details, labels, input placeholders, promise and brand text have stronger contrast and spacing.
- The palace opening, piano, garden and finale have constrained portrait layouts. The botanical model fits both the width and height of its region. Decorative garden models yield to the focused blessing form while typing.
- Replay fades/stops active synthetic effects and cancels pending accents. The selected background score and normal musical interaction remain functional. Content-based asset URLs prevent mixing old audio/app/CSS files with a new bundle.

## Automated verification

**22 tests pass** with `node --test tests/*.test.cjs tests/*.test.mjs`.

Coverage includes the original interaction/audio/geometry checks plus immediate scene retirement throughout the former fade boundary, rapid interrupted navigation, cancellation of child animations and held-promise callbacks, replay sound cleanup, interrupted GPU background snapshots, restoration of render targets on failure, full particle-retirement uploads and celebration/background isolation. DOM/audio mocks do not replace GPU rendering; the browser checks below complement them.

## Actual browser verification

**56 scene/viewport composition checks** cover all eight scenes at seven requested sizes: 320×568, 390×693, 390×760, 390×844, 430×932, 844×390 and 1440×900. The browser reports fractional/rounded dimensions in a few cases (the requested 390×693 area reports 390×694). `layout-checks.json` records actual dimensions.

Checks include specified content-region pairs for overlaps, active controls outside the viewport, document overflow, exactly one visible scene, and zero body/world/stage scroll offsets. Failed compositions found during development were corrected and the affected cases rechecked. No issues remain in these measured cases. This is a defined browser test matrix, not a universal perfection or accessibility-certification claim.

**26 rapid navigation samples** cover interrupted chapter jumps and consecutive Next/Previous presses. Every sample reached the requested destination with exactly one visible scene and no world offset. See `rapid-transitions.json`.

The visual walkthrough inspected all eight photographs and their captions, the palace opening, real pointer scratching and return to the revealed date, all three event objects/details, white and black piano keys, melody and sound levels, quick and written blessings, the reduced-height focused form, an 850 ms held promise, the final sky and replay. Screenshots in this folder are actual browser captures. The focused form was checked by reducing the browser viewport; physical iOS/Android keyboards were not used.

The final browser run recorded no warnings or errors; see `console-check.json`. Screen-recorder audio routing and device-specific thermal behavior still require checking on the intended recording phone. No Instagram results are guaranteed.

## Original project isolation

The original invitation remains separate. `original-integrity.json` compares its 38 files with the pre-work SHA-256 baseline and records the Git status. No original hosting or repository was changed.

## Delivery

`Anirudh-Kavya-Project-Infinity.zip` is refreshed with the complete current source and ready-built static site. The three stylesheets, JavaScript bundle and local media must be included when hosting. Earlier `qa/infinity` and root QA captures are historical; this folder documents the current polish pass.
