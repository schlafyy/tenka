// The game's own data: what each province yields, the clans you can play, the history that runs underneath, the reforms,
// the tea utensils and the house codes. Figures are approximate; the yields follow the Keichō-era (c. 1598) land survey.

// assessed rice yield of each province, in man-koku (10,000 koku), rounded
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

// mines, ports and markets: coin (kan a year) from the year they opened; port: doubled by Nanban trade
const SPECIAL = {
  kai: { kan: 600, en: 'Kōshū gold mines', ja: '甲州金山', from: 1467 },
  sado: { kan: 900, en: 'Sado mines', ja: '佐渡金山', from: 1542 },
  iwami: { kan: 1500, en: 'Iwami silver mine', ja: '石見銀山', from: 1526 },
  tajima: { kan: 700, en: 'Ikuno silver mine', ja: '生野銀山', from: 1542 },
  mutsu: { kan: 500, en: 'Ōshū gold', ja: '奥州金', from: 1467 },
  izumi: { kan: 1200, en: 'Sakai', ja: '堺', from: 1467, port: true },
  chikuzen: { kan: 900, en: 'Hakata', ja: '博多', from: 1467, port: true },
  hizen: { kan: 900, en: 'Hirado', ja: '平戸', from: 1550, port: true },
  bungo: { kan: 400, en: 'Funai', ja: '府内', from: 1551, port: true },
  settsu: { kan: 400, en: 'Hyōgo port', ja: '兵庫津', from: 1467, port: true },
  satsuma: { kan: 300, en: 'Bōnotsu', ja: '坊津', from: 1467, port: true },
  yamashiro: { kan: 600, en: 'Kyoto', ja: '京', from: 1467 },
  omi: { kan: 400, en: 'Lake Biwa trade', ja: '琵琶湖', from: 1467 },
  suo: { kan: 500, en: 'Yamaguchi', ja: '山口', from: 1467 },
};

// deep snow: no campaign can move into these in winter
const SNOW = ['mutsu', 'dewa', 'echigo', 'sado', 'etchu', 'kaga', 'noto', 'echizen', 'hida', 'shinano'];

// the clans you can play: home province, the house trait, and the renown it costs to unlock (0: open from the start)
const STARTS = [
  { clan: 'oda', home: 'owari', cost: 0, trait: 'Free markets', traitJa: '楽市', text: 'Coin +50%, and matchlocks cost half.', mods: { coin: .5, gunCost: -.5 } },
  { clan: 'takeda', home: 'kai', cost: 0, trait: 'Wind, forest, fire, mountain', traitJa: '風林火山', text: 'Campaigns march 30% faster.', mods: { speed: .3 } },
  { clan: 'mori', home: 'aki', cost: 0, trait: 'The three arrows', traitJa: '三本の矢', text: 'Retainers lose loyalty at half the rate. Sea crossings need no extra men.', mods: { loyaltyDecay: -.5, seaFree: 1 } },
  { clan: 'shimazu', home: 'satsuma', cost: 0, trait: 'The false retreat', traitJa: '釣り野伏せ', text: 'Campaigns lose 35% fewer men.', mods: { loss: -.35 } },
  { clan: 'imagawa', home: 'suruga', cost: 30, trait: 'The cultured court', traitJa: '今川文化', text: 'Tea utensils turn up twice as often; tea gatherings do twice as much.', mods: { find: 1, tea: 1 } },
  { clan: 'date', home: 'mutsu', cost: 50, trait: 'The one-eyed dragon', traitJa: '独眼竜', text: 'Snow never stops your campaigns.', mods: { snowproof: 1 } },
  { clan: 'uesugi', home: 'echigo', cost: 60, trait: 'Righteousness', traitJa: '義', text: 'Fame +60%.', mods: { fame: .6 } },
  { clan: 'hojo', home: 'izu', cost: 60, trait: 'Four to the lord, six to the people', traitJa: '四公六民', text: 'Rice +10%; conquered provinces settle twice as fast.', mods: { yield: .1, unrest: 1 } },
  { clan: 'otomo', home: 'bungo', cost: 80, trait: 'The Nanban lord', traitJa: '南蛮', text: 'Ports bring twice the coin.', mods: { portCoin: 1 } },
  { clan: 'chosokabe', home: 'tosa', cost: 100, trait: 'One-ryō soldiers', traitJa: '一領具足', text: 'Troops cost 40% less rice.', mods: { recruitCost: -.4 } },
  { clan: 'tokugawa', home: 'mikawa', cost: 150, trait: 'Patience', traitJa: '忍耐', text: 'Time away counts 50% more, and the steward keeps watch twice as long.', mods: { offlineRate: .5, offlineCap: 1 } },
];

// clans that rose during the period: in that year they take the province, unless it's yours (or they are you)
const RISERS = [
  [1471, 'asakura', 'echizen'], [1484, 'amago', 'izumo'], [1488, 'ikko', 'kaga'], [1493, 'hojo', 'izu'], [1495, 'hojo', 'sagami'],
  [1524, 'hojo', 'musashi'], [1542, 'saito', 'mino'], [1549, 'miyoshi', 'settsu'], [1550, 'date', 'mutsu'], [1555, 'oda', 'owari'],
  [1555, 'mori', 'aki'], [1557, 'mori', 'suo'], [1557, 'mori', 'nagato'], [1559, 'ryuzoji', 'hizen'], [1560, 'tokugawa', 'mikawa'],
  [1567, 'oda', 'mino'], [1575, 'chosokabe', 'tosa'],
];

// reforms: bought with rice (koku) or coin (kan); each level costs grow times the last
const POLICIES = [
  { id: 'irrigation', en: 'Flood control', ja: '治水', text: 'Dikes and channels: rice +12% a level.', koku: 40000, grow: 2.6, max: 5, mods: { yield: .12 } },
  { id: 'levies', en: 'Ashigaru levies', ja: '足軽', text: 'Foot soldiers from the villages: troop limit +25% a level.', koku: 30000, grow: 2.5, max: 5, mods: { cap: .25 } },
  { id: 'post', en: 'Post horses', ja: '伝馬', text: 'Relay stations on the roads: campaigns 15% faster a level.', kan: 1500, grow: 2.6, max: 3, mods: { speed: .15 }, need: { provinces: 4 } },
  { id: 'navy', en: 'The fleet', ja: '水軍', text: 'Pirate captains in your pay: sea crossings need no extra men.', kan: 4000, max: 1, mods: { seaFree: 1 }, need: { provinces: 3 } },
  { id: 'guns', en: 'Matchlocks', ja: '鉄砲', text: 'Arquebuses from the smiths of Sakai and Kunitomo: troops fight 35% harder a level.', kan: 2500, grow: 3, max: 3, mods: { power: .35 }, need: { flag: 'guns' } },
  { id: 'markets', en: 'Free markets', ja: '楽市楽座', text: 'No guild fees or market tolls: coin +60%.', kan: 3000, max: 1, mods: { coin: .6 }, need: { year: 1549 } },
  { id: 'nanban', en: 'Nanban trade', ja: '南蛮貿易', text: 'Portuguese ships call at your ports: port coin doubled.', kan: 6000, max: 1, mods: { portCoin: 1 }, need: { flag: 'nanban' } },
  { id: 'towns', en: 'Castle towns', ja: '城下町', text: 'Merchants settle under your castles: what castles give is doubled.', kan: 8000, max: 1, mods: { castle: 1 }, need: { provinces: 10, orFlag: 'azuchi' } },
  { id: 'volley', en: 'Volley fire', ja: '三段撃ち', text: 'Ranks of gunners behind palisades: troops fight 50% harder.', kan: 20000, max: 1, mods: { power: .5 }, need: { flag: 'nagashino', policy: ['guns', 2] } },
  { id: 'survey', en: 'Land survey', ja: '検地', text: 'Every field measured and recorded: rice +25%.', koku: 2e6, max: 1, mods: { yield: .25 }, need: { provinces: 15, orFlag: 'kenchi' } },
  { id: 'swords', en: 'Sword hunt', ja: '刀狩', text: 'The villages give up their swords: conquered provinces settle twice as fast.', koku: 1.5e6, max: 1, mods: { unrest: 1 }, need: { provinces: 20, orFlag: 'katanagari' } },
  { id: 'separation', en: 'Warriors from farmers', ja: '兵農分離', text: 'Samurai move to the castle towns and farmers stay farmers: troops cost 30% less rice.', koku: 3e6, max: 1, mods: { recruitCost: -.3 }, need: { provinces: 25 } },
];

// famous tea utensils (meibutsu). Each one found joins the house collection for good, with its bonus in every later run.
const MEIBUTSU = [
  { id: 'tsukumo', en: 'Tsukumo Nasu', ja: '九十九髪茄子', kind: 'tea caddy', tier: 3, mods: { yield: .08 }, text: 'An eggplant-shaped Chinese tea caddy, owned in turn by the shogun Yoshimitsu, Matsunaga Hisahide, Nobunaga and Hideyoshi.' },
  { id: 'hiragumo', en: 'Hiragumo', ja: '平蜘蛛', kind: 'kettle', tier: 3, mods: { power: .08 }, text: 'The "flat spider" kettle. Matsunaga Hisahide is said to have smashed it in 1577 rather than hand it to Nobunaga.' },
  { id: 'yohen', en: 'Yōhen tenmoku', ja: '曜変天目', kind: 'tea bowl', tier: 3, mods: { coin: .1 }, text: 'A Song-dynasty bowl whose black glaze breaks into spots of blue light, like stars.' },
  { id: 'kizaemon', en: 'Kizaemon Ido', ja: '喜左衛門井戸', kind: 'tea bowl', tier: 3, mods: { loyaltyDecay: -.1 }, text: 'A plain Korean rice bowl that tea masters came to prize above Chinese treasures.' },
  { id: 'hatsuhana', en: 'Hatsuhana', ja: '初花肩衝', kind: 'tea caddy', tier: 2, mods: { fame: .1 }, text: '"First flower": one of the three great shouldered caddies of the realm.' },
  { id: 'nitta', en: 'Nitta', ja: '新田肩衝', kind: 'tea caddy', tier: 2, mods: { cap: .08 }, text: 'Another of the three great shouldered caddies, said to come from the Nitta house.' },
  { id: 'narashiba', en: 'Narashiba', ja: '楢柴肩衝', kind: 'tea caddy', tier: 2, mods: { speed: .06 }, text: 'The third great shouldered caddy, sought by Nobunaga and won by Hideyoshi from a Hakata merchant.' },
  { id: 'chigusa', en: 'Chigusa', ja: '千種', kind: 'tea-leaf jar', tier: 2, mods: { yield: .05 }, text: 'A Chinese storage jar that Japanese tea men renamed and dressed in silk cords and brocade.' },
  { id: 'tsutsui', en: 'Tsutsui-zutsu', ja: '筒井筒', kind: 'tea bowl', tier: 2, mods: { loss: -.06 }, text: 'An Ido bowl given to Hideyoshi by Tsutsui Junkei. Dropped and broken, it was mended and loved more for it.' },
  { id: 'oguro', en: 'Ōguro', ja: '大黒', kind: 'tea bowl', tier: 2, from: 1580, mods: { recruitCost: -.05 }, text: 'A black Raku bowl by Chōjirō, made for Sen no Rikyū.' },
  { id: 'unohana', en: 'Unohanagaki', ja: '卯花墻', kind: 'tea bowl', tier: 2, from: 1590, mods: { unrest: .15 }, text: 'A white Shino bowl of the Momoyama years, glazed like a hedge of deutzia flowers.' },
  { id: 'seto', en: 'A Seto tea caddy', ja: '瀬戸茶入', kind: 'tea caddy', tier: 1, mods: { coin: .03 }, text: 'Brown-glazed stoneware from Seto in Owari, made in imitation of Chinese caddies.' },
  { id: 'bizen', en: 'A Bizen vase', ja: '備前花入', kind: 'flower vase', tier: 1, mods: { yield: .03 }, text: 'Unglazed stoneware from Bizen, marked by the ash and flame of the kiln.' },
  { id: 'karamono', en: 'A Chinese bronze vase', ja: '唐物花入', kind: 'flower vase', tier: 1, mods: { fame: .04 }, text: 'A bronze vase from China: in Muromachi taste, the finest things came from across the sea.' },
  { id: 'aka', en: 'A red Raku bowl', ja: '赤楽茶碗', kind: 'tea bowl', tier: 1, from: 1580, mods: { cap: .03 }, text: 'Hand-shaped, low-fired, warm to hold: the Raku style begun by Chōjirō.' },
  { id: 'hagi', en: 'A Hagi bowl', ja: '萩茶碗', kind: 'tea bowl', tier: 1, from: 1604, mods: { tea: .2 }, text: 'From the kilns Korean potters founded at Hagi after the invasions of the 1590s.' },
];

// house codes: bought with renown, kept through every run
const CODES = [
  { id: 'farming', en: 'Farming is the root', ja: '農は国の本', text: 'Rice +15% a level.', cost: 10, max: 10, mods: { yield: .15 } },
  { id: 'supply', en: 'Supply lines', ja: '兵站', text: 'Soldiers cost 12% less rice a level.', cost: 15, max: 5, mods: { recruitCost: -.12 } },
  { id: 'mercy', en: 'Benevolent rule', ja: '仁政', text: 'Conquered provinces settle 25% faster a level.', cost: 15, max: 5, mods: { unrest: .25 } },
  { id: 'haste', en: 'Speed above all', ja: '兵は神速を貴ぶ', text: 'Campaigns 10% faster a level.', cost: 12, max: 5, mods: { speed: .1 } },
  { id: 'stores', en: 'Full granaries', ja: '備蓄', text: 'Each run starts with a year of rice and 3,000 more men a level.', cost: 8, max: 5, mods: { stores: 1 } },
  { id: 'loyal', en: 'Loyalty', ja: '忠義', text: 'Retainers lose loyalty 15% slower a level.', cost: 12, max: 4, mods: { loyaltyDecay: -.15 } },
  { id: 'steward', en: 'The steward', ja: '留守居', text: 'While you are away, time keeps counting 6 hours longer a level.', cost: 10, max: 3, mods: { offlineHours: 6 } },
  { id: 'eye', en: 'A connoisseur’s eye', ja: '目利き', text: 'Tea utensils turn up 50% more often a level.', cost: 10, max: 3, mods: { find: .5 } },
  { id: 'envoy', en: 'Envoys', ja: '使者', text: 'Alliances cost 20% less a level.', cost: 12, max: 3, mods: { allyCost: -.2 } },
  { id: 'strategist', en: 'The strategist', ja: '軍師', text: 'A strategist launches campaigns on his own whenever men and a leader are free, even while you are away.', cost: 40, max: 1, mods: { auto: 1 } },
];

// retainer names: real samurai family names, given names of the period, put together at random
const NAMES = {
  family: ['Shibata', 'Niwa', 'Sakuma', 'Takigawa', 'Ikeda', 'Maeda', 'Sassa', 'Kanamori', 'Hachisuka', 'Kuroda', 'Takenaka', 'Baba',
    'Naitō', 'Kōsaka', 'Yamagata', 'Obata', 'Amari', 'Itagaki', 'Sanada', 'Honda', 'Sakai', 'Ishikawa', 'Sakakibara', 'Ōkubo',
    'Torii', 'Naoe', 'Kakizaki', 'Usami', 'Kikkawa', 'Shishido', 'Kumagai', 'Niiro', 'Ijūin', 'Katakura', 'Oniniwa', 'Tachibana',
    'Nabeshima', 'Gamō', 'Hosokawa', 'Tsutsui', 'Kani', 'Mori', 'Hori', 'Inaba', 'Andō', 'Ujiie', 'Yamauchi', 'Tōdō'],
  given: ['Nagahide', 'Nobumori', 'Kazumasu', 'Tsuneoki', 'Toshiie', 'Narimasa', 'Nagachika', 'Masakatsu', 'Yoshitaka', 'Shigeharu',
    'Nobuharu', 'Masatoyo', 'Masanobu', 'Masakage', 'Toramasa', 'Torayasu', 'Nobukata', 'Masayuki', 'Tadakatsu', 'Tadatsugu',
    'Kazumasa', 'Naomasa', 'Yasumasa', 'Tadayo', 'Mototada', 'Kanetsugu', 'Kageie', 'Sadamitsu', 'Motoharu', 'Takaie',
    'Tadamoto', 'Tadamune', 'Kagetsuna', 'Tsunamoto', 'Muneshige', 'Shigetane', 'Naoshige', 'Ujisato', 'Yoshinari', 'Nagayoshi',
    'Takatora', 'Kazutoyo', 'Morinari', 'Ittetsu', 'Bokuzen', 'Yoshimoto', 'Hidemasa', 'Sukemasa'],
  // the daimyo's given names: the house's own characters
  lord: { oda: ['Nobuhide', 'Nobunaga', 'Nobutada', 'Nobukatsu', 'Nobutaka', 'Nobusada'], takeda: ['Nobutora', 'Harunobu', 'Katsuyori', 'Nobushige', 'Nobumitsu'],
    mori: ['Motonari', 'Takamoto', 'Terumoto', 'Hiromoto', 'Okimoto'], shimazu: ['Tadayoshi', 'Takahisa', 'Yoshihisa', 'Yoshihiro', 'Iehisa', 'Tadatsune'],
    imagawa: ['Yoshitada', 'Ujichika', 'Yoshimoto', 'Ujizane', 'Ujiteru'], date: ['Tanemune', 'Harumune', 'Terumune', 'Masamune', 'Tadamune'],
    uesugi: ['Akisada', 'Kenshin', 'Kagekatsu', 'Sadazane', 'Norizane'], hojo: ['Sōun', 'Ujitsuna', 'Ujiyasu', 'Ujimasa', 'Ujinao'],
    otomo: ['Chikaharu', 'Yoshiaki', 'Sōrin', 'Yoshimune', 'Chikaie'], chosokabe: ['Kanetsugu', 'Kunichika', 'Motochika', 'Nobuchika', 'Morichika'],
    tokugawa: ['Kiyoyasu', 'Hirotada', 'Ieyasu', 'Nobuyasu', 'Hidetada'] },
};

// the history running underneath: each event arrives in its year. Effects use the game's own actions (G) on the state (S).
const EVENTS = [
  { id: 'onin', year: 1467, en: 'The Ōnin War begins', ja: '応仁の乱', text: 'The Hosokawa and Yamana armies are fighting in the streets of Kyoto over who will follow the shogun. The great lords have taken their men to the capital, and the provinces are left to whoever is bold enough to take them.',
    choices: [{ en: 'Stay home and build', note: 'Rice +30% for 5 years', fx: (S, G) => G.buff(S, { yield: .3 }, 5, 'Staying out of the war') },
      { en: 'Send men to the capital', note: 'Lose a third of your troops; fame +40', fx: (S, G) => { S.troops *= 2 / 3; G.addFame(S, 40, true); } }] },
  { id: 'onin_end', year: 1477, en: 'Kyoto in ashes', ja: '京都焼亡', text: 'Ten years on, the armies simply go home. Neither side has won; much of Kyoto has burned, and the shogun now rules little beyond it. Lords everywhere stop waiting for orders.',
    fx: (S, G) => { G.rivalBuff(S, ['hosokawa', 'yamana'], -.2, 20); } },
  { id: 'yamashiro', year: 1485, en: 'The Yamashiro uprising', ja: '山城国一揆', text: 'In southern Yamashiro the local warriors and farmers drive out both Hatakeyama armies and govern themselves for eight years. Your own villages hear about it.',
    choices: [{ en: 'Lighten the tax', note: 'Rice −10% for 8 years; conquests settle twice as fast for 8 years', fx: (S, G) => { G.buff(S, { yield: -.1, unrest: 1 }, 8, 'A lighter tax'); } },
      { en: 'Send riders to the villages', note: 'Coin −20% of a year; retainers +10 loyalty', fx: (S, G) => { S.kan = Math.max(0, S.kan - G.income(S).kan * G.YEAR * .2); G.allLoyalty(S, 10); } }] },
  { id: 'kaga', year: 1488, en: 'Kaga, the province of farmers', ja: '加賀一向一揆', text: 'Followers of the Ikkō sect overthrow Togashi Masachika, the governor of Kaga. The sect will rule the province for nearly a century, and their leagues fight like no ordinary army.',
    fx: () => {} },
  { id: 'meio', year: 1493, en: 'The Meiō coup', ja: '明応の政変', text: 'Hosokawa Masamoto deposes the shogun and puts his own choice in his place. If a deputy can unmake a shogun, any retainer can dream of unmaking his lord: gekokujō, "the low overthrow the high".',
    fx: (S, G) => { G.allLoyalty(S, -10); } },
  { id: 'iwami', year: 1526, en: 'Silver at Iwami', ja: '石見銀山', text: 'The Hakata merchant Kamiya Jutei opens the Iwami silver mine. Within decades Japan is one of the world’s great silver producers, and whoever holds Iwami grows rich.',
    fx: () => {} },
  { id: 'tanegashima', year: 1543, en: 'Guns reach Tanegashima', ja: '鉄砲伝来', text: 'A ship carrying Portuguese traders lands on Tanegashima. Its lord buys two of their arquebuses, and his smiths are soon making copies. Matchlocks can now be bought.',
    choices: [{ en: 'Buy guns at once', note: 'Costs a year’s coin; troops fight 15% harder for good', fx: (S, G) => { S.kan = Math.max(0, S.kan - G.income(S).kan * G.YEAR); G.buff(S, { power: .15 }, 1e4, 'The first guns'); S.flags.guns = 1; } },
      { en: 'Let the smiths copy them', note: 'Matchlocks unlock as a reform', fx: S => { S.flags.guns = 1; } }] },
  { id: 'xavier', year: 1549, en: 'Francis Xavier at Kagoshima', ja: 'ザビエル来日', text: 'The Jesuit Francis Xavier lands in Satsuma. Where the missionaries go, the Portuguese ships follow, with silk, guns and saltpetre.',
    choices: [{ en: 'Welcome the Jesuits', note: 'Nanban trade unlocks as a reform', fx: S => { S.flags.nanban = 1; } },
      { en: 'Turn them away', note: 'Fame +30', fx: (S, G) => G.addFame(S, 30, true) }] },
  { id: 'itsukushima', year: 1555, en: 'The night landing at Itsukushima', ja: '厳島の戦い', text: 'Mōri Motonari lures Sue Harukata’s far larger army onto the island of Itsukushima, then lands behind it in a storm. Sea power decides a war.',
    fx: (S, G) => G.buff(S, { seaFree: 1 }, 10, 'Lessons of Itsukushima') },
  { id: 'okehazama', year: 1560, en: 'Rain at Okehazama', ja: '桶狭間の戦い', text: 'Oda Nobunaga, with a few thousand men, falls on Imagawa Yoshimoto’s army of some 25,000 in a sudden downpour and kills Yoshimoto in his camp. Numbers are not everything.',
    fx: (S, G) => { S.flags.okehazama = 1; G.log(S, 'Your next campaign needs half the men.'); } },
  { id: 'kyoto', year: 1568, en: 'The march on Kyoto', ja: '上洛', text: 'Nobunaga escorts Ashikaga Yoshiaki into Kyoto and makes him shogun. Holding the capital now means something again.',
    fx: (S, G) => { if (S.owner.yamashiro === S.clan) G.addFame(S, 150, true); S.flags.capital = 1; } },
  { id: 'ishiyama', year: 1570, en: 'The siege of Ishiyama Hongan-ji', ja: '石山合戦', text: 'The Ikkō sect’s fortress-temple in Settsu begins a ten-year war against Nobunaga. Its leagues everywhere fight harder.',
    fx: (S, G) => G.rivalBuff(S, ['ikko'], .4, 10) },
  { id: 'muromachi', year: 1573, en: 'The end of the Muromachi shogunate', ja: '室町幕府滅亡', text: 'Nobunaga drives the last Ashikaga shogun out of Kyoto. The shogunate founded in 1338 is over; what is left of its lands falls to local lords.',
    fx: (S, G) => G.dissolve(S, 'ashikaga') },
  { id: 'nagashino', year: 1575, en: 'Nagashino', ja: '長篠の戦い', text: 'Behind wooden palisades, Oda and Tokugawa gunners break the charges of the Takeda cavalry. Massed matchlocks change war in Japan.',
    fx: S => { S.flags.nagashino = 1; } },
  { id: 'azuchi', year: 1576, en: 'Azuchi Castle', ja: '安土城', text: 'Nobunaga raises a castle of stone walls and a seven-storey keep on Lake Biwa, with a town of free markets below it. Castles become cities.',
    fx: S => { S.flags.azuchi = 1; } },
  { id: 'honnoji', year: 1582, en: 'Honnō-ji', ja: '本能寺の変', text: 'Akechi Mitsuhide, one of Nobunaga’s own generals, surrounds him at the Honnō-ji temple in Kyoto. Nobunaga dies in the fire. Every lord looks at his retainers a little differently.',
    choices: [{ en: 'Hold a tea gathering for your retainers', note: 'Costs a year’s coin; retainers +20 loyalty', fx: (S, G) => { S.kan = Math.max(0, S.kan - G.income(S).kan * G.YEAR); G.allLoyalty(S, 20); } },
      { en: 'Take hostages from their families', note: 'Retainers −10 loyalty, but none can fall below 30 for 10 years', fx: (S, G) => { G.allLoyalty(S, -10); G.buff(S, { loyaltyFloor: 30 }, 10, 'Hostages'); } }] },
  { id: 'kenchi', year: 1582, en: 'The great land survey', ja: '太閤検地', text: 'Hideyoshi orders every field in the realm measured with one standard rod and one standard measure. The land survey can now be ordered at any size.',
    fx: S => { S.flags.kenchi = 1; } },
  { id: 'katanagari', year: 1588, en: 'The sword hunt', ja: '刀狩', text: 'Hideyoshi orders the farmers to hand over their swords, spears and guns, to be melted down for a great Buddha. The sword hunt can now be ordered at any size.',
    fx: S => { S.flags.katanagari = 1; } },
  { id: 'korea', year: 1592, en: 'The invasion of Korea', ja: '文禄の役', text: 'Hideyoshi sends some 150,000 men across the sea to Korea. The lords of the west are expected to send armies.',
    choices: [{ en: 'Send an army', note: 'Lose 40% of your troops; fame +200; a chance of a Korean tea bowl', fx: (S, G) => { S.troops *= .6; G.addFame(S, 200, true); if (G.rand(S) < .5) G.findMeibutsu(S, ['kizaemon', 'tsutsui']); } },
      { en: 'Plead the defence of your lands', note: 'Fame −50', fx: (S, G) => G.addFame(S, -50) }] },
  { id: 'sekigahara', year: 1600, en: 'Sekigahara', ja: '関ヶ原の戦い', text: 'East against West: the realm’s great lords choose sides and fight it out in one day in Mino. The strongest house takes from the next strongest.',
    fx: (S, G) => G.greatBattle(S) },
  { id: 'edo', year: 1603, en: 'The Edo shogunate', ja: '江戸幕府', text: 'Tokugawa Ieyasu is named shogun. History says the warring is over; your cloth may say otherwise.',
    fx: (S, G) => { if (G.counts(S)[S.clan] >= 34) { G.addFame(S, 500, true); S.flags.shogun = 1; } } },
];

if (typeof module !== 'undefined') module.exports = { KOKU, SPECIAL, SNOW, STARTS, RISERS, POLICIES, MEIBUTSU, CODES, NAMES, EVENTS };
