# Geometry and fullscreen verification

The revision is limited to lesson visual panels, the dashboard header illustration, and approved fullscreen support. Existing lesson text, assessment questions, games, progress behavior, and concurrent narration/copy updates are preserved. Original game diagram functions were moved without behavioral changes to `GameDiagrams.tsx` and re-exported through their existing import path.

- Initial browser pass: 37 route/viewport combinations across 320, 390, 844 (landscape), and 1440 pixel widths. All 18 lessons checked at 320 pixels. No horizontal/header overflow, undersized visible visual controls, or SVG text outside the drawing bounds.
- All 47 tested slider interactions changed geometry, plotted marks, or the 3D render. Right-triangle, elevation, coordinate, and room diagrams now use consistent scales. The volume comparison uses the same scale for radius and height.
- The initial pass found a clipped cube net at maximum edge/unfold values; the camera framing was corrected. The repeated favicon request was resolved with an explicit icon link.
- Final browser confirmation: 12 updated route/viewport combinations, no overflow and no page/console errors. Cube nets reviewed at maximum dimensions on mobile and desktop.
- Real WebGL rendering confirmed. Continuous rotation, pause/resume, keyboard rotation, mouse drag, and emulated touch drag passed. Reduced-motion settings stop automatic animation. Left/right/reset controls are removed.
- WebGL-disabled simulation confirmed an interactive projected SVG cube fallback that still unfolds. Modules are loaded when approaching the viewport; renderers, observers, geometry, and materials are disposed on unmount. Automatic animation is capped at 30 fps and stops outside the viewport or in hidden tabs.
- Actual browser fullscreen entry, client-side navigation while fullscreen, and exit passed. Simulated denial and unsupported API show Home Screen guidance. Manifest, SVG icon, and all three PNG icons return HTTP 200.
- TypeScript and production build passed. Impeccable detector returned no findings for this scope before the user-directed continuous-motion follow-up.

Browser QA uses Chromium desktop and mobile/touch emulation, not physical iPhone/Android hardware. Installed Home Screen behavior depends on the device/browser and is configured but was not physically tested. Browser fullscreen cannot be forced on page load or after the user exits it.

References: [Fullscreen user activation](https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen), [WebKit Home Screen web apps](https://webkit.org/blog/13878/), [Three.js renderer](https://threejs.org/docs/pages/WebGLRenderer.html).

Scripts and screenshots: `output/playwright/inspect-geometry.js`, `output/playwright/confirm-geometry.js`, and `output/playwright/geometry-*.png`.
