"""Focused CPU checks for the canonical teaching implementation."""

import importlib.util
from pathlib import Path

import torch


SOURCE = Path(__file__).resolve().parents[1] / "docs" / "code" / "teaching_transformer.py"
SPEC = importlib.util.spec_from_file_location("teaching_transformer", SOURCE)
teaching = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(teaching)


def check(condition, message):
    if not condition:
        raise AssertionError(message)


config = {
    "vocab_size": 32,
    "context_length": 4,
    "emb_dim": 16,
    "n_heads": 4,
    "n_layers": 2,
    "drop_rate": 0.0,
    "qkv_bias": False,
}
model = teaching.GPT(config)
model.eval()
tokens = torch.tensor([[1, 2, 3, 4]])
logits = model(tokens)
check(logits.shape == (1, 4, 32), f"unexpected logits shape: {tuple(logits.shape)}")
check(torch.isfinite(logits).all().item(), "model logits must be finite")

# A causal position cannot depend on a token that appears later in the sequence.
changed_future = tokens.clone()
changed_future[0, 3] = 9
changed_logits = model(changed_future)
check(torch.allclose(logits[:, :3], changed_logits[:, :3], atol=1e-6), "future token changed earlier logits")

# Sliding windows pair each source sequence with its one-token-shifted target.
class SequenceTokenizer:
    def encode(self, _text):
        return [0, 1, 2, 3, 4, 5]


dataset = teaching.SlidingWindowDataset("ignored", SequenceTokenizer(), context_length=3, stride=2)
check(len(dataset) == 2, f"unexpected sliding-window count: {len(dataset)}")
source, target = dataset[0]
check(source.tolist() == [0, 1, 2], f"unexpected first source: {source.tolist()}")
check(target.tolist() == [1, 2, 3], f"unexpected first target: {target.tolist()}")

# Loss and one optimizer step execute with a small configuration.
targets = torch.tensor([[2, 3, 4, 5]])
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3)
loss = teaching.get_loss_per_batch(tokens, targets, model, torch.device("cpu"))
check(torch.isfinite(loss).item(), "cross-entropy loss must be finite")
optimizer.zero_grad()
loss.backward()
optimizer.step()

# Greedy generation appends argmax tokens while respecting the context window.
class GreedyModel:
    config = {"context_length": 3}

    def __call__(self, context):
        result = torch.zeros((context.size(0), context.size(1), 8))
        result[:, :, 6] = 1
        return result


generated = teaching.generate(GreedyModel(), torch.tensor([[1, 2, 3]]), 2, temperature=0)
check(generated.shape == (1, 5), f"unexpected generated shape: {tuple(generated.shape)}")
check(generated[0, -2:].tolist() == [6, 6], f"unexpected greedy tokens: {generated[0, -2:].tolist()}")

try:
    teaching.generate(GreedyModel(), torch.tensor([[1]]), 1, temperature=-0.1)
except ValueError:
    pass
else:
    raise AssertionError("negative temperature should be rejected")

try:
    teaching.generate(GreedyModel(), torch.tensor([[1]]), 1, temperature=1, top_k=9)
except ValueError:
    pass
else:
    raise AssertionError("top_k larger than the vocabulary should be rejected")

print("Verified model shapes, causal masking, shifted targets, finite loss, optimizer update, greedy generation, and invalid sampling parameters.")
