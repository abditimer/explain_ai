# Website redesign TODO

## Goal

Create a beautiful, independent, self-guided website explaining how a transformer continues text. Aim for award submission quality in visual design, interaction, accessibility, and educational clarity. Stage presentation is a secondary capability, not the organising principle.

The central narrative is **“How a machine continues a thought.”** Follow one sentence through tokenisation, representations, attention, layers, and next-token selection. Keep real code in the narrative: visual behaviour leads to an operation, then its implementation, then an opportunity to experiment.

## 1. Define the story and art direction

Completed design specification: [story and art direction](docs/STORY_AND_ART_DIRECTION.md). These decisions are ready for implementation in the later sections.

- [x] Choose the intended audience and state what visitors should understand by the end. See [the story brief](STORY_BRIEF.md).
- [x] Choose one example sentence that works throughout the experience. See [the sentence and scene mapping](STORY_BRIEF.md#the-sentence-we-follow).
- [x] Restructure the main journey into three acts: **Represent**, **Connect**, and **Continue**.
- [x] Give training its own companion chapter, accessible from navigation and the main journey's ending.
- [x] Rewrite the current 30 steps into a focused core route with optional technical depth.
- [x] Define one teaching objective and takeaway for each scene.
- [x] Storyboard the complete journey, including quiet reading sections and transitions between immersive scenes.
- [x] Develop an editorial visual system: soft-white canvas, spruce text, expressive typography, restrained lavender/apricot accents, and fine connective lines.
- [x] Assign consistent semantic colours to tokens, representations, and code references.
- [x] Establish a type scale, spacing system, diagram style, and motion language.
- [x] Define deliberate mobile compositions alongside desktop storyboards.

## 2. Audit and correct educational content

- [x] Identify the specific model architecture demonstrated and distinguish its choices from transformers generally. The snippets describe a GPT-2 Small–style decoder-only model (12 blocks, width 768, 12 heads, 50,257-token GPT-2 tokenizer vocabulary), with an intentionally shortened 256-token context and no pretrained weights. Its numerical next-token example is now a separate, pinned pretrained GPT-2 Small checkpoint. These implementation choices are not requirements of transformers generally.
- [x] Audit factual claims, including sweeping claims about training data, embeddings, activations, and model capabilities. Rewrote the story copy and documented remaining audit findings in [the educational content audit](docs/EDUCATIONAL_CONTENT_AUDIT.md).
- [x] Keep code, diagram labels, tensor dimensions, and narrative explanations consistent. Corrected live story copy and labels; the remaining hand-authored visual values are explicitly marked illustrative in the diagram and documented in the audit.
- [x] Distinguish illustrative values, reduced-dimensional diagrams, and recorded model outputs. Labelled the attention and loss schematics and selected-dimensional embedding illustration; recorded a pinned full-vocabulary GPT-2 checkpoint output and documented its separation from the teaching model in [the audit](docs/EDUCATIONAL_CONTENT_AUDIT.md).
- [x] Add sources and an explanation of important simplifications. See [the educational content audit](docs/EDUCATIONAL_CONTENT_AUDIT.md) for the separate teaching implementation and pinned checkpoint, their different limits, and the remaining illustrative diagrams. Exact upstream revision provenance for the teaching-code pattern is still not pinned.
- [x] Keep a canonical executable code example; derive displayed excerpts from it where practical. Added [the canonical teaching implementation](docs/code/teaching_transformer.py), generation scripts, and a verifier confirming all eight displayed excerpts exactly match their source lines. The code is syntactically valid; running model computation still requires the documented PyTorch and `tiktoken` dependencies.
- [x] Prepare reproducible demonstration data and record its provenance and configuration. Exact story-prefix tokenizer output is recorded with tiktoken 0.9.0/Python 3.12.12; the fixed toy softmax is reproducible with `npm run record:generation-demo`; and `npm run record:gpt2-output` reproduces all 50,257 logits from the pinned checkpoint. Both records include hashes and configuration. Attention weights and the training curve remain explicitly illustrative; see [the audit](docs/EDUCATIONAL_CONTENT_AUDIT.md).

## 3. Build the shared experience engine

- [x] Define stable scene, beat, code-expression, and diagram-object identifiers. Scenes use stable IDs, beats are explicit scene-scoped records, code excerpts have canonical source line ranges, and diagrams expose semantic `data-object-id` attributes. Source-level check found 8 scenes and 30 unique beats.
- [x] Define shared narrative state: scene, beat, and transition progress. Added `narrativeReducer` and exposed its stable scene/beat/progress state on the shared diagram frame.
- [x] Keep experiment state, such as selected token or temperature, separate from narrative progress. Added a distinct `experimentReducer`; scroll navigation never updates experiment state.
- [x] Replace competing global navigation state with a controller that separates requested destinations from observed scroll position. Added a beat-ID controller for keyboard and chapter jumps; Scrollama reports observed beats separately, and removed the `window.__targetStep` / `window.__activeStep` globals.
- [x] Implement seekable transitions that behave correctly during reverse scrolling and chapter jumps. Added Scrollama progress events and converted scene diagram states to direct progress-derived attributes; removed queued D3 transition delays so reverse scrolling and jump landings settle from current state.
- [x] Preserve shared visual objects across scenes instead of remounting every diagram at chapter boundaries. Added one persistent, keyed layer per scene; only the active layer is displayed and exposed to accessibility, while D3 nodes remain mounted.
- [x] Assign clear ownership: React for structure, D3 for calculations/layout, and one animation system for animated properties. React owns persistent scene layers; D3 owns diagram SVG nodes and seekable attributes; no separate diagram animation library is in use.
- [x] Evaluate and integrate a timeline system for scroll-linked transforms and selective pinning. Evaluation: the current experience needs seekable SVG attributes and bounded scene progress; Scrollama supplies normalized progress, and D3 renders directly from it. No separate timeline library is justified yet because no tested scene requires pinning and a second scroll/timeline owner would duplicate Scrollama. Revisit selective desktop pinning after user testing.
- [x] Add transition cancellation and cleanup for scene changes and unmounting. New destinations supersede Lenis scrolling; wheel/touch/native paging cancels the request; reaching or passing the destination clears shared request state; navigation and Scrollama listeners are removed on unmount.
- [x] Support direct scene links, refresh restoration, resizing, and deterministic end states. Beat IDs are URL fragments; Back/Forward and session restore resolve them; Scrollama and Lenis recalculate on resize; each diagram renders directly from the current beat/progress.
- [x] Ensure readable content and navigation work independently of animation. Story content remains semantic HTML; reduced-motion preference disables smooth scrolling and visual fades; a no-JavaScript overview preserves the essential explanation.

## 4. Integrate code into the narrative

- [x] Replace the single highlighted HTML block with structured lines and semantic expression anchors. Excerpts render line by line with stable expression/line IDs, line numbers, and syntax highlighting.
- [x] Build a persistent code surface with selectable text and accessible reading order. One chapter's source excerpt stays in a persistent, non-trapping code column; line numbers are omitted from selection.
- [x] Keep unchanged lines visually stable; emphasise only the current operation. The current chapter's excerpt is highlighted as one operation while all other chapters' code is kept out of the reading surface.
- [x] Remove repeated full snippets from individual narrative steps. Story beats now use a concise source reference and line link.
- [x] Associate code expressions with diagram elements and tensor-shape annotations. Beat-level operation IDs, source ranges, shape annotations, and diagram-object links are now checked by `npm run verify:story-map`; it validates all 27 mapped beats against the canonical source and diagram IDs.
- [ ] Choreograph a small number of meaningful code-to-diagram transitions using measured anchors and temporary visual copies. Added two desktop attention transitions from the active source lines to the measured heatmap; cancellation, reduced-motion opt-out, and compact sticky code layout are implemented, but a rendered motion check remains.
- [x] Assemble individual operations into the full function at appropriate chapter boundaries. The canonical implementation is grouped with stable chapter anchors; its full-source page now has a linked contents map connecting each narrative topic to the corresponding implementation region.
- [x] Provide a clearly labelled route to the complete implementation without losing narrative position. The full source opens separately and links back to the story.
- [x] Label simplified excerpts and link them to the exact implementation. Each narrative reference names its excerpt and links to the exact source start line.

## 5. Build the first polished vertical slice

- [x] Create the opening question with an unfinished sentence and candidate continuations. The opening now uses the brief's “The cat sat on the” prefix, a visible missing continuation, and three labelled editorial examples (“ mat”, “ floor”, “ sofa”).
- [x] Animate the same sentence into token pieces and token IDs. The scene now consumes the recorded GPT-2 tokenizer artifact for “The cat sat on the”; exact IDs and pieces are documented in [the recorded output](docs/code/tokenizer_demo.json).
- [x] Transform token pieces into representations and introduce position information. The embedding chapter now uses those same five token IDs, then shows token vectors, position vectors, and their sum as explicitly schematic dimensions.
- [x] Build the attention centrepiece with selectable tokens and explanatory connections. The detailed heatmap follows the first three recorded story tokens; keyboard-accessible controls choose the query row, backed by separate experiment state.
- [ ] Reveal attention scores, causal masking, normalised weights, and weighted values in a clear sequence. Restructured the illustrative heatmap to reveal full scores, then future-position masking, then normalised weights on successive beats; a rendered visual check remains.
- [ ] Integrate one convincing transition from the visual operation into real code. The attention sequence has two measured code-to-diagram transitions; a complete rendered check is still needed.
- [x] Add quiet intervals so readers can pause and understand each transformation. Each beat is a separate tall reading step with no automatic advance; scroll progress directly controls the scene.
- [ ] Complete mobile and reduced-motion variants of this slice. Mobile keeps the diagram pinned above the story; nonvisual checks now show no horizontal overflow at 375px and in a short 768px viewport. Touch, zoom, reduced-motion, and visual checks remain.
- [ ] Test with readers unfamiliar with the explanation: can they explain what changed and why, and find the deeper code without guidance? A [moderated reader-test guide](docs/READER_TEST_GUIDE.md) is ready; sessions and follow-up changes still require independent participants.
- [ ] Refine the visual language, pacing, and interactions before extending the remaining chapters. Updated source styles toward the warm-paper/spruce editorial direction, added paper-safe semantic accent colors, and replaced the placeholder ending; rendered visual review is intentionally deferred.

## 6. Complete the journey

- [x] Explain feed-forward processing and residual connections using the established visual language. Dedicated chapters show per-position expansion/GELU/compression and a pre-LayerNorm block with two residual paths.
- [x] Pull back to reveal repeated transformer blocks while retaining the tracked representation. The final block beat now resolves to a schematic 12-layer stack with one token-position path tracked from input to updated vector; values are explicitly described as conceptual. Rendered review remains deferred.
- [x] Show output scores, probabilities, and next-token selection. Recorded all 50,257 logits from the pinned MIT-licensed GPT-2 Small checkpoint for the exact prefix; the chart recomputes probabilities over the complete vocabulary, presents its top five, and lets the reader append a selected candidate. The output is explicitly separated from the randomly initialized teaching implementation and is checksum-verified.
- [x] Add a temperature experiment with an accurate explanation of its effect. The slider recomputes each displayed candidate’s probability using softmax across all 50,257 recorded checkpoint logits; lower positive temperatures sharpen the distribution and higher values flatten it. Browser visual/accessibility review remains open.
- [x] Return to the original sentence and append the selected token to complete the narrative loop. The reader can choose one of three continuations, each verified as one exact GPT-2 token, and see its ID appended to the five-token prefix. The choice is explicitly user-selected, not a model sample.
- [x] Build the training companion chapter with loss, gradients, and parameter updates. The final training chapter explains cross-entropy, backpropagation, and AdamW; its chart is explicitly schematic rather than recorded training output.
- [x] Add a satisfying ending with a concise takeaway, further exploration, sources, and maker credit. Added a closing card with the narrative takeaway, return links to generation and training, implementation and audit routes, and maker credit.

## 7. Accessibility, performance, and reliability

- [x] Audit text contrast and remove unnecessary opacity-based reading barriers. Removed the 30% opacity applied to inactive narrative steps, raised key story/navigation/diagram labels, and raised the chapter hover label from 4.21:1 to 5.90:1. Replaced the mismatched bundled code theme with colors measured against the spruce panel: all defined syntax colors, including comments, exceed 4.5:1 on `#172420`. Rendered contrast and zoom review remain part of cross-browser verification.
- [x] Support keyboard navigation, visible focus, semantic headings, and accessible interaction labels. Native buttons and the temperature range remain keyboard-operable; one app-wide high-contrast focus style covers links, buttons, and inputs, and attention query controls announce exact token text and ID. Browser keyboard and screen-reader verification remains part of the cross-browser review.
- [x] Provide meaningful textual equivalents for diagrams and avoid colour-only explanations. Each active diagram label now describes its actual structure and important values, including exact token/ID pairs, attention phase, toy probabilities, vector dimensions, residual order, and schematic training trend. Color distinctions are paired with labels, numbers, or operation names. Rendered screen-reader verification remains part of the accessibility review.
- [x] Ensure reduced-motion mode exposes all content without requiring animated transitions. Story copy and diagram text alternatives remain available; the active diagram settles directly to the current beat, CSS motion is disabled globally, Lenis smooth scrolling is off, and code-to-diagram ghost motion is canceled/omitted when the preference is active. Preference changes are observed live. Rendered device verification remains in the responsive review.
- [x] Avoid scroll traps, excessive pinning, and nested scrolling in the core journey. Removed vertical scrolling from the chapter rail and made code lines wrap instead of requiring horizontal scrolling. At short/zoomed heights the rail moves into document flow and keeps chapter-level links; the code panel unpins, and on short narrow screens the diagram also flows normally. Rendered viewport verification remains open.
- [ ] Test narrow screens, touch interaction, browser zoom, and viewport-height changes. Nonvisual viewport checks now confirm no horizontal overflow at 375px and 768×600px; touch, browser zoom, and rendered checks remain.
- [x] Bundle essential fonts and assets locally; progressively load later scenes. Fraunces Variable and Manrope Variable are self-hosted as Latin WOFF2 subsets under OFL-1.1; diagrams load on first visit and remain mounted afterward. Production output confirms separate scene chunks and the JPEG is absent.
- [ ] Establish loading and animation-performance budgets and measure against them. Added [build and runtime budgets](docs/PERFORMANCE_BUDGET.md) and recorded production output sizes within the build budgets; browser frame/long-task measurements remain.
- [x] Prefer HTML/SVG; introduce heavier rendering only for a demonstrated need. The experience diagrams are HTML/SVG; no canvas or WebGL renderer is used.
- [ ] Test forward/reverse scrolling, interrupted transitions, direct links, refresh, and resize across supported browsers. Production-browser checks confirmed direct beat entry, refresh restoration, and presentation next/previous; interrupted scrolls and cross-browser behavior remain.
- [x] Verify numerical demonstrations and executable code with focused correctness checks. Recomputed the temperature and causal-attention values with provenance checks; a pinned CPU check exercises model shape, causal masking, shifted data windows, loss, optimizer update, generation, and invalid sampling parameters.

## 8. Secondary stage support

- [x] Add an optional presentation mode that drives the same narrative engine. Added a `?presentation=1` mode that keeps the selected beat, diagram, and implementation excerpt in a presentation layout.
- [x] Support next/previous beat, replay, and chapter navigation with keyboard/clicker controls. Presenter controls provide previous, next, replay, and exit; arrow keys and the chapter rail use the shared beat navigation.
- [x] Make each presentation beat settle into a stable composition with no automatic advance. Only the active beat is displayed; transitions happen only after a presenter action or existing navigation input.
- [x] Provide larger code excerpts and projection-friendly layouts. Presenter mode increases story type, widens the composition, and retains the persistent code panel; rendered projector review remains open.
- [ ] Verify essential content works offline and can recover after refresh. A deterministic harness now verifies install, cache, scope, and navigation fallback logic; browser-level offline and refresh checks remain.

## 9. Publication and award readiness

- [x] Choose the target award and check its current eligibility, submission requirements, and deadlines. See [award target and current readiness](docs/AWARD_TARGET.md); CSSDA submission is deferred until the site is public and reviewed.
- [ ] Complete independent usability and comprehension testing; address findings. The reader-test guide is ready, but independent participants are still needed.
- [ ] Review every scene for visual continuity, typography, pacing, and scientific accuracy.
- [x] Add page metadata, social preview imagery, favicon, and descriptive sharing information. Added title/description/theme-color/Open Graph and large-image card metadata, custom social-preview SVG artwork, a project favicon, and a designed public sources page. The Pages URL is confirmed; check the deployed metadata again after updating the live build.
- [x] Check asset/font licences and attribution. Bundled fonts are confirmed OFL-1.1 and credited; the attention overview is now project-authored SVG, and the supplied JPEG is excluded from the site and public build pending permission.
- [x] Verify the production build and deployment. The production build and local `/explain_ai/` preview pass, including the source and references pages. GitHub Actions deployed commit `33372a4`; the public page now serves the redesigned metadata and asset bundle. Deep-link/refresh checks passed locally; published deep links and forced load-error recovery still need a production-browser pass.
- [ ] Prepare a concise project description and submission screenshots/video that demonstrate both craft and educational purpose. A concise CSSDA description is drafted in [award target](docs/AWARD_TARGET.md); screenshot/video preparation awaits the visual review and target URL capture.

## First milestone acceptance criteria

- A new visitor can follow the opening through attention without a presenter.
- The same sentence and token identities remain recognisable through transformations.
- Code adds understanding at the relevant moment and remains available in full.
- Forward scrolling, backward scrolling, and direct scene entry produce consistent visuals.
- Mobile and reduced-motion experiences communicate the same core ideas.
- The prototype establishes a distinctive visual direction before the full site is rebuilt.
