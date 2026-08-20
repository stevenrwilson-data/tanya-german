/* Vocab sets.

   A set is six words from one topic. Phase one tests the words; phase
   two gives the sentences that use them. You have to get a word right
   to clear it — a miss puts it back in the queue.

   Phase one has three question shapes, toggled by the buttons:
     pic   see the image, pick the German
     word  see the German, pick the image
     mean  see the German, pick the Russian (or English)

   'mean' only appears when the interface is in Russian or English AND
   every word in the set has that translation. German-to-German would
   be pointless, and entries above 70 have no Russian yet.

   Phase two has two shapes:
     blank  the sentence with the word missing, pick the word
     pic    the sentence in German, pick the image it describes  */

window.GH = window.GH || {};

GH.vocab = (function(){

  var SET_SIZE = 6;
  var OPTIONS  = 4;

  var host = null;
  var state = null;

  function t(key, vars){ return GH.i18n.t(key, vars); }

  function el(tag, cls, text){
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }

  /* ---------- sets ---------- */

  function wordsIn(cat){
    return (window.GH_VOCAB || []).filter(function(v){ return v.cat === cat; });
  }

  /* Sequential chunks, not random ones: the numbering runs thematically,
     so neighbours belong together and the set hangs together. */
  function setsFor(cat){
    var all = wordsIn(cat), out = [], i;
    for (i = 0; i < all.length; i += SET_SIZE){
      var chunk = all.slice(i, i + SET_SIZE);
      if (chunk.length >= 3) out.push(chunk);       /* a stub of 1-2 is not a set */
      else if (out.length) out[out.length - 1] = out[out.length - 1].concat(chunk);
    }
    return out;
  }

  function meaningKey(){
    var lang = GH.i18n.lang();
    return (lang === 'ru' || lang === 'en') ? lang : null;
  }

  function canMean(words){
    var k = meaningKey();
    if (!k) return false;
    for (var i = 0; i < words.length; i++) if (!words[i][k]) return false;
    return true;
  }

  /* ---------- distractors ---------- */

  /* Pulled from the same topic so the choice is a real one, and never
     from an entry whose German contains this one's — 'der Lippenstift'
     against 'der rote Lippenstift' is a coin toss, not a question. */
  function overlaps(a, b){
    var x = a.de.toLowerCase(), y = b.de.toLowerCase();
    return x.indexOf(y) >= 0 || y.indexOf(x) >= 0;
  }

  function distractors(word, pool, howMany){
    var near = [], far = [], i;
    for (i = 0; i < pool.length; i++){
      var c = pool[i];
      if (c.n === word.n || overlaps(word, c)) continue;
      (c.cat === word.cat ? near : far).push(c);
    }
    near = GH.text.shuffle(near);
    far  = GH.text.shuffle(far);
    return near.concat(far).slice(0, howMany);
  }

  /* ---------- building the queues ---------- */

  function wordQuestions(words, shape){
    var pool = window.GH_VOCAB || [];
    return GH.text.shuffle(words.map(function(w){
      return {
        word:w,
        shape:shape,
        options:GH.text.shuffle([w].concat(distractors(w, pool, OPTIONS - 1))),
        done:false
      };
    }));
  }

  function sentenceQuestions(words, shape){
    var pool = window.GH_VOCAB || [], out = [];
    words.forEach(function(w){
      w.s.forEach(function(sen){
        out.push({
          word:w,
          sentence:sen,
          shape:shape,
          options:GH.text.shuffle([w].concat(distractors(w, pool, OPTIONS - 1)))
        });
      });
    });
    return GH.text.shuffle(out);
  }

  /* Blanks the word in the sentence. Tries each part of the entry,
     longest first, matching on a stem so inflected forms still hit.
     Separable verbs ('aufwachen' -> 'wache ... auf') and irregulars
     ('essen' -> 'isst') often cannot be found at all; those sentences
     report no blank and the activity shows them as picture questions
     instead of inventing a blank in the wrong place. */
  var SKIP = { der:1, die:1, das:1, ein:1, eine:1, einen:1, einem:1, einer:1,
               sich:1, etwas:1, mit:1, dem:1, den:1, zu:1, im:1, am:1, auf:1,
               in:1, bei:1, vor:1, nach:1, ins:1, zwei:1, sehr:1, eigenen:1,
               jemandem:1, jemanden:1, und:1 };

  function blankOut(sen, word){
    var parts = word.de.split(/\s+/).filter(function(p){
      return p.length >= 3 && !SKIP[p.toLowerCase()];
    });
    parts.sort(function(a, b){ return b.length - a.length; });

    var i, stem, re, m = null;
    for (i = 0; i < parts.length && !m; i++){
      stem = parts[i].length > 5 ? parts[i].slice(0, parts[i].length - 2) : parts[i];
      re = new RegExp('[A-Za-zÄÖÜäöüß]*' +
                      stem.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
                      '[A-Za-zÄÖÜäöüß]*', 'i');
      m = sen.de.match(re);
    }
    if (!m) return { before:sen.de, blank:'', after:'', ok:false };
    return {
      before:sen.de.slice(0, m.index),
      blank:m[0],
      after:sen.de.slice(m.index + m[0].length),
      ok:true
    };
  }

  /* ---------- painting ---------- */

  function tile(word, onPick){
    var b = el('button', 'vopt-pic');
    b.type = 'button';
    b.appendChild(GH.sprite.tile(word.n));
    b.addEventListener('click', function(){ onPick(word, b); });
    return b;
  }

  function textOption(label, word, onPick){
    var b = el('button', 'option', label);
    b.type = 'button';
    b.addEventListener('click', function(){ onPick(word, b); });
    return b;
  }

  function paint(){
    host.textContent = '';

    var head = el('div', 'practice-head');
    var back = el('button', 'backlink', '‹ ' + t('back'));
    back.type = 'button';
    back.addEventListener('click', function(){ state.onExit(); });
    head.appendChild(back);

    var titles = el('div', 'practice-title');
    titles.appendChild(el('h1', null, state.title));
    titles.appendChild(el('p', null, state.phase === 'words'
      ? t('vocabWords') : t('vocabSentences')));
    head.appendChild(titles);

    var q = current();
    var total = state.phase === 'words' ? state.words.length : state.sentences.length;
    var left  = state.phase === 'words'
      ? state.words.filter(function(x){ return !x.done; }).length : state.sIndex;
    var prog = el('div', 'progress');
    var meter = el('div', 'meter');
    var bar = el('div', 'bar');
    bar.style.width = Math.round(((total - left) / total) * 100) + '%';
    meter.appendChild(bar);
    prog.appendChild(meter);
    prog.appendChild(el('span', 'progress-label',
      t('roundOf', { i:(total - left + (state.phase === 'words' ? 0 : 1)), n:total })));
    head.appendChild(prog);
    host.appendChild(head);

    if (!q){ paintDone(); return; }

    var card = el('div', 'card');

    /* shape toggle */
    var tools = el('div', 'card-tools');
    if (GH.speech.supported){
      var speak = el('button', 'speak');
      speak.type = 'button';
      speak.appendChild(el('span', 'speak-icon', '🔊'));
      speak.appendChild(el('span', null, t('listen')));
      speak.addEventListener('click', function(){
        GH.speech.say(q.sentence ? q.sentence.de : q.word.de);
      });
      tools.appendChild(speak);
    }
    tools.appendChild(shapeToggle());
    card.appendChild(tools);

    if (state.phase === 'words') paintWord(card, q);
    else paintSentence(card, q);

    if (state.feedback){
      var fb = el('p', 'feedback ' + state.feedbackKind, state.feedback);
      card.appendChild(fb);
    }
    host.appendChild(card);

    if (state.autoSpeak){
      state.autoSpeak = false;
      GH.speech.say(q.sentence ? q.sentence.de : q.word.de);
    }
  }

  function shapeToggle(){
    var wrap = el('div', 'mode-toggle');
    var shapes = state.phase === 'words'
      ? [['pic', 'vShapePic'], ['word', 'vShapeWord']]
      : [['blank', 'vShapeBlank'], ['pic', 'vShapePic']];
    if (state.phase === 'words' && canMean(state.set)) shapes.push(['mean', 'vShapeMean']);
    shapes.forEach(function(pair){
      var b = el('button', null, t(pair[1]));
      b.type = 'button';
      b.setAttribute('aria-pressed', shapeOf() === pair[0] ? 'true' : 'false');
      b.addEventListener('click', function(){
        if (state.phase === 'words') state.wordShape = pair[0];
        else state.senShape = pair[0];
        rebuild();
      });
      wrap.appendChild(b);
    });
    return wrap;
  }

  function shapeOf(){
    return state.phase === 'words' ? state.wordShape : state.senShape;
  }

  function paintWord(card, q){
    var shape = state.wordShape;
    var pick = answerWord;

    if (shape === 'pic'){
      var fig = el('figure', 'figure');
      fig.appendChild(GH.sprite.tile(q.word.n));
      card.appendChild(fig);
      var opts = el('div', 'options');
      q.options.forEach(function(o){ opts.appendChild(textOption(o.de, o, pick)); });
      card.appendChild(opts);
      return;
    }

    if (shape === 'word'){
      card.appendChild(el('p', 'vword', q.word.de));
      var grid = el('div', 'vpics');
      q.options.forEach(function(o){ grid.appendChild(tile(o, pick)); });
      card.appendChild(grid);
      return;
    }

    /* mean */
    var k = meaningKey();
    card.appendChild(el('p', 'vword', q.word.de));
    var mo = el('div', 'options');
    q.options.forEach(function(o){ mo.appendChild(textOption(o[k] || o.en, o, pick)); });
    card.appendChild(mo);
  }

  function paintSentence(card, q){
    var cut = blankOut(q.sentence, q.word);
    if (state.senShape === 'pic' || !cut.ok){
      card.appendChild(el('p', 'sentence', q.sentence.de));
      var tr = translationOf(q.sentence);
      if (tr) card.appendChild(el('p', 'translation', tr));
      var grid = el('div', 'vpics');
      q.options.forEach(function(o){ grid.appendChild(tile(o, answerSentence)); });
      card.appendChild(grid);
      return;
    }

    var p = el('p', 'sentence');
    p.appendChild(document.createTextNode(cut.before));
    p.appendChild(el('span', 'slot' + (state.revealed ? ' filled' : ''),
                     state.revealed ? cut.blank : '???'));
    p.appendChild(document.createTextNode(cut.after));
    card.appendChild(p);
    var tr2 = translationOf(q.sentence);
    if (tr2) card.appendChild(el('p', 'translation', tr2));
    var opts = el('div', 'options');
    q.options.forEach(function(o){ opts.appendChild(textOption(o.de, o, answerSentence)); });
    card.appendChild(opts);
  }

  function translationOf(sen){
    var lang = GH.i18n.lang();
    if (lang === 'de') return '';
    return sen[lang] || '';
  }

  function paintDone(){
    var box = el('div', 'done');
    box.appendChild(el('h2', null, t('doneTitle')));
    box.appendChild(el('p', null, t('vocabDone', { n:state.set.length })));
    var acts = el('div', 'done-actions');
    var again = el('button', 'btn btn-primary', t('again'));
    again.type = 'button';
    again.addEventListener('click', function(){ start(state.set); });
    var hub = el('button', 'btn btn-ghost', t('toHub'));
    hub.type = 'button';
    hub.addEventListener('click', function(){ state.onExit(); });
    acts.appendChild(again); acts.appendChild(hub);
    box.appendChild(acts);
    host.appendChild(box);
  }

  /* ---------- answering ---------- */

  function current(){
    if (state.phase === 'words'){
      for (var i = 0; i < state.words.length; i++) if (!state.words[i].done) return state.words[i];
      return null;
    }
    return state.sentences[state.sIndex] || null;
  }

  function answerWord(picked){
    var q = current();
    if (!q) return;
    if (picked.n === q.word.n){
      q.done = true;
      state.feedback = ''; state.autoSpeak = false;
      GH.speech.say(q.word.de);
      if (!current()){                       /* every word cleared */
        state.phase = 'sentences';
        state.sIndex = 0;
        state.sentences = sentenceQuestions(state.set, state.senShape);
      }
      paint();
    } else {
      /* a miss goes to the back of the queue rather than being skipped */
      state.feedback = t('vocabRetry', { w:q.word.de });
      state.feedbackKind = 'miss';
      var idx = state.words.indexOf(q);
      state.words.splice(idx, 1);
      state.words.push(q);
      paint();
    }
  }

  function answerSentence(picked){
    var q = current();
    if (!q) return;
    if (picked.n === q.word.n){
      state.revealed = true;
      state.feedback = '';
      paint();
      GH.speech.say(q.sentence.de, function(){
        state.revealed = false;
        state.sIndex++;
        paint();
      });
    } else {
      state.feedback = t('vocabRetry', { w:q.word.de });
      state.feedbackKind = 'miss';
      paint();
    }
  }

  function rebuild(){
    if (state.phase === 'words'){
      var cleared = {};
      state.words.forEach(function(x){ if (x.done) cleared[x.word.n] = true; });
      state.words = wordQuestions(state.set, state.wordShape);
      state.words.forEach(function(x){ if (cleared[x.word.n]) x.done = true; });
    } else {
      state.sentences = sentenceQuestions(state.set, state.senShape);
      state.sIndex = 0;
    }
    state.feedback = '';
    paint();
  }

  function start(set){
    state.set = set;
    state.phase = 'words';
    state.words = wordQuestions(set, state.wordShape);
    state.sentences = [];
    state.sIndex = 0;
    state.revealed = false;
    state.feedback = '';
    paint();
  }

  function mount(container, config){
    host = container;
    state = {
      title:config.title,
      set:config.set,
      onExit:config.onExit,
      wordShape:'pic',
      senShape:'blank',
      phase:'words',
      words:[], sentences:[], sIndex:0,
      revealed:false, feedback:'', feedbackKind:'', autoSpeak:false
    };
    start(config.set);
  }

  return { mount:mount, setsFor:setsFor, wordsIn:wordsIn };
})();
