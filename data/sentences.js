/* ============================================================
   THE BANK — the only file you edit to add content.

   A sentence:
   {
     id:'unique-id',
     cat:'body' | 'shopping' | 'beauty' | 'food' |
         'home' | 'family' | 'weather' | 'travel',
     de:'German sentence.',
     ru:'Russian translation.',
     en:'English translation.',
     blanks:[2,4]            // OPTIONAL. Word positions to blank out,
                             // counting words from 1. Leave it out and
                             // every word gets its turn as the blank.
     img:137                 // OPTIONAL. The image's number. Images live
                             // nine to a 3x3 sheet in images/1.jpg …
                             // images/31.jpg; the number is the address,
                             // so 137 is sheet 16, row 0, col 1.
   }

   A story is a title plus an ordered list of the same sentence objects.
   ============================================================ */

window.GH_BANK = {

  /* Sprite sheet layout. Nine images per sheet, reading order.
     Sheets are images/1.jpg .. images/31.jpg, each 1024 x 1536. */
  sheets: { prefix:'images/', ext:'.jpg', cols:3, rows:3, pad:1, aspect:'2 / 3' },

  categories: [
    { id:'body',     glyph:'🖐', ru:'Тело',       de:'Körper',              en:'Body' },
    { id:'shopping', glyph:'🛍', ru:'Покупки',    de:'Einkaufen',           en:'Shopping' },
    { id:'beauty',   glyph:'💄', ru:'Косметика',  de:'Make-up',             en:'Makeup & beauty' },
    { id:'food',     glyph:'🍞', ru:'Еда',        de:'Essen',               en:'Food' },
    { id:'home',     glyph:'🏠', ru:'Дом и быт',  de:'Zuhause und Alltag',  en:'Home & daily life' },
    { id:'family',   glyph:'👪', ru:'Семья',      de:'Familie',             en:'Family' },
    { id:'weather',  glyph:'☀️', ru:'Погода',     de:'Wetter',              en:'Weather' },
    { id:'travel',   glyph:'🚌', ru:'Транспорт',  de:'Reisen und Verkehr',  en:'Travel & transport' }
  ],

  sentences: [

    /* ---------- 1. Körper ---------- */
    { id:'bo01', cat:'body', de:'Mein Kopf tut weh.',            ru:'У меня болит голова.',        en:'My head hurts.', img:128 },
    { id:'bo02', cat:'body', de:'Ich habe zwei Hände.',          ru:'У меня две руки.',            en:'I have two hands.', img:3 },
    { id:'bo03', cat:'body', de:'Meine Hände sind kalt.',        ru:'Мои руки холодные.',          en:'My hands are cold.', img:124 },
    { id:'bo04', cat:'body', de:'Meine Füße sind müde.',         ru:'Мои ноги устали.',            en:'My feet are tired.', img:125 },
    { id:'bo05', cat:'body', de:'Ich habe blaue Augen.',         ru:'У меня голубые глаза.',       en:'I have blue eyes.', img:2 },
    { id:'bo06', cat:'body', de:'Meine Haare sind lang.',        ru:'Мои волосы длинные.',         en:'My hair is long.', img:5 },
    { id:'bo07', cat:'body', de:'Ich wasche meine Hände.',       ru:'Я мою руки.',                 en:'I wash my hands.', img:143 },
    { id:'bo08', cat:'body', de:'Ich putze meine Zähne.',        ru:'Я чищу зубы.',                en:'I brush my teeth.', img:145 },
    { id:'bo09', cat:'body', de:'Mein Rücken tut weh.',          ru:'У меня болит спина.',         en:'My back hurts.', img:127 },
    { id:'bo10', cat:'body', de:'Mein Bauch tut weh.',           ru:'У меня болит живот.',         en:'My stomach hurts.', img:129 },
    { id:'bo11', cat:'body', de:'Meine Augen sind müde.',        ru:'Мои глаза устали.',           en:'My eyes are tired.', img:126 },
    { id:'bo12', cat:'body', de:'Ich öffne meine Augen.',        ru:'Я открываю глаза.',           en:'I open my eyes.', img:149 },
    { id:'bo13', cat:'body', de:'Ich habe eine kleine Nase.',    ru:'У меня маленький нос.',       en:'I have a small nose.', img:10 },
    { id:'bo14', cat:'body', de:'Meine Haut ist trocken.',       ru:'Моя кожа сухая.',             en:'My skin is dry.', img:131 },
    { id:'bo15', cat:'body', de:'Ich bewege meine Arme.',        ru:'Я двигаю руками.',            en:'I move my arms.', img:150 },
    { id:'bo16', cat:'body', de:'Mein Bein tut weh.',            ru:'У меня болит нога.',          en:'My leg hurts.', img:130 },
    { id:'bo17', cat:'body', de:'Ich habe zehn Finger.',         ru:'У меня десять пальцев.',      en:'I have ten fingers.', img:14 },
    { id:'bo18', cat:'body', de:'Meine Ohren sind kalt.',        ru:'Мои уши холодные.',           en:'My ears are cold.', img:15 },
    { id:'bo19', cat:'body', de:'Ich fühle mich gut.',           ru:'Я чувствую себя хорошо.',     en:'I feel good.', img:119 },
    { id:'bo20', cat:'body', de:'Ich bin heute müde.',           ru:'Сегодня я устала.',           en:'I am tired today.', img:116 },

    /* ---------- 2. Einkaufen ---------- */
    { id:'sh01', cat:'shopping', de:'Ich gehe einkaufen.',              ru:'Я иду по магазинам.',           en:'I am going shopping.', img:166 },
    { id:'sh02', cat:'shopping', de:'Ich brauche eine neue Jacke.',     ru:'Мне нужна новая куртка.',       en:'I need a new jacket.', img:16 },
    { id:'sh03', cat:'shopping', de:'Wie viel kostet das?',             ru:'Сколько это стоит?',            en:'How much does that cost?', img:173 },
    { id:'sh04', cat:'shopping', de:'Das ist zu teuer.',                ru:'Это слишком дорого.',           en:'That is too expensive.', img:253 },
    { id:'sh05', cat:'shopping', de:'Das ist sehr billig.',             ru:'Это очень дёшево.',             en:'That is very cheap.', img:254 },
    { id:'sh06', cat:'shopping', de:'Ich möchte dieses Kleid.',         ru:'Я хочу это платье.',            en:'I would like this dress.', img:18 },
    { id:'sh07', cat:'shopping', de:'Haben Sie das in Schwarz?',        ru:'У вас это есть в чёрном?',      en:'Do you have that in black?', img:17 },
    { id:'sh08', cat:'shopping', de:'Haben Sie eine kleinere Größe?',   ru:'У вас есть размер меньше?',     en:'Do you have a smaller size?', img:25 },
    { id:'sh09', cat:'shopping', de:'Ich suche neue Schuhe.',           ru:'Я ищу новые туфли.',            en:'I am looking for new shoes.', img:19 },
    { id:'sh10', cat:'shopping', de:'Diese Schuhe sind schön.',         ru:'Эти туфли красивые.',           en:'These shoes are beautiful.', img:26 },
    { id:'sh11', cat:'shopping', de:'Die Hose ist zu groß.',            ru:'Брюки слишком большие.',        en:'The pants are too big.', img:20 },
    { id:'sh12', cat:'shopping', de:'Das Kleid passt gut.',             ru:'Платье хорошо сидит.',          en:'The dress fits well.', img:257 },
    { id:'sh13', cat:'shopping', de:'Wo ist die Kasse?',                ru:'Где касса?',                    en:'Where is the checkout?', img:23 },
    { id:'sh14', cat:'shopping', de:'Ich bezahle mit Karte.',           ru:'Я плачу картой.',               en:'I pay by card.', img:176 },
    { id:'sh15', cat:'shopping', de:'Ich brauche eine Tasche.',         ru:'Мне нужна сумка.',              en:'I need a bag.', img:21 },
    { id:'sh16', cat:'shopping', de:'Ich kaufe nur eine Sache.',        ru:'Я покупаю только одну вещь.',   en:'I am buying only one thing.', img:175 },
    { id:'sh17', cat:'shopping', de:'Der Laden ist heute offen.',       ru:'Магазин сегодня открыт.',       en:'The store is open today.', img:259 },
    { id:'sh18', cat:'shopping', de:'Ich mag diese Farbe.',             ru:'Мне нравится этот цвет.',       en:'I like this color.', img:134 },
    { id:'sh19', cat:'shopping', de:'Kann ich das anprobieren?',        ru:'Можно это примерить?',          en:'Can I try that on?', img:171 },
    { id:'sh20', cat:'shopping', de:'Ich nehme es.',                    ru:'Я это беру.',                   en:'I will take it.', img:178 },

    /* ---------- 3. Make-up und Schönheit ---------- */
    { id:'be01', cat:'beauty', de:'Ich trage heute Make-up.',              ru:'Сегодня я накрашена.',                  en:'I am wearing makeup today.', img:37 },
    { id:'be02', cat:'beauty', de:'Ich benutze Lippenstift.',              ru:'Я пользуюсь помадой.',                  en:'I use lipstick.', img:158 },
    { id:'be03', cat:'beauty', de:'Der Lippenstift ist rot.',              ru:'Помада красная.',                       en:'The lipstick is red.', img:31 },
    { id:'be04', cat:'beauty', de:'Ich mag rosa Nagellack.',               ru:'Мне нравится розовый лак для ногтей.',  en:'I like pink nail polish.', img:33 },
    { id:'be05', cat:'beauty', de:'Ich lackiere meine Nägel.',             ru:'Я красю ногти.',                        en:'I paint my nails.', img:161 },
    { id:'be06', cat:'beauty', de:'Meine Haare sind frisch gewaschen.',    ru:'Мои волосы свежевымытые.',              en:'My hair is freshly washed.', img:261 },
    { id:'be07', cat:'beauty', de:'Ich wasche meine Haare.',               ru:'Я мою волосы.',                         en:'I wash my hair.', img:147 },
    { id:'be08', cat:'beauty', de:'Ich brauche eine neue Haarbürste.',     ru:'Мне нужна новая щётка для волос.',      en:'I need a new hairbrush.', img:35 },
    { id:'be09', cat:'beauty', de:'Ich benutze eine Gesichtscreme.',       ru:'Я пользуюсь кремом для лица.',          en:'I use a face cream.', img:162 },
    { id:'be10', cat:'beauty', de:'Meine Haut ist sehr weich.',            ru:'Моя кожа очень мягкая.',                en:'My skin is very soft.', img:132 },
    { id:'be11', cat:'beauty', de:'Diese Creme riecht gut.',               ru:'Этот крем хорошо пахнет.',              en:'This cream smells good.', img:42 },
    { id:'be12', cat:'beauty', de:'Ich schminke meine Augen.',             ru:'Я красю глаза.',                        en:'I put makeup on my eyes.', img:160 },
    { id:'be13', cat:'beauty', de:'Ich benutze Mascara.',                  ru:'Я пользуюсь тушью.',                    en:'I use mascara.', img:38 },
    { id:'be14', cat:'beauty', de:'Ich brauche einen Spiegel.',            ru:'Мне нужно зеркало.',                    en:'I need a mirror.', img:39 },
    { id:'be15', cat:'beauty', de:'Mein Parfüm riecht schön.',             ru:'Мои духи приятно пахнут.',              en:'My perfume smells nice.', img:40 },
    { id:'be16', cat:'beauty', de:'Ich kämme meine Haare.',                ru:'Я расчёсываю волосы.',                  en:'I comb my hair.', img:146 },
    { id:'be17', cat:'beauty', de:'Ich möchte meine Haare schneiden.',     ru:'Я хочу подстричь волосы.',              en:'I want to cut my hair.', img:164 },
    { id:'be18', cat:'beauty', de:'Meine Nägel sind kurz.',                ru:'Мои ногти короткие.',                   en:'My nails are short.', img:34 },
    { id:'be19', cat:'beauty', de:'Diese Farbe gefällt mir.',              ru:'Этот цвет мне нравится.',               en:'I like this color.', img:134 },
    { id:'be20', cat:'beauty', de:'Ich mache mich für den Abend fertig.',  ru:'Я готовлюсь к вечеру.',                 en:'I am getting ready for the evening.', img:260 },

    /* ---------- 4. Essen ---------- */
    { id:'fo01', cat:'food', de:'Ich habe Hunger.',                 ru:'Я голодна.',                    en:'I am hungry.', img:121 },
    { id:'fo02', cat:'food', de:'Ich möchte etwas essen.',          ru:'Я хочу что-нибудь поесть.',     en:'I want to eat something.', img:179 },
    { id:'fo03', cat:'food', de:'Ich esse gern Gemüse.',            ru:'Я люблю овощи.',                en:'I like eating vegetables.', img:181 },
    { id:'fo04', cat:'food', de:'Ich mag frisches Brot.',           ru:'Мне нравится свежий хлеб.',     en:'I like fresh bread.', img:46 },
    { id:'fo05', cat:'food', de:'Der Kaffee ist heiß.',             ru:'Кофе горячий.',                 en:'The coffee is hot.', img:47 },
    { id:'fo06', cat:'food', de:'Die Suppe ist lecker.',            ru:'Суп вкусный.',                  en:'The soup is tasty.', img:48 },
    { id:'fo07', cat:'food', de:'Ich trinke viel Wasser.',          ru:'Я пью много воды.',             en:'I drink a lot of water.', img:153 },
    { id:'fo08', cat:'food', de:'Ich esse einen Apfel.',            ru:'Я ем яблоко.',                  en:'I am eating an apple.', img:185 },
    { id:'fo09', cat:'food', de:'Zum Frühstück esse ich Eier.',     ru:'На завтрак я ем яйца.',         en:'I eat eggs for breakfast.', img:186 },
    { id:'fo10', cat:'food', de:'Ich trinke Tee mit Milch.',        ru:'Я пью чай с молоком.',          en:'I drink tea with milk.', img:184 },
    { id:'fo11', cat:'food', de:'Ich möchte einen Salat.',          ru:'Я хочу салат.',                 en:'I would like a salad.', img:55 },
    { id:'fo12', cat:'food', de:'Das Essen ist fertig.',            ru:'Еда готова.',                   en:'The food is ready.', img:262 },
    { id:'fo13', cat:'food', de:'Ich koche heute Abend.',           ru:'Сегодня вечером я готовлю.',    en:'I am cooking tonight.', img:189 },
    { id:'fo14', cat:'food', de:'Wir brauchen Kartoffeln.',         ru:'Нам нужна картошка.',           en:'We need potatoes.', img:56 },
    { id:'fo15', cat:'food', de:'Ich schneide eine Tomate.',        ru:'Я режу помидор.',               en:'I am cutting a tomato.', img:192 },
    { id:'fo16', cat:'food', de:'Ich esse kein Fleisch.',           ru:'Я не ем мясо.',                 en:'I do not eat meat.', img:58 },
    { id:'fo17', cat:'food', de:'Die Schokolade ist süß.',          ru:'Шоколад сладкий.',              en:'The chocolate is sweet.', img:59 },
    { id:'fo18', cat:'food', de:'Die Zitrone ist sauer.',           ru:'Лимон кислый.',                 en:'The lemon is sour.', img:60 },
    { id:'fo19', cat:'food', de:'Ich möchte noch etwas Kaffee.',    ru:'Я хочу ещё немного кофе.',      en:'I would like some more coffee.', img:183 },
    { id:'fo20', cat:'food', de:'Ich bin satt.',                    ru:'Я сыта.',                       en:'I am full.', img:122 },

    /* ---------- 5. Zuhause und Alltag ---------- */
    { id:'ho01', cat:'home', de:'Ich bin zu Hause.',                ru:'Я дома.',                       en:'I am at home.', img:65 },
    { id:'ho02', cat:'home', de:'Ich stehe um sieben Uhr auf.',     ru:'Я встаю в семь часов.',         en:'I get up at seven o\u2019clock.', img:200 },
    { id:'ho03', cat:'home', de:'Ich mache mein Bett.',             ru:'Я убираю постель.',             en:'I make my bed.', img:201 },
    { id:'ho04', cat:'home', de:'Ich öffne das Fenster.',           ru:'Я открываю окно.',              en:'I open the window.', img:202 },
    { id:'ho05', cat:'home', de:'Ich mache das Licht an.',          ru:'Я включаю свет.',               en:'I turn on the light.', img:203 },
    { id:'ho06', cat:'home', de:'Ich mache das Licht aus.',         ru:'Я выключаю свет.',              en:'I turn off the light.', img:204 },
    { id:'ho07', cat:'home', de:'Ich räume mein Zimmer auf.',       ru:'Я убираю в комнате.',           en:'I tidy my room.', img:205 },
    { id:'ho08', cat:'home', de:'Ich wasche die Wäsche.',           ru:'Я стираю бельё.',               en:'I wash the laundry.', img:207 },
    { id:'ho09', cat:'home', de:'Ich mache die Küche sauber.',      ru:'Я убираю кухню.',               en:'I clean the kitchen.', img:208 },
    { id:'ho10', cat:'home', de:'Ich sitze auf dem Sofa.',          ru:'Я сижу на диване.',             en:'I am sitting on the sofa.', img:209 },
    { id:'ho11', cat:'home', de:'Die Wohnung ist warm.',            ru:'В квартире тепло.',             en:'The apartment is warm.', img:66 },
    { id:'ho12', cat:'home', de:'Die Tür ist offen.',               ru:'Дверь открыта.',                en:'The door is open.', img:74 },
    { id:'ho13', cat:'home', de:'Ich brauche einen neuen Tisch.',   ru:'Мне нужен новый стол.',         en:'I need a new table.', img:75 },
    { id:'ho14', cat:'home', de:'Mein Handy liegt auf dem Bett.',   ru:'Мой телефон лежит на кровати.', en:'My phone is on the bed.', img:76 },
    { id:'ho15', cat:'home', de:'Ich sehe am Abend fern.',          ru:'Вечером я смотрю телевизор.',   en:'I watch TV in the evening.', img:210 },
    { id:'ho16', cat:'home', de:'Ich gehe spät ins Bett.',          ru:'Я поздно ложусь спать.',        en:'I go to bed late.', img:211 },
    { id:'ho17', cat:'home', de:'Ich schlafe acht Stunden.',        ru:'Я сплю восемь часов.',          en:'I sleep for eight hours.', img:212 },
    { id:'ho18', cat:'home', de:'Heute bleibe ich zu Hause.',       ru:'Сегодня я остаюсь дома.',       en:'Today I am staying home.', img:213 },
    { id:'ho19', cat:'home', de:'Ich habe viel zu tun.',            ru:'У меня много дел.',             en:'I have a lot to do.', img:206 },
    { id:'ho20', cat:'home', de:'Jetzt habe ich Zeit.',             ru:'Сейчас у меня есть время.',     en:'Now I have time.', img:137 },

    /* ---------- 6. Familie ---------- */
    { id:'fa01', cat:'family', de:'Ich habe einen Sohn.',                       ru:'У меня есть сын.',                  en:'I have a son.', img:80 },
    { id:'fa02', cat:'family', de:'Mein Sohn ist in der Schule.',               ru:'Мой сын в школе.',                  en:'My son is at school.', img:90 },
    { id:'fa03', cat:'family', de:'Meine Mutter wohnt weit weg.',               ru:'Моя мама живёт далеко.',            en:'My mother lives far away.', img:81 },
    { id:'fa04', cat:'family', de:'Mein Vater arbeitet heute.',                 ru:'Мой папа сегодня работает.',        en:'My father is working today.', img:82 },
    { id:'fa05', cat:'family', de:'Ich habe eine Schwester.',                   ru:'У меня есть сестра.',               en:'I have a sister.', img:83 },
    { id:'fa06', cat:'family', de:'Ich habe einen Bruder.',                     ru:'У меня есть брат.',                 en:'I have a brother.', img:84 },
    { id:'fa07', cat:'family', de:'Meine Familie ist wichtig für mich.',        ru:'Моя семья важна для меня.',         en:'My family is important to me.', img:86 },
    { id:'fa08', cat:'family', de:'Wir essen zusammen.',                        ru:'Мы едим вместе.',                   en:'We eat together.', img:223 },
    { id:'fa09', cat:'family', de:'Wir sprechen jeden Tag.',                    ru:'Мы разговариваем каждый день.',     en:'We talk every day.', img:219 },
    { id:'fa10', cat:'family', de:'Ich rufe meine Mutter an.',                  ru:'Я звоню маме.',                     en:'I call my mother.', img:221 },
    { id:'fa11', cat:'family', de:'Mein Sohn spielt draußen.',                  ru:'Мой сын играет на улице.',          en:'My son is playing outside.', img:87 },
    { id:'fa12', cat:'family', de:'Wir besuchen meine Familie.',                ru:'Мы навещаем мою семью.',            en:'We visit my family.', img:222 },
    { id:'fa13', cat:'family', de:'Meine Eltern sind zu Hause.',                ru:'Мои родители дома.',                en:'My parents are at home.', img:85 },
    { id:'fa14', cat:'family', de:'Mein Bruder ist älter als ich.',             ru:'Мой брат старше меня.',             en:'My brother is older than me.', img:84 },
    { id:'fa15', cat:'family', de:'Meine Schwester ist jünger als ich.',        ru:'Моя сестра младше меня.',           en:'My sister is younger than me.', img:83 },
    { id:'fa16', cat:'family', de:'Wir trinken zusammen Kaffee.',               ru:'Мы вместе пьём кофе.',              en:'We drink coffee together.', img:224 },
    { id:'fa17', cat:'family', de:'Meine Familie lebt in einer anderen Stadt.', ru:'Моя семья живёт в другом городе.',  en:'My family lives in another city.', img:110 },
    { id:'fa18', cat:'family', de:'Heute hat mein Sohn Schule.',                ru:'Сегодня у моего сына школа.',       en:'My son has school today.', img:92 },
    { id:'fa19', cat:'family', de:'Wir sehen zusammen einen Film.',             ru:'Мы вместе смотрим фильм.',          en:'We watch a movie together.', img:225 },
    { id:'fa20', cat:'family', de:'Ich liebe meine Familie.',                   ru:'Я люблю свою семью.',               en:'I love my family.', img:86 },

    /* ---------- 7. Wetter ---------- */
    { id:'we01', cat:'weather', de:'Heute ist es kalt.',                    ru:'Сегодня холодно.',              en:'It is cold today.', img:101 },
    { id:'we02', cat:'weather', de:'Heute ist es warm.',                    ru:'Сегодня тепло.',                en:'It is warm today.', img:102 },
    { id:'we03', cat:'weather', de:'Die Sonne scheint.',                    ru:'Солнце светит.',                en:'The sun is shining.', img:232 },
    { id:'we04', cat:'weather', de:'Es regnet heute.',                      ru:'Сегодня идёт дождь.',           en:'It is raining today.', img:230 },
    { id:'we05', cat:'weather', de:'Es schneit draußen.',                    ru:'На улице идёт снег.',           en:'It is snowing outside.', img:231 },
    { id:'we06', cat:'weather', de:'Der Himmel ist blau.',                  ru:'Небо синее.',                   en:'The sky is blue.', img:96 },
    { id:'we07', cat:'weather', de:'Es ist sehr windig.',                   ru:'Очень ветрено.',                en:'It is very windy.', img:233 },
    { id:'we08', cat:'weather', de:'Ich brauche eine Jacke.',               ru:'Мне нужна куртка.',             en:'I need a jacket.', img:16 },
    { id:'we09', cat:'weather', de:'Das Wetter ist schön.',                 ru:'Погода хорошая.',               en:'The weather is nice.', img:268 },
    { id:'we10', cat:'weather', de:'Das Wetter ist schlecht.',              ru:'Погода плохая.',                en:'The weather is bad.', img:103 },
    { id:'we11', cat:'weather', de:'Am Morgen ist es kühl.',                ru:'Утром прохладно.',              en:'It is cool in the morning.', img:265 },
    { id:'we12', cat:'weather', de:'Am Abend wird es kalt.',                ru:'Вечером становится холодно.',   en:'It gets cold in the evening.', img:123 },
    { id:'we13', cat:'weather', de:'Ich mag den Sommer.',                   ru:'Я люблю лето.',                 en:'I like summer.', img:93 },
    { id:'we14', cat:'weather', de:'Ich mag den Frühling.',                 ru:'Я люблю весну.',                en:'I like spring.' },
    { id:'we15', cat:'weather', de:'Im Winter ist es kalt.',                ru:'Зимой холодно.',                en:'It is cold in winter.', img:104 },
    { id:'we16', cat:'weather', de:'Im Sommer ist es heiß.',                ru:'Летом жарко.',                  en:'It is hot in summer.', img:93 },
    { id:'we17', cat:'weather', de:'Heute gibt es viele Wolken.',           ru:'Сегодня много облаков.',        en:'There are many clouds today.', img:98 },
    { id:'we18', cat:'weather', de:'Ich nehme einen Regenschirm mit.',      ru:'Я беру с собой зонт.',          en:'I am taking an umbrella with me.', img:235 },
    { id:'we19', cat:'weather', de:'Morgen soll es regnen.',                ru:'Завтра обещают дождь.',         en:'It is supposed to rain tomorrow.', img:267 },
    { id:'we20', cat:'weather', de:'Hoffentlich ist es morgen sonnig.',     ru:'Надеюсь, завтра будет солнечно.', en:'Hopefully it is sunny tomorrow.', img:102 },

    /* ---------- 8. Reisen und Verkehr ---------- */
    { id:'tr01', cat:'travel', de:'Ich fahre mit dem Bus.',             ru:'Я езжу на автобусе.',                   en:'I travel by bus.', img:237 },
    { id:'tr02', cat:'travel', de:'Ich fahre mit dem Zug.',             ru:'Я езжу на поезде.',                     en:'I travel by train.', img:238 },
    { id:'tr03', cat:'travel', de:'Der Bus kommt um acht Uhr.',         ru:'Автобус приходит в восемь часов.',      en:'The bus comes at eight o\u2019clock.', img:107 },
    { id:'tr04', cat:'travel', de:'Der Zug ist spät.',                  ru:'Поезд опаздывает.',                     en:'The train is late.', img:270 },
    { id:'tr05', cat:'travel', de:'Ich warte auf den Bus.',             ru:'Я жду автобус.',                        en:'I am waiting for the bus.', img:239 },
    { id:'tr06', cat:'travel', de:'Wo ist der Bahnhof?',                ru:'Где вокзал?',                           en:'Where is the train station?', img:108 },
    { id:'tr07', cat:'travel', de:'Wo ist die Bushaltestelle?',         ru:'Где автобусная остановка?',             en:'Where is the bus stop?', img:107 },
    { id:'tr08', cat:'travel', de:'Ich brauche eine Fahrkarte.',        ru:'Мне нужен билет.',                      en:'I need a ticket.', img:109 },
    { id:'tr09', cat:'travel', de:'Ich möchte nach Berlin fahren.',     ru:'Я хочу поехать в Берлин.',              en:'I want to go to Berlin.', img:252 },
    { id:'tr10', cat:'travel', de:'Die Fahrt dauert eine Stunde.',      ru:'Поездка длится час.',                   en:'The trip takes one hour.', img:113 },
    { id:'tr11', cat:'travel', de:'Ich steige hier aus.',               ru:'Я выхожу здесь.',                       en:'I get off here.', img:244 },
    { id:'tr12', cat:'travel', de:'Ich steige in den Bus ein.',         ru:'Я сажусь в автобус.',                   en:'I get on the bus.', img:243 },
    { id:'tr13', cat:'travel', de:'Der Bahnhof ist nicht weit.',        ru:'Вокзал недалеко.',                      en:'The train station is not far.', img:241 },
    { id:'tr14', cat:'travel', de:'Ich fahre morgen in die Stadt.',     ru:'Завтра я еду в город.',                 en:'I am going to the city tomorrow.', img:250 },
    { id:'tr15', cat:'travel', de:'Wir fahren am Wochenende weg.',      ru:'На выходные мы уезжаем.',               en:'We are going away for the weekend.', img:111 },
    { id:'tr16', cat:'travel', de:'Ich nehme meinen Koffer mit.',       ru:'Я беру с собой чемодан.',               en:'I am taking my suitcase.', img:249 },
    { id:'tr17', cat:'travel', de:'Mein Pass ist in meiner Tasche.',    ru:'Мой паспорт в сумке.',                  en:'My passport is in my bag.' },
    { id:'tr18', cat:'travel', de:'Wann fährt der nächste Zug?',        ru:'Когда отправляется следующий поезд?',   en:'When does the next train leave?', img:106 },
    { id:'tr19', cat:'travel', de:'Dieser Bus fährt ins Zentrum.',      ru:'Этот автобус идёт в центр.',            en:'This bus goes to the city center.', img:110 },
    { id:'tr20', cat:'travel', de:'Ich bin fast da.',                   ru:'Я почти на месте.',                     en:'I am almost there.', img:271 }
  ],

  stories: [

    /* ---------- Körper ---------- */
    {
      id:'st-bo-1', cat:'body',
      title:{ ru:'Долгий день', de:'Ein langer Tag', en:'A long day' },
      sentences:[
        { de:'Tanya ist heute müde.',
          ru:'Таня сегодня усталая.',
          en:'Tanya is tired today.', img:117 },
        { de:'Ihre Augen sind müde und ihr Rücken tut weh.',
          ru:'Её глаза устали, и у неё болит спина.',
          en:'Her eyes are tired and her back hurts.', img:127 },
        { de:'Sie setzt sich auf das Sofa.',
          ru:'Она садится на диван.',
          en:'She sits down on the sofa.', img:151 },
        { de:'Sie trinkt ein Glas Wasser.',
          ru:'Она пьёт стакан воды.',
          en:'She drinks a glass of water.', img:45 },
        { de:'Dann macht sie die Augen für zehn Minuten zu.',
          ru:'Потом она закрывает глаза на десять минут.',
          en:'Then she closes her eyes for ten minutes.', img:148 },
        { de:'Danach fühlt sie sich besser.',
          ru:'После этого она чувствует себя лучше.',
          en:'After that she feels better.', img:278 }
      ]
    },
    {
      id:'st-bo-2', cat:'body',
      title:{ ru:'Утром', de:'Am Morgen', en:'In the morning' },
      sentences:[
        { de:'Tanya steht am Morgen auf.',
          ru:'Утром Таня встаёт.',
          en:'Tanya gets up in the morning.', img:200 },
        { de:'Sie wäscht ihr Gesicht und ihre Hände.',
          ru:'Она моет лицо и руки.',
          en:'She washes her face and her hands.', img:144 },
        { de:'Dann putzt sie ihre Zähne.',
          ru:'Потом она чистит зубы.',
          en:'Then she brushes her teeth.', img:145 },
        { de:'Sie bürstet ihre Haare.',
          ru:'Она расчёсывает волосы щёткой.',
          en:'She brushes her hair.', img:146 },
        { de:'Ihre Hände sind ein bisschen kalt.',
          ru:'Её руки немного холодные.',
          en:'Her hands are a little cold.', img:124 },
        { de:'Sie zieht einen warmen Pullover an.',
          ru:'Она надевает тёплый свитер.',
          en:'She puts on a warm sweater.', img:154 }
      ]
    },

    /* ---------- Einkaufen ---------- */
    {
      id:'st-sh-1', cat:'shopping',
      title:{ ru:'Новая куртка', de:'Eine neue Jacke', en:'A new jacket' },
      sentences:[
        { de:'Tanya geht in ein Geschäft.',
          ru:'Таня заходит в магазин.',
          en:'Tanya goes into a store.', img:22 },
        { de:'Sie braucht eine neue Jacke.',
          ru:'Ей нужна новая куртка.',
          en:'She needs a new jacket.', img:170 },
        { de:'Sie sieht eine schwarze Jacke.',
          ru:'Она видит чёрную куртку.',
          en:'She sees a black jacket.', img:17 },
        { de:'Die Jacke ist schön, aber zu groß.',
          ru:'Куртка красивая, но слишком большая.',
          en:'The jacket is beautiful but too big.', img:255 },
        { de:'Sie fragt: „Haben Sie eine kleinere Größe?“',
          ru:'Она спрашивает: «У вас есть размер меньше?»',
          en:'She asks: “Do you have a smaller size?”', img:25 },
        { de:'Die kleinere Jacke passt gut, und Tanya kauft sie.',
          ru:'Куртка поменьше хорошо сидит, и Таня её покупает.',
          en:'The smaller jacket fits well, and Tanya buys it.', img:133 }
      ]
    },
    {
      id:'st-sh-2', cat:'shopping',
      title:{ ru:'Новые туфли', de:'Neue Schuhe', en:'New shoes' },
      sentences:[
        { de:'Tanya sucht neue Schuhe.',
          ru:'Таня ищет новые туфли.',
          en:'Tanya is looking for new shoes.', img:19 },
        { de:'Sie findet ein schönes Paar.',
          ru:'Она находит красивую пару.',
          en:'She finds a nice pair.', img:26 },
        { de:'Die Schuhe kosten sechzig Euro.',
          ru:'Туфли стоят шестьдесят евро.',
          en:'The shoes cost sixty euros.', img:23 },
        { de:'Tanya probiert sie an.',
          ru:'Таня их примеряет.',
          en:'Tanya tries them on.', img:172 },
        { de:'Sie sind bequem und passen gut.',
          ru:'Они удобные и хорошо сидят.',
          en:'They are comfortable and fit well.', img:133 },
        { de:'Tanya sagt: „Ich nehme sie.“',
          ru:'Таня говорит: «Я их беру».',
          en:'Tanya says: “I will take them.”', img:178 }
      ]
    },

    /* ---------- Make-up ---------- */
    {
      id:'st-be-1', cat:'beauty',
      title:{ ru:'На вечер', de:'Für den Abend', en:'For the evening' },
      sentences:[
        { de:'Tanya geht heute Abend aus.',
          ru:'Сегодня вечером Таня идёт гулять.',
          en:'Tanya is going out tonight.', img:136 },
        { de:'Sie wäscht ihre Haare und kämmt sie.',
          ru:'Она моет волосы и расчёсывает их.',
          en:'She washes her hair and combs it.', img:147 },
        { de:'Dann benutzt sie ein bisschen Make-up.',
          ru:'Потом она наносит немного макияжа.',
          en:'Then she uses a little makeup.', img:37 },
        { de:'Sie trägt Mascara und roten Lippenstift.',
          ru:'На ней тушь и красная помада.',
          en:'She wears mascara and red lipstick.', img:31 },
        { de:'Sie sieht in den Spiegel.',
          ru:'Она смотрит в зеркало.',
          en:'She looks in the mirror.', img:157 },
        { de:'Sie ist fertig und gefällt sich.',
          ru:'Она готова, и она себе нравится.',
          en:'She is ready and likes how she looks.', img:135 }
      ]
    },
    {
      id:'st-be-2', cat:'beauty',
      title:{ ru:'В магазине косметики', de:'Im Kosmetikgeschäft', en:'At the cosmetics store' },
      sentences:[
        { de:'Tanya geht in ein Kosmetikgeschäft.',
          ru:'Таня идёт в магазин косметики.',
          en:'Tanya goes into a cosmetics store.', img:41 },
        { de:'Sie braucht eine neue Gesichtscreme.',
          ru:'Ей нужен новый крем для лица.',
          en:'She needs a new face cream.', img:36 },
        { de:'Sie findet zwei Cremes.',
          ru:'Она находит два крема.',
          en:'She finds two creams.', img:42 },
        { de:'Eine Creme ist teuer, aber sie riecht sehr gut.',
          ru:'Один крем дорогой, но он очень хорошо пахнет.',
          en:'One cream is expensive, but it smells very good.', img:253 },
        { de:'Tanya kauft die kleinere Packung.',
          ru:'Таня покупает упаковку поменьше.',
          en:'Tanya buys the smaller package.', img:43 },
        { de:'Zu Hause probiert sie die Creme aus.',
          ru:'Дома она пробует крем.',
          en:'At home she tries the cream.', img:36 }
      ]
    },

    /* ---------- Essen ---------- */
    {
      id:'st-fo-1', cat:'food',
      title:{ ru:'Завтрак', de:'Frühstück', en:'Breakfast' },
      sentences:[
        { de:'Tanya hat am Morgen Hunger.',
          ru:'Утром Таня голодная.',
          en:'Tanya is hungry in the morning.', img:263 },
        { de:'Sie macht zwei Eier und etwas Brot.',
          ru:'Она готовит два яйца и немного хлеба.',
          en:'She makes two eggs and some bread.', img:51 },
        { de:'Sie schneidet auch eine Tomate.',
          ru:'Она также режет помидор.',
          en:'She also cuts a tomato.', img:57 },
        { de:'Dazu trinkt sie Tee mit Milch.',
          ru:'К этому она пьёт чай с молоком.',
          en:'With it she drinks tea with milk.', img:53 },
        { de:'Das Frühstück ist einfach, aber lecker.',
          ru:'Завтрак простой, но вкусный.',
          en:'The breakfast is simple but tasty.', img:52 },
        { de:'Danach ist Tanya satt.',
          ru:'После этого Таня сыта.',
          en:'Afterward Tanya is full.', img:122 }
      ]
    },
    {
      id:'st-fo-2', cat:'food',
      title:{ ru:'Ужин', de:'Abendessen', en:'Dinner' },
      sentences:[
        { de:'Am Abend kocht Tanya eine Suppe.',
          ru:'Вечером Таня варит суп.',
          en:'In the evening Tanya cooks a soup.', img:191 },
        { de:'Sie braucht Kartoffeln, Karotten und Zwiebeln.',
          ru:'Ей нужны картошка, морковь и лук.',
          en:'She needs potatoes, carrots and onions.', img:56 },
        { de:'Sie schneidet das Gemüse und gibt es in einen Topf.',
          ru:'Она режет овощи и кладёт их в кастрюлю.',
          en:'She cuts the vegetables and puts them into a pot.', img:197 },
        { de:'Die Suppe kocht zwanzig Minuten.',
          ru:'Суп варится двадцать минут.',
          en:'The soup cooks for twenty minutes.', img:63 },
        { de:'Dann probiert Tanya die Suppe.',
          ru:'Потом Таня пробует суп.',
          en:'Then Tanya tastes the soup.', img:198 },
        { de:'Sie schmeckt sehr gut.',
          ru:'Он очень вкусный.',
          en:'It tastes very good.', img:48 }
      ]
    },

    /* ---------- Zuhause und Alltag ---------- */
    {
      id:'st-ho-1', cat:'home',
      title:{ ru:'Спокойная суббота', de:'Ein ruhiger Samstag', en:'A quiet Saturday' },
      sentences:[
        { de:'Heute ist Samstag.',
          ru:'Сегодня суббота.',
          en:'Today is Saturday.' },
        { de:'Tanya bleibt zu Hause.',
          ru:'Таня остаётся дома.',
          en:'Tanya stays home.', img:65 },
        { de:'Am Morgen macht sie ihr Bett und öffnet das Fenster.',
          ru:'Утром она убирает постель и открывает окно.',
          en:'In the morning she makes her bed and opens the window.', img:67 },
        { de:'Dann räumt sie die Wohnung auf.',
          ru:'Потом она убирает квартиру.',
          en:'Then she tidies the apartment.', img:70 },
        { de:'Am Nachmittag sitzt sie auf dem Sofa und trinkt Kaffee.',
          ru:'Днём она сидит на диване и пьёт кофе.',
          en:'In the afternoon she sits on the sofa and drinks coffee.', img:73 },
        { de:'Am Abend sieht sie einen Film.',
          ru:'Вечером она смотрит фильм.',
          en:'In the evening she watches a movie.', img:141 }
      ]
    },
    {
      id:'st-ho-2', cat:'home',
      title:{ ru:'Где мой телефон?', de:'Wo ist mein Handy?', en:'Where is my phone?' },
      sentences:[
        { de:'Tanya möchte ihr Handy benutzen.',
          ru:'Таня хочет воспользоваться телефоном.',
          en:'Tanya wants to use her phone.', img:76 },
        { de:'Aber sie findet es nicht.',
          ru:'Но она его не находит.',
          en:'But she cannot find it.', img:275 },
        { de:'Sie schaut auf den Tisch und auf das Sofa.',
          ru:'Она смотрит на стол и на диван.',
          en:'She looks on the table and on the sofa.', img:215 },
        { de:'Dort ist es nicht.',
          ru:'Там его нет.',
          en:'It is not there.', img:216 },
        { de:'Dann schaut sie auf ihr Bett.',
          ru:'Потом она смотрит на кровать.',
          en:'Then she looks on her bed.', img:217 },
        { de:'Das Handy liegt unter einem Pullover.',
          ru:'Телефон лежит под свитером.',
          en:'The phone is under a sweater.', img:79 }
      ]
    },

    /* ---------- Familie ---------- */
    {
      id:'st-fa-1', cat:'family',
      title:{ ru:'После школы', de:'Nach der Schule', en:'After school' },
      sentences:[
        { de:'Nazar kommt von der Schule nach Hause.',
          ru:'Назар приходит из школы домой.',
          en:'Nazar comes home from school.', img:226 },
        { de:'Er hat Hunger.',
          ru:'Он голодный.',
          en:'He is hungry.', img:121 },
        { de:'Tanya macht ihm etwas zu essen.',
          ru:'Таня готовит ему что-нибудь поесть.',
          en:'Tanya makes him something to eat.', img:199 },
        { de:'Dann erzählt Nazar von seinem Tag.',
          ru:'Потом Назар рассказывает о своём дне.',
          en:'Then Nazar talks about his day.', img:227 },
        { de:'Später machen sie zusammen die Hausaufgaben.',
          ru:'Позже они вместе делают домашнее задание.',
          en:'Later they do the homework together.', img:229 },
        { de:'Am Abend sehen sie einen Film.',
          ru:'Вечером они смотрят фильм.',
          en:'In the evening they watch a movie.', img:274 }
      ]
    },
    {
      id:'st-fa-2', cat:'family',
      title:{ ru:'Звонок', de:'Ein Anruf', en:'A phone call' },
      sentences:[
        { de:'Am Abend ruft Tanya ihre Mutter an.',
          ru:'Вечером Таня звонит маме.',
          en:'In the evening Tanya calls her mother.', img:221 },
        { de:'Ihre Mutter wohnt weit weg.',
          ru:'Её мама живёт далеко.',
          en:'Her mother lives far away.', img:81 },
        { de:'Sie sprechen über die Familie und das Wetter.',
          ru:'Они говорят о семье и о погоде.',
          en:'They talk about the family and the weather.', img:220 },
        { de:'Tanya erzählt von ihrem Tag.',
          ru:'Таня рассказывает о своём дне.',
          en:'Tanya talks about her day.', img:273 },
        { de:'Ihre Mutter erzählt auch ein paar Neuigkeiten.',
          ru:'Её мама тоже рассказывает несколько новостей.',
          en:'Her mother also tells some news.', img:228 },
        { de:'Nach dem Gespräch ist Tanya glücklich.',
          ru:'После разговора Таня счастливая.',
          en:'After the conversation Tanya is happy.', img:118 }
      ]
    },

    /* ---------- Wetter ---------- */
    {
      id:'st-we-1', cat:'weather',
      title:{ ru:'Холодное утро', de:'Ein kalter Morgen', en:'A cold morning' },
      sentences:[
        { de:'Heute Morgen ist es sehr kalt.',
          ru:'Сегодня утром очень холодно.',
          en:'This morning it is very cold.', img:101 },
        { de:'Der Himmel ist grau und es ist windig.',
          ru:'Небо серое, и ветрено.',
          en:'The sky is gray and it is windy.', img:97 },
        { de:'Tanya möchte nach draußen gehen.',
          ru:'Таня хочет выйти на улицу.',
          en:'Tanya wants to go outside.', img:236 },
        { de:'Sie zieht eine warme Jacke an.',
          ru:'Она надевает тёплую куртку.',
          en:'She puts on a warm jacket.', img:155 },
        { de:'Sie nimmt auch einen Schal mit.',
          ru:'Она также берёт с собой шарф.',
          en:'She also takes a scarf with her.', img:156 },
        { de:'Draußen sind ihre Hände trotzdem kalt.',
          ru:'На улице её руки всё равно холодные.',
          en:'Outside her hands are still cold.', img:124 }
      ]
    },
    {
      id:'st-we-2', cat:'weather',
      title:{ ru:'Дождь в Берлине', de:'Regen in Berlin', en:'Rain in Berlin' },
      sentences:[
        { de:'Am Nachmittag beginnt es zu regnen.',
          ru:'Днём начинается дождь.',
          en:'In the afternoon it starts to rain.', img:94 },
        { de:'Tanya schaut aus dem Fenster.',
          ru:'Таня смотрит в окно.',
          en:'Tanya looks out of the window.', img:234 },
        { de:'Sie muss noch zum Geschäft gehen.',
          ru:'Ей ещё нужно пойти в магазин.',
          en:'She still has to go to the store.', img:22 },
        { de:'Deshalb nimmt sie einen Regenschirm mit.',
          ru:'Поэтому она берёт с собой зонт.',
          en:'That is why she takes an umbrella with her.', img:100 },
        { de:'Nach einer Stunde hört der Regen auf.',
          ru:'Через час дождь заканчивается.',
          en:'After an hour the rain stops.', img:103 },
        { de:'Am Abend kommt sogar die Sonne heraus.',
          ru:'Вечером даже выходит солнце.',
          en:'In the evening the sun even comes out.', img:268 }
      ]
    },

    /* ---------- Reisen und Verkehr ---------- */
    {
      id:'st-tr-1', cat:'travel',
      title:{ ru:'Автобус', de:'Der Bus', en:'The bus' },
      sentences:[
        { de:'Tanya muss heute ins Zentrum fahren.',
          ru:'Сегодня Тане нужно поехать в центр.',
          en:'Tanya has to go to the city center today.', img:250 },
        { de:'Sie geht zur Bushaltestelle.',
          ru:'Она идёт на автобусную остановку.',
          en:'She goes to the bus stop.', img:240 },
        { de:'Der Bus kommt um neun Uhr.',
          ru:'Автобус приходит в девять часов.',
          en:'The bus comes at nine o’clock.', img:105 },
        { de:'Tanya steigt ein und findet einen Sitzplatz.',
          ru:'Таня садится в автобус и находит место.',
          en:'Tanya gets on and finds a seat.', img:246 },
        { de:'Nach zwanzig Minuten steigt sie aus.',
          ru:'Через двадцать минут она выходит.',
          en:'After twenty minutes she gets off.', img:105 },
        { de:'Jetzt ist sie im Zentrum.',
          ru:'Теперь она в центре.',
          en:'Now she is in the city center.', img:110 }
      ]
    },
    {
      id:'st-tr-2', cat:'travel',
      title:{ ru:'Поездка на поезде', de:'Eine Zugfahrt', en:'A train journey' },
      sentences:[
        { de:'Tanya und Nazar fahren mit dem Zug.',
          ru:'Таня и Назар едут на поезде.',
          en:'Tanya and Nazar travel by train.', img:106 },
        { de:'Sie haben zwei Fahrkarten und einen kleinen Koffer.',
          ru:'У них два билета и небольшой чемодан.',
          en:'They have two tickets and a small suitcase.', img:115 },
        { de:'Der Zug fährt um zehn Uhr ab.',
          ru:'Поезд отправляется в десять часов.',
          en:'The train leaves at ten o’clock.', img:108 },
        { de:'Nazar sitzt am Fenster und schaut nach draußen.',
          ru:'Назар сидит у окна и смотрит на улицу.',
          en:'Nazar sits by the window and looks outside.', img:247 },
        { de:'Die Fahrt dauert eine Stunde.',
          ru:'Поездка длится час.',
          en:'The journey takes one hour.', img:114 },
        { de:'Dann kommen sie am Bahnhof an.',
          ru:'Потом они приезжают на вокзал.',
          en:'Then they arrive at the train station.', img:251 }
      ]
    }
  ]
};
