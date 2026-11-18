# Targeted text readability and transition fixes

The opening's `opening` class used to be removed before the outgoing prologue was hidden. That restored its child text opacity during the outgoing crossfade. The suppression now remains in place until the old room is hidden. Replay still resets it normally. An animated-path regression checks the 1.8-second interval, before the prologue is hidden, and verifies cleanup after hiding.

Seven functional tests pass, including the added animated-path regression and the existing reduced-motion/WebGL-free journey. The expected WebGL error in the test fixture is deliberate.

Reading colours are darker; small labels, date metadata, dialog labels, action labels and caption text have targeted size corrections. A soft ivory backing sits locally behind reading areas. Grain and the travelling gold thread now render below the reading layer. Photo mats reserve room for two caption lines. The ceremony title can wrap on narrow screens, footer labels have controlled spacing and the landscape letter ornament clears the eyebrow.

Reviewed all seven rooms at 390x844 and 320x568, desktop text at 1440x1000, landscape at 844x390, and the Anand Karaj state/dialog at 375x667. Saved screenshots show the review. Browser host connection timeouts interrupted some batches; resumed the remaining views. No invitation console errors or warnings appeared in the completed reads.

The palace artwork, 3D sculptures, lighting, particles, room transitions, photo sources, audio, dhol, embroidery generation, calendars, sharing and keepsakes are retained. No asset or world-engine changes were made.

Release commit: 12a7efd632a9f0c3225dc6761496e14031e176ed. Live asset verification follows publication.

## Published verification

GitHub Pages built commit `12a7efd632a9f0c3225dc6761496e14031e176ed`. All 44 runtime assets returned HTTP 200 and matched this release. The root workspace runtime matches the publication build. The standalone ZIP is refreshed and passes CRC validation.

The public browser completed the opening and the next room transition. The opening class was cleaned after the prologue became hidden; the prologue stayed hidden in the story room. The public ceremony heading, date, venue, action and tabs were reviewed at 390x844. Grain/thread layers are below the text layer. No application console errors or warnings were present. Temporary viewport overrides were reset and the public tab was retained.

Screenshots: `public-opening.jpg`, `public-story.jpg`, `public-ceremony.jpg`, and the combined `public-preview.jpg`. Physical-device and OS-specific behaviour has not been exhaustively tested; the saved layout reviews use browser viewport sizes.
