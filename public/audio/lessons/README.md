# Saved Luna narration

These recordings use the same KittenTTS mini 0.8 model, Luna voice, speech normalization and 0.32-second sentence gaps as the previous live narration. Each JSON file contains the displayed sentences, spoken text, exact clip durations and source hash. The website plays the WAV and uses the durations for the existing sentence highlighting.

Coverage deliberately matches the previous Listen with Luna button: lesson title, concept, “Let’s work it out”, example, and every worked-solution detail. No lesson content or visual layout was changed. The standalone voice studio remains a separate live-generation feature.

Developer regeneration, from the project root with the original TTS environment installed:

```powershell
node --experimental-strip-types scripts/export-narration.mjs
.\.venv\Scripts\python.exe tts/generate_lessons.py
node --experimental-strip-types scripts/check-narration.mjs
```

Generation resumes by skipping unchanged completed recordings. Commit/package both the WAV and JSON files. Clients and hosted websites need only these static assets for lesson narration; they do not run the generation commands.

Speech model and software: [KittenML/KittenTTS](https://github.com/KittenML/KittenTTS), model revision `c02725660cea441db4c383af69f1f26f5cd00947`.
