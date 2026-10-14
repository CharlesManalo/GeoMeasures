"""Local KittenTTS speech service and HTML test, bound to loopback only."""
import io
import json
import logging
import re
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

MODEL_ID = "KittenML/kitten-tts-mini-0.8"
DEFAULT_VOICE = "Luna"
VOICES = ("Bella", "Jasper", "Luna", "Bruno", "Rosie", "Hugo", "Kiki", "Leo")
SAMPLE_RATE = 24000
SENTENCE_PAUSE_SECONDS = 0.32
ROOT = Path(__file__).resolve().parents[1]
ALLOWED_ORIGINS = {
    "http://127.0.0.1:3000", "http://localhost:3000",
    "http://127.0.0.1:8765", "http://localhost:8765",
}
model = None
state = "loading"
load_error = None
generation_lock = threading.Lock()


def generate_speech(text, voice):
    import numpy as np

    sentences = [sentence for sentence in re.split(r"(?<=[.!?])\s+", text.strip()) if sentence]
    clips = [np.asarray(model.generate(sentence, voice=voice)) for sentence in sentences]
    durations = [len(clip) / SAMPLE_RATE for clip in clips]
    if len(clips) < 2:
        return clips[0], durations
    pause = np.zeros(round(SAMPLE_RATE * SENTENCE_PAUSE_SECONDS), dtype=clips[0].dtype)
    audio = []
    for index, clip in enumerate(clips):
        if index:
            audio.append(pause)
        audio.append(clip)
    return np.concatenate(audio), durations


def load_model():
    global model, state, load_error
    try:
        from locked_model import LockedKittenTTS
        model = LockedKittenTTS(MODEL_ID)
        # The 0.8 wheel lists internal voice IDs; friendly names live in its aliases.
        aliases = getattr(model.model, "voice_aliases", {})
        missing = [voice for voice in VOICES if voice not in model.available_voices and voice not in aliases]
        if missing:
            raise RuntimeError(f"This model does not provide these voices: {', '.join(missing)}.")
        state = "ready"
        logging.info("All eight voices are ready: %s", MODEL_ID)
    except Exception as exc:
        load_error = str(exc)
        state = "error"
        logging.exception("Could not load KittenTTS")


class Handler(BaseHTTPRequestHandler):
    def send(self, status, body, content_type="application/json", headers=None):
        self.send_response(status)
        origin = self.headers.get("Origin")
        if origin in ALLOWED_ORIGINS:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
            self.send_header("Access-Control-Expose-Headers", "X-Sentence-Metadata")
        for name, value in (headers or {}).items():
            self.send_header(name, value)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def reply(self, status, data):
        self.send(status, json.dumps(data).encode())

    def do_OPTIONS(self):
        if self.headers.get("Origin") not in ALLOWED_ORIGINS:
            return self.reply(403, {"error": "Origin not allowed."})
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", self.headers["Origin"])
        self.send_header("Vary", "Origin")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        if self.path == "/health":
            return self.reply(200, {"status": state, "voice": DEFAULT_VOICE, "voices": VOICES, "model": MODEL_ID, "error": load_error})
        if self.path in ("/", "/tts-test.html"):
            return self.send(200, (ROOT / "public/tts-test.html").read_bytes(), "text/html; charset=utf-8")
        self.reply(404, {"error": "Not found."})

    def do_POST(self):
        if self.path != "/generate":
            return self.reply(404, {"error": "Not found."})
        if self.headers.get("Origin") and self.headers["Origin"] not in ALLOWED_ORIGINS:
            return self.reply(403, {"error": "Origin not allowed."})
        if self.headers.get_content_type() != "application/json":
            return self.reply(415, {"error": "Send application/json."})
        try:
            size = int(self.headers.get("Content-Length", "0"))
            if not 0 < size <= 8192:
                return self.reply(413, {"error": "Request is too large or empty."})
            data = json.loads(self.rfile.read(size))
            text = data.get("text") if isinstance(data, dict) else None
            if not isinstance(text, str) or not text.strip() or len(text) > 1000:
                return self.reply(400, {"error": "Enter between 1 and 1,000 characters."})
            voice = data.get("voice", DEFAULT_VOICE)
            if not isinstance(voice, str) or voice not in VOICES:
                return self.reply(400, {"error": "Choose a supported voice: " + ", ".join(VOICES) + "."})
        except (ValueError, UnicodeDecodeError):
            return self.reply(400, {"error": "Invalid JSON request."})
        if state != "ready":
            return self.reply(503, {"error": load_error or "The voices are warming up. Please try again shortly."})
        if not generation_lock.acquire(blocking=False):
            return self.reply(429, {"error": "Another audio is being generated. Please try again shortly."})
        try:
            import soundfile as sf
            audio, durations = generate_speech(text, voice)
            wav = io.BytesIO()
            sf.write(wav, audio, SAMPLE_RATE, format="WAV", subtype="PCM_16")
            self.send(
                200,
                wav.getvalue(),
                "audio/wav",
                {
                    "X-Sentence-Metadata": json.dumps(
                        {"durations": durations, "pause": SENTENCE_PAUSE_SECONDS},
                        separators=(",", ":"),
                    )
                },
            )
        except Exception:
            logging.exception("Speech generation failed")
            self.reply(500, {"error": "Speech generation failed. Check logs/tts.stderr.log for details."})
        finally:
            generation_lock.release()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    server = ThreadingHTTPServer(("127.0.0.1", 8765), Handler)
    threading.Thread(target=load_model, daemon=True).start()
    logging.info("TTS test: http://127.0.0.1:8765/tts-test.html")
    server.serve_forever()
