"""Keep client downloads on the exact model revision used during development."""
import json
from huggingface_hub import hf_hub_download
from kittentts import KittenTTS
from kittentts.onnx_model import KittenTTS_1_Onnx

MODEL_REVISION = "c02725660cea441db4c383af69f1f26f5cd00947"


class LockedKittenTTS(KittenTTS):
    def __init__(self, model_name):
        def download(filename):
            return hf_hub_download(repo_id=model_name, filename=filename, revision=MODEL_REVISION)

        with open(download("config.json"), encoding="utf-8") as file:
            config = json.load(file)
        if config.get("type") not in ("ONNX1", "ONNX2"):
            raise ValueError("Unsupported pinned model type")
        self.model = KittenTTS_1_Onnx(
            model_path=download(config["model_file"]),
            voices_path=download(config["voices"]),
            speed_priors=config.get("speed_priors", {}),
            voice_aliases=config.get("voice_aliases", {}),
        )
