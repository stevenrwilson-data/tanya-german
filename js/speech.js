/* Speaks German with the browser's built-in voices */

window.GH = window.GH || {};

GH.speech = (function(){

  var voice = null;
  var supported = typeof window.speechSynthesis !== 'undefined';

  /* Higher is better. Taking the first de-DE voice is wrong: on macOS the
     list starts with Apple's Eloquence novelty voices (Sandy, Grandma,
     Rocko), which sound far worse than the plain compact voice. */
  function score(v){
    var uri = (v.voiceURI || v.name || '').toLowerCase();
    var s = 0;
    if (uri.indexOf('premium') >= 0) s = 500;
    else if (uri.indexOf('enhanced') >= 0) s = 400;
    else if (uri.indexOf('siri') >= 0) s = 350;
    else if (uri.indexOf('eloquence') >= 0) s = 10;   /* novelty, last resort */
    else if (uri.indexOf('compact') >= 0) s = 100;
    else s = 200;                                      /* unknown, assume normal */
    if (v.lang === 'de-DE') s += 30;                   /* prefer Germany over AT/CH */
    return s;
  }

  function pickVoice(){
    if (!supported) return;
    var list = window.speechSynthesis.getVoices() || [];
    var de = list.filter(function(v){
      return v.lang && v.lang.toLowerCase().indexOf('de') === 0;
    });
    if (!de.length){ voice = null; return; }
    de.sort(function(a, b){ return score(b) - score(a); });
    voice = de[0];
  }

  /* so the chosen voice can be checked on a device that isn't in front of us */
  function voiceName(){
    return voice ? (voice.name + ' | ' + voice.voiceURI) : 'none';
  }

  if (supported){
    pickVoice();
    window.speechSynthesis.onvoiceschanged = pickVoice;
  }

  function stop(){
    if (supported) window.speechSynthesis.cancel();
  }

  /* onDone runs whether it finished or failed, so buttons never get stuck */
  function say(text, onDone){
    if (!supported || !text){ if (onDone) onDone(); return; }
    stop();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'de-DE';
    if (voice) u.voice = voice;
    u.rate = 0.85;
    u.pitch = 1;
    var settled = false;
    function finish(){ if (!settled){ settled = true; if (onDone) onDone(); } }
    u.onend = finish;
    u.onerror = finish;
    window.speechSynthesis.speak(u);
    /* safety net for browsers that drop onend */
    setTimeout(finish, 1200 + text.length * 110);
  }

  return { say:say, stop:stop, supported:supported, voiceName:voiceName };
})();
