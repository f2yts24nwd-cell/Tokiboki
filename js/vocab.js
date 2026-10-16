// Vokabeln für den Lern-Trainer (Englisch Klasse 6, Baden-Württemberg).
// Typischer Wortschatz zu den Themen von "Green Line 2 G9". Die genauen Wortlisten stehen im Buch –
// einfach hier ersetzen oder ergänzen. Format: [Englisch, Deutsch, Emoji].
// Mehrere richtige englische Antworten mit "/" trennen (die erste wird angezeigt).

export const UNITS = [
  {
    id: 'u1', title: 'Ferien & Schule', icon: '🏖️', color: '#ff9f1c',
    words: [
      ['holidays', 'die Ferien', '🏖️'], ['beach', 'der Strand', '🏝️'], ['to travel', 'reisen', '✈️'], ['suitcase', 'der Koffer', '🧳'],
      ['timetable', 'der Stundenplan', '🗓️'], ['subject', 'das Schulfach', '📚'], ['homework', 'die Hausaufgaben', '📝'], ['exercise book', 'das Schulheft', '📓'],
      ['break', 'die Pause', '🔔'], ['uniform', 'die Schuluniform', '👔'], ['to be late', 'zu spät sein', '⏰'], ['pupil', 'der Schüler / die Schülerin', '🎒'],
      ['to forget', 'vergessen', '🤔'], ['to remember', 'sich erinnern', '💭'], ['ruler', 'das Lineal', '📏'], ['rubber', 'der Radiergummi', '🩹'],
      ['pencil case', 'das Mäppchen', '✏️'], ['classroom', 'das Klassenzimmer', '🏫'], ['to learn', 'lernen', '🧠'], ['test', 'die Klassenarbeit / der Test', '💯'],
    ],
  },
  {
    id: 'u2', title: 'Unterwegs in London', icon: '🚌', color: '#e63946',
    words: [
      ['underground', 'die U-Bahn', '🚇'], ['bridge', 'die Brücke', '🌉'], ['tower', 'der Turm', '🗼'], ['museum', 'das Museum', '🏛️'],
      ['map', 'die Karte / der Stadtplan', '🗺️'], ['to turn left', 'links abbiegen', '⬅️'], ['straight on', 'geradeaus', '⬆️'], ['corner', 'die Ecke', '📐'],
      ['ticket', 'die Fahrkarte', '🎫'], ['crowded', 'überfüllt', '👥'], ['river', 'der Fluss', '🌊'], ['palace', 'der Palast', '👑'],
      ['to get lost', 'sich verlaufen', '😵'], ['station', 'der Bahnhof', '🚉'], ['bus stop', 'die Bushaltestelle', '🚏'], ['double-decker', 'der Doppeldeckerbus', '🚌'],
      ['souvenir', 'das Andenken', '🎁'], ['expensive', 'teuer', '💰'], ['sightseeing', 'die Besichtigung', '📸'], ['to visit', 'besuchen', '🧭'],
    ],
  },
  {
    id: 'u3', title: 'Essen & Einkaufen', icon: '🛒', color: '#2a9d8f',
    words: [
      ['shop', 'der Laden', '🏪'], ['to buy', 'kaufen', '🛒'], ['to pay', 'bezahlen', '💳'], ['price', 'der Preis', '🏷️'],
      ['cheap', 'billig', '🤑'], ['money', 'das Geld', '💶'], ['change', 'das Wechselgeld', '🪙'], ['bottle', 'die Flasche', '🍾'],
      ['piece', 'das Stück', '🍰'], ['bread', 'das Brot', '🍞'], ['cheese', 'der Käse', '🧀'], ['vegetables', 'das Gemüse', '🥦'],
      ['fruit', 'das Obst', '🍎'], ['hungry', 'hungrig', '😋'], ['thirsty', 'durstig', '🥤'], ['delicious', 'lecker', '🤤'],
      ['breakfast', 'das Frühstück', '🥣'], ['to cook', 'kochen', '🍳'], ['recipe', 'das Rezept', '📜'], ['meal', 'die Mahlzeit', '🍽️'],
    ],
  },
  {
    id: 'u4', title: 'Natur & Wetter', icon: '⛰️', color: '#52b788',
    words: [
      ['weather', 'das Wetter', '🌦️'], ['sunny', 'sonnig', '☀️'], ['rainy', 'regnerisch', '🌧️'], ['cloudy', 'bewölkt', '☁️'],
      ['windy', 'windig', '🌬️'], ['snow', 'der Schnee', '❄️'], ['storm', 'der Sturm', '⛈️'], ['mountain', 'der Berg', '⛰️'],
      ['forest', 'der Wald', '🌲'], ['sea', 'das Meer', '🌊'], ['island', 'die Insel', '🏝️'], ['sheep', 'das Schaf', '🐑'],
      ['farm', 'der Bauernhof', '🚜'], ['castle', 'die Burg', '🏰'], ['to climb', 'klettern', '🧗'], ['tent', 'das Zelt', '⛺'],
      ['field', 'das Feld', '🌾'], ['dangerous', 'gefährlich', '⚠️'], ['wild', 'wild', '🐺'], ['sky', 'der Himmel', '🌤️'],
    ],
  },
  {
    id: 'u5', title: 'Feste & Gefühle', icon: '🎉', color: '#9b5de5',
    words: [
      ['birthday', 'der Geburtstag', '🎂'], ['party', 'die Party', '🎉'], ['present', 'das Geschenk', '🎁'], ['invitation', 'die Einladung', '💌'],
      ['to celebrate', 'feiern', '🥳'], ['candle', 'die Kerze', '🕯️'], ['guest', 'der Gast', '🙋'], ['to dance', 'tanzen', '💃'],
      ['happy', 'glücklich', '😊'], ['sad', 'traurig', '😢'], ['angry', 'wütend', '😠'], ['afraid', 'ängstlich', '😨'],
      ['surprised', 'überrascht', '😮'], ['bored', 'gelangweilt', '🥱'], ['excited', 'aufgeregt', '🤩'], ['tired', 'müde', '😴'],
      ['proud', 'stolz', '🦚'], ['friendly', 'freundlich', '🤝'], ['funny', 'lustig', '😂'], ['nervous', 'nervös', '😬'],
    ],
  },
  {
    id: 'u6', title: 'Unregelmäßige Verben', icon: '⏪', color: '#1982c4',
    hint: 'Simple past',
    words: [
      ['went', 'ging (go)', '🚶'], ['saw', 'sah (see)', '👀'], ['bought', 'kaufte (buy)', '🛍️'], ['ate', 'aß (eat)', '🍽️'],
      ['came', 'kam (come)', '👋'], ['took', 'nahm (take)', '🤲'], ['made', 'machte (make)', '🛠️'], ['had', 'hatte (have)', '🤝'],
      ['found', 'fand (find)', '🔍'], ['ran', 'rannte (run)', '🏃'], ['thought', 'dachte (think)', '💭'], ['gave', 'gab (give)', '🎁'],
      ['swam', 'schwamm (swim)', '🏊'], ['wrote', 'schrieb (write)', '✍️'], ['sang', 'sang (sing)', '🎤'], ['was/were', 'war (be)', '📅'],
    ],
  },
];
