/* Screen wiring + the hub. Add new games with GH.app.register(). */

window.GH = window.GH || {};

GH.app = (function(){

  var t = function(k, v){ return GH.i18n.t(k, v); };
  var view = document.getElementById('view');
  var extras = [];

  /* A new game only needs: an id, names in the three languages, a glyph,
     and an open(container, onExit) function. */
  function register(activity){ extras.push(activity); }

  function el(tag, cls, text){
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }

  function countBlanks(s){
    return GH.text.blankUnits(s.de, s.blanks).length;
  }

  function sentencesIn(catId){
    return (GH_BANK.sentences || []).filter(function(s){ return s.cat === catId; });
  }

  function tile(glyph, name, sub, footer, onOpen){
    var b = el('button', 'tile');
    b.type = 'button';
    if (glyph) b.appendChild(el('span', 'tile-glyph', glyph));
    b.appendChild(el('span', 'tile-name', name));
    if (sub) b.appendChild(el('span', 'tile-sub', sub));
    if (footer) b.appendChild(el('span', 'tile-de', footer));
    if (onOpen) b.addEventListener('click', onOpen);
    else b.disabled = true;
    return b;
  }

  /* Sections register themselves for the jump bar as they are built, so
     the bar always matches what is actually on the page — a section that
     gets skipped (no data yet) never shows up as a dead link. */
  var jumps = [];

  /* Topic filter, following the same rules as the pink math org list:
     a set of active topics OR-matched together, "All" as a real state
     that clears the rest, and the set emptying out re-activates "All"
     rather than leaving nothing selected.

     The chips stay collapsed behind a button — seventeen topics is far
     too much furniture to leave on screen above the content. */
  var activeCats = {};
  var catCount = 0;
  var filterOpen = false;

  function keep(catId){
    return catCount === 0 || !!activeCats[catId];
  }

  function allTopics(){
    return (GH_BANK.categories || []).concat(window.GH_VOCAB_CATS || []);
  }

  function toggleCat(id){
    if (id === 'all'){
      activeCats = {}; catCount = 0;
    } else if (activeCats[id]){
      delete activeCats[id]; catCount--;
    } else {
      activeCats[id] = true; catCount++;
    }
    hub();
  }

  function filterBlock(){
    var wrap = el('div', 'filterwrap');

    var toggle = el('button', 'filter-toggle' + (catCount ? ' has' : ''));
    toggle.type = 'button';
    toggle.setAttribute('aria-expanded', filterOpen ? 'true' : 'false');
    toggle.appendChild(el('span', null, t('filterBy')));
    toggle.appendChild(el('span', 'filter-caret', filterOpen ? '▴' : '▾'));
    if (catCount){
      toggle.appendChild(el('span', 'filter-badge', catCount));
    }
    toggle.addEventListener('click', function(){
      filterOpen = !filterOpen;
      hub();
    });
    wrap.appendChild(toggle);

    if (!filterOpen) return wrap;

    var chips = el('div', 'chips');

    var all = el('button', 'chip' + (catCount ? '' : ' on'), t('allTopics'));
    all.type = 'button';
    all.setAttribute('aria-pressed', catCount ? 'false' : 'true');
    all.addEventListener('click', function(){ toggleCat('all'); });
    chips.appendChild(all);

    allTopics().forEach(function(c){
      var on = !!activeCats[c.id];
      var b = el('button', 'chip' + (on ? ' on' : ''));
      b.type = 'button';
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.appendChild(el('span', 'chip-glyph', c.glyph));
      b.appendChild(document.createTextNode(' ' + GH.i18n.pick(c)));
      b.addEventListener('click', function(){ toggleCat(c.id); });
      chips.appendChild(b);
    });
    wrap.appendChild(chips);
    wrap.appendChild(el('p', 'filter-hint', t('filterHint')));
    return wrap;
  }

  function section(headKey, count){
    var wrap = el('section', 'hub-section');
    wrap.id = 'sec-' + headKey;
    var head = el('div', 'hub-head');
    head.appendChild(el('h2', null, t(headKey)));
    if (count) head.appendChild(el('span', 'hub-count', count));
    wrap.appendChild(head);
    var tiles = el('div', 'tiles');
    wrap.appendChild(tiles);
    wrap._tiles = tiles;
    jumps.push({ id: wrap.id, key: headKey, node: wrap });
    return wrap;
  }

  /* Built last but inserted at the top, once every section is known. */
  function jumpBar(){
    if (jumps.length < 2) return null;
    var bar = el('nav', 'jumpbar');
    bar.setAttribute('aria-label', t('jumpTo'));
    jumps.forEach(function(j){
      var b = el('button', 'jump', t(j.key));
      b.type = 'button';
      b.addEventListener('click', function(){
        if (j.node.scrollIntoView) j.node.scrollIntoView({ behavior:'smooth', block:'start' });
      });
      bar.appendChild(b);
    });
    return bar;
  }

  function hub(){
    GH.speech.stop();
    GH.app.redraw = hub;
    view.textContent = '';
    jumps = [];

    view.appendChild(el('p', 'eyebrow', 'Deutsch · Русский · English'));
    view.appendChild(el('h1', null, t('hubTitle')));
    view.appendChild(el('p', 'lede', t('hubLede')));

    /* sentences by topic */
    var cats = GH_BANK.categories || [];
    var sec = section('sentencesHead', t('byTopic'));
    cats.filter(function(c){ return keep(c.id); }).forEach(function(cat){
      var list = sentencesIn(cat.id);
      var blanks = list.reduce(function(sum, s){ return sum + countBlanks(s); }, 0);
      sec._tiles.appendChild(tile(
        cat.glyph,
        GH.i18n.pick(cat),
        t('itemsN', { n:list.length }),
        t('blanksN', { n:blanks }),
        list.length ? function(){ openSentences(cat); } : null
      ));
    });
    if (sec._tiles.children.length) view.appendChild(sec); else jumps.pop();

    /* stories */
    var stories = GH_BANK.stories || [];
    var shown2 = stories.filter(function(x){ return keep(x.cat); });
    var sec2 = section('storiesHead', t('storiesN', { n:shown2.length }));
    shown2.forEach(function(story){
      var blanks = (story.sentences || []).reduce(function(sum, s){ return sum + countBlanks(s); }, 0);
      var cat = cats.filter(function(c){ return c.id === story.cat; })[0];
      sec2._tiles.appendChild(tile(
        '📖',
        GH.i18n.pick(story.title),
        t('itemsN', { n:(story.sentences || []).length }),
        cat ? GH.i18n.pick(cat) + ' · ' + t('blanksN', { n:blanks }) : t('blanksN', { n:blanks }),
        function(){ openStory(story); }
      ));
    });
    if (sec2._tiles.children.length) view.appendChild(sec2); else jumps.pop();

    /* vocab sets: words first, then the sentences that use them */
    if (window.GH_VOCAB && GH.vocab){
      var sec25 = section('vocabHead', t('byTopic'));
      var any = false;
      /* the original eight plus the vocabulary-only topics */
      allTopics().filter(function(c){ return keep(c.id); }).forEach(function(cat){
        GH.vocab.setsFor(cat.id).forEach(function(set, i){
          any = true;
          sec25._tiles.appendChild(tile(
            cat.glyph,
            GH.i18n.pick(cat) + ' ' + (i + 1),
            t('vocabSetN', { n:set.length }),
            set.slice(0, 3).map(function(w){ return w.de; }).join(' · '),
            function(){ openVocab(cat, set, i + 1); }
          ));
        });
      });
      if (any) view.appendChild(sec25); else jumps.pop();
    }

    /* Section 4: longer stories, one blank per sentence */
    if (window.GH_LONG && GH_LONG.length){
      var shown4 = GH_LONG.filter(function(x){ return keep(x.cat); });
      var sec4 = section('longStoriesHead', t('storiesN', { n:shown4.length }));
      shown4.forEach(function(story){
        var c = cats.filter(function(x){ return x.id === story.cat; })[0];
        sec4._tiles.appendChild(tile(
          '📚',
          GH.i18n.pick(story.title),
          t('itemsN', { n:story.sentences.length }),
          c ? GH.i18n.pick(c) : null,
          function(){ openLongStory(story); }
        ));
      });
      if (sec4._tiles.children.length) view.appendChild(sec4); else jumps.pop();
    }

    /* the word list — reference, not an exercise */
    if (window.GH_VOCAB && GH.reference){
      var secR = section('refHead');
      secR._tiles.appendChild(tile('📖', t('refTitle'),
        t('refCount', { n:GH_VOCAB.length }), null, function(){
          GH.speech.stop();
          view.textContent = '';
          GH.reference.open(view, hub);
        }));
      view.appendChild(secR);
    }

    /* anything registered later */
    if (extras.length){
      var sec3 = section('gamesHead');
      extras.forEach(function(a){
        sec3._tiles.appendChild(tile(a.glyph, GH.i18n.pick(a.name), GH.i18n.pick(a.sub), null, function(){
          GH.speech.stop();
          view.textContent = '';
          a.open(view, hub);
        }));
      });
      view.appendChild(sec3);
    }

    /* Nothing matched the filter at all. */
    if (!jumps.length){
      view.appendChild(el('p', 'empty', t('nothingHere')));
    }

    /* Built last so every section is known, inserted first so they sit
       above them. Filter row first, then the jump row. */
    var anchor = jumps.length ? jumps[0].node : null;
    var jb = jumpBar();
    if (jb && anchor) view.insertBefore(jb, anchor);
    var fb = filterBlock();
    view.insertBefore(fb, jb || anchor || null);
  }

  function openLongStory(story){
    var list = (story.sentences || []).map(function(s){
      return { de:s.de, ru:s.ru, en:s.en, blanks:s.blanks, img:s.img, cat:story.cat };
    });
    view.textContent = '';
    GH.fillBlank.mount(view, {
      title:GH.i18n.pick(story.title),
      subtitle:t('longStoriesHead'),
      cat:story.cat,
      sentences:list,
      ordered:true,
      onExit:hub
    });
  }

  function openVocab(cat, set, num){
    GH.speech.stop();
    view.textContent = '';
    GH.vocab.mount(view, {
      title:GH.i18n.pick(cat) + ' ' + num,
      set:set,
      onExit:hub
    });
  }

  function openSentences(cat){
    var list = GH.text.shuffle(sentencesIn(cat.id));
    view.textContent = '';
    GH.fillBlank.mount(view, {
      title:GH.i18n.pick(cat),
      subtitle:t('sentencesHead'),
      cat:cat.id,
      sentences:list,
      onExit:hub
    });
  }

  function openStory(story){
    var list = (story.sentences || []).map(function(s){
      return { de:s.de, ru:s.ru, en:s.en, blanks:s.blanks, img:s.img, cat:story.cat };
    });
    view.textContent = '';
    GH.fillBlank.mount(view, {
      title:GH.i18n.pick(story.title),
      subtitle:t('storiesHead'),
      cat:story.cat,
      sentences:list,
      ordered:true,
      onExit:hub
    });
  }

  function initLangSwitch(){
    var bar = document.getElementById('langswitch');
    var buttons = bar.querySelectorAll('button');
    function mark(){
      for (var i = 0; i < buttons.length; i++){
        buttons[i].setAttribute('aria-pressed',
          buttons[i].getAttribute('data-lang') === GH.i18n.lang() ? 'true' : 'false');
      }
    }
    for (var i = 0; i < buttons.length; i++){
      buttons[i].addEventListener('click', function(){
        GH.i18n.set(this.getAttribute('data-lang'));
        mark();
      });
    }
    GH.i18n.onChange(function(){
      if (GH.app.redraw) GH.app.redraw();
    });
    mark();
  }

  function start(){
    initLangSwitch();
    GH.i18n.set('ru');   /* opens in Russian */
    hub();
  }

  return { start:start, hub:hub, register:register, redraw:null };
})();

document.addEventListener('DOMContentLoaded', GH.app.start);
