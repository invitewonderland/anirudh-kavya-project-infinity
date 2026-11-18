# Noor Mahal · The Woven Light

## Changes

Gate names are removed synchronously with hidden before doors move. Explicit opening/journey display guards prevent any fade, lingering panel or return flash. Returning to the seal restores them.

Full-width portraits replace miniature photographs in all four event folios; lossless originals upgrade the previews. Sticky close and internal scrolling preserve the original event details and calendars. The formal portrait is much larger inside a unified illuminated letter. Taller phones fit the complete letter; compact phones and landscape retain readable type with internal reading scroll.

The cloth now has an all-over bagh-inspired geometric stitch field with a central medallion and embroidery in all sixteen tested areas. A curved golden shuttle traverses the cloth in 4.8 seconds, with a soft light front and twelve glints. Cloth and finished stitches are cached in two canvas layers; animated frames composite those layers. Stitch thickness scales with cloth size in both the experience and export. Leaving the room cancels the animation and removes the glow class; reduced motion shows the finished cloth immediately.

The finale has three fine orbital gold rings in one instanced draw call, restrained lotus petals, peripheral shader light, portrait afterglow and a written infinity flourish. Foreground text is isolated above its visual layers. All share the existing WebGL renderer and frame loop.

## Verification

- Nine Node tests pass: photo fitting and source integrity; packaged assets/fonts; India-time calendar safety; personal pattern determinism and export word wrapping; corrupt/denied/bounded private storage; geometry batching; full GPU-free/reduced-motion journey; synchronous and animated gate removal; embroidery bounds and coverage in every quadrant and the centre. The gate test checks hidden immediately in the same input task, before any animation frame.
- All seven rooms reviewed at 320×568, 375×667, 390×844, 820×1180, 844×390 and 1440×1000. No detected unintended horizontal overflow or stage clipping. Letter scrolling is intentional on compact layouts. All eight full-original photographs match the prior published masters byte for byte.
- All four event dialogs reviewed with full-resolution photographs, correct India-time details, and contain fitting. At 390px, modal photos are approximately 301px wide, compared with the previous 92px miniature. The formal photograph is approximately 227px wide, compared with the earlier small mat. The close button remains visible at the bottom of a scrolled invitation.
- Native Mehndi calendar, portrait keepsake and new phulkari PNG downloads exercised. The larger letter action is reachable by internal scrolling at 320×568. Exported PNG visually inspected. Test blessings cleared only on the task-owned localhost origin; public guest blessings were not altered.
- The travelling shuttle was visually inspected near 42% progress and at completion. Stopping on navigation was checked in the actual browser.
- No browser errors or warnings in the final local review. A 390×844, DPR1 desktop CPU submission sample for the finale recorded median 0.6ms, p95 0.9ms, 17 draw calls and 38,540 triangles. These are CPU submission measurements, not physical-phone GPU/FPS guarantees.

Screenshots, layout records, source hashes, event facts and actual native downloads are saved alongside this report.

A live slow-original case was additionally addressed: each enlarged event folio now shows the complete 840px preview immediately and upgrades to the original. The semantic regression holds the Mehndi master unresolved, opens the folio, checks its full preview, releases the master and verifies the original upgrade.

## Final publication

Published 9b1564a109b75a5080c8d7d0c1948d9b2aaaa87f on codex/noor-mahal. GitHub Pages reports built. All 66 runtime files returned HTTP 200 and matched the final release (text line endings normalised). All seven chapters, the enlarged Mehndi folio, the finale flight and replay were checked on the final public URL. The opening check records hidden=true, display=none and zero name rectangles while phase=opening. Public console: no errors or warnings. Audio stopped, viewport override reset and published tab retained.

https://invitewonderland.github.io/armaan-meher-noor-mahal/?edition=woven-light&v=9b1564a

Final stationery copy was simplified to a single text node to preserve natural spacing around the dedication. Published commit f517f6be0c67dc98ec527bed31e8c4a890325e57. Only index.html differs in the runtime from the browser-reviewed revision. Its HTTP content was checked against this build; the other 65 verified runtime files are byte-identical after normalising text line endings. Pages reports built for the final commit.

https://invitewonderland.github.io/armaan-meher-noor-mahal/?edition=woven-light&v=f517f6b
