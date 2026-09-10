// app.js — frontend logika. Ne sadrži API ključ niti bilo šta specifično za
// predmet/tutora (to sve dolazi sa servera preko /api/config).

let mode = 'pitaj'; // 'pitaj' | 'provera'
let quizHistory = [];
let quizStarted = false;
let msgCount = 0;

const chat = document.getElementById('chat');
const input = document.getElementById('input');
const sendBtn = document.getElementById('send');

// ---------------------------------------------------------------------------
// Markdown -> HTML (isti mali parser kao u prototipu: ##, **, *, `, liste)
// ---------------------------------------------------------------------------

function escapeHtml(str){
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function mdToHtml(raw){
  const lines = escapeHtml(raw).split('\n');
  let html = '';
  let listType = null;

  function closeList(){
    if(listType){ html += listType === 'ul' ? '</ul>' : '</ol>'; listType = null; }
  }
  function inline(text){
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
  }

  for(let line of lines){
    const trimmed = line.trim();
    if(trimmed === ''){ closeList(); continue; }

    const h = trimmed.match(/^(#{1,4})\s+(.*)$/);
    if(h){ closeList(); html += `<div class="md-h md-h${h[1].length}">${inline(h[2])}</div>`; continue; }

    const ol = trimmed.match(/^\d+[\.\)]\s+(.*)$/);
    if(ol){ if(listType!=='ol'){closeList(); html+='<ol>'; listType='ol';} html += `<li>${inline(ol[1])}</li>`; continue; }

    const ul = trimmed.match(/^[-*•]\s+(.*)$/);
    if(ul){ if(listType!=='ul'){closeList(); html+='<ul>'; listType='ul';} html += `<li>${inline(ul[1])}</li>`; continue; }

    closeList();
    html += `<p>${inline(trimmed)}</p>`;
  }
  closeList();
  return html;
}

// ---------------------------------------------------------------------------
// Chat UI
// ---------------------------------------------------------------------------

function scrollChatToBottom(){ chat.scrollTop = chat.scrollHeight; }

function addMessage(role, text, pending=false){
  msgCount++;
  const row = document.createElement('div');
  row.className = 'msg ' + (role === 'user' ? 'user' : 'assistant');

  const idx = document.createElement('div');
  idx.className = 'tile-idx';
  idx.textContent = String(msgCount).padStart(2,'0');

  const bubble = document.createElement('div');
  bubble.className = 'bubble' + (pending ? ' pending' : '');
  bubble.textContent = text;

  if(role === 'user'){ row.appendChild(bubble); row.appendChild(idx); }
  else { row.appendChild(idx); row.appendChild(bubble); }

  chat.appendChild(row);
  scrollChatToBottom();
  return bubble;
}

function renderAnswer(bubbleEl, rawText){
  bubbleEl.classList.remove('pending');
  const srcMatch = rawText.match(/\[(IZVOR:[^\]]+|PROVERITI SA [^\]]+|NIJE U MATERIJALU)\]/);
  let body = rawText;
  let srcLine = null;
  if(srcMatch){ body = rawText.replace(srcMatch[0], '').trim(); srcLine = srcMatch[1]; }

  bubbleEl.innerHTML = mdToHtml(body);

  if(srcLine){
    const src = document.createElement('span');
    src.className = 'src';
    if(srcLine.startsWith('IZVOR')){
      src.textContent = '✓ ' + srcLine;
      src.classList.add('src-ok');
    } else if(srcLine.startsWith('PROVERITI SA')){
      src.textContent = '◐ Van gradiva — ' + srcLine.toLowerCase().replace('proveriti sa', 'proveriti sa') + ' pre nego što se prosledi učeniku';
      src.classList.add('src-check');
    } else {
      src.textContent = '⚠ Nije u materijalu / nije pouzdano — pitati profesora direktno';
      src.classList.add('src-miss');
    }
    bubbleEl.appendChild(src);
  }
  scrollChatToBottom();
}

// ---------------------------------------------------------------------------
// Poziv ka backend-u preko streaminga (SSE). NE ka Anthropic API-ju direktno —
// server drži ključ. Protokol (definisan u server.js):
//   event: status  {"state":"thinking"|"answering"}
//   event: delta   {"text":"..."}   (kumulativno se nadovezuje)
//   event: done    {}
//   event: error   {"message":"..."}
// ---------------------------------------------------------------------------

async function streamBackend(mode, messages, onDelta, onStatus){
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode, messages })
  });

  if(!response.ok){
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || ('Server greška ' + response.status));
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';

  while(true){
    const { done, value } = await reader.read();
    if(done) break;
    buffer += decoder.decode(value, { stream: true });

    const chunks = buffer.split('\n\n');
    buffer = chunks.pop();

    for(const chunk of chunks){
      let eventType = null, dataStr = null;
      for(const line of chunk.split('\n')){
        if(line.startsWith('event: ')) eventType = line.slice(7).trim();
        if(line.startsWith('data: ')) dataStr = line.slice(6);
      }
      if(!dataStr) continue;
      let payload;
      try{ payload = JSON.parse(dataStr); } catch { continue; }

      if(eventType === 'status'){ onStatus && onStatus(payload.state); }
      else if(eventType === 'delta'){ fullText += payload.text; onDelta && onDelta(fullText); }
      else if(eventType === 'error'){ throw new Error(payload.message); }
      // 'done' ne treba posebnu obradu - petlja se prirodno završava
    }
  }
  return fullText;
}

async function ask(question){
  addMessage('user', question);
  const pendingBubble = addMessage('assistant', 'Proveravam gradivo…', true);
  sendBtn.disabled = true;
  let started = false;
  try{
    const fullText = await streamBackend(
      'pitaj',
      [{ role: 'user', content: question }],
      (partial) => {
        if(!started){ pendingBubble.classList.remove('pending'); started = true; }
        pendingBubble.innerHTML = mdToHtml(partial);
        scrollChatToBottom();
      },
      (state) => {
        if(state === 'thinking' && !started){ pendingBubble.textContent = 'Razmišlja dublje…'; }
      }
    );
    renderAnswer(pendingBubble, fullText); // finalni prolaz: skida [IZVOR]/[PROVERITI...] tag, dodaje bedž
  } catch(err){
    renderAnswer(pendingBubble, 'Greška: ' + err.message + ' [NIJE U MATERIJALU]');
    console.error(err);
  } finally {
    sendBtn.disabled = false;
  }
}

async function startQuiz(topic){
  quizHistory = [];
  quizStarted = true;
  input.disabled = false;
  input.placeholder = 'Upiši svoj odgovor…';
  addMessage('user', 'Provera znanja — tema: ' + topic);
  const pendingBubble = addMessage('assistant', 'Smišljam pitanje…', true);
  sendBtn.disabled = true;
  const starter = `Postavi mi prvo pitanje iz teme: ${topic}. Sačekaj moj odgovor pre nego što nastaviš.`;
  quizHistory.push({ role: 'user', content: starter });
  let started = false;
  try{
    const fullText = await streamBackend(
      'provera', quizHistory,
      (partial) => {
        if(!started){ pendingBubble.classList.remove('pending'); started = true; }
        pendingBubble.innerHTML = mdToHtml(partial);
        scrollChatToBottom();
      },
      (state) => { if(state === 'thinking' && !started){ pendingBubble.textContent = 'Razmišlja dublje…'; } }
    );
    quizHistory.push({ role: 'assistant', content: fullText });
    renderAnswer(pendingBubble, fullText);
  } catch(err){
    renderAnswer(pendingBubble, 'Greška: ' + err.message);
    console.error(err);
    quizStarted = false;
  } finally {
    sendBtn.disabled = false;
  }
}

async function askQuiz(answerText){
  addMessage('user', answerText);
  const pendingBubble = addMessage('assistant', 'Razmišljam…', true);
  sendBtn.disabled = true;
  quizHistory.push({ role: 'user', content: answerText });
  let started = false;
  try{
    const fullText = await streamBackend(
      'provera', quizHistory,
      (partial) => {
        if(!started){ pendingBubble.classList.remove('pending'); started = true; }
        pendingBubble.innerHTML = mdToHtml(partial);
        scrollChatToBottom();
      },
      (state) => { if(state === 'thinking' && !started){ pendingBubble.textContent = 'Razmišlja dublje…'; } }
    );
    quizHistory.push({ role: 'assistant', content: fullText });
    renderAnswer(pendingBubble, fullText);
  } catch(err){
    renderAnswer(pendingBubble, 'Greška: ' + err.message);
    console.error(err);
    quizHistory.pop();
  } finally {
    sendBtn.disabled = false;
  }
}

function trigger(){
  const q = input.value.trim();
  if(!q) return;
  input.value = '';
  if(mode === 'provera'){
    if(!quizStarted) return;
    askQuiz(q);
  } else {
    ask(q);
  }
}

function resetConversationState(){
  chat.innerHTML = '';
  msgCount = 0;
  input.value = '';
  quizHistory = [];
  quizStarted = false;
  if(mode === 'provera'){
    input.disabled = true;
    input.placeholder = 'Izaberi temu iznad da počneš proveru znanja…';
  } else {
    input.disabled = false;
    input.placeholder = 'Postavi pitanje iz gradiva…';
  }
}

function setMode(newMode){
  mode = newMode;
  const pitajActive = mode === 'pitaj';
  document.getElementById('tabPitaj').classList.toggle('active', pitajActive);
  document.getElementById('tabProvera').classList.toggle('active', !pitajActive);
  document.getElementById('scopeNotePitaj').style.display = pitajActive ? '' : 'none';
  document.getElementById('scopeNoteProvera').style.display = pitajActive ? 'none' : '';
  document.getElementById('chipsPitaj').style.display = pitajActive ? '' : 'none';
  document.getElementById('chipsProvera').style.display = pitajActive ? 'none' : '';
  resetConversationState();
}

// ---------------------------------------------------------------------------
// Inicijalizacija: povuci config sa servera i izgradi UI (naziv, teme, dugmad)
// ---------------------------------------------------------------------------

async function init(){
  const res = await fetch('/api/config');
  const cfg = await res.json();

  document.title = cfg.appTitle;
  document.getElementById('appTitle').textContent = cfg.appTitle;
  document.getElementById('tagline').textContent = cfg.tagline;
  document.getElementById('tutorInitial').textContent = cfg.tutorName.charAt(0) + '.';
  document.getElementById('tutorNameLower').textContent = cfg.tutorName.toLowerCase();

  document.getElementById('scopeNotePitaj').innerHTML =
    `<b>Prototip.</b> Materijal ispod dolazi iz baze znanja profesora/profesorke ${cfg.tutorName}
     (predmet: ${cfg.subjectNameCap}). Pitanja iz ovog gradiva dobijaju odgovor sa <b>✓ IZVOR</b>.
     Pitanja van gradiva i dalje dobijaju odgovor (iz opšteg znanja modela), ali sa napomenom
     <b>◐ proveriti sa ${cfg.tutorName}</b>.`;

  document.getElementById('footerLine').innerHTML =
    `Poziva model preko sopstvenog servera (API ključ se čuva server-side, ne u browseru).
     Model: <b>${cfg.model}</b> · Reasoning: <b>${cfg.reasoningLevel}</b>`;

  const chipsPitaj = document.getElementById('chipsPitaj');
  cfg.sampleQuestions.forEach(sq => {
    const btn = document.createElement('button');
    btn.className = 'chip';
    btn.textContent = sq.label;
    btn.addEventListener('click', () => ask(sq.question));
    chipsPitaj.appendChild(btn);
  });

  const chipsProvera = document.getElementById('chipsProvera');
  cfg.topics.forEach(topic => {
    const btn = document.createElement('button');
    btn.className = 'chip chip-topic';
    btn.textContent = topic;
    btn.addEventListener('click', () => startQuiz(topic));
    chipsProvera.appendChild(btn);
  });
  const randomBtn = document.createElement('button');
  randomBtn.className = 'chip chip-topic';
  randomBtn.textContent = 'nasumično';
  randomBtn.addEventListener('click', () => startQuiz('nasumično, po tvom izboru iz celog gradiva'));
  chipsProvera.appendChild(randomBtn);

  resetConversationState();
}

sendBtn.addEventListener('click', trigger);
input.addEventListener('keydown', (e) => {
  if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); trigger(); }
});
document.getElementById('clearBtn').addEventListener('click', resetConversationState);
document.getElementById('tabPitaj').addEventListener('click', () => setMode('pitaj'));
document.getElementById('tabProvera').addEventListener('click', () => setMode('provera'));

init();
