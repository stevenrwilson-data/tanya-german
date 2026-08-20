/* Colour themes.

   Each theme is a block of CSS variables in css/style.css. This sets
   data-theme on <html>; the stylesheet does the rest.

   To add one: add the block in style.css, then add its id and label
   here. The two lists must agree.

   Runs from <head> so the stored theme is applied before first paint. */

window.GH = window.GH || {};

GH.theme = (function(){

  var THEMES = [
    { id:'sand',  label:'Sand'  },
    { id:'mint',  label:'Mint'  },
    { id:'plum',  label:'Plum'  },
    { id:'orchid', label:'Orchid' },
    { id:'moss', label:'Moss' },
    { id:'lagoon', label:'Lagoon' },
    { id:'tobacco', label:'Tobacco' },
    { id:'citrus', label:'Citrus' },
    { id:'grove', label:'Grove' }
  ];

  var KEY = 'gh-theme';
  var current = 'sand';

  function known(id){
    for (var i = 0; i < THEMES.length; i++) if (THEMES[i].id === id) return true;
    return false;
  }

  /* Private browsing on iOS throws on localStorage rather than
     returning null, so every access is wrapped. */
  function stored(){
    try { return window.localStorage.getItem(KEY); } catch (e){ return null; }
  }
  function remember(id){
    try { window.localStorage.setItem(KEY, id); } catch (e){}
  }

  function apply(id){
    if (!known(id)) id = 'sand';
    current = id;
    /* Sand is the :root default, so it carries no attribute. */
    if (id === 'sand') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', id);
  }

  function set(id){
    apply(id);
    remember(current);
    mark();
  }

  var bar = null;

  function mark(){
    if (!bar) return;
    var buttons = bar.querySelectorAll('button');
    for (var i = 0; i < buttons.length; i++){
      buttons[i].setAttribute('aria-pressed',
        buttons[i].getAttribute('data-theme') === current ? 'true' : 'false');
    }
  }

  /* Builds the swatch row. Called once the header exists. */
  function init(){
    bar = document.getElementById('themeswitch');
    if (!bar) return;
    THEMES.forEach(function(t){
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'swatch';
      b.setAttribute('data-theme', t.id);
      b.setAttribute('title', t.label);
      b.setAttribute('aria-label', t.label);
      /* the dot previews the theme without switching to it */
      b.innerHTML = '<span class="swatch-dot swatch-' + t.id + '"></span>';
      b.addEventListener('click', function(){ set(t.id); });
      bar.appendChild(b);
    });
    mark();
  }

  apply(stored() || 'sand');

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { set:set, list:THEMES, current:function(){ return current; } };
})();
