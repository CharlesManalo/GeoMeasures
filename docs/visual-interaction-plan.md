# Geometry visual revision

Scope: lesson visual panels, dashboard header illustration, and the separately approved fullscreen support. Keep lesson prose, assessments, games, rewards, navigation routes, mascot art elsewhere, and the established palette unchanged. The earlier general grid/layout revision is paused.

Keep cream #fffaf4, plum #453352, mint #b8dfd1, lilac #dac7ed, pink #e7a2c1, and sky #c3e2f6. Fredoka labels/headings and Nunito instructions remain. Existing panels and reading order remain; 3D replaces the header illustration and selected lesson canvases.

Audit: lessons 1, 2, 3, 5, 6, and 7 update numbers without a proportional picture. The elevation visual uses unequal axis scales; the coordinate grid has inconsistent spacing; normalized room/triangle drawings can obscure dimension changes. Other diagrams already respond, but need clearer geometric reference points.

Build: fixed-scale rulers/areas, place-value motion, a hinged 3D cube net, cylinder/cone comparison with radius and height, a fixed-scale map/wall comparison, equivalent currency bars, a moving time hand/timeline, physically consistent triangles/height/coordinates, a fixed-scale floor, and a 3D tank fill. Existing SVG game exports stay untouched.

Focal interaction: drag to inspect a solid and move sliders to transform its actual geometry. The user's follow-up requests continuous rotation with vertical tilt and removal of left/right/reset buttons. Animate at up to 30 fps while visible; pause for interaction, user pause, hidden tabs, and reduced motion. Cap pixel ratio, defer Three.js until visible, dispose GPU resources on unmount, and provide SVG fallback geometry when WebGL is unavailable. Preserve touch scrolling and keyboard rotation without separate arrow controls.

Fullscreen: an explicit control requests fullscreen and persists across client-side route changes. Browsers may refuse it or let users exit; never trap or repeatedly force entry. A fullscreen web manifest and Apple Home Screen metadata provide installed launch support. Feature-detect support and show inline installation guidance when unavailable.

Verification: one batched phone/landscape/desktop inspection, scope-specific geometry assertions, actual fullscreen entry/navigation/exit, unsupported/rejected API paths, and WebGL fallback/cleanup. One correction and confirmation batch if needed. Build and typecheck.
