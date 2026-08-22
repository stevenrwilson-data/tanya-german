/* Hören und wählen — hear a German sentence, tap the image it describes.

   The only exercise in the app where the audio IS the question: nothing
   is written down, so it tests whether she understood the sentence
   rather than whether she recognised a word on screen.

   Difficulty bundles three things — how many images, whether a clock
   runs, and how often she can replay the audio — because those are the
   same axis, not three separate settings.

   iOS will not speak unless a tap started it, so the first round always
   waits for the play button. After that the audio may start on its own,
   the browser having been unlocked by that first tap. */

window.GH = window.GH || {};

GH.listenPick = (function(){

  var LEVELS = [
    { id:'easy',   pics:4, seconds:0,  plays:0, key:'lpEasy'   },
    { id:'normal', pics:9, seconds:0,  plays:0, key:'lpNormal' },
    { id:'quick',  pics:9, seconds:10, plays:0, key:'lpQuick'  },
    { id:'hard',   pics:9, seconds:6,  plays:1, key:'lpHard'   }
  ];

  var ROUNDS = 10;

  var host = null;
  var state = null;
  var ticker = null;
  var unlocked = false;          /* has a tap started audio at least once */

  function t(k, v){ return GH.i18n.t(k, v); }

  function el(tag, cls, text){
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }

  /* ---------- items ---------- */

  function overlaps(a, b){
    var x = a.de.toLowerCase(), y = b.de.toLowerCase();
    return x.indexOf(y) >= 0 || y.indexOf(x) >= 0;
  }

  /* Distractors come from the same topic first: picking a kitchen scene
     out of nine kitchen scenes is a real test, out of nine random
     pictures it is not. Entries whose German contains this one's are
     excluded — 'der Lippenstift' against 'der rote Lippenstift' would
     make two pictures both correct. */
  function build(level){
    var pool = (window.GH_VOCAB || []).filter(function(v){ return v.n && v.s && v.s.length; });
    var items = [];
    GH.text.shuffle(pool).slice(0, ROUNDS).forEach(function(v){
      var sen = v.s[Math.floor(Math.random() * v.s.length)];
      var near = [], far = [];
      pool.forEach(function(c){
        if (c.n === v.n || overlaps(v, c)) return;
        (c.cat === v.cat ? near : far).push(c);
      });
      var others = GH.text.shuffle(near).concat(GH.text.shuffle(far)).slice(0, level.pics - 1);
      items.push({
        word:v,
        sentence:sen,
        options:GH.text.shuffle([v].concat(others)),
        plays:0,
        answered:false,
        correct:false,
        timedOut:false
      });
    });
    return items;
  }

  /* ---------- audio ---------- */

  function canPlay(){
    var it = current();
    if (!it || it.answered) return false;
    if (!state.level.plays) return true;
    return it.plays < state.level.plays;
  }

  function play(fromTap){
    var it = current();
    if (!it) return;
    if (fromTap) unlocked = true;
    if (!canPlay()) return;
    it.plays++;
    GH.speech.say(it.sentence.de);
    if (state.level.seconds && !state.deadline) startClock();
    paint();
  }

  /* ---------- clock ---------- */

  function startClock(){
    stopClock();
    state.deadline = Date.now() + state.level.seconds * 1000;
    ticker = setInterval(function(){
      var left = state.deadline - Date.now();
      if (left <= 0){ stopClock(); timeUp(); return; }
      var bar = host.querySelector('.lp-clock-bar');
      if (bar) bar.style.width = (left / (state.level.seconds * 1000) * 100) + '%';
    }, 100);
  }

  function stopClock(){
    if (ticker){ clearInterval(ticker); ticker = null; }
    state.deadline = 0;
  }

  function timeUp(){
    var it = current();
    if (!it || it.answered) return;
    it.answered = true;
    it.timedOut = true;
    it.correct = false;
    if (GH.progress){
      GH.progress.record('word:' + it.word.n, false);
      GH.progress.record('topic:' + it.word.cat, false);
      GH.progress.record('skill:listening', false);
    }
    paint();
    GH.speech.say(it.sentence.de);
  }

  /* ---------- answering ---------- */

  function current(){ return state.items[state.i] || null; }

  function choose(opt){
    var it = current();
    if (!it || it.answered) return;
    stopClock();
    it.answered = true;
    it.correct = opt.n === it.word.n;
    if (GH.progress){
      GH.progress.record('word:' + it.word.n, it.correct);
      GH.progress.record('topic:' + it.word.cat, it.correct);
      GH.progress.record('skill:listening', it.correct);
    }
    paint();
    GH.speech.say(it.sentence.de);
  }

  function next(){
    stopClock();
    state.i++;
    paint();
    var it = current();
    /* only self-start once a tap has unlocked audio on this device */
    if (it && unlocked && !state.level.plays) play(false);
  }

  /* ---------- painting ---------- */

  function paint(){
    host.textContent = '';

    var head = el('div', 'practice-head');
    var back = el('button', 'backlink', '‹ ' + t('back'));
    back.type = 'button';
    back.addEventListener('click', function(){ stopClock(); state.onExit(); });
    head.appendChild(back);

    var titles = el('div', 'practice-title');
    titles.appendChild(el('h1', null, t('lpTitle')));
    titles.appendChild(el('p', null, t(state.level.key)));
    head.appendChild(titles);

    if (state.i < state.items.length){
      var right = state.items.filter(function(x){ return x.correct; }).length;
      var prog = el('div', 'progress');
      var meter = el('div', 'meter');
      var bar = el('div', 'bar');
      bar.style.width = Math.round((state.i / state.items.length) * 100) + '%';
      meter.appendChild(bar);
      prog.appendChild(meter);
      prog.appendChild(el('span', 'progress-label',
        t('roundOf', { i:state.i + 1, n:state.items.length }) + ' · ' + right + '/' + state.i));
      head.appendChild(prog);
    }
    host.appendChild(head);

    if (state.i >= state.items.length){ paintDone(); return; }

    var it = current();
    var card = el('div', 'card');

    /* play button, and the clock if this level has one */
    var tools = el('div', 'card-tools');
    var pb = el('button', 'speak lp-play');
    pb.type = 'button';
    pb.appendChild(el('span', 'speak-icon', '🔊'));
    pb.appendChild(el('span', null, it.plays ? t('lpAgain') : t('lpPlay')));
    pb.disabled = !canPlay();
    pb.addEventListener('click', function(){ play(true); });
    tools.appendChild(pb);
    if (state.level.plays){
      tools.appendChild(el('span', 'lp-plays',
        t('lpPlaysLeft', { n:Math.max(0, state.level.plays - it.plays) })));
    }
    card.appendChild(tools);

    if (state.level.seconds && !it.answered){
      var clock = el('div', 'lp-clock');
      var cbar = el('div', 'lp-clock-bar');
      cbar.style.width = state.deadline ? '100%' : '0%';
      clock.appendChild(cbar);
      card.appendChild(clock);
    }

    if (!it.plays){
      card.appendChild(el('p', 'lp-hint', t('lpTapPlay')));
    }

    /* the grid */
    var grid = el('div', 'lp-grid' + (state.level.pics > 4 ? ' lp-nine' : ''));
    it.options.forEach(function(o){
      var b = el('button', 'lp-pic');
      b.type = 'button';
      b.appendChild(GH.sprite.tile(o.n));
      if (it.answered){
        if (o.n === it.word.n) b.className += ' is-right';
        else if (!it.correct) b.className += ' is-dim';
      } else if (!it.plays){
        b.disabled = true;
      }
      b.addEventListener('click', function(){ choose(o); });
      grid.appendChild(b);
    });
    card.appendChild(grid);

    /* after answering, show what it said */
    if (it.answered){
      card.appendChild(el('p', 'feedback ' + (it.correct ? 'hit' : 'miss'),
        it.correct ? t('lpRight') : (it.timedOut ? t('lpTimeUp') : t('lpWrong'))));
      card.appendChild(el('p', 'sentence lp-reveal', it.sentence.de));
      var lang = GH.i18n.lang();
      if (lang !== 'de' && it.sentence[lang]){
        card.appendChild(el('p', 'translation', it.sentence[lang]));
      }
      card.appendChild(el('p', 'lp-word', it.word.de));
      var nx = el('button', 'btn btn-primary', t('next'));
      nx.type = 'button';
      nx.addEventListener('click', next);
      var acts = el('div', 'done-actions');
      acts.appendChild(nx);
      card.appendChild(acts);
    }

    host.appendChild(card);
  }

  function paintDone(){
    var right = state.items.filter(function(x){ return x.correct; }).length;
    var box = el('div', 'done');
    box.appendChild(el('h2', null, t('doneTitle')));
    box.appendChild(el('p', null, t('lpScore', { i:right, n:state.items.length })));
    var acts = el('div', 'done-actions');
    var again = el('button', 'btn btn-primary', t('again'));
    again.type = 'button';
    again.addEventListener('click', function(){ begin(state.level); });
    var pick = el('button', 'btn btn-ghost', t('lpChangeLevel'));
    pick.type = 'button';
    pick.addEventListener('click', paintLevels);
    var hubb = el('button', 'btn btn-ghost', t('toHub'));
    hubb.type = 'button';
    hubb.addEventListener('click', function(){ state.onExit(); });
    acts.appendChild(again); acts.appendChild(pick); acts.appendChild(hubb);
    box.appendChild(acts);
    host.appendChild(box);
  }

  function paintLevels(){
    stopClock();
    host.textContent = '';
    var head = el('div', 'practice-head');
    var back = el('button', 'backlink', '‹ ' + t('back'));
    back.type = 'button';
    back.addEventListener('click', function(){ state.onExit(); });
    head.appendChild(back);
    var titles = el('div', 'practice-title');
    titles.appendChild(el('h1', null, t('lpTitle')));
    titles.appendChild(el('p', null, t('lpPickLevel')));
    head.appendChild(titles);
    host.appendChild(head);

    var tools = el('div', 'card-tools');
    tools.appendChild(GH.howto.button('lpTitle', 'lpRule'));
    host.appendChild(tools);

    var grid = el('div', 'tiles');
    LEVELS.forEach(function(lv){
      var b = el('button', 'tile');
      b.type = 'button';
      b.appendChild(el('span', 'tile-glyph', lv.pics > 4 ? '🎧' : '🎵'));
      b.appendChild(el('span', 'tile-name', t(lv.key)));
      b.appendChild(el('span', 'tile-sub', t('lpPicsN', { n:lv.pics })));
      b.appendChild(el('span', 'tile-foot',
        (lv.seconds ? t('lpSecondsN', { n:lv.seconds }) : t('lpNoClock')) + ' · ' +
        (lv.plays ? t('lpOnePlay') : t('lpFreePlays'))));
      b.addEventListener('click', function(){ begin(lv); });
      grid.appendChild(b);
    });
    host.appendChild(grid);
  }

  function begin(level){
    stopClock();
    state.level = level;
    state.items = build(level);
    state.i = 0;
    state.deadline = 0;
    paint();
  }

  function open(container, onExit){
    host = container;
    state = { onExit:onExit, level:LEVELS[1], items:[], i:0, deadline:0 };
    paintLevels();
  }

  return { open:open };
})();

/* Register on the hub.

   app.js loads AFTER this file, so GH.app does not exist yet — checking
   for it here and giving up silently is what kept this game off the hub.
   app.js boots on DOMContentLoaded and our listener is added first, so
   registering there runs before the hub is drawn regardless of the order
   the script tags happen to be in. */
(function(){
  var entry = {
    id:'listen-pick',
    glyph:'🎧',
    name:{ ru:'Слушай и выбирай', de:'Hören und wählen', en:'Listen and pick' },
    sub:{ ru:'Картинка к тому, что услышала',
          de:'Das Bild zum Gehörten',
          en:'The picture for what you heard' },
    open:GH.listenPick.open
  };

  function register(){
    if (window.GH && GH.app && GH.app.register) GH.app.register(entry);
  }

  if (window.GH && GH.app && GH.app.register) register();
  else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', register);
  else register();
})();
