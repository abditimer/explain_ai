# Independent reader test

This is a short moderated comprehension check for people who have not studied transformer models. It should be run with five readers individually before treating the experience as clear. The moderator should observe without explaining the answer or correcting the reader. A copyable [participant invitation](READER_TEST_INVITE.md) is ready.

## Session

Allow 8–12 minutes per reader. Ask the participant to think aloud while using the site; do not record audio or collect identifying information. Note the task, where they hesitated, what they expected, what they did, and their own explanation.

Use the [anonymous session record](READER_TEST_RECORD_TEMPLATE.md) for consistent notes across the five sessions.

1. “Explore the page as you normally would. Stop when you feel you understand how the example continues.”
2. “In your own words, what happens to the sentence between its words and the next-token choice?”
3. “Choose one query token in the attention chapter. What is it comparing, and why are some positions unavailable?”
4. “Find the implementation for that operation. What would you click or follow to see the complete code?”
5. “Change the temperature. Which values change, and how does the page explain those values?”
6. “Choose one of the likely next tokens and append it. Did the checkpoint choose it for you, or did you?”

## Record and act on findings

For each reader, record whether they completed each task without moderator help and quote only short, anonymous paraphrases. Mark a comprehension issue when a reader confuses tokens with words, interprets attention weights as a complete explanation of model behavior, confuses a raw logit with a probability, treats illustrative values as model predictions, or cannot distinguish a reader choice from model sampling. Fix repeated navigation or comprehension failures before polishing minor preferences, then run the relevant task again with a new reader.

Do not claim that usability testing is complete until real independent readers have taken part and the resulting changes have been reviewed.
