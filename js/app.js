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
    if (Object.prototype.toString.call(s.blanks) === '[object Array]' && s.blanks.length) return s.blanks.length;
    return GH.text.words(s.de).length;
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

  function section(headKey, count){
    var wrap = el('section', 'hub-section');
    var head = el('div', 'hub-head');
    head.appendChild(el('h2', null, t(headKey)));
    if (count) head.appendChild(el('span', 'hub-count', count));
    wrap.appendChild(head);
    var tiles = el('div', 'tiles');
    wrap.appendChild(tiles);
    wrap._tiles = tiles;
    return wrap;
  }

  function hub(){
    GH.speech.stop();
    GH.app.redraw = hub;
    view.textContent = '';

    view.appendChild(el('p', 'eyebrow', 'Deutsch · Русский · English'));
    view.appendChild(el('h1', null, t('hubTitle')));
    view.appendChild(el('p', 'lede', t('hubLede')));

    /* sentences by topic */
    var cats = GH_BANK.categories || [];
    var sec = section('sentencesHead', t('byTopic'));
    cats.forEach(function(cat){
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
    view.appendChild(sec);

    /* stories */
    var stories = GH_BANK.stories || [];
    var sec2 = section('storiesHead', t('storiesN', { n:stories.length }));
    if (!stories.length){
      sec2._tiles.appendChild(el('p', 'empty', t('noneYet')));
    }
    stories.forEach(function(story){
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
    view.appendChild(sec2);

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
