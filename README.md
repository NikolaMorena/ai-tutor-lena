# AI Tutor

A small web application: an AI tutor grounded in its own knowledge base, with a Q&A mode and a
"Knowledge check" (oral exam) mode. The current knowledge base is the Computer Graphics part of the
TU Wien lecture notes for *Introduction to Visual Computing* (VU 186.822, SS 2025). The API key is kept on the server, never in the browser.

## Running locally

```bash
npm install
cp .env.example .env
# open .env and enter your real ANTHROPIC_API_KEY (console.anthropic.com -> API Keys)
npm start
```

Open http://localhost:3000

## Project structure

```
config/app.config.json    <- branding + model + reasoning level
data/knowledge.md         <- KNOWLEDGE BASE - all the material the AI is grounded in
data/EVC_Skriptum_CG_EN_v3.pdf <- original source of the knowledge base (not read by the server)
data/sample-questions.json<- demo questions for the buttons in "Ask" mode
server.js                 <- backend (Express) - the only file that knows the API key
public/                   <- frontend (HTML/CSS/JS), no need to touch it to change the subject
```

## Configurable model and reasoning (extended thinking)

In `config/app.config.json`:

```json
{
  "model": "claude-sonnet-5",
  "maxTokens": 1000,
  "reasoningLevel": "none"
}
```

- `model` — any valid Anthropic model string (e.g. `claude-sonnet-5`, `claude-opus-5`,
  `claude-haiku-4-5-20251001`). A stronger model = better answers, slower and more expensive.
- `reasoningLevel` — `"none"` (default, fastest) or `"low" | "medium" | "high" | "xhigh" | "max"`.
  When it is not `"none"`, the server automatically sends `thinking: {"type":"adaptive"}` and
  `output_config: {"effort": <level>}` to the Anthropic API, and increases `max_tokens` to leave room for
  both thinking and the answer. The model itself decides *whether* to think on each question (adaptive)
  — `reasoningLevel` only tunes how inclined it is to do so and how deeply.
  Note: which levels are supported depends on the model — check the
  [Anthropic documentation](https://platform.claude.com/docs/en/build-with-claude/effort) before
  raising it to `"high"` or above if you notice answers are slow or expensive for simple questions
  (for this tutor, `"none"` or `"low"` is probably enough — questions are mostly direct lookups
  in the material, not complex multi-step reasoning).

The answer is **streamed** — the student sees the text as it is produced, line by line, instead of waiting
for the whole answer at once. When `reasoningLevel` is on, "Thinking deeper…" is shown while the model is
thinking, before the text starts arriving (the raw thinking is never shown to the student, only the final answer).

## How to change the subject/tutor (without writing code)

1. Open `config/app.config.json` and change `tutorName`, `subjectName`, `subjectNameCap`,
   `appTitle`, `tagline`, and `audience` (who the answers are written for, e.g. "a university student
   preparing for the exam").
2. Replace the contents of `data/knowledge.md` with the new material. Format: each topic starts with
   `## Topic name`, and its content goes below it until the next `##`. The number of topics is unlimited -
   the "Knowledge check" buttons and the topic list in the system prompt are built automatically from this file.
3. (Optional) Update `data/sample-questions.json` with new demo questions for "Ask" mode.
4. Restart the server (`npm start`), or call `POST /api/reload` to load the changes without a restart.

None of these steps require changing any `.js` files.

## Deployment (once you move past the "just for me" phase)

This is a plain Node/Express application - it can run on Render, Railway, Fly.io, or your own VPS.
Important: `ANTHROPIC_API_KEY` is set as an environment variable on the hosting service (the same as
in `.env` locally), and is never put in the code or the frontend.

## Limitations of this MVP (honestly stated)

- No authentication/student accounts - anyone with the link can use it. For real distribution to
  a larger number of students, the next step is adding limits (e.g. per IP address or with accounts) to
  prevent someone from accidentally or deliberately spending the whole budget.
- The knowledge check keeps the conversation history only in the student's browser (in page memory, not
  persistently) - if they refresh the page, they lose their progress. For a real version, this should be
  stored per student (in a database), so the teacher can also see where students most often make mistakes.
- One model for everything (Claude Sonnet) - changeable in `config/app.config.json` -> `model`.
- The whole knowledge base (~40k tokens) is sent with every request. Prompt caching keeps repeat
  requests cheap, but for a much larger body of material a retrieval step would be needed.
