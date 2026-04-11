export const codeBlocks = [
  {
    id: 'imports',
    section: null,
    title: 'Imports & Setup',
    code: `import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader
import tiktoken

torch.manual_seed(123)
tokenizer = tiktoken.get_encoding("gpt2")`
  },
  {
    id: 'data-prep',
    section: 'data-prep',
    title: 'Data Preparation',
    code: `def read_file(file_path, train_split_ratio):
    with open(file_path, "r", encoding="utf-8") as file:
        text = file.read()
    split_at_this_index = int(train_split_ratio * len(text))
    train_text = text[:split_at_this_index]
    validation_text = text[split_at_this_index:]
    return train_text, validation_text

class SlidingWindowDataset(Dataset):
    def __init__(self, text, tokenizer, context_length, stride):
        self.source_tokens = []
        self.target_tokens = []
        tokens = tokenizer.encode(text)
        for token_id in range(0, len(tokens)-context_length, stride):
            source = tokens[token_id:token_id+context_length]
            target = tokens[token_id+1:token_id+context_length+1]
            self.source_tokens.append(torch.tensor(source))
            self.target_tokens.append(torch.tensor(target))

    def __len__(self):
        return len(self.source_tokens)

    def __getitem__(self, index):
        return self.source_tokens[index], self.target_tokens[index]

def dataloader(text, batch_size=4, context_length=256,
               stride=128, shuffle=True, drop_last=True):
    tokenizer = tiktoken.get_encoding("gpt2")
    dataset = SlidingWindowDataset(text, tokenizer, context_length, stride)
    return DataLoader(dataset, batch_size=batch_size,
                     shuffle=shuffle, drop_last=drop_last)`
  },
  {
    id: 'feedforward',
    section: 'feedforward',
    title: 'FeedForward Network',
    code: `class FeedForward(nn.Module):
    def __init__(self, config):
        super().__init__()
        self.layers = nn.Sequential(
            nn.Linear(config["emb_dim"], 4*config["emb_dim"]),
            nn.GELU(),
            nn.Linear(4*config["emb_dim"], config["emb_dim"])
        )

    def forward(self, x):
        return self.layers(x)`
  },
  {
    id: 'attention',
    section: 'attention',
    title: 'Multi-Head Attention',
    code: `class MultiHeadAttention(nn.Module):
    def __init__(self, dim_in, dim_out, context_length,
                 dropout, num_heads, qkv_bias=False):
        super().__init__()
        assert dim_out % num_heads == 0
        self.dim_out = dim_out
        self.num_heads = num_heads
        self.head_dim = dim_out // num_heads

        self.Wq = nn.Linear(dim_in, dim_out, bias=qkv_bias)
        self.Wk = nn.Linear(dim_in, dim_out, bias=qkv_bias)
        self.Wv = nn.Linear(dim_in, dim_out, bias=qkv_bias)
        self.head_combined_projection = nn.Linear(dim_out, dim_out)
        self.dropout = nn.Dropout(dropout)

        self.register_buffer("mask",
            torch.triu(torch.ones(context_length, context_length), diagonal=1))

    def forward(self, x):
        b, tokens, dim_in = x.shape

        q = self.Wq(x)
        k = self.Wk(x)
        v = self.Wv(x)

        q = q.view(b, tokens, self.num_heads, self.head_dim).transpose(1, 2)
        k = k.view(b, tokens, self.num_heads, self.head_dim).transpose(1, 2)
        v = v.view(b, tokens, self.num_heads, self.head_dim).transpose(1, 2)

        attention_scores = q @ k.transpose(2, 3)
        mask_bool = self.mask.bool()[:tokens, :tokens]
        attention_scores.masked_fill_(mask_bool, -torch.inf)

        attention_weights = torch.softmax(
            attention_scores / k.shape[-1]**0.5, dim=-1)
        attention_weights = self.dropout(attention_weights)

        context_vector = (attention_weights @ v).transpose(1, 2)
        context_vector = context_vector.contiguous().view(b, tokens, self.dim_out)
        return self.head_combined_projection(context_vector)`
  },
  {
    id: 'block',
    section: 'block',
    title: 'Transformer Block',
    code: `class TransformerBlock(nn.Module):
    def __init__(self, config):
        super().__init__()
        self.attention = MultiHeadAttention(
            dim_in=config["emb_dim"], dim_out=config["emb_dim"],
            context_length=config["context_length"],
            num_heads=config["n_heads"], dropout=config["drop_rate"],
            qkv_bias=config["qkv_bias"])
        self.feedforwards = FeedForward(config)
        self.layer_norm_1 = nn.LayerNorm(config["emb_dim"])
        self.layer_norm_2 = nn.LayerNorm(config["emb_dim"])
        self.drop_shortcut = nn.Dropout(config["drop_rate"])

    def forward(self, x):
        shortcut = x
        x = self.layer_norm_1(x)
        x = self.attention(x)
        x = self.drop_shortcut(x)
        x = x + shortcut

        shortcut = x
        x = self.layer_norm_2(x)
        x = self.feedforwards(x)
        x = self.drop_shortcut(x)
        x = x + shortcut
        return x`
  },
  {
    id: 'model',
    section: 'model',
    title: 'GPT Model',
    code: `class GPT(nn.Module):
    def __init__(self, config):
        super().__init__()
        self.config = config

        self.tokens_embeddings = nn.Embedding(
            config["vocab_size"], config["emb_dim"])
        self.positional_embeddings = nn.Embedding(
            config["context_length"], config["emb_dim"])
        self.dropout = nn.Dropout(config["drop_rate"])

        self.transformer = nn.Sequential(
            *[TransformerBlock(config) for _ in range(config["n_layers"])])

        self.final_norm = nn.LayerNorm(config["emb_dim"])
        self.output_head = nn.Linear(
            config["emb_dim"], config["vocab_size"], bias=False)

    def forward(self, idx):
        batch_size, seq_len = idx.shape

        tok_emb = self.tokens_embeddings(idx)
        pos_emb = self.positional_embeddings(
            torch.arange(seq_len, device=idx.device))
        x = self.dropout(tok_emb + pos_emb)

        x = self.transformer(x)
        x = self.final_norm(x)
        logits = self.output_head(x)
        return logits

GPT_CONFIG_124M = {
    "vocab_size": 50257,
    "context_length": 256,
    "emb_dim": 768,
    "n_heads": 12,
    "n_layers": 12,
    "drop_rate": 0.1,
    "qkv_bias": False
}`
  },
  {
    id: 'generation',
    section: 'generation',
    title: 'Text Generation',
    code: `def generate(model, idx, max_generated_tokens,
             temperature=1.0, top_k=None):
    for _ in range(max_generated_tokens):
        idx_context = idx[:, -model.config["context_length"]:]

        with torch.no_grad():
            logits = model(idx_context)

        logits = logits[:, -1, :]

        if top_k is not None:
            top_logits, _ = torch.topk(logits, top_k)
            min_val = top_logits[:, -1]
            logits = torch.where(logits < min_val,
                torch.tensor(float('-inf')).to(logits.device), logits)

        if temperature > 0.0:
            logits = logits / temperature
            probs = torch.softmax(logits, dim=-1)
            idx_next = torch.multinomial(probs, num_samples=1)
        else:
            idx_next = torch.argmax(logits, dim=-1, keepdim=True)

        idx = torch.cat((idx, idx_next), dim=1)
    return idx

def encode(text):
    return torch.tensor(tokenizer.encode(text)).unsqueeze(0)

def decode(tokens):
    return tokenizer.decode(tokens.squeeze(0).tolist())`
  },
  {
    id: 'training',
    section: 'training',
    title: 'Training Loop',
    code: `def get_loss_per_batch(input_batch, target_batch, model, device):
    input_batch = input_batch.to(device)
    target_batch = target_batch.to(device)
    logits = model(input_batch)
    loss = F.cross_entropy(logits.flatten(0, 1), target_batch.flatten())
    return loss

@torch.no_grad()
def get_loss_per_dataloader(dataloader, model, device, num_batches=None):
    total_loss = 0
    num_batches = min(num_batches or len(dataloader), len(dataloader))
    for i, (x, y) in enumerate(dataloader):
        if i >= num_batches:
            break
        total_loss += get_loss_per_batch(x, y, model, device).item()
    return total_loss / num_batches if num_batches > 0 else float("nan")

def train_model(model, train_dl, val_dl, optimizer, device,
                num_epochs, eval_freq, eval_iter):
    train_losses, val_losses, track_tokens_seen = [], [], []
    tokens_seen, step = 0, -1

    for e in range(num_epochs):
        model.train()
        for x, y in train_dl:
            optimizer.zero_grad()
            loss = get_loss_per_batch(x, y, model, device)
            loss.backward()
            optimizer.step()
            tokens_seen += x.numel()
            step += 1

            if step % eval_freq == 0:
                model.eval()
                train_loss = get_loss_per_dataloader(train_dl, model, device, eval_iter)
                val_loss = get_loss_per_dataloader(val_dl, model, device, eval_iter)
                train_losses.append(train_loss)
                val_losses.append(val_loss)
                track_tokens_seen.append(tokens_seen)
                print(f"Epoch {e+1} | Step {step:06d} | "
                      f"Train {train_loss:.3f} | Val {val_loss:.3f}")
                model.train()

    return train_losses, val_losses, track_tokens_seen`
  }
];
