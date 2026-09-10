# AI Tutor

Mala web aplikacija: AI tutor uzemljen u sopstvenu bazu znanja, sa Q&A i "Provera znanja"
(usmeni-ispit) režimom. API ključ se čuva na serveru, nikad u browseru.

## Pokretanje (lokalno)

```bash
npm install
cp .env.example .env
# otvori .env i upiši svoj pravi ANTHROPIC_API_KEY (console.anthropic.com -> API Keys)
npm start
```

Otvori http://localhost:3000

## Struktura projekta

```
config/app.config.json    <- brendiranje + model + reasoning level
data/knowledge.md         <- BAZA ZNANJA - sav materijal na kom je AI uzemljen
data/sample-questions.json<- demo pitanja za dugmad u "Pitaj" režimu
server.js                 <- backend (Express) - jedini fajl koji zna za API ključ
public/                   <- frontend (HTML/CSS/JS), ne dira se za promenu predmeta
```

## Konfigurabilan model i reasoning (extended thinking)

U `config/app.config.json`:

```json
{
  "model": "claude-sonnet-5",
  "maxTokens": 1000,
  "reasoningLevel": "none"
}
```

- `model` — bilo koji važeći Anthropic model string (npr. `claude-sonnet-5`, `claude-opus-5`,
  `claude-haiku-4-5-20251001`). Jači model = bolji odgovori, sporije i skuplje.
- `reasoningLevel` — `"none"` (podrazumevano, najbrže) ili `"low" | "medium" | "high" | "xhigh" | "max"`.
  Kad nije `"none"`, server automatski šalje `thinking: {"type":"adaptive"}` i
  `output_config: {"effort": <nivo>}` Anthropic API-ju, i uvećava `max_tokens` da ostavi prostora i
  za razmišljanje i za odgovor. Model sam odlučuje *da li* će razmišljati na svako pitanje (adaptivno)
  — `reasoningLevel` samo podešava koliko je sklon da to uradi i koliko duboko.
  Napomena: koji nivoi su podržani zavisi od modela — proveri
  [Anthropic dokumentaciju](https://platform.claude.com/docs/en/build-with-claude/effort) pre nego što
  podigneš na `"high"` ili više ako primetiš da su odgovori spori ili skupi za jednostavna pitanja
  (za ovaj tutor, `"none"` ili `"low"` je verovatno dovoljno — pitanja su uglavnom direktna pretraga
  kroz materijal, ne kompleksno višekorako rezonovanje).

Odgovor se **streamuje** — učenik vidi tekst kako nastaje, red po red, umesto da čeka ceo odgovor
odjednom. Kad je `reasoningLevel` uključen, dok model razmišlja prikazuje se "Razmišlja dublje…" pre
nego što tekst počne da stiže (sirovo razmišljanje se nikad ne prikazuje učeniku, samo finalni odgovor).

## Kako promeniti temu/tutora (bez pisanja koda)

1. Otvori `config/app.config.json` i promeni `tutorName`, `subjectName`, `subjectNameCap`,
   `appTitle`, `tagline`.
2. Zameni sadržaj `data/knowledge.md` novim materijalom. Format: svaka tema počinje sa
   `## Naziv teme`, sadržaj ide ispod do sledećeg `##`. Broj tema nije ograničen - dugmad za
   "Provera znanja" i lista tema u sistemskom promptu se grade automatski iz ovog fajla.
3. (Opciono) Ažuriraj `data/sample-questions.json` za nova demo pitanja u "Pitaj" režimu.
4. Restartuj server (`npm start`), ili pozovi `POST /api/reload` da se izmene učitaju bez restarta.

Nijedan od ovih koraka ne zahteva izmenu `.js` fajlova.

## Deployment (kad se izađe iz "samo za mene" faze)

Ovo je obična Node/Express aplikacija - može na Render, Railway, Fly.io, ili sopstveni VPS.
Bitno: `ANTHROPIC_API_KEY` se podešava kao environment varijabla na hosting servisu (isto kao
u `.env` lokalno), nikad se ne stavlja u kod niti u frontend.

## Ograničenja ovog MVP-a (realno, ne skriva se)

- Nema autentifikacije/naloga učenika - svako ko ima link može da koristi. Za pravu distribuciju
  većem broju učenika, sledeći korak je dodavanje limita (npr. po IP adresi ili sa nalozima) da se
  spreči da neko slučajno ili namerno potroši ceo budžet.
- Provera znanja čuva istoriju razgovora samo u browseru učenika (u memoriji stranice, ne trajno) -
  ako osveži stranicu, gubi napredak. Za pravu verziju, to bi trebalo čuvati po učeniku (baza
  podataka), da profesor može i da vidi gde učenici najčešće greše (pomenuto ranije kao jedna od
  prednosti AI pristupa).
- Jedan model za sve (Claude Sonnet) - promenljivo u `config/app.config.json` -> `model`.
