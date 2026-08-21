/* Поймай слово — words surface in a 3×3 grid; tap the ones belonging to
   the announced topic before they vanish, leave the rest alone.

   The point is association rather than translation. She does not have to
   remember what 'die Zahnbürste' means — only that it belongs with the
   bathroom. Getting that wiring in place first makes the meaning easier
   to hang on later, which is why a wrong tap costs something: tapping
   everything that moves would build no association at all.

   Difficulty follows the pink math ladder — veryeasy through hardcore,
   hearts counting down to 1, hardcore as sudden death — and scales four
   things at once: hearts, how long a word stays up, how fast they
   arrive, and how few of them belong. */

window.GH = window.GH || {};

GH.catchWord = (function(){

  var DIFFICULTY = {
    veryeasy: { hearts:5, visible:4000, gap:1700, spawns:20, hitRate:0.50, look:8, key:'cwVeryEasy' },
    easy:     { hearts:4, visible:3500, gap:1500, spawns:24, hitRate:0.45, look:7, key:'cwEasy'     },
    medium:   { hearts:3, visible:3000, gap:1300, spawns:28, hitRate:0.40, look:6, key:'cwMedium'   },
    hard:     { hearts:2, visible:2000, gap:1000, spawns:32, hitRate:0.35, look:5, key:'cwHard'     },
    hardcore: { hearts:1, visible:1500, gap:800,  spawns:36, hitRate:0.33, look:4, key:'cwHardcore' }
  };

  var ORDER = ['veryeasy', 'easy', 'medium', 'hard', 'hardcore'];

  var HEART_PATH = 'M10 17.5s-6.5-4.03-8.5-7.86C.36 7.4 1.2 4.4 4 3.4c1.9-.68 3.9.1 5 1.7 1.1-1.6 3.1-2.38 5-1.7 2.8 1 3.64 4 2.5 6.24C16.5 13.47 10 17.5 10 17.5z';

  /* Topics that shade into each other. A 'Кухня' round must not offer
     'der Kochtopf' as a wrong answer — it is tagged Еда but any sane
     person calls it kitchen, and punishing her for being right teaches
     the wrong lesson. Distractors are drawn only from topics that are
     not listed here as neighbours. */
  var NEIGHBOURS = {
    kitchen:  ['food', 'home'],
    food:     ['kitchen'],
    home:     ['kitchen', 'bath'],
    bath:     ['body', 'beauty', 'home'],
    body:     ['bath', 'beauty'],
    beauty:   ['body', 'bath'],
    places:   ['shopping', 'travel'],
    shopping: ['places'],
    travel:   ['places'],
    time:     ['weather'],
    weather:  ['time', 'describe'],
    colors:   ['describe'],
    describe: ['colors', 'weather'],
    family:   [],
    /* Numbers and the clock words live together — 'zehn' is a number and
       'in einer Stunde' is time, and either could reasonably be called
       the other. Music neighbours nothing. */
    numbers:  ['time'],
    music:    []
  };

  var SLOTS = 9;

  /* How the topic is introduced. Pictures by default — she reads the topic
     out of what she sees rather than translating a label first. The word
     alone is harder and worth having, so it is a toggle rather than a
     second game. Remembered between visits. */
  var LOOK_KEY = 'gh-cw-preview';

  function previewMode(){
    try {
      return window.localStorage.getItem(LOOK_KEY) === 'word' ? 'word' : 'pics';
    } catch (e){ return 'pics'; }
  }

  function setPreviewMode(m){
    try { window.localStorage.setItem(LOOK_KEY, m); } catch (e){}
  }

  var host = null;
  var state = null;
  var spawnTimer = null;
  var cardTimers = [];

  function t(k, v){ return GH.i18n.t(k, v); }

  function el(tag, cls, text){
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }

  function topics(){
    return (GH_BANK.categories || []).concat(window.GH_VOCAB_CATS || []);
  }

  function wordsIn(catId){
    return (window.GH_VOCAB || []).filter(function(v){ return v.cat === catId; });
  }

  /* Only topics with enough words of their own to keep a round supplied. */
  function playableTopics(){
    return topics().filter(function(c){ return wordsIn(c.id).length >= 6; });
  }

  function distractorsFor(catId){
    var bad = NEIGHBOURS[catId] || [];
    return (window.GH_VOCAB || []).filter(function(v){
      return v.cat !== catId && bad.indexOf(v.cat) < 0;
    });
  }

  /* ---------- timers ---------- */

  function clearTimers(){
    if (spawnTimer){ clearInterval(spawnTimer); spawnTimer = null; }
    cardTimers.forEach(function(id){ clearTimeout(id); });
    cardTimers = [];
  }

  /* ---------- a round ---------- */

  function begin(level){
    clearTimers();
    var cfg = DIFFICULTY[level];
    var pool = playableTopics();
    var topic = pool[Math.floor(Math.random() * pool.length)];

    state.level = level;
    state.cfg = cfg;
    state.topic = topic;
    state.hits = wordsIn(topic.id).slice();
    state.misses = distractorsFor(topic.id);
    state.hearts = cfg.hearts;
    state.score = 0;
    state.caught = 0;
    state.escaped = 0;
    state.wrong = 0;
    state.spawned = 0;
    state.slots = new Array(SLOTS);

    /* Up to nine pictures from the topic, so she sees what it holds before
       any word appears. They turn into empty tiles, and only then do the
       words start. Naming the topic in text alone made her translate the
       label first and the words second. */
    state.preview = GH.text.shuffle(state.hits.slice()).slice(0, SLOTS);
    state.countdown = cfg.look;
    state.phase = 'preview';
    paint();

    spawnTimer = setInterval(function(){
      state.countdown--;
      if (state.countdown <= 0){ clearInterval(spawnTimer); spawnTimer = null; startPlay(); }
      else paintCountdown();
    }, 1000);
  }

  function startPlay(){
    clearTimers();
    state.phase = 'play';
    paint();
    spawnTimer = setInterval(tick, state.cfg.gap);
    tick();
  }

  function tick(){
    if (state.phase !== 'play') return;
    if (state.spawned >= state.cfg.spawns){
      /* stop spawning, let whatever is up run out, then score it */
      clearInterval(spawnTimer); spawnTimer = null;
      var wait = setTimeout(function(){ finish(); }, state.cfg.visible + 200);
      cardTimers.push(wait);
      return;
    }

    var free = [];
    for (var i = 0; i < SLOTS; i++) if (!state.slots[i]) free.push(i);
    if (!free.length) return;

    var slot = free[Math.floor(Math.random() * free.length)];
    var isHit = Math.random() < state.cfg.hitRate;
    var from = isHit ? state.hits : state.misses;
    var word = from[Math.floor(Math.random() * from.length)];

    state.spawned++;
    var card = { word:word, hit:isHit, slot:slot, id:state.spawned, gone:false };
    state.slots[slot] = card;
    paintSlot(slot);

    var id = setTimeout(function(){ expire(card); }, state.cfg.visible);
    cardTimers.push(id);
  }

  /* Letting a wrong word go is correct play and costs nothing. Letting one
     of HERS go costs a heart, same as tapping a wrong one — both are a
     failure to sort the word into the topic, which is the whole exercise.
     The tile flashes red on its way out so a miss is visible rather than
     just a heart quietly disappearing. */
  function expire(card){
    if (card.gone || state.phase !== 'play') return;
    card.gone = true;
    if (state.slots[card.slot] === card) state.slots[card.slot] = null;

    if (!card.hit){ paintSlot(card.slot); return; }

    state.escaped++;
    state.hearts--;
    flash(card.slot, 'missed', card.word.de);
    paintStatus();
    if (state.hearts <= 0) finish();
  }

  function tap(card){
    if (card.gone || state.phase !== 'play') return;
    card.gone = true;
    if (state.slots[card.slot] === card) state.slots[card.slot] = null;

    if (card.hit){
      state.caught++;
      state.score++;
      flash(card.slot, 'hit', card.word.de);
      GH.speech.say(card.word.de);
    } else {
      state.wrong++;
      state.hearts--;
      flash(card.slot, 'wrong', card.word.de);
    }
    paintStatus();
    if (state.hearts <= 0) finish();
  }

  function finish(){
    clearTimers();
    state.phase = 'done';
    paint();
  }

  /* ---------- painting ---------- */

  function flash(slot, kind, text){
    var cell = host.querySelector('[data-slot="' + slot + '"]');
    if (!cell) return;
    cell.textContent = '';
    cell.className = 'cw-cell cw-' + kind;
    cell.appendChild(el('span', 'cw-word', text));
    var id = setTimeout(function(){ paintSlot(slot); }, 380);
    cardTimers.push(id);
  }

  function paintSlot(slot){
    var cell = host.querySelector('[data-slot="' + slot + '"]');
    if (!cell) return;
    var card = state.slots[slot];
    cell.textContent = '';
    if (!card){ cell.className = 'cw-cell is-empty'; return; }
    cell.className = 'cw-cell cw-up';
    cell.appendChild(el('span', 'cw-word', card.word.de));
  }

  function hearts(){
    var wrap = el('span', 'cw-hearts');
    for (var i = 0; i < state.cfg.hearts; i++){
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 20 20');
      svg.setAttribute('class', 'cw-heart' + (i < state.hearts ? '' : ' spent'));
      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', HEART_PATH);
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
      t('cwLeft', { n:Math.max(0, state.cfg.spawns - state.spawned) })));
  }

  function paint(){
    host.textContent = '';

    var head = el('div', 'practice-head');
    var back = el('button', 'backlink', '‹ ' + t('back'));
    back.type = 'button';
    back.addEventListener('click', function(){ clearTimers(); state.onExit(); });
    head.appendChild(back);
    var titles = el('div', 'practice-title');
    titles.appendChild(el('h1', null, t('cwTitle')));
    titles.appendChild(el('p', null, state.phase === 'pick'
      ? t('cwPickLevel') : t(state.cfg.key)));
    head.appendChild(titles);
    host.appendChild(head);

    if (state.phase === 'pick'){ paintLevels(); return; }
    if (state.phase === 'preview'){ paintPreview(); return; }
    if (state.phase === 'done'){ paintDone(); return; }

    var card = el('div', 'card');

    /* the target topic, up the whole round so she cannot lose track */
    var target = el('div', 'cw-target');
    target.appendChild(el('span', 'cw-target-label', t('cwTapThese')));
    var chip = el('span', 'cw-target-topic');
    chip.appendChild(el('span', 'cw-target-glyph', state.topic.glyph));
    chip.appendChild(document.createTextNode(' ' + GH.i18n.pick(state.topic)));
    target.appendChild(chip);
    card.appendChild(target);

    card.appendChild(el('div', 'cw-status'));

    var grid = el('div', 'cw-grid');
    for (var i = 0; i < SLOTS; i++){
      var cell = el('button', 'cw-cell is-empty');
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

  function paintCountdown(){
    var el2 = host.querySelector('.cw-count');
    if (el2) el2.textContent = state.countdown;
  }

  function modeToggle(){
    var wrap = el('div', 'mode-toggle');
    [['pics', 'cwByPics'], ['word', 'cwByWord']].forEach(function(pair){
      var b = el('button', null, t(pair[1]));
      b.type = 'button';
      b.setAttribute('aria-pressed', previewMode() === pair[0] ? 'true' : 'false');
      b.addEventListener('click', function(){
        setPreviewMode(pair[0]);
        paint();
      });
      wrap.appendChild(b);
    });
    return wrap;
  }

  function paintPreview(){
    var card = el('div', 'card');

    var tools = el('div', 'card-tools');
    tools.appendChild(modeToggle());
    card.appendChild(tools);

    var target = el('div', 'cw-target');
    target.appendChild(el('span', 'cw-target-label', t('cwLookAt')));
    var chip = el('span', 'cw-target-topic');
    chip.appendChild(el('span', 'cw-target-glyph', state.topic.glyph));
    chip.appendChild(document.createTextNode(' ' + GH.i18n.pick(state.topic)));
    target.appendChild(chip);
    target.appendChild(el('span', 'cw-count', state.countdown));
    card.appendChild(target);

    if (previewMode() === 'word'){
      /* No pictures: the topic name alone, in German, and she has to know
         what belongs to it without being shown. */
      var big = el('div', 'cw-bigtopic');
      big.appendChild(el('span', 'cw-bigtopic-glyph', state.topic.glyph));
      big.appendChild(el('span', 'cw-bigtopic-name', state.topic.de));
      big.appendChild(el('span', 'cw-bigtopic-sub', GH.i18n.pick(state.topic)));
      card.appendChild(big);
    } else {
      var grid = el('div', 'cw-grid');
      for (var i = 0; i < SLOTS; i++){
        var cell = el('div', 'cw-cell cw-shot');
        var w = state.preview[i];
        if (w){
          cell.appendChild(GH.sprite.tile(w.n));
          cell.appendChild(el('span', 'cw-shot-word', w.de));
        }
        grid.appendChild(cell);
      }
      card.appendChild(grid);
    }

    var go = el('button', 'btn btn-primary', t('cwStart'));
    go.type = 'button';
    go.addEventListener('click', function(){ startPlay(); });
    var acts = el('div', 'done-actions');
    acts.appendChild(go);
    card.appendChild(acts);

    host.appendChild(card);
  }

  function paintLevels(){
    var grid = el('div', 'tiles');
    ORDER.forEach(function(id){
      var d = DIFFICULTY[id];
      var b = el('button', 'tile');
      b.type = 'button';
      b.appendChild(el('span', 'tile-glyph', '🐹'));
      b.appendChild(el('span', 'tile-name', t(d.key)));
      b.appendChild(el('span', 'tile-sub',
        t('cwHeartsN', { n:d.hearts }) + ' · ' + (d.visible / 1000) + t('cwSec')));
      b.appendChild(el('span', 'tile-foot', t('cwWordsN', { n:d.spawns })));
      b.addEventListener('click', function(){ begin(id); });
      grid.appendChild(b);
    });
    host.appendChild(grid);
    host.appendChild(el('p', 'cw-rules', t('cwRules')));
  }

  function paintDone(){
    var lost = state.hearts <= 0;
    var perfect = !lost && state.wrong === 0 && state.escaped === 0;

    var box = el('div', 'done');
    box.appendChild(el('h2', null, lost ? t('cwOut') : (perfect ? t('cwPerfect') : t('doneTitle'))));
    box.appendChild(el('p', null, t('cwSummary', {
      caught:state.caught, wrong:state.wrong, escaped:state.escaped
    })));
    box.appendChild(el('p', 'cw-final', t('cwScore', { n:state.score })));

    var acts = el('div', 'done-actions');
    var again = el('button', 'btn btn-primary', t('again'));
    again.type = 'button';
    again.addEventListener('click', function(){ begin(state.level); });
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
    state = { onExit:onExit, phase:'pick', level:'medium', cfg:DIFFICULTY.medium,
              topic:null, slots:[], hearts:0, score:0 };
    paint();
  }

  return { open:open };
})();

/* Registered on DOMContentLoaded, not inline: app.js loads after this file,
   so GH.app does not exist yet at this point. */
(function(){
  var entry = {
    id:'catch-word',
    glyph:'🐹',
    name:{ ru:'Поймай слово', de:'Wörter fangen', en:'Catch the word' },
    sub:{ ru:'Успей нажать слова по теме',
          de:'Triff die Wörter zum Thema',
          en:'Tap the words that fit the topic' },
    open:GH.catchWord.open
  };
  function register(){
    if (window.GH && GH.app && GH.app.register) GH.app.register(entry);
  }
  if (window.GH && GH.app && GH.app.register) register();
  else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', register);
  else register();
})();
