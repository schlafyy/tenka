# Tenka 天下

An idle game about one Japanese house across 550 years. Pick a house and its crest in 1467, the year the Ōnin War begins, and lead it to the present day: a samurai family, then a daimyō house, then Meiji industrialists, then a modern company, under the same crest. It is built on the provinces, clans, dyes, crests and history of the Sengoku map project (`../sengoku-map`). It looks like the front of a merchant house: the house curtain (noren) in the clan's dye with its crest, white plaster, and dark wooden signboards with gilt characters for the trades.

## Play it

- **On the iPhone:** open https://schlafyy.github.io/tenka/ in Safari, then Share → Add to Home Screen. It runs full-screen, works offline, and keeps your save on the phone.
- **In a browser:** serve the folder (`python -m http.server`) and open `index.html`.
- The game saves itself every few seconds. The house section at the bottom has Copy save / Load a save to move it between devices.

## How it plays

A business-tycoon idle game (in the manner of AdVenture Capitalist) on top of 550 years of Japanese history.

- **Trades.** Each age opens three, in their real year: paddies, a silver mine and castle towns; indigo dye houses, sake and the Dōjima rice exchange; silk mills, railways and department stores; electric works, cars and microchips; games, mobile networks and robots. Tap a signboard's character and its bar fills in your house's dye, then pays out. Buy levels ×1, ×10, ×100 or Max (one plate that cycles). Levels 25, 50, 100, 200, 300 and 400 double a trade's speed; from 500 on, milestones triple its profit.
- **Managers.** One for each trade (the village headman, the mine master, the master brewer, the fab director…). A managed trade runs without taps and keeps earning while you are away, up to a day.
- **Upgrades.** Three for each trade (iron ploughs, cupellation, kanban, emoji…), each tripling its profit, and one great work for each age (the land survey, the five highways, civilisation and enlightenment, the bullet train, the internet) that triples everything.
- **The year follows the money.** The more the house has earned, the later the year: the history arrives as you grow, and each trade opens in its year.
- **Rooms of the house.** Six rooms along the bottom: the Shop (trades, upgrades and managers under one switch), Guests, Journeys, the Tea room, the Chronicle and the House.
- **Guests.** 25 real people visit the house in their own years, from the tea master Murata Jukō and Oda Nobunaga to Shibusawa Eiichi, Matsushita Kōnosuke and Iwata Satoru (living people are left out). Welcome one and they stay for the run: most double the trade they are known for or add 10% to all profit; Jukō opens the tea room, Sen no Rikyū makes tea stronger, Hokusai and Inō Tadataka make chapters and provinces count double. Each run you welcome a guest the bond grows (up to five), and so does their help. Portraits are period paintings and old photographs from Wikimedia Commons (credits in the House room); guests without one show their name, brushed.
- **Crossroads.** Thirteen real turning points, from the Nanban ships at Hirado (1550) and the free market at Azuchi to the closed country, the Tenmei famine, the open ports, the great Kantō earthquake, the bubble and phones on the internet (1999). Each one offers the house two ways for the run, such as opening a branch in the new city of Edo or staying in Osaka. Each way changes one thing (a trade earns double, prices fall, trades run faster…), and the bubble's land deal pays only until 1991. A new beginning brings the choice again, and every way ever taken adds 1% profit for good (26 ways). The notice waits at the top of the trades; the House lists the ways taken.
- **Journeys.** A sixth room, 旅. Send the house's clerks along real trade roads:
  - up to Kyoto, the free port of Sakai, the Nanban ships at Hirado
  - the Tōkaidō to Edo, Dejima, the Kitamae ships to Ezo
  - the first train to Yokohama, the steamer to Seattle, the bullet train, a shop on the internet

  A trip takes 1 to 8 hours of game time, and the clerk keeps going while you are away. Each clerk comes home with a share of what the run has earned and one of the road's three famous goods. Every good ever brought home adds 1% profit for good (30 goods), and the 8-hour voyages sometimes turn up a treasure. There is one clerk at first, a second from 1603 and a third from 1868.
- **The tea room.** Serve tea for profit ×2 over 30 minutes, once every four hours. Three tasks a day (buy levels, read a chapter, welcome a guest…), each paying a twentieth of what the run has earned.
- **The house curtain. The crest dyed across the curtain with the clan name and the era, then the year, the head of the house, the money, and a band of the five ages filling in the house's dye.
- **Provinces and chronicle.** The house reaches a new province by itself every few years, always the richest next to its land (+4% profit each; listed in the House tab). The real history arrives as chapters with the clans' crests; reading one gives +2% profit.
- **Renown.** The Renown plate in the banner shows it and opens the House. Begin again in 1467, with any house, to turn this run's fame into renown: +1% profit each, for good. Treasures stay too. After the first new beginning, chapters already read count as read.

## Pacing (from the bot in `test.js`)

A bot that plays half an hour, then checks in five times a day, reaches about 1520 in its first half hour and the present day in about 7.5 days, beginning again nine times. Simulated casual players take longer: about 12 days checking in three times a day, 15–18 days at twice a day or with careless buying.

## Files

| File | What it does |
|---|---|
| `index.html` | Layout and all styles: one column the height of the screen (the house banner, the panel that scrolls, the tabs) |
| `ui.js` | The house banner, the trades, upgrades, managers, chronicle and house tabs, choosing a house, saving and the clock. Bars move on the compositor every frame; numbers update a few times a second; markup is rebuilt only when it changes |
| `game.js` | All the rules, as pure functions over one JSON state; no page code, so `test.js` plays it in Node. The dials are at the top |
| `data/game-data.js` | Province yields, mines and ports, the ages and their trades (with managers and upgrades), the great works, houses, names, treasures, the chapters after 1945, the guests and the tea room's tasks |
| `data/portraits.js`, `portraits/` | Generated by `tools/portraits.py`: the guests' portraits from Wikimedia Commons with their licences |
| `data/map.js` | Generated by `tools/import.js` from the Sengoku map: province names, borders and sea crossings, clans, dyes, crests, who held each province by year, the history. Don't edit by hand |
| `test.js` | `node test.js` checks the data and rules, then lets a bot play to the present to show the pacing; `quick` skips the bot |
| `tools/shots.py` | Plays the game in headless Chrome at phone and desktop sizes and saves screenshots; fails on any page error |
| `tools/subset_fonts.py` | Cuts the fonts down to the characters used; re-run after adding text |
| `docs/ios-readiness.md` | What the iPhone review found, what was fixed, and the path to the App Store |
| `tools/casual.js` | Pacing for casual players (two or three check-ins a day, careless buying) |
| `tools/perf.py` | Frame rate and long tasks at phone size with the CPU slowed 4x (roughly a mid-range phone) |
| `tools/icon.py` | The icons, drawn from the game's roof and brush font |
| `tools/portraits.py` | Fetches the guests' portraits (public domain or Creative Commons only) |
| `art/` | The roof and eave tile drawings |

**Tuning:** the dials are at the top of `game.js`. `YEARMAP` sets what the house must have earned by each year, and every trade's price follows from it. After a change, run `node test.js` and look at the day counts.

**Credits:** clan crests from Wikimedia Commons, each under its own licence (listed in `data/map.js`). Fonts: Shippori Mincho B1 and Zen Kaku Gothic New, SIL Open Font License. The history is written from standard accounts and simplified; yields are approximate.
