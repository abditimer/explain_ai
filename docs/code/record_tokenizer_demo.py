"""Record reproducible tokenizer output for the story prefix."""

import hashlib
import importlib.metadata
import json
import platform
from pathlib import Path

import tiktoken


TEXT = "The cat sat on the"
CONTINUATIONS = (" mat", " floor", " sofa")
ENCODING_NAME = "gpt2"
OUTPUT_PATH = Path(__file__).with_name("tokenizer_demo.json")
PUBLIC_OUTPUT_PATH = Path(__file__).resolve().parents[2] / "public" / "docs" / "code" / "tokenizer_demo.json"


def main():
    encoding = tiktoken.get_encoding(ENCODING_NAME)
    token_ids = encoding.encode(TEXT)
    pieces = [encoding.decode([token_id]) for token_id in token_ids]
    candidate_tokenizations = []
    for text in CONTINUATIONS:
        candidate_ids = encoding.encode(text)
        candidate_tokenizations.append({
            "text": text,
            "token_ids": candidate_ids,
            "token_pieces": [encoding.decode([token_id]) for token_id in candidate_ids],
        })
    result = {
        "kind": "tokenizer_output",
        "input_text": TEXT,
        "tokenizer": ENCODING_NAME,
        "token_ids": token_ids,
        "token_pieces": pieces,
        "decoded_text": encoding.decode(token_ids),
        "candidate_tokenizations": candidate_tokenizations,
        "source_sha256": hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
        "configuration": {
            "tiktoken_version": importlib.metadata.version("tiktoken"),
            "python_version": platform.python_version(),
            "model_checkpoint": None,
        },
        "note": "Tokenizer output only; no model inference or probability values were recorded.",
    }
    serialized = json.dumps(result, ensure_ascii=False, indent=2) + "\n"
    OUTPUT_PATH.write_text(serialized)
    PUBLIC_OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    PUBLIC_OUTPUT_PATH.write_text(serialized)
    print(f"Recorded {len(token_ids)} token IDs to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
