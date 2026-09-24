// app.js — frontend logic. Contains no API key and nothing specific to the
// subject/tutor (all of that comes from the server via /api/config).

let mode = 'ask'; // 'ask' | 'quiz'
let quizHistory = [];
let quizStarted = false;
let msgCount = 0;

const chat = document.getElementById('chat');
const input = document.getElementById('input');
const sendBtn = document.getElementById('send');

// ---------------------------------------------------------------------------
// Markdown -> HTML (same small parser as in the prototype: ##, **, *, `, lists)
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
  const srcMatch = rawText.match(/\[(SOURCE:[^\]]+|VERIFY WITH [^\]]+|NOT IN MATERIAL)\]/);
  let body = rawText;
  let srcLine = null;
  if(srcMatch){ body = rawText.replace(srcMatch[0], '').trim(); srcLine = srcMatch[1]; }

  bubbleEl.innerHTML = mdToHtml(body);

  if(srcLine){
    const src = document.createElement('span');
    src.className = 'src';
    if(srcLine.startsWith('SOURCE')){
      src.textContent = '✓ ' + srcLine;
      src.classList.add('src-ok');
    } else if(srcLine.startsWith('VERIFY WITH')){
      src.textContent = '◐ Outside the curriculum — ' + srcLine.toLowerCase() + ' before relying on it';
      src.classList.add('src-check');
    } else {
      src.textContent = '⚠ Not in the material / not reliable — ask the teacher directly';
      src.classList.add('src-miss');
    }
    bubbleEl.appendChild(src);
  }
  scrollChatToBottom();
}

// ---------------------------------------------------------------------------
// Streaming (SSE) call to the backend. NOT to the Anthropic API directly —
// the server holds the key. Protocol (defined in server.js):
//   event: status  {"state":"thinking"|"answering"}
//   event: delta   {"text":"..."}   (appended cumulatively)
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
    throw new Error(data.error || ('Server error ' + response.status));
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
      // 'done' needs no special handling - the loop ends naturally
    }
  }
  return fullText;
}

async function ask(question){
  addMessage('user', question);
  const pendingBubble = addMessage('assistant', 'Checking the material…', true);
  sendBtn.disabled = true;
  let started = false;
  try{
    const fullText = await streamBackend(
      'ask',
      [{ role: 'user', content: question }],
      (partial) => {
        if(!started){ pendingBubble.classList.remove('pending'); started = true; }
        pendingBubble.innerHTML = mdToHtml(partial);
        scrollChatToBottom();
      },
      (state) => {
        if(state === 'thinking' && !started){ pendingBubble.textContent = 'Thinking deeper…'; }
      }
    );
    renderAnswer(pendingBubble, fullText); // final pass: strips the [SOURCE]/[VERIFY...] tag, adds the badge
  } catch(err){
    renderAnswer(pendingBubble, 'Error: ' + err.message + ' [NOT IN MATERIAL]');
    console.error(err);
  } finally {
    sendBtn.disabled = false;
  }
}

async function startQuiz(topic){
  quizHistory = [];
  quizStarted = true;
  input.disabled = false;
  input.placeholder = 'Type your answer…';
  addMessage('user', 'Knowledge check — topic: ' + topic);
  const pendingBubble = addMessage('assistant', 'Coming up with a question…', true);
  sendBtn.disabled = true;
  const starter = `Ask me the first question on the topic: ${topic}. Wait for my answer before you continue.`;
  quizHistory.push({ role: 'user', content: starter });
  let started = false;
  try{
    const fullText = await streamBackend(
      'quiz', quizHistory,
      (partial) => {
        if(!started){ pendingBubble.classList.remove('pending'); started = true; }
        pendingBubble.innerHTML = mdToHtml(partial);
        scrollChatToBottom();
      },
      (state) => { if(state === 'thinking' && !started){ pendingBubble.textContent = 'Thinking deeper…'; } }
    );
    quizHistory.push({ role: 'assistant', content: fullText });
    renderAnswer(pendingBubble, fullText);
  } catch(err){
    renderAnswer(pendingBubble, 'Error: ' + err.message);
    console.error(err);
    quizStarted = false;
  } finally {
    sendBtn.disabled = false;
  }
}

async function askQuiz(answerText){
  addMessage('user', answerText);
  const pendingBubble = addMessage('assistant', 'Thinking…', true);
  sendBtn.disabled = true;
  quizHistory.push({ role: 'user', content: answerText });
  let started = false;
  try{
    const fullText = await streamBackend(
      'quiz', quizHistory,
      (partial) => {
        if(!started){ pendingBubble.classList.remove('pending'); started = true; }
        pendingBubble.innerHTML = mdToHtml(partial);
        scrollChatToBottom();
      },
      (state) => { if(state === 'thinking' && !started){ pendingBubble.textContent = 'Thinking deeper…'; } }
    );
    quizHistory.push({ role: 'assistant', content: fullText });
    renderAnswer(pendingBubble, fullText);
  } catch(err){
    renderAnswer(pendingBubble, 'Error: ' + err.message);
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
  if(mode === 'quiz'){
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
  if(mode === 'quiz'){
    input.disabled = true;
    input.placeholder = 'Pick a topic above to start the knowledge check…';
  } else {
    input.disabled = false;
    input.placeholder = 'Ask a question about the material…';
  }
}

function setMode(newMode){
  mode = newMode;
  const askActive = mode === 'ask';
  document.getElementById('tabAsk').classList.toggle('active', askActive);
  document.getElementById('tabQuiz').classList.toggle('active', !askActive);
  document.getElementById('scopeNoteAsk').style.display = askActive ? '' : 'none';
  document.getElementById('scopeNoteQuiz').style.display = askActive ? 'none' : '';
  document.getElementById('chipsAsk').style.display = askActive ? '' : 'none';
  document.getElementById('chipsQuiz').style.display = askActive ? 'none' : '';
  resetConversationState();
}

// ---------------------------------------------------------------------------
// Initialization: fetch config from the server and build the UI (title, topics, buttons)
// ---------------------------------------------------------------------------

async function init(){
  const res = await fetch('/api/config');
  const cfg = await res.json();

  document.title = cfg.appTitle;
  document.getElementById('appTitle').textContent = cfg.appTitle;
  document.getElementById('tagline').textContent = cfg.tagline;
  document.getElementById('tutorInitial').textContent = cfg.tutorName.charAt(0) + '.';
  document.getElementById('tutorNameLower').textContent = cfg.tutorName.toLowerCase();

  document.getElementById('scopeNoteAsk').innerHTML =
    `<b>Prototype.</b> Answers come from the knowledge base provided by the tutor ${cfg.tutorName}
     (subject: ${cfg.subjectNameCap}). Questions covered by the material get an answer marked <b>✓ SOURCE</b>.
     Questions outside the material still get an answer (from the model's general knowledge), but with the note
     <b>◐ verify with teacher</b>.`;

  document.getElementById('footerLine').innerHTML =
    `Model: <b>${cfg.model}</b> · Reasoning: <b>${cfg.reasoningLevel}</b>`;

  const chipsAsk = document.getElementById('chipsAsk');
  cfg.sampleQuestions.forEach(sq => {
    const btn = document.createElement('button');
    btn.className = 'chip';
    btn.textContent = sq.label;
    btn.addEventListener('click', () => ask(sq.question));
    chipsAsk.appendChild(btn);
  });

  const chipsQuiz = document.getElementById('chipsQuiz');
  cfg.topics.forEach(topic => {
    const btn = document.createElement('button');
    btn.className = 'chip chip-topic';
    btn.textContent = topic;
    btn.addEventListener('click', () => startQuiz(topic));
    chipsQuiz.appendChild(btn);
  });
  const randomBtn = document.createElement('button');
  randomBtn.className = 'chip chip-topic';
  randomBtn.textContent = 'random';
  randomBtn.addEventListener('click', () => startQuiz('random, your choice from the whole material'));
  chipsQuiz.appendChild(randomBtn);

  resetConversationState();
}

sendBtn.addEventListener('click', trigger);
input.addEventListener('keydown', (e) => {
  if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); trigger(); }
});
document.getElementById('clearBtn').addEventListener('click', resetConversationState);
document.getElementById('tabAsk').addEventListener('click', () => setMode('ask'));
document.getElementById('tabQuiz').addEventListener('click', () => setMode('quiz'));

init();
