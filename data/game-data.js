// The game's own data: the ages and their trades, the houses you can lead, the heads' traits, the treasures, and the
// chapters after 1945 (the earlier ones come from the Sengoku map, in data/map.js). Figures are approximate.

// assessed rice yield of each province, in man-koku (10,000 koku), rounded, from the Keichō-era (c. 1598) survey
const KOKU = {
  yamashiro: 22.5, yamato: 44.9, kawachi: 24.2, izumi: 14.1, settsu: 35.6, iga: 10.0, ise: 56.7, shima: 1.8, owari: 57.2,
  mikawa: 29.1, totomi: 25.5, suruga: 15.0, izu: 7.0, kai: 22.8, sagami: 19.4, musashi: 66.7, awa_boso: 4.5, kazusa: 37.9,
  shimosa: 39.3, hitachi: 53.1, omi: 77.5, mino: 54.0, hida: 3.8, shinano: 40.9, kozuke: 49.7, shimotsuke: 37.4, mutsu: 167.2,
  dewa: 31.8, wakasa: 8.5, echizen: 50.0, kaga: 35.6, noto: 21.0, etchu: 38.1, echigo: 39.1, sado: 1.7, tanba: 26.4, tango: 11.1,
  tajima: 11.4, inaba: 8.9, hoki: 10.1, izumo: 18.7, iwami: 11.1, oki: 0.5, harima: 35.9, mimasaka: 18.7, bizen: 22.4,
  bitchu: 17.7, bingo: 18.7, aki: 19.5, suo: 16.8, nagato: 13.1, kii: 24.4, awaji: 6.2, awa_shikoku: 18.4, sanuki: 12.6,
  iyo: 36.6, tosa: 9.8, chikuzen: 33.6, chikugo: 26.6, buzen: 14.0, bungo: 41.8, hizen: 31.0, higo: 34.2, hyuga: 12.0,
  osumi: 17.5, satsuma: 28.3, iki: 1.6, tsushima: 1.0,
};

// mines, ports and cities: reaching one is worth as much as a province of this many man-koku more
const SPECIAL = {
  iwami: [40, 'Iwami silver mine', '石見銀山'], sado: [30, 'Sado gold mine', '佐渡金山'], kai: [15, 'Kōshū gold', '甲州金'],
  tajima: [20, 'Ikuno silver mine', '生野銀山'], izumi: [40, 'Sakai', '堺'], chikuzen: [30, 'Hakata', '博多'], hizen: [30, 'Nagasaki', '長崎'],
  settsu: [40, 'Osaka', '大坂'], yamashiro: [40, 'Kyoto', '京'], musashi: [50, 'Edo, later Tokyo', '江戸'], omi: [15, 'Lake Biwa trade', '琵琶湖'],
};

// the five ages. Each brings three trades, opening in the year given. money: what the house counts in.
const AGES = [
  { id: 'sengoku', en: 'The warring states', ja: '戦国', from: 1467, money: 'koku' },
  { id: 'edo', en: 'The Edo peace', ja: '江戸', from: 1603, money: 'koku' },
  { id: 'meiji', en: 'Meiji and Taishō', ja: '明治・大正', from: 1868, money: 'yen' },
  { id: 'showa', en: 'Shōwa', ja: '昭和', from: 1926, money: 'yen' },
  { id: 'heisei', en: 'Heisei and Reiwa', ja: '平成・令和', from: 1989, money: 'yen' },
];
const END_YEAR = 2026;

const WORKS = [
  { id: 'paddies', verb: 'Clear new paddies', age: 0, year: 1467, glyph: '田', en: 'Rice paddies', ja: '田畑', text: 'Every new field is more rice at harvest.' },
  { id: 'mine', verb: 'Sink a new shaft', age: 0, year: 1526, glyph: '銀', en: 'Silver mine', ja: '銀山', text: 'The new cupellation method from Korea makes Japan rich in silver.' },
  { id: 'castletown', verb: 'Grow the castle town', age: 0, year: 1576, glyph: '城', en: 'Castle town', ja: '城下町', text: 'Merchants and craftsmen settle under the castle walls.' },
  { id: 'dyehouse', verb: 'Add a dye vat', age: 1, year: 1603, glyph: '藍', en: 'Indigo dye house', ja: '紺屋', text: 'Cotton dyed blue for a whole country that now wears it.' },
  { id: 'brewery', verb: 'Build a brewhouse', age: 1, year: 1660, glyph: '酒', en: 'Sake brewery', ja: '酒蔵', text: 'Winter brewing, cedar casks, and ships to carry it to Edo.' },
  { id: 'exchange', verb: 'Buy a seat at the exchange', age: 1, year: 1730, glyph: '米', en: 'Rice exchange', ja: '米会所', text: 'At Dōjima in Osaka, rice is traded as promises on paper.' },
  { id: 'silk', verb: 'Add reeling machines', age: 2, year: 1872, glyph: '糸', en: 'Silk mill', ja: '製糸場', text: 'Reeling machines like Tomioka\'s, and silk for the world.' },
  { id: 'railway', verb: 'Lay new track', age: 2, year: 1880, glyph: '鉄', en: 'Railway', ja: '鉄道', text: 'Steam lines join the old castle towns.' },
  { id: 'store', verb: 'Open a new floor', age: 2, year: 1904, glyph: '店', en: 'Department store', ja: '百貨店', text: 'An old kimono shop becomes a palace of goods.' },
  { id: 'electric', verb: 'Add a factory line', age: 3, year: 1926, glyph: '電', en: 'Electric works', ja: '電機', text: 'Fans, radios and the wires to light every house.' },
  { id: 'cars', verb: 'Open a new plant', age: 3, year: 1955, glyph: '車', en: 'Car works', ja: '自動車', text: 'Small, careful cars, then the world\'s roads.' },
  { id: 'chips', verb: 'Build a clean room', age: 3, year: 1976, glyph: '芯', en: 'Microchips', ja: '半導体', text: 'Memory chips, made cleaner than anyone else\'s.' },
  { id: 'games', verb: 'Start a new game', age: 4, year: 1989, glyph: '遊', en: 'Game studio', ja: 'ゲーム', text: 'Worlds in a cartridge, then on every phone.' },
  { id: 'network', verb: 'Raise new towers', age: 4, year: 1999, glyph: '網', en: 'Mobile network', ja: '通信', text: 'The internet in every pocket, years before anywhere else.' },
  { id: 'robots', verb: 'Build a robot line', age: 4, year: 2012, glyph: '機', en: 'Robotics', ja: 'ロボット', text: 'Machines that build, carry and care.' },
];

// what a head of the house is good at, for as long as they lead it
const TRAITS = {
  thrifty: { en: 'Thrifty', ja: '倹約', text: 'Everything costs 15% less.', mods: { cost: -.15 } },
  diligent: { en: 'Diligent', ja: '勤勉', text: 'Income +20%.', mods: { income: .2 } },
  scholar: { en: 'Learned', ja: '学問', text: 'Chapters give twice as much.', mods: { chapter: 1 } },
  traveller: { en: 'Well travelled', ja: '見聞', text: 'New provinces come twice as often.', mods: { reachRate: 1 } },
  patient: { en: 'Patient', ja: '忍耐', text: 'Time away counts 25% more.', mods: { away: .25 } },
  collector: { en: 'A collector', ja: '数寄', text: 'Treasures turn up twice as often.', mods: { find: 1 } },
};

// the houses you can lead: home province and the house's own lasting strength
const HOUSES = [
  { clan: 'oda', home: 'owari', motto: 'Free markets', mottoJa: '楽市楽座', text: 'Everything costs 10% less.', mods: { cost: -.1 } },
  { clan: 'takeda', home: 'kai', motto: 'Wind, forest, fire, mountain', mottoJa: '風林火山', text: 'Income +10%.', mods: { income: .1 } },
  { clan: 'mori', home: 'aki', motto: 'The three arrows', mottoJa: '三本の矢', text: 'Heads of the house lead 10 years longer.', mods: { reign: 10 } },
  { clan: 'shimazu', home: 'satsuma', motto: 'Ships from the south', mottoJa: '南蛮貿易', text: 'Provinces give 25% more.', mods: { reach: .25 } },
  { clan: 'tokugawa', home: 'mikawa', motto: 'Patience', mottoJa: '忍耐', text: 'Time away counts 20% more.', mods: { away: .2 } },
  { clan: 'date', home: 'mutsu', motto: 'The one-eyed dragon', mottoJa: '独眼竜', text: 'Mutsu is your home: the largest province of all.', mods: {} },
  { clan: 'uesugi', home: 'echigo', motto: 'Righteousness', mottoJa: '義', text: 'Chapters give 50% more.', mods: { chapter: .5 } },
  { clan: 'hojo', home: 'izu', motto: 'Four to the lord, six to the people', mottoJa: '四公六民', text: 'Rice paddies earn double.', mods: { paddies: 1 } },
  { clan: 'imagawa', home: 'suruga', motto: 'The cultured court', mottoJa: '今川文化', text: 'Treasures turn up 50% more often.', mods: { find: .5 } },
  { clan: 'otomo', home: 'bungo', motto: 'The Nanban lord', mottoJa: '南蛮', text: 'Ports and mines give double.', mods: { special: 1 } },
  { clan: 'chosokabe', home: 'tosa', motto: 'One-ryō farmers', mottoJa: '一領具足', text: 'Rice paddies earn double.', mods: { paddies: 1 } },
  { clan: 'maeda', home: 'noto', motto: 'A million koku of Kaga', mottoJa: '加賀百万石', text: 'Castle towns earn double.', mods: { castletown: 1 } },
  { clan: 'hosokawa', home: 'tango', motto: 'The way of tea and poetry', mottoJa: '文武両道', text: 'Start with a treasure.', mods: { startTreasure: 1 } },
];

// heads' given names: each house's own characters before 1868, then modern names
const NAMES = {
  lord: { oda: ['Nobuhide', 'Nobunaga', 'Nobutada', 'Nobukatsu', 'Nobutaka', 'Nobusada', 'Nobuyoshi', 'Nobumasa'],
    takeda: ['Nobutora', 'Harunobu', 'Katsuyori', 'Nobushige', 'Nobumitsu', 'Nobutsuna', 'Nobumasa'],
    mori: ['Motonari', 'Takamoto', 'Terumoto', 'Hiromoto', 'Okimoto', 'Hidenari', 'Tsunahiro'],
    shimazu: ['Tadayoshi', 'Takahisa', 'Yoshihisa', 'Yoshihiro', 'Iehisa', 'Tadatsune', 'Nariakira', 'Tadayoshi'],
    tokugawa: ['Kiyoyasu', 'Hirotada', 'Ieyasu', 'Nobuyasu', 'Hidetada', 'Iemitsu', 'Ietsuna', 'Yoshimune'],
    date: ['Tanemune', 'Harumune', 'Terumune', 'Masamune', 'Tadamune', 'Tsunamune', 'Yoshimura'],
    uesugi: ['Akisada', 'Kenshin', 'Kagekatsu', 'Sadakatsu', 'Tsunanori', 'Harunori', 'Norizane'],
    hojo: ['Sōun', 'Ujitsuna', 'Ujiyasu', 'Ujimasa', 'Ujinao', 'Ujinori', 'Ujimori'],
    imagawa: ['Yoshitada', 'Ujichika', 'Yoshimoto', 'Ujizane', 'Norimochi', 'Naofusa'],
    otomo: ['Chikaharu', 'Yoshiaki', 'Sōrin', 'Yoshimune', 'Chikaie', 'Yoshitaka'],
    chosokabe: ['Kanetsugu', 'Kunichika', 'Motochika', 'Nobuchika', 'Morichika', 'Chikakazu'],
    maeda: ['Toshiharu', 'Toshiie', 'Toshinaga', 'Toshitsune', 'Tsunanori', 'Shigehiro', 'Nariyasu'],
    hosokawa: ['Mochiyuki', 'Fujitaka', 'Tadaoki', 'Tadatoshi', 'Mitsunao', 'Tsunatoshi', 'Shigekata'] },
  modern: ['Hiroshi', 'Takashi', 'Kenji', 'Akira', 'Makoto', 'Satoshi', 'Yūko', 'Haruko', 'Kazuo', 'Masako', 'Tomoko', 'Shigeru',
    'Naoko', 'Kōji', 'Yasuko', 'Daisuke', 'Ayako', 'Takeshi', 'Emi', 'Yūki', 'Haruka', 'Sō', 'Ren', 'Mio'],
};

// treasures: each one found joins the house collection for good, +6% income in every run after
const TREASURES = [
  { id: 'tsukumo', from: 1467, en: 'Tsukumo Nasu', ja: '九十九髪茄子', kind: 'tea caddy', text: 'An eggplant-shaped Chinese tea caddy, owned in turn by the shogun Yoshimitsu, Matsunaga Hisahide, Nobunaga and Hideyoshi.' },
  { id: 'yohen', from: 1467, en: 'Yōhen tenmoku', ja: '曜変天目', kind: 'tea bowl', text: 'A Song-dynasty bowl whose black glaze breaks into spots of blue light, like stars.' },
  { id: 'chigusa', from: 1467, en: 'Chigusa', ja: '千種', kind: 'tea-leaf jar', text: 'A Chinese storage jar that Japanese tea men renamed and dressed in silk cords and brocade.' },
  { id: 'hatsuhana', from: 1467, en: 'Hatsuhana', ja: '初花肩衝', kind: 'tea caddy', text: '"First flower": one of the three great shouldered caddies of the realm.' },
  { id: 'kizaemon', from: 1500, en: 'Kizaemon Ido', ja: '喜左衛門井戸', kind: 'tea bowl', text: 'A plain Korean rice bowl that tea masters came to prize above Chinese treasures.' },
  { id: 'hiragumo', from: 1540, en: 'Hiragumo', ja: '平蜘蛛', kind: 'kettle', text: 'The "flat spider" kettle. Matsunaga Hisahide is said to have smashed it in 1577 rather than hand it to Nobunaga.' },
  { id: 'oguro', from: 1580, en: 'Ōguro', ja: '大黒', kind: 'tea bowl', text: 'A black Raku bowl by Chōjirō, made for Sen no Rikyū.' },
  { id: 'unohana', from: 1590, en: 'Unohanagaki', ja: '卯花墻', kind: 'tea bowl', text: 'A white Shino bowl of the Momoyama years, glazed like a hedge of deutzia flowers.' },
  { id: 'kakiemon', from: 1650, en: 'A Kakiemon jar', ja: '柿右衛門', kind: 'porcelain', text: 'Arita porcelain painted in persimmon red on milk-white, copied in Meissen and Chelsea.' },
  { id: 'irises', from: 1705, en: 'Irises screens', ja: '燕子花図屏風', kind: 'folding screens', text: 'Ogata Kōrin\'s pair of gold screens: nothing but irises and the rhythm between them.' },
  { id: 'wave', from: 1831, en: 'The Great Wave', ja: '神奈川沖浪裏', kind: 'woodblock print', text: 'Hokusai\'s wave off Kanagawa, Mount Fuji small beneath it, printed in imported Prussian blue.' },
  { id: 'tokaido', from: 1833, en: 'The Tōkaidō in fifty-three stations', ja: '東海道五十三次', kind: 'print series', text: 'Hiroshige\'s journey from Edo to Kyoto, in rain, snow and evening light.' },
  { id: 'satsuma', from: 1873, en: 'A Satsuma vase', ja: '薩摩焼', kind: 'export ware', text: 'Crackled cream glaze crowded with gold, made for the world\'s fairs.' },
  { id: 'clock', from: 1890, en: 'A Meiji wall clock', ja: '掛時計', kind: 'clock', text: 'Western hours, kept in a hall that still has tatami.' },
  { id: 'yumeji', from: 1915, en: 'A Yumeji print', ja: '竹久夢二', kind: 'print', text: 'Takehisa Yumeji\'s long-limbed, wistful women, the look of Taishō.' },
  { id: 'radio', from: 1955, en: 'A transistor radio', ja: 'トランジスタラジオ', kind: 'radio', text: 'Small enough for a shirt pocket, and the start of a famous export trade.' },
  { id: 'ticket', from: 1964, en: 'A first-day Shinkansen ticket', ja: '新幹線の切符', kind: 'ticket', text: 'Tokyo to Shin-Ōsaka, 1 October 1964, on the first day of the bullet train.' },
  { id: 'console', from: 1983, en: 'A home game console', ja: 'ゲーム機', kind: 'console', text: 'Red and white, with two square controllers wired to it.' },
];

// chapters after the Sengoku map's history ends in 1945, written for the game
const LATER_EVENTS = [
  { id: 'constitution1947', year: 1947, en: 'The new constitution', ja: '日本国憲法', at: 'musashi', sides: [], short: 'A new constitution takes effect: sovereignty rests with the people, the emperor becomes a symbol of the state, and women vote and stand for office.' },
  { id: 'nolonger', year: 1956, en: '"No longer the postwar"', ja: 'もはや戦後ではない', at: 'musashi', sides: [], short: 'The government\'s economic white paper says the recovery is done: output is back above its pre-war peak. Growth of nearly ten percent a year follows.' },
  { id: 'shinkansen', year: 1964, en: 'The bullet train and the Olympics', ja: '新幹線と東京五輪', at: 'musashi', sides: [], short: 'Nine days before the Tokyo Olympics open, the Tōkaidō Shinkansen starts running from Tokyo to Osaka in four hours.' },
  { id: 'expo70', year: 1970, en: 'Expo \'70', ja: '大阪万博', at: 'settsu', sides: [], short: 'Sixty-four million visits to the world\'s fair at Senri, Osaka, under Okamoto Tarō\'s Tower of the Sun.' },
  { id: 'okinawa1972', year: 1972, en: 'Okinawa returns', ja: '沖縄返還', at: 'ryukyu', sides: [], short: 'Twenty-seven years after the war, the United States hands Okinawa back to Japan.' },
  { id: 'oil', year: 1973, en: 'The oil shock', ja: '石油危機', at: 'musashi', sides: [], short: 'Oil prices quadruple and the fastest growth in the world comes to a sudden stop. Industry learns to do more with less.' },
  { id: 'bubble', year: 1989, en: 'The bubble at its height', ja: 'バブル景気', at: 'musashi', sides: [], short: 'The Shōwa era ends in January. By December the Nikkei index stands near 39,000, and the land under Tokyo\'s imperial palace is said to be worth more than California.' },
  { id: 'burst', year: 1991, en: 'The bubble bursts', ja: 'バブル崩壊', at: 'musashi', sides: [], short: 'Share and land prices fall and keep falling. A long, slow decade begins.' },
  { id: 'hanshin', year: 1995, en: 'The Great Hanshin earthquake', ja: '阪神・淡路大震災', at: 'settsu', sides: [], short: 'Before dawn on 17 January an earthquake under Awaji strikes Kobe. More than 6,400 people die; volunteers come from all over the country.' },
  { id: 'tohoku', year: 2011, en: 'The Great East Japan earthquake', ja: '東日本大震災', at: 'mutsu', sides: [], short: 'On 11 March the largest earthquake ever measured in Japan sends a tsunami over the northeast coast. Nearly 20,000 people die, and the Fukushima nuclear plant fails.' },
  { id: 'reiwa', year: 2019, en: 'Reiwa begins', ja: '令和', at: 'yamashiro', sides: [], short: 'Emperor Akihito steps down, the first emperor to abdicate in two centuries. The new era name is taken from the Man\'yōshū, a poetry anthology, for the first time.' },
  { id: 'tokyo2020', year: 2021, en: 'The Tokyo Games, a year late', ja: '東京2020', at: 'musashi', sides: [], short: 'Postponed by the pandemic, the Olympics are held in Tokyo in empty stadiums.' },
  { id: 'expo25', year: 2025, en: 'Expo 2025', ja: '大阪・関西万博', at: 'settsu', sides: [], short: 'The world\'s fair comes back to Osaka, on the island of Yumeshima, inside a ring of wooden beams two kilometres round.' },
];

if (typeof module !== 'undefined') module.exports = { KOKU, SPECIAL, AGES, END_YEAR, WORKS, TRAITS, HOUSES, NAMES, TREASURES, LATER_EVENTS };
