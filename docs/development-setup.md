# Source project setup

The repository root is the main source project. `CLIENT-DELIVERY` is generated separately for Windows clients and is not part of the source repository. Client setup and troubleshooting instructions are in the root `START-HERE.txt`.

## Run the website from source

Requirements: Node.js 22.23.2 or a compatible Node.js 22 release, npm, and internet access to install dependencies.

```powershell
npm ci
npm run dev
```

Open `http://localhost:3000`. To run the production checks:

```powershell
npm run typecheck
npm run build
node --experimental-strip-types --test tests/learning.test.mjs
```

The lesson WAV files and timing metadata are already committed under `public/audio/lessons`. Normal development, the Windows client installer, and Vercel deployment do not install Python, KittenTTS libraries, or a voice model. The optional voice-studio launchers are separate and only needed to generate speech for changed lesson text or new text.

## Deploy with Vercel

Import the GitHub repository into Vercel and keep the detected Next.js build settings. The default build command is `npm run build`; the output is managed by Next.js. No TTS environment variables or external audio service are required. Commit source changes and push them to the connected branch to trigger subsequent deployments.

Progress is browser-local and does not synchronize between devices or browsers.

## Windows client handoff

Run `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/package-client.ps1`. Give the client the resulting ZIP, checksum, and `START-HERE.txt` from `CLIENT-DELIVERY`. The client archive includes the website, static lesson audio, and the one-click Windows setup scripts. It deliberately excludes development output, optional voice-studio launchers, TTS source/runtime requirements, and model downloads.
