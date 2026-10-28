# How a Machine Continues Text

An independent, self-guided explanation of how a decoder-only transformer processes a sentence and produces scores for a possible next token.

**Live site:** [abditimer.github.io/explain_ai](https://abditimer.github.io/explain_ai/)

## The story

The visitor follows “The cat sat on the” through eight chapters: the next-token question, GPT-2 tokenisation, token and position representations, causal attention, feed-forward processing, residual blocks, next-token scores, and training. Each chapter connects its diagram to a focused excerpt from the complete Python implementation.

The model code describes a GPT-2 Small–style decoder-only architecture with a 256-token context. It starts from random weights and does not load or claim to reproduce a pretrained GPT-2 checkpoint. Tokenizer IDs are recorded GPT-2 output. Separately, the next-token chapter loads a recorded full-vocabulary output from a pinned pretrained GPT-2 Small checkpoint; its provenance and all 50,257 logits are available on the [sources page](https://abditimer.github.io/explain_ai/sources.html). The attention values, embedding vectors, and training curve remain illustrative. These boundaries are documented in the [educational content audit](docs/EDUCATIONAL_CONTENT_AUDIT.md).

## Experience and implementation

- React owns the narrative, experiments, and accessible reading structure.
- Scrollama reports scroll-linked beat progress; D3 renders the diagrams from that state.
- Scene diagrams load when first visited and remain mounted for predictable navigation.
- Direct beat links use URL fragments; presentation mode is available with `?presentation=1`.
- Fraunces and Manrope are self-hosted as variable WOFF2 fonts under OFL-1.1. Diagram assets are authored in SVG and HTML.
- The production build registers a scoped service worker for same-origin offline fallback.

## Run locally

```sh
npm ci
npm run dev
```

Vite prints a local development URL, normally `http://localhost:5173/`.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run build` | Create the production site in `dist/` using the GitHub Pages `/explain_ai/` base path. |
| `npm run preview` | Serve that build locally at `/explain_ai/` to match the deployed subpath. |
| `npm run verify:code` | Check displayed Python excerpts against canonical source lines and page anchors. |
| `npm run verify:story-map` | Check beat-to-source ranges and diagram object IDs. |
| `npm run verify:demonstrations` | Recompute attention and temperature examples, check normalization, token references, hashes, and public data copies. |
| `npm run verify:checkpoint-output` | Verify the pinned checkpoint provenance, full-vocabulary logit hash, top-token ranking, normalization, and public data copies. |
| `npm run verify:offline` | Exercise service worker install, same-origin cache, offline fallback, and scope boundaries with a deterministic worker harness. |
| `npm run verify:model` | Run focused CPU checks with the pinned Python dependencies using `uv`. |
| `npm run record:generation-demo` | Re-record the illustrative toy softmax and its provenance. |
| `npm run record:gpt2-output` | Download the pinned 548 MB GPT-2 Small checkpoint to the local Hugging Face cache and re-record the 50,257 float32 next-token logits. Checkpoint weights are not included in the site. |
| `npm run generate:code` | Regenerate code excerpts and the complete implementation page. |
| `npm run lint` | Run ESLint. |

To reproduce tokenizer data with Python 3.12, run:

```sh
uv run --with-requirements docs/code/requirements-tokenizer.txt --python 3.12 python docs/code/record_tokenizer_demo.py
```

The recorded checkpoint output uses its own pinned environment in `docs/code/requirements-checkpoint.txt`. `npm run record:gpt2-output` downloads the model the first time and caches it locally.

The model source requires the pinned packages in `docs/code/requirements.txt`. To run its focused CPU checks, use `uv run --with-requirements docs/code/requirements.txt --python 3.12 python scripts/verify_teaching_model.py`.

## Deployment and project notes

GitHub Actions builds and publishes `dist/` to GitHub Pages whenever `main` is updated. The current public URL and design state are tracked in [TODO.md](TODO.md); the award target and current submission requirements are in [docs/AWARD_TARGET.md](docs/AWARD_TARGET.md).
