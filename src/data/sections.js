export const sections = [
  {
    id: 'data-prep',
    title: 'Data Preparation',
    color: 'border-blue-500',
    bgColor: 'bg-blue-50',
    content: `This teaching implementation uses the GPT-2 byte-level BPE tokenizer to convert text into token IDs. IDs label vocabulary entries; the model's learned vectors are looked up in a later step.

The SlidingWindowDataset creates training examples by moving through text with overlapping windows. Each window is an input-output pair for next-token prediction.`,
    visual: `"The cat sat on the" → [464, 3797, 3332, 319, 262]

Sliding Window (stride=128):
Window 1: [tok1...tok256] → [tok2...tok257]
Window 2: [tok129...tok384] → [tok130...tok385]`
  },
  {
    id: 'embedding',
    title: 'Embeddings',
    color: 'border-purple-500',
    bgColor: 'bg-purple-50',
    highlightSection: 'model',
    content: `This GPT-2 Small–style configuration uses two learned lookup tables:

1. Token Embedding: Maps each token ID → 768-dim vector
2. Position Embedding: Adds positional info (0→768-dim, 1→768-dim, etc.)

These are created in GPT.__init__() and summed in GPT.forward().

Look at the GPT Model code (highlighted) → embeddings are defined at the top of the class.`,
    visual: `Schematic values only (not model weights):
Token:       [ 0.23, -0.11,  0.45, ...]
Position:    [ 0.05,  0.32, -0.08, ...]
             ──────────────────────────
Sum:         [ 0.28,  0.21,  0.37, ...]`
  },
  {
    id: 'attention',
    title: 'Multi-Head Attention',
    color: 'border-pink-500',
    bgColor: 'bg-pink-50',
    content: `Causal self-attention lets each position mix information from permitted positions in the context.

Three projections of the input drive it:
• Query (Q): what am I looking for?
• Key (K): what do I advertise?
• Value (V): what do I actually return?

Attention(Q,K,V) = softmax(QK^T / √d_k) · V

Dividing by √d_k controls score scale and helps avoid overly large dot products. Multiple heads compute separate attention mixtures in parallel; their outputs are concatenated and projected. A residual addition is applied by the enclosing transformer block. This is one common design, not a requirement for all transformers.`,
    visual: `Q @ K^T → Attention Scores
         ↓
    Apply mask & softmax
         ↓
    Multiply by V → Output`
  },
  {
    id: 'feedforward',
    title: 'FeedForward Network',
    color: 'border-orange-500',
    bgColor: 'bg-orange-50',
    content: `A two-layer MLP is applied independently to each position in this model.

Expands dimension 4x, applies GELU activation, then projects back.

Input (768) → Linear → (3072) → GELU → Linear → (768)`,
    visual: `Linear1: 768 → 3072
GELU activation
Linear2: 3072 → 768`
  },
  {
    id: 'block',
    title: 'Transformer Block',
    color: 'border-green-500',
    bgColor: 'bg-green-50',
    content: `This implementation uses pre-LayerNorm sublayers and residual additions:

1. x → LayerNorm → Attention → Dropout → Add(x)
2. x → LayerNorm → FeedForward → Dropout → Add(x)

Residuals help gradients flow in deep networks.`,
    visual: `x ──────────────→ +
 ↓                ↑
LN → Attn → Drop ┘
 ↓
 ──────────────→ +
 ↓               ↑
LN → FF → Drop ─┘`
  },
  {
    id: 'model',
    title: 'GPT Architecture',
    color: 'border-indigo-500',
    bgColor: 'bg-indigo-50',
    content: `This GPT-2 Small–style teaching configuration stacks 12 transformer blocks:

1. Token + Position Embeddings
2. 12× Transformer Blocks
3. Final LayerNorm
4. Output head → vocab_size logits

Each block refines representations.`,
    visual: `Tokens → Embeddings
    ↓
Block 1
Block 2
  ...
Block 12
    ↓
LayerNorm → Output Head → Logits`
  },
  {
    id: 'generation',
    title: 'Text Generation',
    color: 'border-teal-500',
    bgColor: 'bg-teal-50',
    content: `Autoregressive generation: predict a next-token distribution, choose one token, append it, and repeat. The code illustrates this procedure; no trained checkpoint is loaded here.

Temperature: rescales logits before softmax (lower positive values sharpen the distribution)
Top-k: sample from k most likely tokens

logits/temperature → softmax → sample`,
    visual: `"The cat sat on the" → Model
    ↓
Logits for all tokens
    ↓
Temperature + Top-k
    ↓
    Sample → one token
    ↓
    Append token → repeat`
  },
  {
    id: 'training',
    title: 'Training Loop',
    color: 'border-red-500',
    bgColor: 'bg-red-50',
    content: `Standard supervised learning:

1. Get batch from dataloader
2. Forward pass → predictions
3. Cross-entropy loss
4. Backward pass → gradients
5. Optimizer step → update weights

Evaluate on validation set periodically.`,
    visual: `Batch → Forward → Loss
    ↓
Backward → Gradients
    ↓
Update weights
    ↓
Repeat`
  }
];
