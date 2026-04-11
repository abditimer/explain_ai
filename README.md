# explain_ai

An interactive, step-by-step visual tutorial that explains how GPT works — from raw text to trained model — by walking through real PyTorch code.

## What it does

The app presents the GPT architecture as a guided tour. Each section pairs a plain-English explanation with the corresponding Python/PyTorch code, highlighted in a side-by-side (or toggled mobile) view. Topics covered:

1. **Data Preparation** — tokenisation with BPE and the sliding-window dataset
2. **Embeddings** — token and positional embeddings
3. **Multi-Head Attention** — queries, keys, values and the causal mask
4. **FeedForward Network** — the MLP inside each transformer block
5. **Transformer Block** — residual connections and layer normalisation
6. **GPT Architecture** — stacking 12 transformer blocks into a full model
7. **Text Generation** — autoregressive sampling with temperature and top-k
8. **Training Loop** — forward pass, cross-entropy loss, backprop, optimiser step

## Tech stack

- **React 19** + **Vite** — UI and dev server
- **Tailwind CSS** — styling
- **Lucide React** — icons

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Other commands

| Command | Description |
|---|---|
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
