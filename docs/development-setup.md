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

## Publish with GitHub and Vercel

The main source is version-controlled in [CharlesManalo/GeoMeasures](https://github.com/CharlesManalo/GeoMeasures), on the `main` branch. A Vercel project named `geo-measure` has already been created and connected to that GitHub repository. Use this sequence to finish its first deployment:

1. Sign in to [Vercel](https://vercel.com/) using the account that should own the website.
2. Open the `geo-measure` project and select **Settings** → **Build and Deployment**.
3. Set **Framework Preset** to **Next.js** (do not leave it as Other), and keep **Root Directory** set to `./`.
4. Keep the default Next.js build and output settings. No environment variables, TTS service, Python runtime, or voice model are required.
5. Return to **Deployments**, redeploy the latest deployment from the `main` branch, and wait for the build to finish. The current initial deployment used the wrong framework preset and returns 404 until it is corrected and redeployed.

For later updates, edit the source, check it locally, then commit and push to `main`:

```powershell
npm ci
npm run typecheck
npm run build
git add -A
git commit -m "Describe the change"
git push origin main
```

The GitHub repository is already connected to this Vercel project. Once the framework preset is corrected, Vercel automatically builds and deploys new commits pushed to `main`. Pull requests can be connected to Vercel for preview deployments before merging.

Alternatively, after installing and authenticating the Vercel CLI, run `npx vercel link` once in the source root and `npx vercel --prod` to deploy from the command line. Do not commit Vercel credentials or local `.vercel` settings.

Progress is browser-local and does not synchronize between devices or browsers.

## Windows client handoff

Run `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/package-client.ps1`. Give the client the resulting ZIP, checksum, and `START-HERE.txt` from `CLIENT-DELIVERY`. The client archive includes the website, static lesson audio, and the one-click Windows setup scripts. It deliberately excludes development output, optional voice-studio launchers, TTS source/runtime requirements, and model downloads.
