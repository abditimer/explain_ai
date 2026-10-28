# How a machine continues a thought

Section 1 design specification. Audience and sentence decisions live in [the story brief](../STORY_BRIEF.md). This document specifies the redesigned experience; the current application has not yet been migrated to it.

## Journey and navigation

The main route has an opening, three acts, and an ending. Its 12 scenes replace the current 30 narrative steps. Readers advance by ordinary scrolling, with explicit chapter links and an optional “Explore the code” disclosure in relevant scenes. No timed advancement is required.

Primary navigation: **Represent · Connect · Continue · How learning works**. A small contents control reveals scene titles. The current act has a text label and an underline. The title links to the opening. On mobile, show the current act and a Contents button rather than compressing all links.

“How learning works” is a separate companion chapter, available from primary navigation and the ending. Opening it from a scene preserves a return destination. Its return link reads “Back to [scene title]”; a direct visitor receives “Explore how text continues”. Deep links and restoration are implementation work in section 3.

The sentence remains **The cat sat on the**, without a trailing visual blank becoming model input. The continuation defaults editorially to “ mat”. Token boundaries, IDs, weights, and predictions must come from the later verified demonstration data. Preserve occurrence identities rather than assigning identities to words before tokenisation.

## Core route: scene copy, objectives, and storyboards

The copy below is the proposed core narration. Each scene has one teaching objective and takeaway. Technical detail opens in place and never interrupts the core reading order. Code references name intended operations, not verified excerpts from the current implementation.

| Scene / act | Core narration | Objective → takeaway | Optional depth / code |
|---|---|---|---|
| 01 · Opening · What comes next? | “The cat sat on the … You could finish this in several ways. A text model also has several possibilities. Follow this sentence to see how it chooses its next piece.” | Establish the question → continuation involves alternatives. | Preview the full implementation link; no code required yet. |
| 02 · Represent · Give each piece a label | “First, a tokenizer breaks the text into pieces called tokens. Each piece gets a vocabulary ID. These numbers are labels, not measurements of meaning.” | Distinguish text pieces and IDs → tokenisation makes vocabulary entries addressable. | Actual tokenizer output, whitespace notation, subword example, encode operation. |
| 03 · Represent · Give the labels a representation | “Each ID selects a learned list of numbers. Position information is added so the network can use where each piece occurs. Now the sentence is a sequence of representations.” | Explain lookup and position → vectors supply the network's input. | Embedding lookup, position addition, shapes; qualify learned absolute positions as a choice of the demonstrated architecture. |
| 04 · Represent · Keep one position in view | “Follow the last input position. Its representation will change as the sentence moves through the network. At the end, it will supply the next-token prediction.” | Establish the tracked object → the final input position drives this next prediction. | Inspect any occurrence; explain ID versus occurrence versus contextual state. |
| 05 · Connect · Compare the available context | “Attention computes scores between positions. A position can use itself and earlier positions. Later positions are masked out.” | Explain scores and causal limits → permitted context is explicit. | Q/K projections, scaling, score matrix, mask; inspect an earlier position to make blocked later positions visible. |
| 06 · Connect · Turn scores into a mixture | “Softmax turns the permitted scores into weights that add to one. These weights combine value vectors into an attention output.” | Explain attention's numerical operation → weights mix vectors. | V projection, softmax, weighted sum, multiple heads and output projection; code anchors for each operation. |
| 07 · Connect · Transform, then add back | “A feed-forward network transforms each position separately. Residual connections add each sublayer's output to its input, carrying a running representation through the block.” | Explain local processing and residuals → attention and feed-forward processing update a continuing stream. | Normalisation placement, nonlinear activation, intermediate width, attention and MLP residual additions. |
| 08 · Connect · Repeat the block | “The representations pass through more blocks. Each block has its own learned parameters. Keep following the same position as its numbers change.” | Explain depth → repeated structure is not shared weights. | Whole-block code, block count, final normalisation; model-specific dimensions pending audit. |
| 09 · Continue · Score the vocabulary | “The last input position's final representation becomes a score for every vocabulary token. Softmax turns those scores into a probability distribution.” | Connect context to candidates → the output covers the vocabulary, not just the displayed words. | Output projection and softmax, full-vocabulary view, logits versus probabilities. |
| 10 · Continue · Choose a next token | “A selection rule chooses from that distribution. Sampling can give different results from the same prefix. Temperature changes how concentrated the distribution is.” | Separate probabilities and selection → plausible alternatives can produce different continuations. | Positive-temperature slider, greedy selection as a separate option, optional top-k filtering and renormalisation. Temperature is not a truth or creativity control. |
| 11 · Continue · Add it, then repeat | “Decode the chosen token and append its text. That becomes part of the context for another prediction. One token may be only part of a word.” | Close the generation loop → generation repeats next-token selection. | Decode/append code, one additional deliberate step; explain context limits and optional caching. |
| 12 · Ending · A sentence, continued | “Text became representations. Those representations gathered context. The final position produced possibilities, and one token joined the sentence. How did the model learn to do this?” | Consolidate the explanation → represent, connect, continue. | Links: How learning works, complete implementation, sources and simplifications, restart; maker credit: “Made by Abdi”. |

## Composition and transitions, scene by scene

The implemented reading surface uses warm paper, spruce-green story and code surfaces, serif display typography, restrained lavender and apricot accents, and a dark technical diagram canvas. Narrative steps use generous spacing and a fine active rule; the ending resolves into a separate paper card with links to continue exploring.

Desktop reference: 1440 × 900. Mobile reference: 390 × 844, also fit 320 px width. Each row describes a settled composition that must remain understandable without motion.

| Scene | Desktop composition and transition | Mobile composition |
|---|---|---|
| 01 | Large sentence at upper left; open continuation slot and three candidate labels below. Short invitation at right. On entry, everything is readable; selecting a candidate previews its text without presenting a model result. | Title, sentence, then vertically stacked candidate buttons. Intro follows within the first reading screen where practical; never shrink sentence type to keep a desktop line. |
| 02 | Sentence moves into a horizontal piece strip; whitespace marks can be toggled. IDs appear under pieces, joined by fine vertical rules. | Wrap pieces in reading order with each ID directly beneath its piece. No horizontal page scrolling. |
| 03 | Token strip stays as the top reference. Under it, one selected piece's lookup row and position row combine into a vector. Caption labels the displayed dimensions as a subset. | Token strip, selected-piece label, then three stacked rows: token vector, position vector, sum. |
| 04 | Quiet full-width reading interval. Small final-position marker and a static before/after key establish what persists. No pinned canvas. | Text followed by a compact static vector and “Following the final input position”. |
| 05 | Return to a two-column composition: narration left, causal connection diagram right. Selected destination sits below the source strip. Scores precede mask reveal; labels identify unavailable positions. | Narration precedes diagram. Select a destination with labelled buttons; show sources in a compact list with permitted/blocked labels. Matrix is optional depth. |
| 06 | Same diagram and destination persist. Scores become a labelled weight strip, then value rows converge on an output vector. A code disclosure highlights the corresponding operation beside the output. | Vertical sequence: selected destination, weights, combined output, code disclosure. Do not draw crossing arcs over body text. |
| 07 | Keep the output vector at the same anchor. A small block diagram shows normalisation and sublayer branches with residual bypasses; feed-forward detail expands locally. | Stack block operations vertically. Draw residual path along an inset edge, label “add input”, and keep labels outside the line. |
| 08 | Quiet pullback: block becomes one element in a labelled stack. A thin continuous path tracks the final position. Follow with a short paragraph before the next immersive scene. | Compact stack with first, middle, and last blocks plus an explicit omitted-block count derived from configuration. Text explains repeated structure. |
| 09 | Stack resolves into final vector, output projection, and candidate score chart. Indicate that a few candidates are shown from the full vocabulary. | Vector and projection above a vertical candidate list. Bars have text values; full list is an optional disclosure. |
| 10 | Chart stays stable. Temperature and selection controls occupy a narrow panel beside it. “Choose next token” triggers one draw, never an automatic loop. | Controls follow chart in document order. Numeric temperature value is visible; a native slider and separate selection-mode control are keyboard accessible. |
| 11 | Selected token returns to the sentence slot. A single loop line returns to the input; “Generate one more” demonstrates repetition deliberately. | Sentence, selected-token label, then repeat button. Announce only the user-triggered result; do not make the whole scene a live region. |
| 12 | Unpinned editorial ending: completed text, three-line recap, training link as primary next action, code and sources as secondary links. | Same order in one column with generous spacing. Return links preserve experiment result and position when implemented. |

Between acts, use a quiet reading divider with act number, title, and one sentence: **Represent — Give text a form the network can process. Connect — Update each position using available context. Continue — Turn the result into a next-token choice.** No mandatory pause or automatic animation delays.

## Mapping the current 30 steps

Every existing step has a destination. Numbers refer to the current section's `steps` array, starting at 1.

| Current section / steps | New home |
|---|---|
| Intro 1, 2, 3 | Scene 02; scenes 01/09; training introduction respectively. Rewrite broad capability claims during section 2 audit. |
| Tokenisation 1, 2, 3 | Scene 02; scene 02 detail using the canonical sentence; training data-pair detail. |
| Embeddings 1, 2, 3, 4 | Scene 03 core; scene 03 core; scene 03 detail; scenes 03/04 with an architecture-specific position explanation. |
| Attention 1, 2, 3, 4 | Scene 05 detail; scene 05 core; scene 05 core; scene 06 core. |
| Feed-forward 1, 2, 3, 4 | Scene 07 core; scene 07 detail; scene 07 detail with corrected activation wording; scene 07 core. |
| Block 1, 2, 3, 4 | Scene 07; scene 07; training gradient detail; scene 08. |
| Generation 1, 2, 3, 4 | Scene 09; scene 10; scene 10 detail; scene 11. |
| Training 1, 2, 3, 4 | Companion scenes T2, T3, T4, T5 respectively. |

## Training companion

Title: **How learning works**. Opening copy: “So far, the model has used learned numbers to continue text. Training is how those numbers are adjusted.” Keep the canonical sentence in view, adding its following text as the target. Label toy examples and avoid implying one sentence is sufficient training.

| Scene | Core narration and teaching objective | Takeaway / composition / optional depth |
|---|---|---|
| T1 · Make a prediction task | “Training text supplies examples: context followed by a target token.” Explain shifted inputs and targets. | Targets follow tokenizer boundaries. Desktop uses two aligned strips; mobile uses paired input/target rows. Depth: dataset windows and per-position targets. |
| T2 · Measure the miss | “The loss depends on the probability assigned to the observed target. Assigning it more probability lowers this example's loss.” Introduce cross-entropy. | Loss is a training objective, not a truth score. Show target beside candidate probabilities; depth: negative log probability and batch aggregation. |
| T3 · Trace the effect | “Backpropagation computes how the loss changes with the model's parameters.” Introduce gradients. | Gradients guide adjustment. Use a labelled reverse path through a small graph; depth: chain rule and gradient accumulation. Mobile graph is vertical. |
| T4 · Adjust the parameters | “An optimiser uses gradients and its update rule to adjust parameters. Training repeats with more examples.” Explain updates. | Training changes parameters; ordinary generation uses them. Show before/after parameter cells; depth: learning rate, AdamW, zeroing gradients. |
| T5 · Check on unseen examples | “Track loss on training and held-out examples. Lower held-out loss indicates improved prediction on that evaluation data; it does not establish every capability.” Explain evaluation. | Evaluate beyond memorising training examples. Label toy curves as illustrative unless recorded. Mobile uses one plot plus a plain-language caption. |

End with “Return to the sentence” and “Sources and simplifications”. No training diagram appears in the main generation loop. Preserve a quiet text introduction and ending; no compulsory pinning.

## Editorial visual system

The visual metaphor is a sentence becoming a working diagram on an editor's page. Use precise rules, small marginal labels, and visible correspondence between text, vector, and code. Avoid decorative neural-network backgrounds. All core graphics use HTML/SVG; display forms should reflect actual operations.

### Palette and semantics

| Token | Value | Role |
|---|---|---|
| Canvas | `#f5f7f5` | Soft-white page. |
| Surface | `#ffffff` | Code and selected detail surfaces. |
| Ink | `#18251f` | Spruce headings, body, chart labels, diagram outlines. |
| Secondary ink | `#47594f` | Captions and secondary controls, never opacity-faded body copy. |
| Token fill | `#ded7f1` | Text pieces and their vocabulary identity; ink labels. |
| Representation fill | `#d5e5df` | Vectors and intermediate representations; ink labels. |
| Output fill | `#f1dfc5` | Candidate scores, selected continuation, and output area; ink labels. |
| Code reference | `#6251b8` | Expression underlines, numbered code-to-diagram markers, links on the canvas. |
| Structure line | `#a5b5ac` | Decorative separators and background guides only. |
| Functional line | `#47594f` | Essential connections, chart boundaries, control borders. |
| Focus | `#6251b8` | Visible outline, 3 px with 3 px offset. |

Semantic colours describe object types, not individual token occurrences. Occurrences use position labels and stable outlines; a selected object receives a heavier spruce border plus “Selected”. Causal exclusion uses a hatch and “Blocked” label. Attention weight uses bar length plus a numeric label. Code correspondences share numbered markers and text labels, so colour is never the sole cue. Lavender and apricot are fills, not small text colours.

Keep syntax highlighting restrained: spruce base text, violet expressions, dark secondary comments. Validate final rendered text, focus, and graphical contrast in section 7; swatch choices alone do not constitute an accessibility audit.

### Typography

Preferred families: **Fraunces** for display and act titles, **Manrope** for body and UI, **IBM Plex Mono** for code and numerical columns. Use system serif, system sans, and monospace fallbacks. Self-host required subsets after licence review; font acquisition and bundling remain later tasks. Handwriting is optional for one short editorial annotation, never instructional body text.

| Role | Desktop size / line height | Mobile size / line height |
|---|---|---|
| Hero | 80 / 84 px | 44 / 48 px |
| Act title | 56 / 62 px | 36 / 42 px |
| Scene title | 36 / 44 px | 28 / 35 px |
| Body | 20 / 32 px | 18 / 29 px |
| UI / captions | 14 / 21 px | 14 / 21 px |
| Code | 15 / 24 px | 14 / 23 px |

Use responsive interpolation for headings, not fixed viewport sizes. Body measure: 58–65 characters. Sentence measure can be wider, with natural wrapping. Avoid uppercase paragraphs; small act labels may use modest tracking. Use tabular numerals in probability and vector displays.

### Spacing and layout

Base scale in pixels: **4, 8, 12, 16, 24, 32, 48, 64, 96, 128**. Desktop shell max-width 1280 px, outer gutters 48 px, column gap 64 px. Immersive scenes use roughly 5/12 narration and 7/12 diagram; quiet scenes use a centred 680 px reading column. Scene spacing 96–128 px; related label/object gap 8–12 px. Avoid enclosing every paragraph in a card.

At 768–1099 px reduce gutters to 32 px and gap to 32 px; use stacked compositions whenever a diagram needs more room. Below 768 px use a single column, 20 px gutters (16 px at 320 px), and 64–80 px scene gaps. Mobile has no pinned diagram pane or nested scrolling. Code may scroll horizontally inside an explicitly labelled code region; the page itself must not overflow. Controls have at least 44 × 44 px touch areas.

### Diagram grammar

- Text piece: lightly rounded rectangle, 6 px radius, token fill, visible original text; optional whitespace marks with a legend.
- Vector: mint row of cells, explicit position label, visible ellipsis when dimensions are omitted; no decorative random numbers.
- Operation: spruce label on white with input/output labels; name addition and weighted sums explicitly.
- Connection: 1.5 px functional stroke with small arrowhead only where direction matters. Residual bypass: curved corner path labelled “add input”.
- Probability: horizontal bar with candidate text and numeric value. Distinguish displayed subset from full distribution; do not silently renormalise the subset.
- Code reference: violet underline and matching numbered marker. Keep source selectable, with a textual link to its diagram explanation.
- Illustration status: adjacent caption “Illustrative” or “Recorded from [configuration]”; never bury provenance only in a tooltip.

### Motion and pacing

Motion explains correspondence: text pieces separate, a selected row becomes a vector, weights combine values, a chosen token joins the sentence. Maintain readable labels throughout. Do not bounce, rotate, typewrite body text, or continuously pulse attention paths.

Interaction feedback: 120–160 ms. Small object changes: 220–320 ms. Scene correspondence: 450–650 ms with a gentle ease-out. Scroll-linked movement follows a seekable progress value with defined start/end states; durations describe optional button-driven playback. Only one meaningful transformation is emphasised at a time. Animation ownership and cancellation are specified in section 3 implementation.

Use pinning selectively on spacious desktop scenes 05–06 only if testing supports it, with normal scrolling and a finite exit. Keep act dividers, scene 04, scene 08's reading interval, and the ending unpinned. Reverse scroll restores prior states. Direct scene entry renders its settled state immediately.

Reduced motion replaces travel and morphs with immediate stable compositions and explanatory captions. Every scene remains present in document order. Never require waiting for an animation or interacting with a diagram to read the explanation.

## Design handoff and review gates

Section 1 is complete when the audience, canonical sentence, route, training navigation, rewritten narration, objectives, storyboards, visual tokens, and responsive rules are documented. This document and the story brief provide those decisions.

The build must still verify numerical data and architecture (section 2), implement state and transitions (section 3), integrate real code (section 4), realise and test the visual slice (section 5), complete later scenes (section 6), and validate accessibility/performance (section 7). No reader tests, font licence checks, or browser tests are claimed by this design specification.
