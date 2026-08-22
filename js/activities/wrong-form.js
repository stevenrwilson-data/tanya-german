/* Falsche Form — sentences surface, some with a broken verb, and she taps
   according to the mode: the broken ones, or the correct ones.

   Two modes rather than one because they are different skills. Hunting
   errors lets her pass by noticing that something looks odd; hunting
   correct ones makes her actually verify the form. Anyone can learn to
   spot weirdness — the second mode is the one that proves she knows the
   rule.

   The broken forms are not random. Each is the mistake the vowel-shift
   rule actually produces: the shift left off where German needs it
   ('du sehst' for 'siehst'), or carried over to a person that never takes
   it ('ich fähre'). Both are real learner errors and the second one only
   appears once someone has half-learned the rule, which makes it worth
   drilling.

   Sentences come from what she has already met — Section 1, the stories
   and the vocabulary examples — so nothing here is a sentence she has not
   seen correct somewhere else. */

window.GH = window.GH || {};

GH.wrongForm = (function(){

  /* seconds: how long the whole round lasts, and how long one sentence
     stays up inside it */
  var LEVELS = {
    veryeasy: { hearts:5, seconds:75, visible:7000, gap:2600, rounds:14, badRate:0.50, key:'cwVeryEasy' },
    easy:     { hearts:4, seconds:70, visible:6000, gap:2300, rounds:16, badRate:0.45, key:'cwEasy'     },
    medium:   { hearts:3, seconds:60, visible:5000, gap:2000, rounds:18, badRate:0.40, key:'cwMedium'   },
    hard:     { hearts:2, seconds:50, visible:4000, gap:1700, rounds:20, badRate:0.40, key:'cwHard'     },
    hardcore: { hearts:1, seconds:40, visible:3000, gap:1400, rounds:22, badRate:0.35, key:'cwHardcore' }
  };
  var ORDER = ['veryeasy', 'easy', 'medium', 'hard', 'hardcore'];
  var SLOTS = 4;
  var MODE_KEY = 'gh-wf-mode';

  var host = null, state = null;
  var spawnTimer = null, timers = [];

  function t(k, v){ return GH.i18n.t(k, v); }

  function el(tag, cls, text){
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }

  function mode(){
    try { return window.localStorage.getItem(MODE_KEY) === 'right' ? 'right' : 'wrong'; }
    catch (e){ return 'wrong'; }
  }
  function setMode(m){ try { window.localStorage.setItem(MODE_KEY, m); } catch (e){} }

  /* ---------- the pool ---------- */

  /* What a regular verb would look like, so the error is the shift being
     missed rather than something arbitrary. */
  function regularForms(inf){
    var stem = inf.replace(/e?n$/, '');
    var e = /[dt]$/.test(stem) ? 'e' : '';
    var sS = /(s|ß|z|x|tz|ss)$/.test(stem);
    return [stem + 'e', sS ? stem + e + 't' : stem + e + 'st', stem + e + 't',
            inf, stem + e + 't', inf];
  }

  var pool = null;

  function buildPool(){
    if (pool) return pool;
    var C = GH.conjugate;
    var sentences = [];
    (GH_BANK.sentences || []).forEach(function(s){ sentences.push(s.de); });
    (GH_BANK.stories || []).forEach(function(st){
      st.sentences.forEach(function(l){ sentences.push(l.de); });
    });
    (window.GH_LONG || []).forEach(function(st){
      st.sentences.forEach(function(l){ sentences.push(l.de); });
    });
    (window.GH_VOCAB || []).forEach(function(v){
      v.s.forEach(function(s){ sentences.push(s.de); });
    });

    /* every conjugated form of every shift verb, and which person it is */
    var lookup = {};
    Object.keys(C.shifts).forEach(function(inf){
      var real = C.forms(inf), reg = regularForms(inf);
      real.forEach(function(f, i){
        if (lookup[f]) return;                  /* first claim wins */
        var wrong = reg[i] !== f ? reg[i]       /* shift missed */
                  : (i === 0 ? C.shifts[inf].er.replace(/t$/, 'e') : null);
        if (!wrong || wrong === f) return;      /* no plausible error to make */
        lookup[f] = { inf:inf, person:i, wrong:wrong };
      });
    });

    var seen = {}, out = [];
    sentences.forEach(function(s){
      if (seen[s]) return;
      var words = s.replace(/[.,!?:;„“]/g, '').split(/\s+/);
      for (var i = 0; i < words.length; i++){
        var hit = lookup[words[i]];
        if (!hit) continue;
        seen[s] = true;
        out.push({ de:s, good:words[i], bad:hit.wrong, inf:hit.inf, person:hit.person });
        break;
      }
    });
    pool = out;
    return pool;
  }

  /* ---------- rounds ---------- */

  var clockTimer = null;

  function clearTimers(){
    if (spawnTimer){ clearInterval(spawnTimer); spawnTimer = null; }
    if (clockTimer){ clearInterval(clockTimer); clockTimer = null; }
    timers.forEach(function(id){ clearTimeout(id); });
    timers = [];
  }


  function begin(levelId){
    clearTimers();
    var cfg = LEVELS[levelId];
    state.levelId = levelId;
    state.cfg = cfg;
    state.hearts = cfg.hearts;
    state.score = 0;
    state.caught = 0; state.wrong = 0; state.escaped = 0;
    state.spawned = 0;
    state.slots = new Array(SLOTS);
    state.missedItems = []; state.wrongItems = [];
    state.items = GH.text.shuffle(buildPool().slice());
    state.endsAt = Date.now() + cfg.seconds * 1000;
    state.phase = 'play';
    paint();
    spawnTimer = setInterval(tick, cfg.gap);
    clockTimer = setInterval(clockTick, 250);
    tick();
  }

  /* Is this card one she is supposed to tap? */
  function isTarget(card){
    return mode() === 'wrong' ? card.broken : !card.broken;
  }

  function tick(){
    if (state.phase !== 'play') return;
    if (state.spawned >= state.cfg.rounds){
      clearInterval(spawnTimer); spawnTimer = null;
      timers.push(setTimeout(finish, state.cfg.visible + 300));
      return;
    }
    var free = [];
    for (var i = 0; i < SLOTS; i++) if (!state.slots[i]) free.push(i);
    if (!free.length) return;

    var src = state.items[state.spawned % state.items.length];
    var broken = Math.random() < state.cfg.badRate;
    var slot = free[Math.floor(Math.random() * free.length)];
    state.spawned++;

    var card = {
      slot: slot,
      broken: broken,
      shown: broken ? src.de.replace(src.good, src.bad) : src.de,
      good: src.good, bad: src.bad, inf: src.inf,
      born: Date.now(),
      dies: Date.now() + state.cfg.visible,
      gone: false
    };
    state.slots[slot] = card;
    paintSlot(slot);
    timers.push(setTimeout(function(){ expire(card); }, state.cfg.visible));
  }

  /* The round has its own clock. Running it out ends the round with
     whatever she scored — it does not cost a heart on top, because the
     hearts are for mistakes and running out of time is not one. */
  function clockTick(){
    if (state.phase !== 'play') return;
    var left = Math.max(0, state.endsAt - Date.now());
    var bar = host.querySelector('.wf-clock-bar');
    if (bar) bar.style.width = (left / (state.cfg.seconds * 1000) * 100) + '%';
    var num = host.querySelector('.wf-clock-n');
    if (num) num.textContent = Math.ceil(left / 1000);
    if (left <= 0){ state.timeUp = true; finish(); }
  }

  function expire(card){
    if (card.gone || state.phase !== 'play') return;
    card.gone = true;
    if (state.slots[card.slot] === card) state.slots[card.slot] = null;
    if (isTarget(card)){
      state.escaped++;
      state.missedItems.push(card);
      state.hearts--;
      if (GH.progress) GH.progress.record('conj:' + card.inf, false);
      flash(card.slot, 'missed');
      if (state.hearts <= 0){ finish(); return; }
    } else {
      paintSlot(card.slot);
    }
    paintStatus();
  }

  function tap(card){
    if (card.gone || state.phase !== 'play') return;
    card.gone = true;
    if (state.slots[card.slot] === card) state.slots[card.slot] = null;
    var ok = isTarget(card);
    if (ok){
      state.caught++; state.score++;
      flash(card.slot, 'hit');
      GH.speech.say(card.broken ? card.shown.replace(card.bad, card.good) : card.shown);
    } else {
      state.wrong++; state.hearts--;
      state.wrongItems.push(card);
      flash(card.slot, 'wrongtap');
    }
    if (GH.progress) GH.progress.record('conj:' + card.inf, ok);
    paintStatus();
    if (state.hearts <= 0) finish();
  }

  function finish(){
    clearTimers();
    state.phase = 'done';
    paint();
  }

  /* ---------- painting ---------- */

  function flash(slot, kind){
    var cell = host.querySelector('[data-slot="' + slot + '"]');
    if (!cell) return;
    cell.className = 'wf-cell wf-' + kind;
    timers.push(setTimeout(function(){ paintSlot(slot); }, 420));
  }

  function paintSlot(slot){
    var cell = host.querySelector('[data-slot="' + slot + '"]');
    if (!cell) return;
    cell.textContent = '';
    var card = state.slots[slot];
    if (!card){ cell.className = 'wf-cell is-empty'; return; }
    cell.className = 'wf-cell wf-up';
    cell.appendChild(el('span', 'wf-text', card.shown));
  }

  function hearts(){
    var wrap = el('span', 'cw-hearts');
    for (var i = 0; i < state.cfg.hearts; i++){
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 20 20');
      svg.setAttribute('class', 'cw-heart' + (i < state.hearts ? '' : ' spent'));
      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M10 17.5s-6.5-4.03-8.5-7.86C.36 7.4 1.2 4.4 4 3.4c1.9-.68 3.9.1 5 1.7 1.1-1.6 3.1-2.38 5-1.7 2.8 1 3.64 4 2.5 6.24C16.5 13.47 10 17.5 10 17.5z');
      svg.appendChild(path);
      wrap.appendChild(svg);
    }
    return wrap;
  }

  function paintStatus(){
    var bar = host.querySelector('.cw-status');
    if (!bar) return;
    bar.textContent = '';
    bar.appendChild(hearts());
    bar.appendChild(el('span', 'cw-score', t('cwScore', { n:state.score })));
    bar.appendChild(el('span', 'cw-left',
      t('cwLeft', { n:Math.max(0, state.cfg.rounds - state.spawned) })));
  }

  function modeToggle(){
    var wrap = el('div', 'mode-toggle');
    [['wrong', 'wfTapWrong'], ['right', 'wfTapRight']].forEach(function(pair){
      var b = el('button', null, t(pair[1]));
      b.type = 'button';
      b.setAttribute('aria-pressed', mode() === pair[0] ? 'true' : 'false');
      b.addEventListener('click', function(){ setMode(pair[0]); paint(); });
      wrap.appendChild(b);
    });
    return wrap;
  }

  function paint(){
    host.textContent = '';

    var head = el('div', 'practice-head');
    var back = el('button', 'backlink', '‹ ' + t('back'));
    back.type = 'button';
    back.addEventListener('click', function(){ clearTimers(); state.onExit(); });
    head.appendChild(back);
    var titles = el('div', 'practice-title');
    titles.appendChild(el('h1', null, t('wfTitle')));
    titles.appendChild(el('p', null, state.phase === 'pick' ? t('cgPickLevel') : t(state.cfg.key)));
    head.appendChild(titles);
    host.appendChild(head);

    if (state.phase === 'pick'){ paintLevels(); return; }
    if (state.phase === 'done'){ paintDone(); return; }

    var card = el('div', 'card');

    var banner = el('div', 'wf-banner' + (mode() === 'right' ? ' is-right' : ''));
    banner.appendChild(el('span', 'wf-banner-l', t(mode() === 'wrong' ? 'wfHuntWrong' : 'wfHuntRight')));
    card.appendChild(banner);

    card.appendChild(el('div', 'cw-status'));

    var clock = el('div', 'wf-clock');
    var track = el('div', 'wf-clock-track');
    var cbar = el('div', 'wf-clock-bar');
    cbar.style.width = '100%';
    track.appendChild(cbar);
    clock.appendChild(track);
    clock.appendChild(el('span', 'wf-clock-n', state.cfg.seconds));
    card.appendChild(clock);

    var grid = el('div', 'wf-grid');
    for (var i = 0; i < SLOTS; i++){
      var cell = el('button', 'wf-cell is-empty');
      cell.type = 'button';
      cell.setAttribute('data-slot', i);
      (function(idx){
        cell.addEventListener('click', function(){
          var c = state.slots[idx];
          if (c) tap(c);
        });
      })(i);
      grid.appendChild(cell);
    }
    card.appendChild(grid);
    host.appendChild(card);

    paintStatus();
    for (var s = 0; s < SLOTS; s++) paintSlot(s);
  }

  function paintLevels(){
    var card = el('div', 'card');
    var tools = el('div', 'card-tools');
    tools.appendChild(modeToggle());
    tools.appendChild(GH.howto.button('wfTitle', 'wfRule'));
    card.appendChild(tools);
    card.appendChild(el('p', 'cw-rules', t(mode() === 'wrong' ? 'wfRulesWrong' : 'wfRulesRight')));
    host.appendChild(card);

    var grid = el('div', 'tiles');
    ORDER.forEach(function(id){
      var d = LEVELS[id];
      var b = el('button', 'tile');
      b.type = 'button';
      b.appendChild(el('span', 'tile-glyph', '🔍'));
      b.appendChild(el('span', 'tile-name', t(d.key)));
      b.appendChild(el('span', 'tile-sub',
        t('cwHeartsN', { n:d.hearts }) + ' · ' + d.seconds + t('cwSec')));
      b.appendChild(el('span', 'tile-foot',
        t('wfSentencesN', { n:d.rounds }) + ' · ' + (d.visible / 1000) + t('cwSec') + t('wfEach')));
      b.addEventListener('click', function(){ begin(id); });
      grid.appendChild(b);
    });
    host.appendChild(grid);
  }

  /* Every card she got wrong, shown corrected, with the rule named. */
  function review(list, headKey){
    if (!list.length) return null;
    var wrap = el('div', 'cw-review');
    wrap.appendChild(el('p', 'cw-review-head cw-review-missed', t(headKey)));
    var seen = {};
    list.forEach(function(c){
      if (seen[c.shown]) return;
      seen[c.shown] = true;
      var row = el('div', 'wf-fix');
      if (c.broken){
        row.appendChild(el('p', 'wf-bad', c.shown));
        row.appendChild(el('p', 'wf-good', c.shown.replace(c.bad, c.good)));
      } else {
        row.appendChild(el('p', 'wf-good', c.shown));
      }
      row.appendChild(el('p', 'wf-rule',
        c.inf + ' · ' + t('cgKind_' + GH.conjugate.kind(c.inf).replace('-', '_'))));
      wrap.appendChild(row);
    });
    return wrap;
  }

  function paintDone(){
    var lost = state.hearts <= 0;
    var perfect = !lost && !state.wrong && !state.escaped;
    var box = el('div', 'done cw-done');
    box.appendChild(el('div', 'cw-done-glyph', perfect ? '🏆' : (lost ? '💔' : (state.timeUp ? '⏱' : '🔍'))));
    box.appendChild(el('h2', null, perfect ? t('cwPerfect')
      : (lost ? t('cwOut') : (state.timeUp ? t('wfTimeUp') : t('doneTitle')))));
    var stats = el('div', 'cw-stats');
    [[state.caught, 'cwCaught', 'good'], [state.wrong, 'cwWrong', 'bad'], [state.escaped, 'cwMissed', 'bad']]
      .forEach(function(s){
        var b = el('div', 'cw-stat cw-stat-' + s[2]);
        b.appendChild(el('span', 'cw-stat-n', s[0]));
        b.appendChild(el('span', 'cw-stat-l', t(s[1])));
        stats.appendChild(b);
      });
    box.appendChild(stats);

    var m = review(state.missedItems, 'wfMissedHead');
    if (m) box.appendChild(m);
    var w = review(state.wrongItems, 'wfWrongHead');
    if (w) box.appendChild(w);

    var acts = el('div', 'done-actions');
    var again = el('button', 'btn btn-primary', t('again'));
    again.type = 'button';
    again.addEventListener('click', function(){ begin(state.levelId); });
    var lvl = el('button', 'btn btn-ghost', t('cwChangeLevel'));
    lvl.type = 'button';
    lvl.addEventListener('click', function(){ state.phase = 'pick'; paint(); });
    var hubb = el('button', 'btn btn-ghost', t('toHub'));
    hubb.type = 'button';
    hubb.addEventListener('click', function(){ clearTimers(); state.onExit(); });
    acts.appendChild(again); acts.appendChild(lvl); acts.appendChild(hubb);
    box.appendChild(acts);
    host.appendChild(box);
  }

  function open(container, onExit){
    host = container;
    state = { onExit:onExit, phase:'pick', levelId:'medium', cfg:LEVELS.medium,
              slots:[], hearts:0, score:0 };
    paint();
  }

  return { open:open, poolSize:function(){ return buildPool().length; } };
})();

(function(){
  var entry = {
    id:'wrong-form',
    glyph:'🔍',
    name:{ ru:'Найди ошибку', de:'Falsche Form', en:'Spot the wrong form' },
    sub:{ ru:'Правильно ли стоит глагол?',
          de:'Stimmt die Verbform?',
          en:'Is the verb form right?' },
    open:GH.wrongForm.open
  };
  function register(){ if (window.GH && GH.app && GH.app.register) GH.app.register(entry); }
  if (window.GH && GH.app && GH.app.register) register();
  else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', register);
  else register();
})();
