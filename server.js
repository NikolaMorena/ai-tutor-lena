// server.js
// -----------------------------------------------------------------------------
// AI Tutor — backend
//
// Odgovornosti ovog fajla (i SAMO ovog fajla):
//   1) Čuva Anthropic API ključ server-side (iz .env, nikad ne stiže do browsera)
//   2) Učitava konfiguraciju brendiranja (config/app.config.json) i bazu znanja
//      (data/knowledge.md) i od njih gradi sistemske promptove za model
//   3) Izlaže dva mala API endpointa koje frontend zove
//   4) Servira statičke fajlove iz /public
//
// Za drugi predmet/tutora: NE DIRAJ ovaj fajl. Promeni config/app.config.json
// i data/knowledge.md (i po želji data/sample-questions.json).
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
// Učitavanje i parsiranje baze znanja / konfiguracije
// -----------------------------------------------------------------------------

function loadConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

function loadSampleQuestions() {
  if (!fs.existsSync(SAMPLE_Q_PATH)) return [];
  return JSON.parse(fs.readFileSync(SAMPLE_Q_PATH, 'utf8'));
}

// Parsira knowledge.md: svaka "## Naslov" sekcija postaje jedna tema.
// Vraća { topics: [{title, content}], materialText: "[MATERIJAL 1 — ...]\n...\n\n[MATERIJAL 2 — ...]..." }
function loadKnowledge() {
  const raw = fs.readFileSync(KNOWLEDGE_PATH, 'utf8');
  // ukloni HTML komentar sa vrha fajla (uputstvo za uređivanje), ne ide modelu
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
    .map((t, i) => `[MATERIJAL ${i + 1} — ${t.title}]\n${t.content}`)
    .join('\n\n');

  return { topics, materialText };
}

let config = loadConfig();
let knowledge = loadKnowledge();
let sampleQuestions = loadSampleQuestions();

// -----------------------------------------------------------------------------
// Građenje sistemskih promptova (isti principi kao u prototipu: uzemljeno u
// materijal, tri nivoa pouzdanosti za Q&A mod, Sokratski dijalog za quiz mod)
// -----------------------------------------------------------------------------

function buildQaSystemPrompt() {
  return `Ti si AI asistent za pripremu prijemnog ispita iz ${config.subjectName}, napravljen za
profesorku/profesora ${config.tutorName}, koji drži privatne časove. Odgovaraš isključivo na osnovu
materijala koji je dat ispod, u tagu MATERIJAL.

Pravila:
- Ako pitanje pokriva materijal ispod, odgovori jasno, korak po korak, kao profesor koji objašnjava učeniku.
  Na kraju dodaj liniju u formatu: [IZVOR: naziv materijala].
- Ako pitanje NIJE pokriveno materijalom ispod, ali je iz oblasti ${config.subjectName} (ili srodnih
  oblasti koje se sa njom prepliću) i ti sa sigurnošću znaš tačan odgovor iz opšteg naučnog znanja —
  SLOBODNO odgovori, jasno i tačno, korak po korak. Ali na kraju OBAVEZNO dodaj liniju u formatu:
  [PROVERITI SA ${config.tutorName.toUpperCase()}] jer odgovor nije proveren protiv materijala i
  metodologije profesora, iako je naučno tačan.
- Ako pitanje uopšte nije iz oblasti ${config.subjectName}, ili ako nisi siguran u tačnost odgovora,
  jasno reci da ne možeš pouzdano da odgovoriš i predloži da se pita profesor direktno.
  Format: [NIJE U MATERIJALU]
- Piši na srpskom jeziku, jasno i sažeto, prilagođeno srednjoškolcu koji se sprema za prijemni.
- Ne izmišljaj podatke, brojeve ili činjenice u koje nisi siguran — u tom slučaju koristi
  [NIJE U MATERIJALU] umesto nagađanja.

MATERIJAL:
${knowledge.materialText}`;
}

function buildQuizSystemPrompt() {
  return `Ti si AI ispitivač za pripremu prijemnog ispita iz ${config.subjectName}, napravljen za
profesorku/profesora ${config.tutorName}, koji drži privatne časove. Vodiš usmenu proveru znanja sa
učenikom, isključivo na osnovu materijala datog ispod u tagu MATERIJAL.

Način rada (ponašaj se kao profesor na usmenom ispitu):
- Postavljaš JEDNO pitanje odjednom, iz teme koju ti učenik navede (ili nasumično iz celog materijala
  ako kaže "nasumično"). Pitanje mora biti odgovorivo isključivo iz MATERIJALA ispod.
- Kad učenik odgovori, proceni da li je odgovor kompletan i tačan u odnosu na MATERIJAL.
  * Ako je odgovor NEPOTPUN ili delimično pogrešan: NEMOJ odmah dati tačan odgovor. Umesto toga postavi
    kratko pod-pitanje ili nagoveštaj koji učenika vodi ka delu koji nedostaje. Budi ohrabrujući, ne strog.
  * Ako je odgovor TAČAN i kompletan: potvrdi to kratko i pohvali, po potrebi dopuni sitnicu ako nešto
    fali, i onda postavi SLEDEĆE pitanje iz iste teme (ili pitaj da li učenik želi da nastavi/promeni temu).
  * Ako učenik nakon dva pokušaja i dalje ne dođe do odgovora, otkrij tačan i kompletan odgovor izvučen
    iz MATERIJALA, jasno objašnjen, pa nastavi dalje.
- Uvek ostani u okviru MATERIJALA ispod — ne izmišljaj pitanja niti odgovore koji nisu tamo pokriveni.
- Piši na srpskom jeziku, kratko i jasno, tonom profesora koji ispituje ali podržava učenika.
- Ne koristi tagove [IZVOR], [PROVERITI SA ...] ni [NIJE U MATERIJALU] u ovom režimu.

MATERIJAL:
${knowledge.materialText}`;
}

// -----------------------------------------------------------------------------
// Reasoning (adaptive thinking) — konfigurabilno preko config.reasoningLevel:
// "none" | "low" | "medium" | "high" | "xhigh" | "max"
// Kad je != "none", šaljemo thinking:{type:"adaptive"} + output_config:{effort}.
// max_tokens mora imati dovoljno prostora i za razmišljanje i za odgovor, pa ga
// uvećavamo u zavisnosti od nivoa (heuristika, ne stroga garancija).
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
    system: systemPrompt,
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
app.use(express.static(path.join(__dirname, 'public')));

// Frontend čita brending, teme za quiz i demo pitanja odavde — ništa nije
// hardkodovano u HTML/JS, sve dolazi iz config/ i data/.
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

// Ručni reload baze znanja/konfiguracije bez restarta servera — korisno kad
// profesor uređuje knowledge.md i želi odmah da vidi promenu.
app.post('/api/reload', (req, res) => {
  try {
    config = loadConfig();
    knowledge = loadKnowledge();
    sampleQuestions = loadSampleQuestions();
    res.json({ ok: true, topics: knowledge.topics.length });
  } catch (err) {
    res.status(500).json({ error: 'Greška pri učitavanju: ' + err.message });
  }
});

// Jedini endpoint koji zove Anthropic API. mode='pitaj' -> QA prompt (stateless,
// jedno pitanje). mode='provera' -> quiz prompt, klijent šalje CELU istoriju
// razgovora u messages (server ne drži sesiju - jednostavnije i dovoljno za MVP).
//
// Streamuje odgovor nazad klijentu kao Server-Sent Events sa sopstvenim, prostim
// protokolom (ne prosleđuje sirov Anthropic SSE 1:1):
//   event: status   data: {"state":"thinking"|"answering"}
//   event: delta    data: {"text":"..."}       (samo tekst odgovora, thinking se ne šalje klijentu)
//   event: done     data: {}
//   event: error    data: {"message":"..."}
app.post('/api/chat', async (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({
      error: 'Server nema podešen ANTHROPIC_API_KEY. Vidi .env.example.'
    });
  }

  const { mode, messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Nedostaje messages niz.' });
  }

  const systemPrompt = mode === 'provera' ? buildQuizSystemPrompt() : buildQaSystemPrompt();
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
    return res.status(500).json({ error: 'Greška u komunikaciji sa modelom: ' + err.message });
  }

  // Ako je sam zahtev odbijen (loš ključ, loš model, itd.), Anthropic vraća
  // običan (ne-streamovan) JSON — prosledi ga kao normalnu grešku, ne SSE.
  if (!upstream.ok) {
    const errData = await upstream.json().catch(() => ({}));
    console.error('Anthropic API greška:', errData);
    return res.status(upstream.status).json({ error: errData.error?.message || 'Anthropic API greška' });
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
      buffer = chunks.pop(); // poslednji, možda nekompletan deo, čeka sledeći read

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
          // thinking_delta se namerno ne prosleđuje klijentu (učenik ne treba da vidi sirovo rezonovanje)
        } else if (evt.type === 'error') {
          sendEvent('error', { message: evt.error?.message || 'Anthropic streaming greška' });
        }
      }
    }
    sendEvent('done', {});
  } catch (err) {
    console.error(err);
    sendEvent('error', { message: 'Greška u streamu: ' + err.message });
  } finally {
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`${config.appTitle} radi na http://localhost:${PORT}`);
  console.log(`Učitano tema iz baze znanja: ${knowledge.topics.length}`);
  console.log(`Model: ${config.model} · Reasoning level: ${config.reasoningLevel || 'none'}`);
  if (!API_KEY) {
    console.warn('UPOZORENJE: ANTHROPIC_API_KEY nije podešen (vidi .env.example) — /api/chat neće raditi.');
  }
});
