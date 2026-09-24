// server.js
// -----------------------------------------------------------------------------
// AI Tutor — backend
//
// Responsibilities of this file (and ONLY this file):
//   1) Keeps the Anthropic API key server-side (from .env, it never reaches the browser)
//   2) Loads the branding configuration (config/app.config.json) and the knowledge base
//      (data/knowledge.md) and builds the system prompts for the model from them
//   3) Exposes a few small API endpoints that the frontend calls
//   4) Serves static files from /public
//
// For a different subject/tutor: DO NOT TOUCH this file. Change config/app.config.json
// and data/knowledge.md (and optionally data/sample-questions.json).
// -----------------------------------------------------------------------------

require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.ANTHROPIC_API_KEY;

const CONFIG_PATH = path.join(__dirname, 'config', 'app.config.json');
const KNOWLEDGE_PATH = path.join(__dirname, 'data', 'knowledge.md');
const SAMPLE_Q_PATH = path.join(__dirname, 'data', 'sample-questions.json');

// -----------------------------------------------------------------------------
// Loading and parsing the knowledge base / configuration
// -----------------------------------------------------------------------------

function loadConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

function loadSampleQuestions() {
  if (!fs.existsSync(SAMPLE_Q_PATH)) return [];
  return JSON.parse(fs.readFileSync(SAMPLE_Q_PATH, 'utf8'));
}

// Parses knowledge.md: each "## Title" section becomes one topic.
// Returns { topics: [{title, content}], materialText: "[MATERIAL 1 — ...]\n...\n\n[MATERIAL 2 — ...]..." }
function loadKnowledge() {
  // normalize Windows (CRLF) line endings, otherwise no "## " heading matches and no topics are found
  const raw = fs.readFileSync(KNOWLEDGE_PATH, 'utf8').replace(/\r\n?/g, '\n');
  // strip the HTML comment at the top of the file (editing instructions), it is not sent to the model
  const withoutComment = raw.replace(/<!--[\s\S]*?-->/, '').trim();

  const lines = withoutComment.split('\n');
  const topics = [];
  let current = null;

  for (const line of lines) {
    const h = line.match(/^##\s+(.*)$/);
    if (h) {
      if (current) topics.push(current);
      current = { title: h[1].trim(), content: '' };
    } else if (current) {
      current.content += line + '\n';
    }
  }
  if (current) topics.push(current);

  topics.forEach(t => { t.content = t.content.trim(); });

  const materialText = topics
    .map((t, i) => `[MATERIAL ${i + 1} — ${t.title}]\n${t.content}`)
    .join('\n\n');

  return { topics, materialText };
}

let config = loadConfig();
let knowledge = loadKnowledge();
let sampleQuestions = loadSampleQuestions();

// -----------------------------------------------------------------------------
// Logging — a simple structured logger (timestamp + level + message + meta),
// with no external dependencies. Used for HTTP access, chat activity and errors.
// -----------------------------------------------------------------------------

function log(level, message, meta) {
  const line = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}`;
  const out = level === 'error' || level === 'warn' ? console.error : console.log;
  if (meta !== undefined) out(line, meta);
  else out(line);
}

// -----------------------------------------------------------------------------
// Building the system prompts (same principles as in the prototype: grounded in
// the material, three confidence levels for Q&A mode, Socratic dialogue for quiz mode)
// -----------------------------------------------------------------------------

function buildQaSystemPrompt() {
  return `You are an AI assistant for exam preparation in ${config.subjectName}, built for
the tutor ${config.tutorName}. You answer exclusively on the basis of the
material given below, in the MATERIAL tag.

Rules:
- If the question is covered by the material below, answer clearly, step by step, like a teacher explaining to a student.
  At the end, add a line in the format: [SOURCE: material name].
- If the question is NOT covered by the material below, but is from the field of ${config.subjectName} (or
  related fields that overlap with it) and you know the correct answer with certainty from general scientific
  knowledge — FEEL FREE to answer, clearly and accurately, step by step. But at the end you MUST add a line in
  the format: [VERIFY WITH TEACHER] because the answer has not been checked against the teacher's material and
  methodology, even though it is scientifically correct.
- If the question is not from the field of ${config.subjectName} at all, or if you are not sure the answer is
  correct, say clearly that you cannot answer reliably and suggest asking the teacher directly.
  Format: [NOT IN MATERIAL]
- Write in English, clearly and concisely, suited to ${config.audience || 'a student preparing for the exam'}.
- Do not make up data, numbers or facts you are not sure about — in that case use
  [NOT IN MATERIAL] instead of guessing.

MATERIAL:
${knowledge.materialText}`;
}

function buildQuizSystemPrompt() {
  return `You are an AI examiner for exam preparation in ${config.subjectName}, built for
the tutor ${config.tutorName}. You conduct an oral knowledge check with
the student, based exclusively on the material given below in the MATERIAL tag.

How to work (behave like a teacher at an oral exam):
- Ask ONE question at a time, from the topic the student names (or at random from the whole material
  if they say "random"). The question must be answerable exclusively from the MATERIAL below.
- When the student answers, judge whether the answer is complete and correct with respect to the MATERIAL.
  * If the answer is INCOMPLETE or partly wrong: DO NOT give the correct answer right away. Instead, ask a
    short follow-up question or give a hint that leads the student toward the missing part. Be encouraging, not strict.
  * If the answer is CORRECT and complete: confirm it briefly and praise the student, fill in a small detail if
    something is missing, and then ask the NEXT question from the same topic (or ask whether the student wants to continue/change the topic).
  * If after two attempts the student still does not reach the answer, reveal the correct and complete answer
    drawn from the MATERIAL, clearly explained, and then move on.
- Always stay within the MATERIAL below — do not invent questions or answers that are not covered there.
- Write in English, briefly and clearly, in the tone of a teacher who examines but supports the student.
- Do not use the tags [SOURCE], [VERIFY WITH ...] or [NOT IN MATERIAL] in this mode.

MATERIAL:
${knowledge.materialText}`;
}

// -----------------------------------------------------------------------------
// Reasoning (adaptive thinking) — configurable via config.reasoningLevel:
// "none" | "low" | "medium" | "high" | "xhigh" | "max"
// When != "none", we send thinking:{type:"adaptive"} + output_config:{effort}.
// max_tokens must leave enough room for both thinking and the answer, so we
// increase it depending on the level (a heuristic, not a strict guarantee).
// -----------------------------------------------------------------------------

const REASONING_EXTRA_TOKENS = {
  none: 0,
  low: 2000,
  medium: 6000,
  high: 12000,
  xhigh: 18000,
  max: 24000
};

function buildRequestBody(systemPrompt, messages) {
  const level = config.reasoningLevel || 'none';
  const extra = REASONING_EXTRA_TOKENS[level] ?? 0;

  const body = {
    model: config.model,
    max_tokens: (config.maxTokens || 1000) + extra,
    // The system prompt carries the whole knowledge base, so it is cached: repeat
    // requests within a few minutes reuse it instead of paying for it again.
    system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
    messages,
    stream: true
  };

  if (level !== 'none') {
    body.thinking = { type: 'adaptive' };
    body.output_config = { effort: level };
  }

  return body;
}

// -----------------------------------------------------------------------------
// Express app
// -----------------------------------------------------------------------------

const app = express();
app.use(express.json());

// Logs every HTTP request: method, path, status code and duration.
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    log('info', `${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`);
  });
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

// The frontend reads branding, quiz topics and demo questions from here — nothing is
// hardcoded in the HTML/JS, everything comes from config/ and data/.
app.get('/api/config', (req, res) => {
  res.json({
    appTitle: config.appTitle,
    tutorName: config.tutorName,
    subjectNameCap: config.subjectNameCap,
    tagline: config.tagline,
    model: config.model,
    reasoningLevel: config.reasoningLevel || 'none',
    topics: knowledge.topics.map(t => t.title),
    sampleQuestions
  });
});

// Manual reload of the knowledge base/configuration without restarting the server — useful
// when the teacher edits knowledge.md and wants to see the change right away.
app.post('/api/reload', (req, res) => {
  try {
    config = loadConfig();
    knowledge = loadKnowledge();
    sampleQuestions = loadSampleQuestions();
    res.json({ ok: true, topics: knowledge.topics.length });
    log('info', `reload ok topics=${knowledge.topics.length}`);
  } catch (err) {
    log('error', 'Reload failed', { error: err.message });
    res.status(500).json({ error: 'Failed to load: ' + err.message });
  }
});

// The only endpoint that calls the Anthropic API. mode='ask' -> QA prompt (stateless,
// a single question). mode='quiz' -> quiz prompt, the client sends the ENTIRE conversation
// history in messages (the server keeps no session - simpler and sufficient for an MVP).
//
// Streams the answer back to the client as Server-Sent Events using its own simple
// protocol (it does not forward the raw Anthropic SSE 1:1):
//   event: status   data: {"state":"thinking"|"answering"}
//   event: delta    data: {"text":"..."}       (answer text only, thinking is not sent to the client)
//   event: done     data: {}
//   event: error    data: {"message":"..."}
app.post('/api/chat', async (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({
      error: 'The server has no ANTHROPIC_API_KEY configured. See .env.example.'
    });
  }

  const { mode, messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Missing messages array.' });
  }

  const chatStart = Date.now();
  const lastMessage = messages[messages.length - 1];
  const preview = typeof lastMessage?.content === 'string'
    ? lastMessage.content.slice(0, 120).replace(/\s+/g, ' ')
    : '';
  log('info', `chat start mode=${mode || 'ask'} messages=${messages.length} preview="${preview}"`);

  const systemPrompt = mode === 'quiz' ? buildQuizSystemPrompt() : buildQaSystemPrompt();
  const requestBody = buildRequestBody(systemPrompt, messages);

  let upstream;
  try {
    upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    });
  } catch (err) {
    log('error', 'Error communicating with the model', { mode, error: err.message });
    return res.status(500).json({ error: 'Error communicating with the model: ' + err.message });
  }

  // If the request itself is rejected (bad key, bad model, etc.), Anthropic returns
  // plain (non-streamed) JSON — forward it as a normal error, not SSE.
  if (!upstream.ok) {
    const errData = await upstream.json().catch(() => ({}));
    log('error', 'Anthropic API error', { mode, status: upstream.status, error: errData });
    return res.status(upstream.status).json({ error: errData.error?.message || 'Anthropic API error' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const sendEvent = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const chunks = buffer.split('\n\n');
      buffer = chunks.pop(); // the last, possibly incomplete chunk waits for the next read

      for (const chunk of chunks) {
        const dataLine = chunk.split('\n').find(l => l.startsWith('data: '));
        if (!dataLine) continue;
        let evt;
        try { evt = JSON.parse(dataLine.slice(6)); } catch { continue; }

        if (evt.type === 'content_block_start') {
          if (evt.content_block?.type === 'thinking') sendEvent('status', { state: 'thinking' });
          if (evt.content_block?.type === 'text') sendEvent('status', { state: 'answering' });
        } else if (evt.type === 'content_block_delta') {
          if (evt.delta?.type === 'text_delta') sendEvent('delta', { text: evt.delta.text });
          // thinking_delta is intentionally not forwarded to the client (the student should not see raw reasoning)
        } else if (evt.type === 'error') {
          sendEvent('error', { message: evt.error?.message || 'Anthropic streaming error' });
        }
      }
    }
    sendEvent('done', {});
    log('info', `chat done mode=${mode || 'ask'} ${Date.now() - chatStart}ms`);
  } catch (err) {
    log('error', 'Stream error', { mode, error: err.message });
    sendEvent('error', { message: 'Stream error: ' + err.message });
  } finally {
    res.end();
  }
});

app.listen(PORT, () => {
  log('info', `${config.appTitle} running at http://localhost:${PORT}`);
  log('info', `Topics loaded from knowledge base: ${knowledge.topics.length}`);
  if (knowledge.topics.length === 0) {
    log('warn', 'No topics found in data/knowledge.md — each topic must start with "## Topic name".');
  }
  log('info', `Model: ${config.model} · Reasoning level: ${config.reasoningLevel || 'none'}`);
  if (!API_KEY) {
    log('warn', 'ANTHROPIC_API_KEY is not set (see .env.example) — /api/chat will not work.');
  }
});
