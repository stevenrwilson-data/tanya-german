/* Tokenizing, blank selection, answer matching */

window.GH = window.GH || {};

GH.text = (function(){

  var WORD = /[A-Za-zÄÖÜäöüßẞ]+(?:[-'’][A-Za-zÄÖÜäöüßẞ]+)*/g;
  var BREAK = /[,.;:!?„“”"«»()]/;

  /* how many blanks each sentence contributes */
  var PER_SENTENCE = 3;

  /* words that can open a noun phrase */
  var DET = {};
  ('der die das den dem des ' +
   'ein eine einen einem einer eines ' +
   'kein keine keinen keinem keiner keines ' +
   'mein meine meinen meinem meiner meines ' +
   'dein deine deinen deinem deiner deines ' +
   'sein seine seinen seinem seiner seines ' +
   'ihr ihre ihren ihrem ihrer ihres ' +
   'unser unsere unseren unserem unserer ' +
   'euer eure euren eurem eurer ' +
   'dieser diese dieses diesen diesem ' +
   'jeder jede jedes jeden jedem ' +
   'welcher welche welches welchen welchem ' +
   'am im zum zur ins beim vom aufs').split(' ').forEach(function(w){ DET[w] = true; });

  /* never worth a blank on their own */
  var GLUE = {};
  'und oder aber denn sondern es'.split(' ').forEach(function(w){ GLUE[w] = true; });

  /* pronouns skipped when they open the sentence */
  var OPENERS = {};
  'ich du er sie es wir ihr man'.split(' ').forEach(function(w){ OPENERS[w] = true; });

  /* low-value words when ranking which blanks to keep */
  var LOWVALUE = {};
  ('ist sind bin bist war waren hat habe haben hast ' +
   'mit auf in an von zu nach für über unter bei aus vor ' +
   'noch sehr auch nicht dann jetzt hier dort so als wie ' +
   'wo wann was wer da ja nein um mir mich sich ihm ihn ihr ' +
   'ein eine einen einem einer der die das den dem ' +
   'mein meine sein seine ihre zwei').split(' ').forEach(function(w){ LOWVALUE[w] = true; });

  /* ---------- tokenizing ---------- */

  /* Splits a sentence into ordered pieces covering the whole string,
     so it can be rebuilt exactly. { text, isWord } */
  function tokenize(str){
    var out = [], last = 0, m;
    WORD.lastIndex = 0;
    while ((m = WORD.exec(str)) !== null){
      if (m.index > last) out.push({ text:str.slice(last, m.index), isWord:false });
      out.push({ text:m[0], isWord:true });
      last = m.index + m[0].length;
    }
    if (last < str.length) out.push({ text:str.slice(last), isWord:false });
    return out;
  }

  function words(str){
    var m = str.match(WORD);
    return m ? m : [];
  }

  function capitalized(w){
    var c = w.charAt(0);
    return c === c.toUpperCase() && c !== c.toLowerCase();
  }

  /* attributive adjectives carry one of these endings */
  function adjectiveShaped(w){
    return !capitalized(w) && /(e|en|er|es|em)$/.test(w) && !DET[w.toLowerCase()];
  }

  function hash(str){
    var h = 0, i;
    for (i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    return Math.abs(h);
  }

  /* ---------- blank units ---------- */

  function makeUnit(toks, start, end){
    var text = '', n = 0, i;
    for (i = start; i <= end; i++){
      text += toks[i].text;
      if (toks[i].isWord) n++;
    }
    return { start:start, end:end, text:text, wordCount:n };
  }

  function cleanBetween(toks, start, end){
    var i;
    for (i = start + 1; i < end; i++){
      if (!toks[i].isWord && BREAK.test(toks[i].text)) return false;
    }
    return true;
  }

  /* determiner (+ adjective) + noun, e.g. "der Apfel", "eine neue Jacke" */
  function nounPhrases(toks, wIdx){
    var spans = [], k;
    function isNoun(i){ return i !== undefined && capitalized(toks[i].text) && i !== wIdx[0]; }

    for (k = 0; k < wIdx.length; k++){
      var i = wIdx[k];
      if (!DET[toks[i].text.toLowerCase()]) continue;
      var n1 = wIdx[k + 1], n2 = wIdx[k + 2];
      if (isNoun(n1) && cleanBetween(toks, i, n1)){
        spans.push({ start:i, end:n1 });
        k += 1;
      } else if (n1 !== undefined && adjectiveShaped(toks[n1].text) && isNoun(n2) && cleanBetween(toks, i, n2)){
        spans.push({ start:i, end:n2 });
        k += 2;
      }
    }
    return spans;
  }

  function opensSentence(toks, i, wIdx){
    if (i === wIdx[0]) return true;
    var prev = toks[i - 1];
    return !!(prev && !prev.isWord && /[„“”":]/.test(prev.text));
  }

  function worthBlanking(toks, unit, wIdx){
    if (unit.wordCount > 1) return true;
    var w = toks[unit.start].text.toLowerCase();
    if (GLUE[w]) return false;
    if (OPENERS[w] && opensSentence(toks, unit.start, wIdx)) return false;
    return true;
  }

  function score(toks, unit){
    if (unit.wordCount > 1) return 5;
    var w = toks[unit.start].text;
    if (capitalized(w) && unit.start !== 0) return 4;
    var lw = w.toLowerCase();
    if (LOWVALUE[lw]) return w.length >= 4 ? 2 : 1;
    return w.length >= 4 ? 3 : 2;
  }

  /* Every candidate blank in a sentence. Half of all sentences keep the
     noun phrase together as one blank, half split it word by word — decided
     by the sentence itself, so it never changes between sessions. */
  function allUnits(de){
    var toks = tokenize(de);
    var wIdx = [], spans = [], claimed = {}, i;
    toks.forEach(function(tk, idx){ if (tk.isWord) wIdx.push(idx); });
    if (!wIdx.length) return [];

    if (hash(de) % 2 === 0){
      nounPhrases(toks, wIdx).forEach(function(sp){
        spans.push(sp);
        for (i = sp.start; i <= sp.end; i++) claimed[i] = true;
      });
    }
    wIdx.forEach(function(idx){ if (!claimed[idx]) spans.push({ start:idx, end:idx }); });
    spans.sort(function(a, b){ return a.start - b.start; });

    var units = spans.map(function(sp){ return makeUnit(toks, sp.start, sp.end); });
    var kept = units.filter(function(u){ return worthBlanking(toks, u, wIdx); });
    return kept.length ? kept : units;
  }

  /* The blanks actually used: the highest-value ones, capped per sentence.
     An explicit blanks:[…] in the data overrides all of this. */
  function blankUnits(de, override){
    var toks = tokenize(de);
    var wIdx = [], out = [];
    toks.forEach(function(tk, idx){ if (tk.isWord) wIdx.push(idx); });

    if (Object.prototype.toString.call(override) === '[object Array]' && override.length){
      override.forEach(function(n){
        var i = wIdx[n - 1];
        if (i !== undefined) out.push(makeUnit(toks, i, i));
      });
      return out;
    }

    var cands = allUnits(de);
    var ranked = cands.slice().sort(function(a, b){
      var d = score(toks, b) - score(toks, a);
      return d !== 0 ? d : a.start - b.start;
    }).slice(0, PER_SENTENCE);
    ranked.sort(function(a, b){ return a.start - b.start; });
    return ranked;
  }

  /* ---------- answer matching ---------- */

  function normalize(str){
    return String(str)
      .toLowerCase()
      .replace(/[’']/g, '')
      .replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue')
      .replace(/ß/g,'ss')
      .replace(/\s+/g,' ')
      .trim();
  }

  function distance(a, b){
    if (a === b) return 0;
    var m = a.length, n = b.length;
    if (!m) return n;
    if (!n) return m;
    var prev = new Array(n + 1), cur = new Array(n + 1), i, j;
    for (j = 0; j <= n; j++) prev[j] = j;
    for (i = 1; i <= m; i++){
      cur[0] = i;
      for (j = 1; j <= n; j++){
        var cost = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      }
      for (j = 0; j <= n; j++) prev[j] = cur[j];
    }
    return prev[n];
  }

  /* 'exact' | 'close' | 'no' */
  function compare(input, target){
    var raw = String(input).trim();
    if (!raw) return 'no';
    if (raw === target) return 'exact';
    var a = normalize(raw), b = normalize(target);
    if (a === b) return 'close';        /* right words, wrong case or umlaut spelling */
    var limit = b.length <= 4 ? 1 : 2;
    return distance(a, b) <= limit ? 'close' : 'no';
  }

  function shuffle(arr){
    var a = arr.slice(), i, j, tmp;
    for (i = a.length - 1; i > 0; i--){
      j = Math.floor(Math.random() * (i + 1));
      tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  return {
    tokenize:tokenize,
    words:words,
    capitalized:capitalized,
    allUnits:allUnits,
    blankUnits:blankUnits,
    normalize:normalize,
    distance:distance,
    compare:compare,
    shuffle:shuffle
  };
})();
