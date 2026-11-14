# Curtain-to-portrait reveal

The physical photograph previously became fully visible when its Three.js group was enabled; fading the DOM touch stage affected only its text and overlays. The photo shader now uses a continuous 1.45-second opacity envelope. Its four physical gold borders share that envelope. The caption enters over 1.5 seconds with a short initial hold. Entry from another chapter uses a shorter 0.75-second photograph fade. Reduced motion shows the completed portrait immediately.

No DOM anchor is scaled or moved, and the existing atomic scene retirement remains in place. Leaving during the reveal cancels the caption entrance; the renderer uses the current scene's clock rather than delayed completion callbacks. Reloading assets while the portrait is active restarts its reveal when the GPU is ready.

25 automated tests passed. Added tests check monotonic opacity, gentle initial/final slopes, independent reentry clocks, reduced motion, and navigation/replay during the longer opening entrance.

Actual local browser checks used 1080×1920 and 450×800 portrait viewports. The first measured opacity was 0.003 and the completed value was 1.000. Navigating away before completion left exactly one active scene at the requested destination. No console warnings or errors were recorded. The 450×800 viewport is the same 9:16 ratio, fitted to the available screen for interaction. It remains open at the curtain.

The live GitHub Pages origin could not be opened by the browser tool because a saved user permission blocks it. The local preview was used instead. Publishing and build verification use the existing authorized GitHub CLI account.
