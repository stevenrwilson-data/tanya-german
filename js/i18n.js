/* Interface language: ru (default), de, en */

window.GH = window.GH || {};

GH.i18n = (function(){

  var STRINGS = {
    ru:{
      tagline:'Немецкий язык',
      hubTitle:'Что будем делать?',
      hubLede:'Послушай предложение, вставь пропущенное слово, послушай ещё раз.',
      sentencesHead:'Раздел 1 · Предложения',
      gamesHead:'Игры',
      longStoriesHead:'Раздел 4 · Длинные истории',
      storiesHead:'Раздел 2 · Короткие истории',
      byTopic:'по темам',
      itemsN:'{n} предложений',
      blanksN:'{n} пропусков',
      storiesN:'{n} историй',
      noneYet:'Пока ничего нет — добавь в data/sentences.js',
      vocabHead:'Раздел 3 · Слова',
      vocabWords:'Сначала слова',
      vocabSentences:'Теперь предложения',
      vocabDone:'Готово: {n} слов и все предложения к ним.',
      vocabRetry:'Не то. Попробуй ещё раз.',
      vocabSetN:'{n} слов',
      vShapePic:'Картинка',
      vShapeWord:'Слово',
      vShapeMean:'Перевод',
      vShapeBlank:'Пропуск',
      autoPlay:'Авто',
      autoPlayOn:'Немецкий звучит сразу — нажми, чтобы выключить',
      autoPlayOff:'Немецкий звучит только после ответа — нажми, чтобы включить',
      back:'Назад',
      listen:'Послушать',
      listenAgain:'Послушать ещё раз',
      choose:'Выбрать',
      type:'Написать',
      typeHere:'Напиши слово…',
      check:'Проверить',
      next:'Дальше',
      finish:'Готово',
      skip:'Не знаю',
      progress:'{i} из {n}',
      right:'Верно!',
      wrong:'Не то. Попробуй ещё раз.',
      closeSpelling:'Почти! Правильно так: {word}',
      answerWas:'Правильный ответ: {word}',
      doneBadge:'Готово',
      doneTitle:'Всё сделано!',
      doneLede:'{n} пропусков заполнено.',
      again:'Ещё раз',
      toHub:'К списку'
    },
    de:{
      tagline:'Deutsch üben',
      hubTitle:'Was möchtest du üben?',
      hubLede:'Satz anhören, fehlendes Wort einsetzen, noch einmal anhören.',
      sentencesHead:'Teil 1 · Sätze',
      gamesHead:'Spiele',
      longStoriesHead:'Teil 4 · Lange Geschichten',
      storiesHead:'Teil 2 · Kurze Geschichten',
      byTopic:'nach Thema',
      itemsN:'{n} Sätze',
      blanksN:'{n} Lücken',
      storiesN:'{n} Geschichten',
      noneYet:'Noch nichts da — in data/sentences.js eintragen',
      vocabHead:'Teil 3 · Wörter',
      vocabWords:'Zuerst die Wörter',
      vocabSentences:'Jetzt die Sätze',
      vocabDone:'Fertig: {n} Wörter und alle Sätze dazu.',
      vocabRetry:'Nicht richtig. Versuch es noch einmal.',
      vocabSetN:'{n} Wörter',
      vShapePic:'Bild',
      vShapeWord:'Wort',
      vShapeMean:'Übersetzung',
      vShapeBlank:'Lücke',
      autoPlay:'Auto',
      autoPlayOn:'Deutsch wird gleich vorgelesen — zum Ausschalten tippen',
      autoPlayOff:'Deutsch erst nach der Antwort — zum Einschalten tippen',
      back:'Zurück',
      listen:'Anhören',
      listenAgain:'Noch einmal anhören',
      choose:'Auswählen',
      type:'Schreiben',
      typeHere:'Wort schreiben…',
      check:'Prüfen',
      next:'Weiter',
      finish:'Fertig',
      skip:'Weiß nicht',
      progress:'{i} von {n}',
      right:'Richtig!',
      wrong:'Nicht ganz. Versuch es noch einmal.',
      closeSpelling:'Fast! Richtig ist: {word}',
      answerWas:'Richtige Antwort: {word}',
      doneBadge:'Fertig',
      doneTitle:'Alles geschafft!',
      doneLede:'{n} Lücken ausgefüllt.',
      again:'Noch einmal',
      toHub:'Zur Übersicht'
    },
    en:{
      tagline:'German practice',
      hubTitle:'What do you want to practice?',
      hubLede:'Hear the sentence, fill in the missing word, hear it again.',
      sentencesHead:'Section 1 · Sentences',
      gamesHead:'Games',
      longStoriesHead:'Section 4 · Long stories',
      storiesHead:'Section 2 · Short stories',
      byTopic:'by topic',
      itemsN:'{n} sentences',
      blanksN:'{n} blanks',
      storiesN:'{n} stories',
      noneYet:'Nothing here yet — add some in data/sentences.js',
      vocabHead:'Section 3 · Words',
      vocabWords:'Words first',
      vocabSentences:'Now the sentences',
      vocabDone:'Done: {n} words and every sentence for them.',
      vocabRetry:'Not that one. Try again.',
      vocabSetN:'{n} words',
      vShapePic:'Picture',
      vShapeWord:'Word',
      vShapeMean:'Meaning',
      vShapeBlank:'Blank',
      autoPlay:'Auto',
      autoPlayOn:'German plays first — tap to switch off',
      autoPlayOff:'German plays only after you answer — tap to switch on',
      back:'Back',
      listen:'Listen',
      listenAgain:'Listen again',
      choose:'Choose',
      type:'Type',
      typeHere:'Type the word…',
      check:'Check',
      next:'Next',
      finish:'Finish',
      skip:'Skip',
      progress:'{i} of {n}',
      right:'Correct!',
      wrong:'Not that one. Try again.',
      closeSpelling:'Close! The correct spelling is: {word}',
      answerWas:'Correct answer: {word}',
      doneBadge:'Done',
      doneTitle:'All finished!',
      doneLede:'{n} blanks filled in.',
      again:'Do it again',
      toHub:'Back to the list'
    }
  };

  var current = 'ru';
  var listeners = [];

  function t(key, vars){
    var table = STRINGS[current] || STRINGS.ru;
    var s = table[key];
    if (s === undefined) s = STRINGS.ru[key];
    if (s === undefined) return key;
    if (vars){
      Object.keys(vars).forEach(function(k){
        s = s.split('{' + k + '}').join(vars[k]);
      });
    }
    return s;
  }

  function lang(){ return current; }

  function set(code){
    if (!STRINGS[code]) return;
    current = code;
    document.documentElement.setAttribute('lang', code);
    applyStatic();
    listeners.forEach(function(fn){ fn(code); });
  }

  function onChange(fn){ listeners.push(fn); }

  /* fills any element carrying data-i18n="key" */
  function applyStatic(root){
    var scope = root || document;
    var nodes = scope.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++){
      nodes[i].textContent = t(nodes[i].getAttribute('data-i18n'));
    }
  }

  /* picks the right label off a {ru,de,en} object */
  function pick(obj){
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[current] || obj.ru || obj.en || obj.de || '';
  }

  return { t:t, lang:lang, set:set, onChange:onChange, applyStatic:applyStatic, pick:pick };
})();
