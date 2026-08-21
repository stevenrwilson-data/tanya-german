/* Wörterbuch — the whole vocabulary in one scrolling list.

   Not an exercise. Paper has one advantage over every drill in this
   app: you can see the whole set at once and notice the patterns —
   that Jacke and Tasche are both feminine, that half the verbs end in
   -en. A single-item screen can never show that. So this is her sheet
   of paper, with the pictures and the audio attached.

   Grouping is the point. The same 278 entries sorted by gender teach
   something different from the same entries sorted by topic. */

window.GH = window.GH || {};

GH.reference = (function(){

  var host = null;
  var state = null;

  function t(k, v){ return GH.i18n.t(k, v); }

  function el(tag, cls, text){
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }

  /* ---------- classifying ---------- */

  function article(de){
    var w = de.split(' ')[0].toLowerCase();
    return (w === 'der' || w === 'die' || w === 'das') ? w : null;
  }

  /* An entry can start with an article without being a noun:
     'das Gesicht waschen' and 'die Augen schließen' are verb phrases,
     'der Zug hat Verspätung' is a clause. German capitalises nouns and
     not infinitives, so the last word decides it, and a length cap of
     three rules out the clauses. Without this the gender groupings would
     happily try to compare the gender of "to wash the face". */
  function isNounEntry(de){
    if (!article(de)) return false;
    var p = de.split(/\s+/);
    if (p.length > 3) return false;
    return /^[A-ZÄÖÜ]/.test(p[p.length - 1]);
  }

  function bareNoun(de){
    var a = article(de);
    return a ? de.split(' ').slice(1).join(' ') : de;
  }

  /* Shape, not grammar: an entry with an article and few words is a
     noun, one ending in -en without an article is a verb, a lone word
     is an adjective, anything longer is a phrase. Good enough to sort
     by, and wrong on nothing that matters. */
  function shape(v){
    var parts = v.de.split(' ');
    var last = parts[parts.length - 1];
    if (article(v.de) && parts.length <= 3) return 'noun';
    if (/(en|ern|eln)$/.test(last) && !article(v.de)) return 'verb';
    if (parts.length === 1) return 'adj';
    return 'phrase';
  }

  function isPlural(v){
    return article(v.de) === 'die' && /s$/.test(v.en) && !/ss$/.test(v.en);
  }

  function isCompound(v){
    var p = v.de.split(' ');
    return !!article(v.de) && p.length === 2 && p[1].length >= 11;
  }

  /* Russian gender comes from the data now — an explicit label per
     entry rather than a guess from the word ending, which got -ь nouns
     wrong and read plurals like 'яйца' as feminine.

     rg is the gender of the Russian as written; rgs is the singular's
     gender when the Russian is plural. Where either language uses a
     plural the comparison is skipped: gender only means something
     singular to singular, and we hold no German singular for entries
     like 'die Augen'. */
  var DE_TO_RU = { der:'M', die:'F', das:'N' };

  function genderMatch(v){
    var a = article(v.de);
    if (!a || !v.rg || !isNounEntry(v.de)) return null;
    if (v.rg === 'PL' || isPlural(v)) return null;
    return DE_TO_RU[a] === v.rg ? 'same' : 'differ';
  }

  /* ---------- the groupings ---------- */

  var VIEWS = [
    { id:'topic',  key:'refByTopic' },
    { id:'gender', key:'refByGender' },
    { id:'type',   key:'refByType' },
    { id:'gsame',  key:'refGenderSame' },
    { id:'gdiff',  key:'refGenderDiff' },
    { id:'plural', key:'refPlurals' },
    { id:'compound', key:'refCompounds' },
    { id:'alpha',  key:'refAlpha' },
    { id:'number', key:'refByNumber' }
  ];

  function pool(){
    var V = (window.GH_VOCAB || []).slice();
    if (!state.catCount) return V;
    return V.filter(function(v){ return state.cats[v.cat]; });
  }

  function groups(view){
    var V = pool();
    var out = [];

    function push(label, items, note){
      if (items.length) out.push({ label:label, items:items, note:note || '' });
    }

    if (view === 'topic'){
      (GH_BANK.categories || []).forEach(function(c){
        push(GH.i18n.pick(c), V.filter(function(v){ return v.cat === c.id; }));
      });
      return out;
    }

    if (view === 'gender'){
      ['der', 'die', 'das'].forEach(function(a){
        push(a, V.filter(function(v){ return article(v.de) === a; }), t('refGender_' + a));
      });
      push(t('refNoArticle'), V.filter(function(v){ return !article(v.de); }));
      return out;
    }

    if (view === 'type'){
      [['noun', 'refNouns'], ['verb', 'refVerbs'], ['adj', 'refAdjs'], ['phrase', 'refPhrases']]
        .forEach(function(pair){
          push(t(pair[1]), V.filter(function(v){ return shape(v) === pair[0]; }));
        });
      return out;
    }

    if (view === 'gsame' || view === 'gdiff'){
      var want = view === 'gsame' ? 'same' : 'differ';
      var hits = V.filter(function(v){ return genderMatch(v) === want; });
      /* inside the differ list, split by what German uses — that is the
         thing she has to remember */
      ['der', 'die', 'das'].forEach(function(a){
        push(a, hits.filter(function(v){ return article(v.de) === a; }),
             t(want === 'same' ? 'refSameNote' : 'refDiffNote'));
      });
      var missing = V.filter(function(v){ return isNounEntry(v.de) && !v.rg; }).length;
      if (missing) push(t('refNoRussian'), [], t('refNoRussianNote', { n:missing }));
      return out;
    }

    if (view === 'plural'){
      push(t('refPlurals'), V.filter(isPlural), t('refPluralNote'));
      return out;
    }

    if (view === 'compound'){
      push(t('refCompounds'), V.filter(isCompound), t('refCompoundNote'));
      return out;
    }

    if (view === 'alpha'){
      var sorted = V.slice().sort(function(a, b){
        return bareNoun(a.de).localeCompare(bareNoun(b.de), 'de');
      });
      var letter = null, bucket = [];
      sorted.forEach(function(v){
        var L = bareNoun(v.de).charAt(0).toUpperCase();
        if (L !== letter){
          if (bucket.length) push(letter, bucket);
          letter = L; bucket = [];
        }
        bucket.push(v);
      });
      if (bucket.length) push(letter, bucket);
      return out;
    }

    /* number: her own generation order, in blocks of the sheet */
    var block = [];
    var from = 1;
    V.slice().sort(function(a, b){ return a.n - b.n; }).forEach(function(v){
      block.push(v);
      if (block.length === 30){
        push('#' + from + '–' + v.n, block);
        block = []; from = v.n + 1;
      }
    });
    if (block.length) push('#' + from + '–' + block[block.length - 1].n, block);
    return out;
  }

  /* Same collapsed-chip filter as the hub. Applied to the pool before
     grouping rather than to the rendered rows, so it narrows the list
     whichever way it is currently sorted — filtering to Кухня and then
     switching to A–Z gives the kitchen words alphabetically, not the
     whole vocabulary again. */
  /* One topic list for the whole app. Every topic has both sentences and
     words now, so there is nothing to filter out — the three that used to
     group sentences only were folded into the vocabulary topics their
     images already belonged to. */
  function allTopics(){
    return (GH_BANK.categories || []).slice();
  }

  function toggleCat(id){
    if (id === 'all'){
      state.cats = {}; state.catCount = 0;
    } else if (state.cats[id]){
      delete state.cats[id]; state.catCount--;
    } else {
      state.cats[id] = true; state.catCount++;
    }
    paint();
  }

  function filterBlock(){
    var wrap = el('div', 'filterwrap');

    var toggle = el('button', 'filter-toggle' + (state.catCount ? ' has' : ''));
    toggle.type = 'button';
    toggle.setAttribute('aria-expanded', state.filterOpen ? 'true' : 'false');
    toggle.appendChild(el('span', null, t('filterBy')));
    toggle.appendChild(el('span', 'filter-caret', state.filterOpen ? '▴' : '▾'));
    if (state.catCount) toggle.appendChild(el('span', 'filter-badge', state.catCount));
    toggle.addEventListener('click', function(){
      state.filterOpen = !state.filterOpen;
      paint();
    });
    wrap.appendChild(toggle);

    if (!state.filterOpen) return wrap;

    var chips = el('div', 'chips');
    var all = el('button', 'chip' + (state.catCount ? '' : ' on'), t('allTopics'));
    all.type = 'button';
    all.addEventListener('click', function(){ toggleCat('all'); });
    chips.appendChild(all);

    allTopics().forEach(function(c){
      var on = !!state.cats[c.id];
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

  /* ---------- painting ---------- */

  /* A row is two targets, not one: the picture opens the lightbox, the
     text speaks the word. Nested buttons are invalid HTML, so the row is
     a plain div holding two buttons rather than one button wrapping
     another. */
  function row(v){
    var wrap = el('div', 'ref-row');

    var thumb = el('button', 'ref-thumb');
    thumb.type = 'button';
    thumb.setAttribute('aria-label', 'Enlarge ' + v.de);
    thumb.appendChild(GH.sprite.tile(v.n));
    thumb.addEventListener('click', function(){ GH.lightbox.open(v.n, v); });
    wrap.appendChild(thumb);

    var b = el('button', 'ref-body');
    b.type = 'button';

    var de = el('span', 'ref-de');
    var a = article(v.de);
    if (a){
      de.appendChild(el('span', 'ref-art art-' + a, a));
      de.appendChild(document.createTextNode(' ' + bareNoun(v.de)));
    } else {
      de.appendChild(document.createTextNode(v.de));
    }
    b.appendChild(de);

    var lang = GH.i18n.lang();
    var gloss = (lang === 'ru' && v.ru) ? v.ru : v.en;
    var line = el('span', 'ref-gloss');
    line.appendChild(document.createTextNode(gloss));
    if (v.rg){
      line.appendChild(el('span', 'ref-rg ' + (v.rg === 'PL' ? 'rg-pl' : 'rg-' + v.rg.toLowerCase()),
                          v.rg === 'PL' && v.rgs ? 'PL·' + v.rgs : v.rg));
    }
    b.appendChild(line);
    if (lang === 'ru' && v.ru && v.en !== v.ru){
      b.appendChild(el('span', 'ref-gloss2', v.en));
    }
    b.appendChild(el('span', 'ref-num', '#' + v.n));

    b.addEventListener('click', function(){ GH.speech.say(v.de); });
    wrap.appendChild(b);
    return wrap;
  }

  function paint(){
    host.textContent = '';

    var head = el('div', 'practice-head');
    var back = el('button', 'backlink', '‹ ' + t('back'));
    back.type = 'button';
    back.addEventListener('click', function(){ state.onExit(); });
    head.appendChild(back);

    var titles = el('div', 'practice-title');
    titles.appendChild(el('h1', null, t('refTitle')));
    titles.appendChild(el('p', null, t('refCount', { n:(window.GH_VOCAB || []).length })));
    head.appendChild(titles);
    host.appendChild(head);

    host.appendChild(filterBlock());

    var picker = el('div', 'ref-views');
    VIEWS.forEach(function(view){
      var b = el('button', 'ref-view', t(view.key));
      b.type = 'button';
      b.setAttribute('aria-pressed', state.view === view.id ? 'true' : 'false');
      b.addEventListener('click', function(){
        state.view = view.id;
        state.open = {};          /* group labels differ per view */
        paint();
      });
      picker.appendChild(b);
    });
    host.appendChild(picker);

    var shown = pool().length, total = (window.GH_VOCAB || []).length;
    host.appendChild(el('p', 'ref-hint',
      (shown === total ? t('refTapHint2')
                       : t('refShowing', { i:shown, n:total }) + ' · ' + t('refTapHint2'))));

    /* Groups start closed. 341 rows in one scroll is the thing that made
       this section unusable; a screen of headings you can open is not.
       A group opens on its own when it is the only one left after
       filtering, since collapsing a list of one is just an extra tap. */
    var gs = groups(state.view);
    var soloOpen = gs.length === 1;

    /* Jump row: Все opens everything, each other pill opens that one
       group and scrolls to it. Without this, "open all" hands you back
       the 341-row scroll the collapsing was meant to solve. */
    var jump = el('div', 'ref-jump');

    var allBtn = el('button', 'ref-jump-btn' + (state.allOpen ? ' on' : ''),
                    t('refAll') + ' · ' + pool().length);
    allBtn.type = 'button';
    allBtn.addEventListener('click', function(){
      state.allOpen = !state.allOpen;
      state.open = {};
      paint();
    });
    jump.appendChild(allBtn);

    var nodes = {};
    gs.forEach(function(g){
      var isOpen = soloOpen || state.allOpen || !!state.open[g.label];
      var b = el('button', 'ref-jump-btn' + (isOpen ? ' on' : ''));
      b.type = 'button';
      b.appendChild(el('span', null, g.label));
      b.appendChild(el('span', 'ref-jump-n', g.items.length));
      b.addEventListener('click', function(){
        if (state.allOpen){
          state.allOpen = false;
          state.open = {};
          gs.forEach(function(x){ state.open[x.label] = true; });
        }
        state.open[g.label] = true;
        state.scrollTo = g.label;
        paint();
      });
      jump.appendChild(b);
    });
    host.appendChild(jump);

    var list = el('div', 'ref-list');
    gs.forEach(function(g){
      var isOpen = soloOpen || state.allOpen || !!state.open[g.label];

      var h = el('button', 'ref-group' + (isOpen ? ' open' : ''));
      h.type = 'button';
      h.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      h.appendChild(el('span', 'ref-group-caret', isOpen ? '▾' : '▸'));
      h.appendChild(el('span', 'ref-group-name', g.label));
      h.appendChild(el('span', 'ref-group-count', g.items.length));
      if (g.note) h.appendChild(el('span', 'ref-group-note', g.note));
      h.addEventListener('click', function(){
        if (state.allOpen){
          state.allOpen = false;
          state.open = {};
          gs.forEach(function(x){ state.open[x.label] = true; });
        }
        if (state.open[g.label]) delete state.open[g.label];
        else state.open[g.label] = true;
        paint();
      });
      list.appendChild(h);
      nodes[g.label] = h;

      if (isOpen) g.items.forEach(function(v){ list.appendChild(row(v)); });
    });
    host.appendChild(list);

    if (state.scrollTo && nodes[state.scrollTo] && nodes[state.scrollTo].scrollIntoView){
      nodes[state.scrollTo].scrollIntoView({ behavior:'smooth', block:'start' });
    }
    state.scrollTo = null;
  }

  function open(container, onExit){
    host = container;
    state = { onExit:onExit, view:'topic', cats:{}, catCount:0,
              filterOpen:false, open:{}, allOpen:false, scrollTo:null };
    paint();
  }

  return { open:open };
})();
