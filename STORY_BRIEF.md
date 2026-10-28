# Story brief: How a machine continues a thought

## Intended audience

The main journey is for curious adults who have used a text-generating AI tool and want to understand how it produces its next piece of text. This includes designers, writers, students, and developers new to machine learning.

Assume no knowledge of Python, linear algebra, neural networks, or transformer terminology. Readers can follow an example sentence, compare quantities, and recognise that a list of numbers can represent something. Introduce each new term through a visible operation before naming it.

Developers and technically curious readers are a secondary audience. Offer optional code, tensor shapes, and mathematical details at the operation they explain. Understanding the main story must not depend on opening them.

## The promise to the visitor

**Follow one unfinished sentence through a transformer and discover how text becomes numbers, how those numbers gather context, and how the model chooses what comes next.**

“How a machine continues a thought” is the narrative title. Explain early that the demonstrated operation is text continuation; the title does not establish that the model has human thoughts or intentions.

## What visitors should understand by the end

Visitors should be able to explain the following in their own words:

1. **Represent:** A tokenizer divides text into pieces called tokens and assigns each an ID. The model looks up a learned vector for each ID and adds position information. IDs are labels; vectors are the numerical representations the network processes.
2. **Connect:** Causal attention lets a position combine information from itself and earlier positions. Its weights control how value vectors are mixed. Feed-forward layers further transform each position's representation, while residual connections carry information through repeated blocks.
3. **Continue:** The final representation at the last input position produces scores over the token vocabulary. These become probabilities, a selection rule chooses a token, and the token is appended. Repeating this process generates more text; there can be several plausible continuations.
4. **Separate learning from use:** Training changes model parameters using prediction errors. Ordinary generation uses the learned parameters to process the current context without updating those parameters. The companion chapter explains how learning happens.
5. **Read the demonstration honestly:** A small diagram shows selected dimensions and simplified examples. A plausible continuation is not a guarantee of truth, and an attention connection alone is not a complete explanation of a model's answer.

The central takeaway is: **A transformer continues text by repeatedly turning the available context into a distribution over the next token.**

## Editorial consequences

- Keep the core route self-guided: every scene needs a question, a visible change, and a plain-language explanation of that change.
- Follow the sentence selected below and recognisable token identities through Represent, Connect, and Continue.
- Introduce vectors as lists of numbers before introducing dimensions; introduce attention as a weighted combination before introducing Q, K, and V.
- Make real code available alongside the operation it implements, with a readable explanation that stands on its own.
- Put training in a linked companion chapter so visitors can finish the continuation story before exploring how parameters were learned.
- Present architecture-specific choices as choices of the demonstrated model. The content audit will establish and verify that model and the demonstration's numerical details.

## The sentence we follow

**Opening prefix:** “The cat sat on the”

**Illustrative continuation:** “ mat” → “The cat sat on the mat”

Use this exact prefix, including its capitalisation and spaces, throughout the core route. Display the missing continuation as a visual blank; do not send an underscore or ellipsis to the tokenizer as part of the prefix. The leading space in “ mat” belongs to the continuation text.

This short, concrete sentence is easy to hold in memory while its visual form changes. The repeated “the” also gives us a useful comparison: the same token identity can occur at different positions and develop different contextual representations. The two occurrences have different capitalisation, so do not claim that “The” and “ the” necessarily share an ID.

At the opening, offer “ mat”, “ floor”, and “ sofa” as plausible example continuations, without percentages or a ranking. They are editorial examples, not recorded model predictions. “ mat” is the default narrative ending; an experiment may choose another continuation and should carry its actual result into the ending.

### How the sentence carries the story

| Moment | What the visitor follows |
|---|---|
| Opening | The unfinished prefix and several possible continuations. |
| Tokenisation | The exact prefix becomes tokenizer-produced pieces and IDs, preserving visible spaces. Do not predefine one token per word. |
| Representations | Each piece retains its occurrence identity while becoming a vector with position information. |
| Attention | Track the final input position. Let visitors inspect how its representation combines value vectors from permitted positions, including itself. Any highlighted connection must be labelled illustrative unless supported by recorded weights. |
| Layers | Keep tracking that position as attention, feed-forward operations, and residual connections update its representation. |
| Output | Use the final input position's representation to show a distribution over the full vocabulary, with a few readable candidates highlighted. |
| Ending | Append the selected token's decoded text to the original prefix. A first generated token need not complete a word or sentence. |
| Training companion | Use the prefix and the following text “ mat” to introduce a target; explain that actual targets follow the selected tokenizer's boundaries. |

Exact token pieces, IDs, token count, attention weights, and output probabilities remain to be generated and verified when the architecture and reproducible demonstration data are established. If “ mat” spans multiple tokens in that tokenizer, show the individual generation steps rather than presenting the whole word as one prediction. Do not substitute invented numerical results.

## How to check the learning goal

After the core journey, ask a reader unfamiliar with transformers to:

- Describe what happens between typing text and receiving the next token.
- Explain the difference between a token ID and its representation.
- Explain which positions causal attention can use and what its weights combine.
- Explain why the same prefix can produce different continuations.
- Distinguish generating an answer from training the model.

Accept plain-language answers without equations or recalled jargon. If a reader needs a presenter, mistakes token IDs for meaningful measurements, or believes ordinary generation trains the model, revise the relevant scene. These are planned comprehension checks; reader testing has not yet been performed.
