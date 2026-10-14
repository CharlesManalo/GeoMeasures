"""Developer-only: render the exact lesson narration to portable WAV files."""
import json
import hashlib
from pathlib import Path
import numpy as np
import soundfile as sf
import server

root = Path(__file__).resolve().parents[1]
lessons = json.loads((root / 'output/lesson-narration.json').read_text(encoding='utf-8'))
destination = root / 'public/audio/lessons'
destination.mkdir(parents=True, exist_ok=True)
server.load_model()
if server.state != 'ready':
    raise RuntimeError(server.load_error)
for lesson in lessons:
    audio_path = destination / f"lesson-{lesson['id']}.wav"
    metadata_path = audio_path.with_suffix('.json')
    source_hash = hashlib.sha256(json.dumps(lesson, ensure_ascii=False, sort_keys=True).encode()).hexdigest()
    if audio_path.exists() and metadata_path.exists():
        previous = json.loads(metadata_path.read_text(encoding='utf-8'))
        if previous.get('sourceHash') == source_hash:
            print(f"Already generated lesson {lesson['id']}", flush=True)
            continue
    clips = []
    durations = []
    for sentence in lesson['spoken']:
        clip = np.asarray(server.model.generate(sentence, voice='Luna'), dtype=np.float32)
        if not len(clip) or not np.isfinite(clip).all() or not np.any(clip):
            raise RuntimeError(f"Invalid audio in lesson {lesson['id']}")
        durations.append(len(clip) / server.SAMPLE_RATE)
        if clips:
            clips.append(np.zeros(round(server.SAMPLE_RATE * server.SENTENCE_PAUSE_SECONDS), dtype=np.float32))
        clips.append(clip)
    sf.write(audio_path, np.concatenate(clips), server.SAMPLE_RATE, subtype='PCM_16')
    metadata = {**lesson, 'voice':'Luna', 'audio':f"/audio/lessons/{audio_path.name}",
                'durations':durations, 'pause':server.SENTENCE_PAUSE_SECONDS, 'sourceHash':source_hash}
    metadata_path.write_text(json.dumps(metadata, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f"Generated lesson {lesson['id']}: {lesson['title']} ({sum(durations):.1f}s)", flush=True)
print('All lesson narration is ready.', flush=True)
