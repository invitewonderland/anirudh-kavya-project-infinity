# Complete promise heart - version 2.3.1

Verified on 15 November 2026. This is a focused shader correction; the surrounding art direction, timing, layout and effects are unchanged.

The heart used `pow(sin(h), 3.)` for its horizontal coordinate. During the left half, `sin(h)` is negative. GLSL ES defines `pow` with a negative base as undefined, even with an odd integer exponent; see the [Khronos GLSL ES 3.00 specification](https://registry.khronos.org/OpenGL/specs/es/3.0/GLSL_ES_Specification_3.00.pdf), exponential functions. That explains why a mobile driver can omit one half while desktop rendering appears complete.

The coordinate now uses `sh * sh * sh`, preserving the signed cubic and the existing shape without undefined power evaluation. A regression test evaluates the actual shader expression across the complete parameter range under strict GLSL power-domain behavior, checking finite coordinates and both mirrored lobes.

All **38 tests pass** (`tests.txt`). Actual local WebGL rendering was visually checked at 412 x 746 (close to the supplied screenshot's content proportions), 320 x 568, 450 x 800 and 1440 x 900. Both lobes remain visible after activation and after leaving/returning. No overflow or browser warnings/errors were observed. Captures are in this folder. These are local browser viewport checks; the physical Galaxy A56 was not connected.

The production bundle and content-based asset URL are rebuilt. The separate GitHub Pages project and downloadable ZIP are refreshed. The original invitation project is untouched.
