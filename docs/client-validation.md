# Client handoff and saved narration validation

Updated 14 October 2026.

Normal Setup installs only pinned Node.js/npm and locked website libraries. All 18 Luna recordings and sentence timings are included in public/audio/lessons. Python and a TTS API are not needed for lesson playback. The developer source retains optional voice-studio tooling, but neither normal client setup nor Vercel deployment installs its Python dependencies or voice model.

The game catalog also includes Time Travel (10 elapsed-time problems, including two that cross midnight) and Tri-Quest (10 formula-selection problems covering right-triangle ratios, oblique-triangle rules, angle sum, and triangle area). Both provide progress feedback, retry behavior, and a final score. Their decorative game-card artwork and controls are original UI; supplied screenshots were used as interaction references only.

Verified:
- All 18 WAV files generated: 24 kHz PCM16, approximately 51 MB total.
- Narration selection matches the previous implementation exactly: title, concept, worked-example heading, example, and every solution-step detail. Speech normalization and 0.32-second gaps are preserved.
- Saved scripts match lesson content; sentence durations match WAV lengths.
- Production build: 29 routes. TypeScript and all six learning tests pass.
- Chromium: playback, every sentence highlight, Stop, replay and completion pass for all 18 lessons, alternating 390px and 1440px widths. No page errors or horizontal overflow were observed.
- TTS was stopped during browser checks. No generation requests occurred.
- Stop closes tracked processes and their children, after checking process identity.
- Earlier clean-copy full voice setup downloaded its own runtimes and generated samples with all eight voices. npm audit reported zero advisories at validation time; this is not a full security audit.

Use 1-SETUP.cmd, 2-START.cmd and 3-STOP.cmd for normal use. 4-CHECK.cmd validates the scripts, recordings, timings, TypeScript and learning tests. The 5/6 voice studio launchers are optional for generating new text.

The ZIP uses an allowlist. Runtimes, installed dependencies, model caches, build output, logs and environment files are excluded. Generated lesson recordings are included. Historical inactive source remains documented in README; TypeScript checks the active app.

Scope: Windows x64 and Chromium on this computer, not a separate clean Windows VM or physical mobile devices. Saved audio removes the TTS-server requirement; it does not automatically make an online website available without internet. Local hosting can serve these recordings without internet. Future text edits require regeneration before shipping.
