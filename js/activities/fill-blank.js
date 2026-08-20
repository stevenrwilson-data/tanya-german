/* Fill in the missing word.
   Every round = one sentence with one blank taken out. A blank is either a
   single word or a whole noun phrase ("eine neue Jacke").
   The sentence is spoken before the round and again once it is solved. */

window.GH = window.GH || {};

GH.fillBlank = (function(){

  var t = function(k, v){ return GH.i18n.t(k, v); };

  var pool = null;   /* answer pool for the wrong choices */
  var host = null;   /* container element */
  var state = null;

  /* ---------- answer pool ---------- */

  function buildPool(){
    var byCat = {}, all = [];
    function add(cat, de){
      GH.text.allUnits(de).forEach(function(u){
        var item = { text:u.text.trim(), words:u.wordCount };
        if (!byCat[cat]) byCat[cat] = [];
        byCat[cat].push(item);
        all.push(item);
      });
    }
    (GH_BANK.sentences || []).forEach(function(s){ add(s.cat, s.de); });
    (GH_BANK.stories || []).forEach(function(st){
      (st.sentences || []).forEach(function(s){ add(st.cat, s.de); });
    });
    return { byCat:byCat, all:all };
  }

  function distractors(target, wordCount, cat, howMany){
    if (!pool) pool = buildPool();
    var cap = GH.text.capitalized(target);
    var seen = {};
    seen[GH.text.normalize(target)] = true;
    var near = [], far = [];

    [pool.byCat[cat] || [], pool.all].forEach(function(list){
      GH.text.shuffle(list).forEach(function(item){
        var key = GH.text.normalize(item.text);
        if (seen[key]) return;
        if (item.words !== wordCount) return;
        if (GH.text.capitalized(item.text) !== cap) return;
        seen[key] = true;
        if (Math.abs(item.text.length - target.length) <= 5) near.push(item.text);
        else far.push(item.text);
      });
    });
    return near.concat(far).slice(0, howMany);
  }

  /* ---------- rounds ---------- */

  function buildRounds(sentences){
    var rounds = [];
    sentences.forEach(function(s){
      var tokens = GH.text.tokenize(s.de);
      GH.text.blankUnits(s.de, s.blanks).forEach(function(u){
        rounds.push({
          sentence:s,
          tokens:tokens,
          start:u.start,
          end:u.end,
          words:u.wordCount,
          answer:u.text.trim(),
          options:null
        });
      });
    });
    return rounds;
  }

  /* ---------- helpers ---------- */

  function el(tag, cls, text){
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }

  function translationOf(s){
    var lang = GH.i18n.lang();
    if (lang === 'de') return '';
    return s[lang] || '';
  }

  function round(){ return state.rounds[state.i]; }

  /* ---------- speaking ---------- */

  function speakSentence(){
    var r = round();
    if (!r) return;
    var btn = host.querySelector('.speak');
    if (btn) btn.classList.add('is-speaking');
    GH.speech.say(r.sentence.de, function(){
      var b = host.querySelector('.speak');
      if (b) b.classList.remove('is-speaking');
    });
  }

  /* ---------- painting ---------- */

  function paint(){
    var r = round();
    if (!r){ paintDone(); return; }

    host.textContent = '';

    var back = el('button', 'backlink', '‹ ' + t('back'));
    back.type = 'button';
    back.addEventListener('click', function(){
      GH.speech.stop();
      state.onExit();
    });
    host.appendChild(back);

    /* header row */
    var top = el('div', 'practice-top');
    var titleWrap = el('div', 'practice-title');
    titleWrap.appendChild(el('h2', null, state.title));
    if (state.subtitle) titleWrap.appendChild(el('p', null, state.subtitle));
    top.appendChild(titleWrap);

    var prog = el('div', 'progress');
    var track = el('span', 'progress-track');
    var fill = el('span', 'progress-fill');
    fill.style.width = Math.round((state.i / state.rounds.length) * 100) + '%';
    track.appendChild(fill);
    prog.appendChild(track);
    prog.appendChild(el('span', null, t('progress', { i:state.i + 1, n:state.rounds.length })));
    top.appendChild(prog);
    host.appendChild(top);

    /* card */
    var card = el('div', 'card');

    var tools = el('div', 'card-tools');
    if (GH.speech.supported){
      var speak = el('button', 'speak');
      speak.type = 'button';
      speak.appendChild(el('span', 'speak-icon', '🔊'));
      speak.appendChild(el('span', null, state.solved ? t('listenAgain') : t('listen')));
      speak.addEventListener('click', speakSentence);
      tools.appendChild(speak);
    }

    var modes = el('div', 'mode-toggle');
    [['choose', 'choose'], ['type', 'type']].forEach(function(pair){
      var b = el('button', null, t(pair[1]));
      b.type = 'button';
      b.setAttribute('aria-pressed', state.mode === pair[0] ? 'true' : 'false');
      b.addEventListener('click', function(){
        if (state.mode === pair[0]) return;
        state.mode = pair[0];
        paint();
      });
      modes.appendChild(b);
    });
    tools.appendChild(modes);
    card.appendChild(tools);

    if (r.sentence.img){
      var fig = el('figure', 'figure');
      if (typeof r.sentence.img === 'number'){
        fig.appendChild(GH.sprite.tile(r.sentence.img));
      } else {
        var im = document.createElement('img');
        im.src = r.sentence.img;
        im.alt = '';
        fig.appendChild(im);
      }
      card.appendChild(fig);
    }

    /* the sentence, with a slot where the blank is */
    var p = el('p', 'sentence');
    var i;
    for (i = 0; i < r.tokens.length; i++){
      if (i === r.start){
        var marks = [];
        var w;
        for (w = 0; w < r.words; w++) marks.push('???');
        var slot = el('span', 'slot' + (state.solved ? ' filled' : ''),
                      state.solved ? r.answer : marks.join(' '));
        p.appendChild(slot);
      } else if (i > r.start && i <= r.end){
        continue;
      } else {
        p.appendChild(document.createTextNode(r.tokens[i].text));
      }
    }
    card.appendChild(p);

    var tr = translationOf(r.sentence);
    if (tr) card.appendChild(el('p', 'translation', tr));

    /* answers */
    var answers = el('div', 'answers');

    if (!state.solved && state.mode === 'choose'){
      if (!r.options){
        r.options = GH.text.shuffle(
          [r.answer].concat(distractors(r.answer, r.words, r.sentence.cat || state.cat, 3))
        );
      }
      var opts = el('div', 'options');
      r.options.forEach(function(word){
        var b = el('button', 'option', word);
        b.type = 'button';
        if (state.ruledOut[GH.text.normalize(word)]){
          b.classList.add('is-wrong');
          b.disabled = true;
        }
        b.addEventListener('click', function(){ pickOption(word, b); });
        opts.appendChild(b);
      });
      answers.appendChild(opts);
    }

    if (!state.solved && state.mode === 'type'){
      var box = el('div', 'typebox');
      var input = document.createElement('input');
      input.type = 'text';
      input.autocomplete = 'off';
      input.spellcheck = false;
      input.placeholder = t('typeHere');
      input.value = state.typed || '';
      input.addEventListener('input', function(){ state.typed = input.value; });
      input.addEventListener('keydown', function(e){
        if (e.key === 'Enter'){ e.preventDefault(); checkTyped(input.value); }
      });
      var go = el('button', 'btn btn-primary', t('check'));
      go.type = 'button';
      go.addEventListener('click', function(){ checkTyped(input.value); });
      box.appendChild(input);
      box.appendChild(go);
      answers.appendChild(box);
      setTimeout(function(){ input.focus(); }, 0);
    }

    var fb = el('p', 'feedback' + (state.feedbackKind ? ' ' + state.feedbackKind : ''));
    if (state.feedback) fb.textContent = state.feedback;
    answers.appendChild(fb);
    card.appendChild(answers);

    /* foot */
    var foot = el('div', 'card-foot');
    if (!state.solved){
      var skip = el('button', 'btn-quiet', t('skip'));
      skip.type = 'button';
      skip.addEventListener('click', reveal);
      foot.appendChild(skip);
    }
    foot.appendChild(el('span', 'spacer'));
    if (state.solved){
      var last = state.i === state.rounds.length - 1;
      var next = el('button', 'btn btn-primary', last ? t('finish') : t('next'));
      next.type = 'button';
      next.addEventListener('click', function(){ goTo(state.i + 1); });
      foot.appendChild(next);
    }
    card.appendChild(foot);

    host.appendChild(card);
  }

  function paintDone(){
    host.textContent = '';
    var box = el('div', 'done');
    box.appendChild(el('span', 'done-badge', t('doneBadge')));
    box.appendChild(el('h2', null, t('doneTitle')));
    box.appendChild(el('p', null, t('doneLede', { n:state.rounds.length })));
    var acts = el('div', 'done-actions');
    var again = el('button', 'btn btn-primary', t('again'));
    again.type = 'button';
    again.addEventListener('click', function(){
      state.rounds.forEach(function(r){ r.options = null; });
      state.rounds = GH.text.shuffle(state.rounds);
      goTo(0);
    });
    var hub = el('button', 'btn btn-ghost', t('toHub'));
    hub.type = 'button';
    hub.addEventListener('click', function(){ state.onExit(); });
    acts.appendChild(again);
    acts.appendChild(hub);
    box.appendChild(acts);
    host.appendChild(box);
  }

  /* ---------- answering ---------- */

  function solve(){
    state.solved = true;
    paint();
    speakSentence();
  }

  function showFeedback(){
    var fb = host.querySelector('.feedback');
    if (fb){
      fb.textContent = state.feedback;
      fb.className = 'feedback ' + state.feedbackKind;
    }
  }

  function pickOption(word, btn){
    var r = round();
    if (word === r.answer){
      state.feedback = t('right');
      state.feedbackKind = 'right';
      btn.classList.add('is-right');
      solve();
      return;
    }
    state.ruledOut[GH.text.normalize(word)] = true;
    state.feedback = t('wrong');
    state.feedbackKind = 'wrong';
    btn.classList.add('is-wrong');
    btn.disabled = true;
    showFeedback();
  }

  function checkTyped(value){
    var r = round();
    var verdict = GH.text.compare(value, r.answer);
    if (verdict === 'exact'){
      state.feedback = t('right');
      state.feedbackKind = 'right';
      solve();
    } else if (verdict === 'close'){
      state.feedback = t('closeSpelling', { word:r.answer });
      state.feedbackKind = 'close';
      solve();
    } else {
      state.feedback = t('wrong');
      state.feedbackKind = 'wrong';
      showFeedback();
    }
  }

  function reveal(){
    var r = round();
    state.feedback = t('answerWas', { word:r.answer });
    state.feedbackKind = 'close';
    solve();
  }

  /* ---------- entry ---------- */

  function goTo(i){
    state.i = i;
    state.solved = false;
    state.feedback = '';
    state.feedbackKind = '';
    state.typed = '';
    state.ruledOut = {};
    paint();
    if (state.i < state.rounds.length) speakSentence();
  }

  function mount(container, config){
    host = container;
    state = {
      title:config.title,
      subtitle:config.subtitle || '',
      cat:config.cat || null,
      rounds:buildRounds(config.sentences),
      i:0,
      mode:'choose',
      solved:false,
      feedback:'',
      feedbackKind:'',
      typed:'',
      ruledOut:{},
      onExit:config.onExit
    };
    GH.app.redraw = paint;
    goTo(0);
  }

  return { mount:mount };
})();
