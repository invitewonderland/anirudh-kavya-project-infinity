# Verification — 14 November 2026

## Original project integrity

The original invitation was fingerprinted before building the separate project. All 38 original files were checked again after implementation and browser QA; every file remained byte-for-byte unchanged. See `original-integrity.json`. No commit, push or hosting operation was performed in the original project.

## Real browser checks

The invitation was exercised in the browser at these CSS viewports:

| Viewport | Purpose |
| --- | --- |
| 320 × 568 | Small portrait phone; every interactive scene checked |
| 390 × 760 | Shorter portrait phone; every interactive scene checked |
| 390 × 844 | Main portrait recording composition; real gesture, audio and interaction checks |
| 430 × 932 | Large portrait phone; high-density instrument, form and finale layouts checked |
| 844 × 390 | Landscape phone; every interactive scene checked |
| 1440 × 900 | Desktop; every interactive scene checked |
| 390 × 400 with focused inputs | Compact software-keyboard layout and successful blessing submission |

At the tested sizes, document width and height matched the viewport, with no vertical or horizontal page overflow. Interactive controls and scene headings remained within the viewport. Final piano/control spacing, garden/form spacing and finale/action spacing were checked after corrections.

`final-viewport-checks.json` contains the final measurements for the most layout-sensitive scenes. Its `gap` is a vertical-only separation measurement: the landscape garden's form and wish message occupy separate horizontal columns, so their negative vertical separation is intentional and is not an intersection. `viewport-checks.json` retains earlier review observations, including issues subsequently corrected.

### Exercised directly in the browser

- Opening seal and palace transition.
- Background soundtrack reached ready state 4 and played after entry; current time advanced.
- Original portraits displayed intact in the memory composition.
- Three actual pointer drag strokes erased the date seal and completed its reveal.
- The wedding world changed its image, sculpted rose, date, time and venue, then revealed the event.
- C4, E4 and G4 piano keys responded, the note feedback changed, and browser console checks showed no errors.
- The native piano volume slider was changed by keyboard; its value and output updated together.
- A held promise gesture completed the luminous promise.
- The finale's sky action lit its constellation.
- Replay restored the opening, re-enabled its seal, reset the date, restored photo 01/08 and paused the soundtrack.
- A blessing was entered and submitted in a focused, reduced-height layout; the field cleared, its exact text was displayed, and a new selectable flower appeared.
- Native browser console review returned no errors or warnings (`browser-console.json`).

### Corrections made during review

The piano's pedals and volume controls were separated at phone, landscape and desktop sizes. The compact finale's two actions were separated. Garden input/message spacing was adjusted. Input focus no longer immediately moves the blessing submit button before pointer release. Rapid scene navigation finishes the current transition before beginning the next, rather than discarding the request. Audio polyphony now reserves room for all three partials before starting another note.

## Automated integration tests

All 10 tests in `tests/experience.test.cjs` pass. They cover asset contracts, one-journey state, entry and blocked-audio retry, navigation and inertness, all eight photographs, real scratch geometry and resize retention, three celebration worlds, the piano's frequency/gain/voice limit, melody cancellation, safe and bounded blessing storage, malformed storage, the promise, finale, particle caps, replay, form submission and navigation interruption.

The audio tests instrument the synthesis graph; they complement browser playback checks and do not claim a subjective listening assessment or actual Android/iPhone hardware testing. Physical device audio routing, software-keyboard behaviour and screen recording should receive a short final check on the phone used for publishing the Reel. Instagram reach and engagement cannot be guaranteed.

## Screenshots

- `01-opening-mobile.jpg`
- `02-date-reveal-mobile.jpg`
- `03-royal-wedding-mobile.jpg`
- `04-piano-mobile.jpg`
- `05-finale-mobile.jpg`
- `06-piano-desktop.jpg`
