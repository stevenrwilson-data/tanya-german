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
    if (!a || !v.rg) return null;
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

  function groups(view){
    var V = (window.GH_VOCAB || []).slice();
    var out = [];

    function push(label, items, note){
      if (items.length) out.push({ label:label, items:items, note:note || '' });
    }

    if (view === 'topic'){
      (GH_BANK.categories || []).concat(window.GH_VOCAB_CATS || []).forEach(function(c){
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
      var missing = V.filter(function(v){ return article(v.de) && !v.rg; }).length;
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

  /* ---------- painting ---------- */

  function row(v){
    var b = el('button', 'ref-row');
    b.type = 'button';

    var thumb = el('span', 'ref-thumb');
    thumb.appendChild(GH.sprite.tile(v.n));
    b.appendChild(thumb);

    var body = el('span', 'ref-body');

    var de = el('span', 'ref-de');
    var a = article(v.de);
    if (a){
      de.appendChild(el('span', 'ref-art art-' + a, a));
      de.appendChild(document.createTextNode(' ' + bareNoun(v.de)));
    } else {
      de.appendChild(document.createTextNode(v.de));
    }
    body.appendChild(de);

    var lang = GH.i18n.lang();
    var gloss = (lang === 'ru' && v.ru) ? v.ru : v.en;
    var line = el('span', 'ref-gloss');
    line.appendChild(document.createTextNode(gloss));
    if (v.rg){
      var tag = el('span', 'ref-rg ' + (v.rg === 'PL' ? 'rg-pl' : 'rg-' + v.rg.toLowerCase()),
                   v.rg === 'PL' && v.rgs ? 'PL·' + v.rgs : v.rg);
      line.appendChild(tag);
    }
    body.appendChild(line);
    if (lang === 'ru' && v.ru && v.en !== v.ru){
      body.appendChild(el('span', 'ref-gloss2', v.en));
    }
    body.appendChild(el('span', 'ref-num', '#' + v.n));

    b.appendChild(body);
    b.addEventListener('click', function(){ GH.speech.say(v.de); });
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
    titles.appendChild(el('h1', null, t('refTitle')));
    titles.appendChild(el('p', null, t('refCount', { n:(window.GH_VOCAB || []).length })));
    head.appendChild(titles);
    host.appendChild(head);

    var picker = el('div', 'ref-views');
    VIEWS.forEach(function(view){
      var b = el('button', 'ref-view', t(view.key));
      b.type = 'button';
      b.setAttribute('aria-pressed', state.view === view.id ? 'true' : 'false');
      b.addEventListener('click', function(){ state.view = view.id; paint(); });
      picker.appendChild(b);
    });
    host.appendChild(picker);

    host.appendChild(el('p', 'ref-hint', t('refTapHint')));

    var list = el('div', 'ref-list');
    groups(state.view).forEach(function(g){
      var h = el('div', 'ref-group');
      h.appendChild(el('span', 'ref-group-name', g.label));
      h.appendChild(el('span', 'ref-group-count', g.items.length));
      if (g.note) h.appendChild(el('span', 'ref-group-note', g.note));
      list.appendChild(h);
      g.items.forEach(function(v){ list.appendChild(row(v)); });
    });
    host.appendChild(list);
  }

  function open(container, onExit){
    host = container;
    state = { onExit:onExit, view:'topic' };
    paint();
  }

  return { open:open };
})();
