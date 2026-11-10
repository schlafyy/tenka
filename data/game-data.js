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
  { id: 'paddies', verb: 'Clear new paddies', age: 0, year: 1467, glyph: '田', en: 'Rice paddies', ja: '田畑', text: 'Every new field is more rice at harvest.', manager: ['Village headman', '名主'], upgrades: [['Iron ploughs', '鉄の鋤'], ['Double cropping', '二毛作'], ['Irrigation ponds', '溜池']] },
  { id: 'mine', verb: 'Sink a new shaft', age: 0, year: 1526, glyph: '銀', en: 'Silver mine', ja: '銀山', text: 'The new cupellation method from Korea makes Japan rich in silver.', manager: ['Mine master', '山師'], upgrades: [['Cupellation', '灰吹法'], ['Drainage adits', '水抜き坑'], ['Smelting furnaces', '精錬炉']] },
  { id: 'castletown', verb: 'Grow the castle town', age: 0, year: 1576, glyph: '城', en: 'Castle town', ja: '城下町', text: 'Merchants and craftsmen settle under the castle walls.', manager: ['Town elder', '町年寄'], upgrades: [['Free markets', '楽市楽座'], ['Merchant quarters', '町割り'], ['Stone walls', '石垣']] },
  { id: 'dyehouse', verb: 'Add a dye vat', age: 1, year: 1603, glyph: '藍', en: 'Indigo dye house', ja: '紺屋', text: 'Cotton dyed blue for a whole country that now wears it.', manager: ['Dye master', '紺屋の親方'], upgrades: [['Indigo from Awa', '阿波藍'], ['Katazome stencils', '型染'], ['Cotton fields', '木綿畑']] },
  { id: 'brewery', verb: 'Build a brewhouse', age: 1, year: 1660, glyph: '酒', en: 'Sake brewery', ja: '酒蔵', text: 'Winter brewing, cedar casks, and ships to carry it to Edo.', manager: ['Master brewer', '杜氏'], upgrades: [['Winter brewing', '寒造り'], ['Cask ships to Edo', '樽廻船'], ['Miyamizu water', '宮水']] },
  { id: 'exchange', verb: 'Buy a seat at the exchange', age: 1, year: 1730, glyph: '米', en: 'Rice exchange', ja: '米会所', text: 'At Dōjima in Osaka, rice is traded as promises on paper.', manager: ['Rice broker', '米仲買'], upgrades: [['Rice on paper', '帳合米'], ['Flag relays', '旗振り通信'], ['Money changers', '両替商']] },
  { id: 'silk', verb: 'Add reeling machines', age: 2, year: 1872, glyph: '糸', en: 'Silk mill', ja: '製糸場', text: 'Reeling machines like Tomioka\'s, and silk for the world.', manager: ['Mill forewoman', '工女取締'], upgrades: [['French reeling frames', '繰糸機'], ['Silk inspection', '生糸検査'], ['Mulberry farms', '桑畑']] },
  { id: 'railway', verb: 'Lay new track', age: 2, year: 1880, glyph: '鉄', en: 'Railway', ja: '鉄道', text: 'Steam lines join the old castle towns.', manager: ['Station master', '駅長'], upgrades: [['Steam locomotives', '蒸気機関車'], ['Tunnels through the hills', '隧道'], ['Timetables', '時刻表']] },
  { id: 'store', verb: 'Open a new floor', age: 2, year: 1904, glyph: '店', en: 'Department store', ja: '百貨店', text: 'An old kimono shop becomes a palace of goods.', manager: ['Floor manager', '支配人'], upgrades: [['Fixed prices', '正札販売'], ['Display windows', '陳列窓'], ['Escalators', 'エスカレーター']] },
  { id: 'electric', verb: 'Add a factory line', age: 3, year: 1926, glyph: '電', en: 'Electric works', ja: '電機', text: 'Fans, radios and the wires to light every house.', manager: ['Chief engineer', '技師長'], upgrades: [['Hydro dams', '水力発電'], ['Two-way sockets', '二股ソケット'], ['Home radios', 'ラジオ']] },
  { id: 'cars', verb: 'Open a new plant', age: 3, year: 1955, glyph: '車', en: 'Car works', ja: '自動車', text: 'Small, careful cars, then the world\'s roads.', manager: ['Plant manager', '工場長'], upgrades: [['Just in time', 'かんばん方式'], ['Kaizen', '改善'], ['Small engines', '小型エンジン']] },
  { id: 'chips', verb: 'Build a clean room', age: 3, year: 1976, glyph: '芯', en: 'Microchips', ja: '半導体', text: 'Memory chips, made cleaner than anyone else\'s.', manager: ['Fab director', '工場長'], upgrades: [['Clean rooms', 'クリーンルーム'], ['Memory chips', '半導体メモリ'], ['Larger wafers', '大口径ウェハー']] },
  { id: 'games', verb: 'Start a new game', age: 4, year: 1989, glyph: '遊', en: 'Game studio', ja: 'ゲーム', text: 'Worlds in a cartridge, then on every phone.', manager: ['Producer', 'プロデューサー'], upgrades: [['Pixel art', 'ドット絵'], ['Cartridges', 'カートリッジ'], ['Online play', 'オンライン']] },
  { id: 'network', verb: 'Raise new towers', age: 4, year: 1999, glyph: '網', en: 'Mobile network', ja: '通信', text: 'The internet in every pocket, years before anywhere else.', manager: ['Network chief', '通信部長'], upgrades: [['Mobile internet', 'iモード'], ['Emoji', '絵文字'], ['Fibre lines', '光回線']] },
  { id: 'robots', verb: 'Build a robot line', age: 4, year: 2012, glyph: '機', en: 'Robotics', ja: 'ロボット', text: 'Machines that build, carry and care.', manager: ['Robotics lead', '開発リーダー'], upgrades: [['Industrial arms', '産業用ロボット'], ['Better sensors', 'センサー'], ['Care robots', '介護ロボット']] },
];

// one upgrade for each age that triples every trade's profit
const REALM_UPGRADES = [
  { id: 'kenchi', year: 1582, en: 'The land survey', ja: '太閤検地', text: 'Every field measured with one rod.' },
  { id: 'kaido', year: 1640, en: 'The five highways', ja: '五街道', text: 'Post towns from Edo to every corner of the realm.' },
  { id: 'bunmei', year: 1871, en: 'Civilisation and enlightenment', ja: '文明開化', text: 'Gas lamps, post offices, a new currency.' },
  { id: 'shinkansen', year: 1964, en: 'The bullet train', ja: '新幹線', text: 'Tokyo to Osaka in four hours.' },
  { id: 'internet', year: 1999, en: 'The internet', ja: 'インターネット', text: 'Every shop open all night, everywhere.' },
];

// the houses you can lead: home province and the house's own lasting strength
const HOUSES = [
  { clan: 'oda', home: 'owari', motto: 'Free markets', mottoJa: '楽市楽座', text: 'Everything costs 10% less.', mods: { cost: -.1 } },
  { clan: 'takeda', home: 'kai', motto: 'Wind, forest, fire, mountain', mottoJa: '風林火山', text: 'Profit +10%.', mods: { profit: .1 } },
  { clan: 'mori', home: 'aki', motto: 'The three arrows', mottoJa: '三本の矢', text: 'Every trade runs 15% faster.', mods: { speed: .15 } },
  { clan: 'shimazu', home: 'satsuma', motto: 'Ships from the south', mottoJa: '南蛮貿易', text: 'Provinces give 25% more.', mods: { reach: .25 } },
  { clan: 'tokugawa', home: 'mikawa', motto: 'Patience', mottoJa: '忍耐', text: 'Managers earn 25% more while you are away.', mods: { away: .25 } },
  { clan: 'date', home: 'mutsu', motto: 'The one-eyed dragon', mottoJa: '独眼竜', text: 'Provinces give 25% more.', mods: { reach: .25 } },
  { clan: 'uesugi', home: 'echigo', motto: 'Righteousness', mottoJa: '義', text: 'Chapters give 50% more.', mods: { chapter: .5 } },
  { clan: 'hojo', home: 'izu', motto: 'Four to the lord, six to the people', mottoJa: '四公六民', text: 'Rice paddies earn double.', mods: { paddies: 1 } },
  { clan: 'imagawa', home: 'suruga', motto: 'The cultured court', mottoJa: '今川文化', text: 'Treasures turn up 50% more often.', mods: { find: .5 } },
  { clan: 'otomo', home: 'bungo', motto: 'The Nanban lord', mottoJa: '南蛮', text: 'Silver mines earn double.', mods: { mine: 1 } },
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

// Guests: real people who visit the house from the year given, in the order they come. Welcomed, they stay for the run and
// do one thing for the house: double a trade's profit (work), raise all profit by a tenth (all), open the tea room (room), make tea
// stronger (tea), or make chapters or provinces count double (chapter, reach). Living people are left out.
const GUESTS = [
  { id: 'juko', en: 'Murata Jukō', ja: '村田珠光', life: '1423–1502', from: 1467, role: 'Tea master', does: { room: 'tea' },
    text: 'Began the quiet, plain way of tea that became wabi-cha.' },
  { id: 'jutei', en: 'Kamiya Jutei', ja: '神屋寿禎', life: 'active 1526–1539', from: 1526, role: 'Hakata merchant', does: { work: 'mine' },
    text: 'Opened the Iwami silver mine and brought in a new way to refine its silver.' },
  { id: 'nobunaga', en: 'Oda Nobunaga', ja: '織田信長', life: '1534–1582', from: 1568, role: 'Lord of Owari', does: { work: 'castletown' },
    text: 'Opened his castle towns to free markets and free guilds.' },
  { id: 'rikyu', en: 'Sen no Rikyū', ja: '千利休', life: '1522–1591', from: 1572, role: 'Tea master', does: { tea: 3 },
    text: 'Perfected the tea ceremony in a tiny, rustic tea room.' },
  { id: 'hideyoshi', en: 'Toyotomi Hideyoshi', ja: '豊臣秀吉', life: '1537–1598', from: 1585, role: 'Regent', does: { work: 'paddies' },
    text: 'Had every rice field in the realm measured with one rod.' },
  { id: 'ieyasu', en: 'Tokugawa Ieyasu', ja: '徳川家康', life: '1543–1616', from: 1603, role: 'Shōgun', does: { all: 1 },
    text: 'Founded the shogunate in Edo and the long peace that followed.' },
  { id: 'shinroku', en: 'Yamanaka Shinroku', ja: '山中新六', life: '1570–1651', from: 1610, role: 'Sake brewer', does: { work: 'brewery' },
    text: 'Brewed clear sake in Itami and founded the Kōnoike merchant house.' },
  { id: 'koan', en: 'Yodoya Koan', ja: '淀屋个庵', life: '1576–1643', from: 1620, role: 'Rice merchant', does: { work: 'exchange' },
    text: 'Let rice traders meet at his Osaka house, the start of the Dōjima rice market.' },
  { id: 'takatoshi', en: 'Mitsui Takatoshi', ja: '三井高利', life: '1622–1694', from: 1673, role: 'Cloth merchant', does: { work: 'dyehouse' },
    text: 'Opened the Echigoya cloth shop in Edo, selling for cash at fixed prices.' },
  { id: 'baigan', en: 'Ishida Baigan', ja: '石田梅岩', life: '1685–1744', from: 1729, role: 'Teacher', does: { all: 1 },
    text: 'Taught that honest trade is a moral way of life.' },
  { id: 'tadataka', en: 'Inō Tadataka', ja: '伊能忠敬', life: '1745–1818', from: 1800, role: 'Surveyor', does: { reach: 2 },
    text: 'Walked the coasts of Japan to draw its first accurate map.' },
  { id: 'hokusai', en: 'Katsushika Hokusai', ja: '葛飾北斎', life: '1760–1849', from: 1814, role: 'Artist', does: { chapter: 2 },
    text: 'Drew the Great Wave and the Thirty-six Views of Mount Fuji.' },
  { id: 'sontoku', en: 'Ninomiya Sontoku', ja: '二宮尊徳', life: '1787–1856', from: 1820, role: 'Farm reformer', does: { all: 1 },
    text: 'Brought ruined villages back with thrift, hard work and shared savings.' },
  { id: 'ryoma', en: 'Sakamoto Ryōma', ja: '坂本龍馬', life: '1836–1867', from: 1865, role: 'Reformer', does: { all: 1 },
    text: 'Founded the Kameyama Shachū trading company in Nagasaki.' },
  { id: 'yukichi', en: 'Fukuzawa Yukichi', ja: '福沢諭吉', life: '1835–1901', from: 1868, role: 'Educator', does: { all: 1 },
    text: 'Founded Keiō and wrote An Encouragement of Learning.' },
  { id: 'eiichi', en: 'Shibusawa Eiichi', ja: '渋沢栄一', life: '1840–1931', from: 1872, role: 'Industrialist', does: { work: 'silk' },
    text: 'Helped found the Tomioka silk mill and some 500 companies.' },
  { id: 'yataro', en: 'Iwasaki Yatarō', ja: '岩崎弥太郎', life: '1835–1885', from: 1873, role: 'Founder of Mitsubishi', does: { all: 1 },
    text: 'Built a shipping line into the Mitsubishi group.' },
  { id: 'masaru', en: 'Inoue Masaru', ja: '井上勝', life: '1843–1910', from: 1880, role: 'Railway engineer', does: { work: 'railway' },
    text: 'Led the building of Japan\'s first railways.' },
  { id: 'osuke', en: 'Hibi Ōsuke', ja: '日比翁助', life: '1860–1931', from: 1904, role: 'Merchant', does: { work: 'store' },
    text: 'Turned Mitsukoshi into Japan\'s first department store.' },
  { id: 'konosuke', en: 'Matsushita Kōnosuke', ja: '松下幸之助', life: '1894–1989', from: 1926, role: 'Founder of Panasonic', does: { work: 'electric' },
    text: 'Began with a two-way light socket and built an electrical giant.' },
  { id: 'soichiro', en: 'Honda Sōichirō', ja: '本田宗一郎', life: '1906–1991', from: 1955, role: 'Founder of Honda', does: { work: 'cars' },
    text: 'Went from piston rings to motorcycles and cars.' },
  { id: 'ibuka', en: 'Ibuka Masaru', ja: '井深大', life: '1908–1997', from: 1976, role: 'Co-founder of Sony', does: { work: 'chips' },
    text: 'Made Japan\'s first transistor radio.' },
  { id: 'tezuka', en: 'Tezuka Osamu', ja: '手塚治虫', life: '1928–1989', from: 1980, role: 'Manga artist', does: { work: 'robots' },
    text: 'Created Astro Boy, who inspired a generation of robot builders.' },
  { id: 'yamauchi', en: 'Yamauchi Hiroshi', ja: '山内溥', life: '1927–2013', from: 1989, role: 'Head of Nintendo', does: { work: 'games' },
    text: 'Turned a playing-card maker into a video game company.' },
  { id: 'iwata', en: 'Iwata Satoru', ja: '岩田聡', life: '1959–2015', from: 2002, role: 'Game maker', does: { all: 1 },
    text: 'Programmer, then president of Nintendo, who made games for everyone.' },
];

// Today's tasks in the tea room: three a day, drawn from these. n is the target; 'need' is a room or state that must be open.
const TASKS = [
  { id: 'levels', en: 'Buy {n} levels', n: 25 },
  { id: 'taps', en: 'Run trades by hand {n} times', n: 20 },
  { id: 'read', en: 'Read a chapter', n: 1 },
  { id: 'improve', en: 'Buy an upgrade or hire a manager', n: 1 },
  { id: 'tea', en: 'Serve tea', n: 1, need: 'tea' },
  { id: 'welcome', en: 'Welcome a guest', n: 1, need: 'guest' },
  { id: 'trip', en: 'Bring a clerk home from a journey', n: 1 },
];

// Crossroads: real turning points where the house must choose its way. Each choice lasts the run (mods add to the house's
// own: a trade id doubles that trade, profit/cost/speed/reach/away/find/chapter as in HOUSES); 'until' ends it in that year.
// Every path ever taken adds a little profit for good, so a new beginning is a chance to try the other way.
const CROSSROADS = [
  { id: 'nanban', year: 1550, en: 'Ships from the south', ja: '南蛮船', text: 'Portuguese ships begin calling at Hirado, buying Japanese silver for Chinese silk.', options: [
    { id: 'ships', en: 'Trade with the Nanban ships', text: 'Silver mines earn double.', mods: { mine: 1 }, done: 'The house sells its silver to the Nanban ships at Hirado.' },
    { id: 'home', en: 'Keep to the home markets', text: 'Rice paddies earn double.', mods: { paddies: 1 }, done: 'The house keeps to the rice of its own provinces.' }] },
  { id: 'rakuichi', year: 1577, en: 'The free market', ja: '楽市楽座', text: 'At Azuchi the lord declares a free market: anyone may sell, and no guild may take its fee.', options: [
    { id: 'free', en: 'Leave the guild and sell freely', text: 'Everything costs 10% less.', mods: { cost: -.1 }, done: 'The house leaves its guild and sells in the free market.' },
    { id: 'guild', en: 'Stay under the guild\'s protection', text: 'Managers earn 25% more while you are away.', mods: { away: .25 }, done: 'The house stays with its guild and the guild\'s protection.' }] },
  { id: 'edo', year: 1603, en: 'A new capital', ja: '江戸開府', text: 'The shogun rules from Edo, a new city of samurai who must be clothed and fed.', options: [
    { id: 'branch', en: 'Open a branch in Edo', text: 'The indigo dye house earns double.', mods: { dyehouse: 1 }, done: 'The house opens a branch in the new city of Edo.' },
    { id: 'osaka', en: 'Stay in Osaka, the kitchen of the realm', text: 'Castle towns earn double.', mods: { castletown: 1 }, done: 'The house stays in Osaka, where the realm\'s rice is sold.' }] },
  { id: 'dejima', year: 1641, en: 'The closed country', ja: '鎖国', text: 'The ports close to the world. Only Dutch and Chinese ships may trade, and only at Nagasaki.', options: [
    { id: 'nagasaki', en: 'Keep a buyer at Nagasaki', text: 'Treasures turn up 50% more often.', mods: { find: .5 }, done: 'The house keeps a buyer at Nagasaki for the Dutch ships\' rare goods.' },
    { id: 'inland', en: 'Turn to the home provinces', text: 'Provinces give 25% more.', mods: { reach: .25 }, done: 'The house turns to the trade of the home provinces.' }] },
  { id: 'kakene', year: 1683, en: 'Cash at marked prices', ja: '現金掛け値なし', text: 'A shop in Edo sells cloth to anyone, for cash, at the price on the tag, and the crowds pour in.', options: [
    { id: 'cash', en: 'Sell for cash at fixed prices', text: 'Every trade runs 15% faster.', mods: { speed: .15 }, done: 'The house sells for cash at marked prices.' },
    { id: 'credit', en: 'Keep credit for the great houses', text: 'Profit +10%.', mods: { profit: .1 }, done: 'The house keeps its year-end credit for the great households.' }] },
  { id: 'dojima', year: 1730, en: 'Rice on paper', ja: '堂島米会所', text: 'The shogunate licenses the rice exchange at Dōjima, where rice is bought and sold as promises.', options: [
    { id: 'paper', en: 'Trade rice on paper', text: 'The rice exchange earns double.', mods: { exchange: 1 }, done: 'The house takes a seat at the Dōjima exchange.' },
    { id: 'real', en: 'Keep real rice in the storehouses', text: 'Rice paddies earn double.', mods: { paddies: 1 }, done: 'The house keeps its rice in its own storehouses.' }] },
  { id: 'tenmei', year: 1783, en: 'The Tenmei famine', ja: '天明の飢饉', text: 'Mount Asama erupts, the harvests fail, and the hungry crowd at the storehouse doors.', options: [
    { id: 'open', en: 'Open the storehouses to the hungry', text: 'Provinces give 25% more: the house is welcome everywhere.', mods: { reach: .25 }, done: 'The house opens its storehouses to the hungry.' },
    { id: 'sell', en: 'Sell rice at famine prices', text: 'Profit +10%.', mods: { profit: .1 }, done: 'The house sells its rice at famine prices.' }] },
  { id: 'yokohama', year: 1859, en: 'The open ports', ja: '開港', text: 'Yokohama opens to foreign ships. Silk and tea sell abroad for more than ever.', options: [
    { id: 'silk', en: 'Open a shop at Yokohama', text: 'Silk mills earn double.', mods: { silk: 1 }, done: 'The house opens a shop at Yokohama to sell silk abroad.' },
    { id: 'sake', en: 'Keep to sake and the coastal ships', text: 'Sake breweries earn double.', mods: { brewery: 1 }, done: 'The house keeps to sake and the old coastal trade.' }] },
  { id: 'bank', year: 1876, en: 'The first banks', ja: '銀行', text: 'The new government lets merchant houses found private banks.', options: [
    { id: 'bank', en: 'Found a bank', text: 'Everything costs 10% less.', mods: { cost: -.1 }, done: 'The house founds its own bank.' },
    { id: 'shop', en: 'Stay a merchant house', text: 'Profit +10%.', mods: { profit: .1 }, done: 'The house stays a merchant house.' }] },
  { id: 'kanto', year: 1923, en: 'The great earthquake', ja: '関東大震災', text: 'The great Kantō earthquake and its fires level Tokyo and Yokohama.', options: [
    { id: 'rebuild', en: 'Rebuild in Tokyo, larger', text: 'Department stores earn double.', mods: { store: 1 }, done: 'The house rebuilds its Tokyo store, larger than before.' },
    { id: 'west', en: 'Move the head office west to Osaka', text: 'Every trade runs 15% faster.', mods: { speed: .15 }, done: 'The house moves its head office west to Osaka.' }] },
  { id: 'doubling', year: 1960, en: 'Double the income', ja: '所得倍増', text: 'The prime minister promises to double every family\'s income in ten years.', options: [
    { id: 'cars', en: 'Make a car for every family', text: 'Car works earn double.', mods: { cars: 1 }, done: 'The house sets out to make a car for every family.' },
    { id: 'tv', en: 'Make televisions and radios', text: 'Electric works earn double.', mods: { electric: 1 }, done: 'The house makes televisions and radios for every home.' }] },
  { id: 'bubble', year: 1987, en: 'The bubble', ja: 'バブル', text: 'Land in Tokyo doubles in price every few years, and the banks will lend against anything.', options: [
    { id: 'land', en: 'Buy land with borrowed money', text: 'Profit +50% until 1991.', mods: { profit: .5 }, until: 1991, done: 'The house borrows to buy land in Tokyo.', after: 'The bubble bursts. The house\'s land is worth a fraction of its debts.' },
    { id: 'wait', en: 'Stay out of it', text: 'Profit +10%, for good.', mods: { profit: .1 }, done: 'The house stays out of the land boom.' }] },
  { id: 'imode', year: 1999, en: 'The internet in a phone', ja: 'iモード', text: 'Phones that reach the internet go on sale, years before anywhere else.', options: [
    { id: 'net', en: 'Build for the phones', text: 'Mobile networks earn double.', mods: { network: 1 }, done: 'The house builds for the new phones.' },
    { id: 'games', en: 'Make games to play on them', text: 'Game studios earn double.', mods: { games: 1 }, done: 'The house makes games for the new phones.' }] },
];

// Journeys: the house sends a clerk along a real route; after its hours (game time) the clerk comes back with money and one
// of the route's famous goods. Every good ever brought home adds a little profit for good.
const ROUTES = [
  { id: 'kyoto', year: 1467, hours: 1, glyph: '京', to: 'Kyoto', en: 'Up to the capital', ja: '京上り', text: 'The old capital buys and sells the finest of everything, war or no war.',
    goods: [['brocade', 'Nishijin brocade', '西陣織'], ['kiyomizu', 'Kiyomizu ware', '清水焼'], ['uji', 'Uji tea', '宇治茶']] },
  { id: 'sakai', year: 1500, hours: 2, glyph: '堺', to: 'Sakai', en: 'The free port of Sakai', ja: '堺', text: 'A merchant city that governs itself, with ships from Ryūkyū and Ming China.',
    goods: [['incense', 'Incense wood', '香木'], ['sugar', 'Ryūkyū black sugar', '黒糖'], ['cutlery', 'Sakai kitchen knives', '堺包丁']] },
  { id: 'hirado', year: 1550, hours: 4, glyph: '平', to: 'Hirado', en: 'The Nanban ships at Hirado', ja: '平戸', text: 'Portuguese carracks anchor at Hirado with goods no one in Japan has seen.',
    goods: [['castella', 'Castella cake', 'カステラ'], ['spectacles', 'Spectacles', '眼鏡'], ['velvet', 'Velvet', 'ビロード']] },
  { id: 'tokaido', year: 1603, hours: 2, glyph: '東', to: 'Edo', en: 'The Tōkaidō to Edo', ja: '東海道', text: 'Fifty-three post towns on the road from Kyoto to the shogun\'s new city.',
    goods: [['soy', 'Noda soy sauce', '野田醤油'], ['nori', 'Asakusa nori', '浅草海苔'], ['prints', 'Ukiyo-e prints', '浮世絵']] },
  { id: 'dejima', year: 1641, hours: 4, glyph: '崎', to: 'Nagasaki', en: 'Dejima', ja: '出島', text: 'The one window on the world: a small fan-shaped island where the Dutch may trade.',
    goods: [['books', 'Dutch books', '蘭書'], ['telescope', 'A telescope', '遠眼鏡'], ['porcelain', 'Chinese porcelain', '唐物の磁器']] },
  { id: 'kitamae', year: 1672, hours: 8, glyph: '北', to: 'Ezo', en: 'The Kitamae ships', ja: '北前船', text: 'Ships sail the Sea of Japan to Ezo and back, buying in every port they call at.',
    goods: [['kombu', 'Ezo kelp', '昆布'], ['herring', 'Herring', '鰊'], ['salmon', 'Salted salmon', '塩鮭']] },
  { id: 'kisha', year: 1872, hours: 1, glyph: '汽', to: 'Yokohama', en: 'The train to Yokohama', ja: '汽車', text: 'The first railway runs from Shinbashi to Yokohama in under an hour.',
    goods: [['gyunabe', 'Beef hot pot', '牛鍋'], ['watch', 'A pocket watch', '懐中時計'], ['paper', 'A newspaper', '新聞']] },
  { id: 'liner', year: 1896, hours: 8, glyph: '船', to: 'Seattle', en: 'The steamer to Seattle', ja: '外航船', text: 'Japanese liners cross the Pacific with silk and come back full.',
    goods: [['cotton', 'American cotton', '綿花'], ['flour', 'Wheat flour', '小麦粉'], ['records', 'Gramophone records', 'レコード']] },
  { id: 'shinkansen', year: 1964, hours: 1, glyph: '新', to: 'Osaka', en: 'The bullet train to Osaka', ja: '新幹線', text: 'Tokyo to Osaka in four hours, then three.',
    goods: [['ekiben', 'Station bento', '駅弁'], ['yatsuhashi', 'Yatsuhashi sweets', '八ツ橋'], ['takoyaki', 'Takoyaki', 'たこ焼き']] },
  { id: 'online', year: 1999, hours: 2, glyph: '網', to: 'the world', en: 'A shop on the internet', ja: '通販', text: 'One shop, open all night, to every country at once.',
    goods: [['figures', 'Anime figures', 'フィギュア'], ['matcha', 'Matcha sweets', '抹茶スイーツ'], ['kimono', 'Old kimono', '古着の着物']] },
];

if (typeof module !== 'undefined') module.exports = { KOKU, SPECIAL, AGES, END_YEAR, WORKS, REALM_UPGRADES, HOUSES, NAMES, TREASURES, LATER_EVENTS, GUESTS, TASKS, CROSSROADS, ROUTES };
