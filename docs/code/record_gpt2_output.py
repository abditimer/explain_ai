"""Record next-token logits from the pinned public GPT-2 Small checkpoint.

The teaching implementation in teaching_transformer.py is intentionally not
this pretrained model. This script records a separate, reproducible reference
inference so the story can show the complete vocabulary distribution without
claiming that the teaching model produced it.
"""

import hashlib
import json
import platform
import struct
from pathlib import Path

import tiktoken
import torch
import transformers
from huggingface_hub import hf_hub_download
from transformers import AutoModelForCausalLM


REPOSITORY = "openai-community/gpt2"
REVISION = "3fe9a169f57f3ca0cac0b9133351644193b9dd3c"
INPUT_TEXT = "The cat sat on the"
SOURCE = Path(__file__).with_name("tokenizer_demo.json")
OUTPUT = Path(__file__).with_name("gpt2_next_token.json")
LOGITS_OUTPUT = Path(__file__).with_name("gpt2_next_token_logits.f32")
PROJECT_ROOT = Path(__file__).resolve().parents[2]


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def printable_piece(piece: str) -> str:
    if piece == " ":
        return "␠"
    return piece.replace(" ", "␠").replace("\n", "↵").replace("\r", "␍").replace("\t", "⇥")


def main() -> None:
    recorded_tokens = json.loads(SOURCE.read_text(encoding="utf-8"))
    assert recorded_tokens["input_text"] == INPUT_TEXT
    tokenizer = tiktoken.get_encoding("gpt2")
    input_ids = tokenizer.encode(INPUT_TEXT)
    assert input_ids == recorded_tokens["token_ids"]

    torch.set_num_threads(2)
    model = AutoModelForCausalLM.from_pretrained(
        REPOSITORY,
        revision=REVISION,
        use_safetensors=True,
        trust_remote_code=False,
    )
    model.eval()
    with torch.inference_mode():
        output = model(input_ids=torch.tensor([input_ids], dtype=torch.long))
        logits = output.logits[0, -1].to(torch.float32).cpu()
        # Accumulate the full-vocabulary softmax in float64. The browser uses
        # double-precision Number arithmetic over the recorded float32 logits.
        probabilities = torch.softmax(logits.to(torch.float64), dim=-1)
        top_values, top_ids = torch.topk(logits, k=8)

    weights_path = Path(hf_hub_download(
        repo_id=REPOSITORY,
        filename="model.safetensors",
        revision=REVISION,
    ))
    LOGITS_OUTPUT.write_bytes(struct.pack(f"<{logits.numel()}f", *logits.tolist()))
    weights_sha256 = sha256(weights_path)
    assert weights_sha256 == "248dfc3911869ec493c76e65bf2fcf7f615828b0254c12b473182f0f81d3a707", "Pinned checkpoint file checksum changed."
    top_tokens = []
    for rank, (token_id, logit) in enumerate(zip(top_ids.tolist(), top_values.tolist()), start=1):
        piece = tokenizer.decode([token_id])
        top_tokens.append({
            "rank": rank,
            "token_id": token_id,
            "piece": piece,
            "display_piece": printable_piece(piece),
            "logit": logit,
            "probability": probabilities[token_id].item(),
        })

    payload = {
        "kind": "checkpoint_next_token_logits",
        "input_text": INPUT_TEXT,
        "input_token_ids": input_ids,
        "tokenizer": "GPT-2 byte-level BPE (tiktoken 0.9.0)",
        "model": REPOSITORY,
        "model_revision": REVISION,
        "model_license": "MIT",
        "model_config": {
            "layers": 12,
            "width": 768,
            "heads": 12,
            "context_length": 1024,
            "vocabulary_size": logits.numel(),
            "output_embeddings_tied_to_token_embeddings": True,
        },
        "inference": {
            "device": "CPU",
            "dtype": "float32 checkpoint logits; float64 softmax accumulation",
            "torch_num_threads": 2,
            "evaluation_mode": True,
            "temperature": 1.0,
            "top_k": None,
            "input_is_truncated": False,
            "torch_version": torch.__version__,
            "transformers_version": transformers.__version__,
            "python_version": platform.python_version(),
        },
        "checkpoint_file": {
            "name": "model.safetensors",
            "sha256": weights_sha256,
            "size_bytes": weights_path.stat().st_size,
        },
        "logits_file": {
            "name": LOGITS_OUTPUT.name,
            "dtype": "float32 little-endian",
            "count": logits.numel(),
            "size_bytes": LOGITS_OUTPUT.stat().st_size,
            "sha256": sha256(LOGITS_OUTPUT),
        },
        "provenance": {
            "generator": "docs/code/record_gpt2_output.py",
            "generator_sha256": sha256(Path(__file__).resolve()),
            "tokenizer_artifact": "docs/code/tokenizer_demo.json",
            "tokenizer_artifact_sha256": sha256(SOURCE),
        },
        "top_tokens_at_temperature_1": top_tokens,
        "probability_sum": probabilities.sum().item(),
        "note": (
            "These are measured outputs from the pinned pretrained GPT-2 Small checkpoint, "
            "not from the separately documented randomly initialized teaching implementation. "
            "The binary file contains one logit for each vocabulary token in token-ID order."
        ),
    }
    OUTPUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    copies = [
        PROJECT_ROOT / "public/docs/code/gpt2_next_token_logits.f32",
        PROJECT_ROOT / "public/docs/code/gpt2_next_token.json",
    ]
    for copy in copies:
        copy.parent.mkdir(parents=True, exist_ok=True)
        copy.write_bytes(LOGITS_OUTPUT.read_bytes() if copy.suffix == ".f32" else OUTPUT.read_bytes())
    print(f"Recorded {logits.numel()} logits for token IDs {input_ids}.")
    print("Top next-token candidates at temperature 1:")
    for token in top_tokens:
        print(f"  {token['rank']}. {token['token_id']} {token['display_piece']!r}: {token['probability']:.6%}")
    print(f"Checkpoint SHA-256: {payload['checkpoint_file']['sha256']}")
    print(f"Logits SHA-256: {payload['logits_file']['sha256']}")


if __name__ == "__main__":
    main()
