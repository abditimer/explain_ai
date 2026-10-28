# Reader test notes

Use one copy per participant. Use an anonymous code such as `R01`; do not record names, contact details, audio, or other identifying information. Run the six prompts in [the reader-test guide](READER_TEST_GUIDE.md) without explaining concepts or correcting answers.

**Participant code:**

**Session date (optional):**

| Prompt/task | Completed without help? | Hesitation or expectation | Reader's own explanation (brief paraphrase) | Moderator intervention |
| --- | --- | --- | --- | --- |
| Explore until the example makes sense | | | | |
| Explain what happens from text to next-token choice | | | | |
| Explain the attention query and unavailable positions | | | | |
| Find and open the complete implementation | | | | |
| Change temperature and explain what changes | | | | |
| Append a candidate and say who chose it | | | | |

## Comprehension checks

Mark a concern only when the participant's explanation demonstrates the misunderstanding; don't infer it from hesitation alone.

- [ ] Confuses a token piece with a whole word.
- [ ] Treats attention weights as a complete explanation of the model's answer.
- [ ] Confuses a raw logit with a probability.
- [ ] Treats illustrative attention, embedding, or training values as model output.
- [ ] Thinks the displayed continuation was sampled by the checkpoint.
- [ ] Could not find the source code without moderator guidance.

## Follow-up

**Most important observed friction:**

**Change to consider:**

**Was the change checked with a different reader?**
