# Educational content audit

## Demonstrated architecture

The code snippets describe a GPT-2 Small–style, decoder-only transformer, following the broad architecture and configuration presented in Sebastian Raschka's *Build a Large Language Model (From Scratch)*. The illustrative configuration has a GPT-2 vocabulary of 50,257 entries, 12 attention heads, 12 transformer blocks, width 768, and a teaching context length of 256. The attention head width is therefore 768 / 12 = 64, and the feed-forward hidden width is 4 × 768 = 3,072.

This is an architecture demonstration, not a running copy of the released GPT-2 Small checkpoint: the snippets define randomly initialized parameters and do not load trained weights. The 256-token context differs from the 1,024-token context commonly associated with GPT-2 Small. The code also uses `qkv_bias=False`; bias settings should be described as an implementation/configuration choice, not as a transformer requirement. The implementation has other differences from GPT-2 Small, including untied output/embedding weights. A GPT-2 tokenizer does not imply the model has GPT-2's learned parameters.

The implementation choices shown include learned token and absolute position embeddings, causal multi-head self-attention, pre-LayerNorm sublayers, residual additions, GELU feed-forward layers with a 4× hidden width, and final LayerNorm. The shown code creates a separate bias-free output projection and does not tie it to token-embedding weights. GPT-2 ties these weights, so this is a material difference from the reference GPT-2 Small architecture and should be resolved before calling the implementation a faithful GPT-2 Small reproduction. Transformer architectures can make different choices about positional representation, normalisation, activations, biases, parameter tying, block layout, and attention masking.

## Claim corrections and simplifications

- Token IDs are vocabulary labels. They are not measurements of meaning. Embedding rows are learned vectors; calling one a “semantic address” overstates what a coordinate means.
- The neural network consumes vectors looked up from IDs, not raw characters or words. The GPT-2 tokenizer can encode text as byte-level BPE tokens; token boundaries do not necessarily align with words.
- Causal masking prevents a position from using future positions in this next-token decoder. It does not mean all transformer models must use causal masks.
- Attention weights are normalized score weights used to mix value vectors. They are not by themselves a complete explanation of a model's answer or a reliable measure of human-readable “importance.”
- GELU is a smooth nonlinear activation, not a binary on/off gate. A GELU layer does not by itself establish sparse activations.
- The feed-forward network expands and projects each position independently, returning an output at the model width for the residual addition. The dimensions alone do not guarantee a broadly “richer” representation, so the story states the output width and block connection directly.
- Residual connections provide an additive path through a sublayer and can help optimization. They do not guarantee successful training or eliminate vanishing gradients.
- Temperature rescales logits before softmax. With positive temperature, lower values make the distribution more concentrated and higher values make it flatter. Temperature does not intrinsically control truth or creativity.
- Cross-entropy for a target token is `-log(p_target)`; averaged cross-entropy is lower when the model assigns higher probability to target tokens on average. It is not a general guarantee of better language performance.
- The displayed parameter count is not calculated from the actual instantiated module. Do not report 124M as the parameter count of this implementation until it is computed after resolving the output-weight tying difference.

## Demonstration data status

The sentence in the story brief is editorial teaching material. The opening's “mat”, “floor”, and “sofa” are editorial possibilities, not model predictions. Exact GPT-2 tokenizer output for the prefix “The cat sat on the” and its one-token continuations is recorded in [tokenizer_demo.json](code/tokenizer_demo.json), including pieces and IDs. The embedding bars show selected schematic dimensions rather than real model values. The project-authored attention diagram uses invented dot-product scores; its displayed weights are computed by scaling those scores by `sqrt(64)`, applying a causal mask, and computing row-wise softmax. They remain illustrative, not model outputs.

The next-token chapter uses a **separate pretrained GPT-2 Small checkpoint**, `openai-community/gpt2` at revision `3fe9a169f57f3ca0cac0b9133351644193b9dd3c` (MIT license). [The inference record](code/gpt2_next_token.json) identifies the pinned checkpoint file by SHA-256, input text and IDs, tokenizer, package versions, CPU/evaluation settings, and output-file hash. The accompanying [float32 logits](code/gpt2_next_token_logits.f32) contain one score for every one of the 50,257 vocabulary IDs. The browser re-normalizes all logits at the selected positive temperature, then displays the top five candidate probabilities. The randomly initialized teaching implementation remains separate: its context length is 256 and output weights are untied, while the pretrained GPT-2 checkpoint uses 1,024 positions and tied token/output embeddings. The displayed five tokens are ranked checkpoint candidates, but a reader's choice to append one is not a sampled model continuation.

The earlier three-candidate softmax with fixed toy logits `[2, 1, 0]` remains in [generation_demo.json](code/generation_demo.json) as a worked illustrative calculation, not a live model result. Its values at temperatures 0.5, 1, and 2 include hashes for the calculation source and tokenizer artifact. The training diagram's loss curve is schematic.

The canonical teaching source lives at `docs/code/teaching_transformer.py`. Teaching-model dependencies are pinned in `docs/code/requirements.txt`; tokenizer recording has its smaller pinned environment in `docs/code/requirements-tokenizer.txt`. The checkpoint inference dependencies are pinned separately in `docs/code/requirements-checkpoint.txt`. Reproduce the full-vocabulary checkpoint output with `npm run record:gpt2-output`; this downloads the 548 MB public checkpoint to the local Hugging Face cache and records only the output logits and provenance in the repository. The earlier toy softmax is reproduced with `npm run record:generation-demo` and is not a checkpoint result.

If checkpoint output is regenerated or changed, update its model revision/file hash, tokenizer and input IDs, library versions, device/dtype, evaluation mode, context handling, and output hash together. Keep the attention scores, reduced-dimensional diagrams, and hand-authored values identified as illustrative; do not present them as checkpoint measurements.

## Diagram accessibility and color audit

Each active SVG is exposed as one labelled image. Its accessible name combines the chapter summary, the current narrative beat, and a scene-specific description in `src/App.jsx`. The descriptions state the token-piece/ID pairs, the selected attention query and current score/mask/weight phase, embedding dimensions and schematic status, feed-forward dimensions and order, both residual additions, the current top-five full-checkpoint probabilities, or the training chart axes and schematic status. The generation name also includes the current temperature and probabilities; when present, it announces the reader-selected continuation and token ID. Controls for changing the attention query and continuation remain outside the image role and have their own accessible labels.

Color is not the sole carrier of instructional information: token identities have text/IDs and connecting layout; embedding rows have token/position/sum labels and arithmetic signs; attention cells show numeric scores, weights, or a minus-infinity mask label; feed-forward and block nodes name operations and dimensions; generation bars show candidate text and numeric probabilities; and the training curve has labelled axes and an explicit schematic-data label. Rendered screen-reader and color-vision checks remain necessary before publication.

The text-color source audit uses WCAG relative luminance contrast ratios. Page and diagram labels use high-contrast neutrals and semantic accents; the chapter hover label is 5.90:1 on the page background. The GitHub syntax theme's dim comment and section colors were below 4.5:1 against this site's spruce code panel, so the code surface now defines theme colors locally. Its lowest syntax color is the comment gray at 6.47:1 against `#172420`; rendered checks at browser zoom levels remain open.

## Sources and implementation provenance

- Radford et al., [Language Models are Unsupervised Multitask Learners (GPT-2)](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf): GPT-2 model and training description.
- Hugging Face, [openai-community/gpt2](https://huggingface.co/openai-community/gpt2/tree/3fe9a169f57f3ca0cac0b9133351644193b9dd3c): MIT-licensed model files at the pinned revision used for the recorded next-token output.
- Hugging Face, [GPT-2 configuration](https://huggingface.co/docs/transformers/model_doc/gpt2#transformers.GPT2Config): reference configuration, including 1,024 positions, width 768, 12 layers, and 12 heads for GPT-2 Small.
- OpenAI, [tiktoken](https://github.com/openai/tiktoken): implementation and encoding names for the GPT-2 tokenizer.
- Raschka, [Build a Large Language Model (From Scratch)](https://github.com/rasbt/LLMs-from-scratch): educational implementation pattern reflected in the snippets. The project currently does not pin a source revision, so exact code provenance should be recorded before the snippets are treated as canonical.
- Vaswani et al., [Attention Is All You Need](https://arxiv.org/abs/1706.03762): foundational scaled dot-product attention and Transformer architecture reference.

The project has not trained the teaching model. The recorded GPT-2 Small next-token result is inference from the separate, pinned checkpoint described above.
