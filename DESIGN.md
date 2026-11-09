---
name: Tenka 天下
description: A house's fortune across 550 years, kept on a length of indigo-dyed cotton; trades run in the house's own dye while the map strip above soaks with its land.
colors:
  kachi: "#13152f"
  kon: "#1a1e47"
  kon-light: "#252c63"
  hanada: "#33478a"
  lining: "#16193a"
  lining-2: "#1c2046"
  cream: "#efe6d3"
  cream-hover: "#fff8e8"
  undyed: "#e2d9c5"
  muted: "#adb2d2"
  faint: "#8f94b8"
  ink: "#13152f"
  ink-soft: "#4a4a63"
  story: "#ddd5c4"
typography:
  display:
    fontFamily: "Shippori, Yu Mincho, Hiragino Mincho ProN, serif"
    fontSize: "2.4rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontFeature: "lnum, tnum"
  headline:
    fontFamily: "Shippori, Yu Mincho, Hiragino Mincho ProN, serif"
    fontSize: "2.2rem"
    fontWeight: 700
    lineHeight: 1.1
  glyph:
    fontFamily: "Shippori, Yu Mincho, Hiragino Mincho ProN, serif"
    fontSize: "2.2rem"
    fontWeight: 700
    lineHeight: 1
  money:
    fontFamily: "Zen, Yu Gothic UI, Hiragino Sans, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 500
    lineHeight: 1.1
    fontFeature: "lnum, tnum"
  title:
    fontFamily: "Shippori, Yu Mincho, Hiragino Mincho ProN, serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.2
  title-sm:
    fontFamily: "Shippori, Yu Mincho, Hiragino Mincho ProN, serif"
    fontSize: "1.05rem"
    fontWeight: 700
    lineHeight: 1.2
  reading:
    fontFamily: "Shippori, Yu Mincho, Hiragino Mincho ProN, serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  body:
    fontFamily: "Zen, Yu Gothic UI, Hiragino Sans, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
  control:
    fontFamily: "Zen, Yu Gothic UI, Hiragino Sans, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 500
    lineHeight: 1.2
  label:
    fontFamily: "Zen, Yu Gothic UI, Hiragino Sans, sans-serif"
    fontSize: "0.84rem"
    fontWeight: 400
    lineHeight: 1.4
  micro:
    fontFamily: "Zen, Yu Gothic UI, Hiragino Sans, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 400
    lineHeight: 1.3
rounded:
  cloth: "4px"
  tile: "8px"
  pill: "22px"
  round: "50%"
spacing:
  gap-sm: "8px"
  gap-md: "14px"
  gutter: "18px"
  tab-clearance: "96px"
components:
  year-header:
    backgroundColor: "{colors.kachi}"
    textColor: "{colors.cream}"
    padding: "12px 18px 10px"
  buy-mode-switch:
    textColor: "{colors.muted}"
    rounded: "{rounded.pill}"
    padding: "3px"
  buy-mode-switch-active:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "34px"
  trade-tile:
    backgroundColor: "{colors.lining-2}"
    textColor: "{colors.cream}"
    rounded: "{rounded.tile}"
    size: "66px"
  trade-tile-idle:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.tile}"
    size: "66px"
  level-badge:
    backgroundColor: "{colors.kachi}"
    textColor: "{colors.cream}"
    rounded: "{rounded.tile}"
    padding: "0 7px"
  trade-bar:
    backgroundColor: "{colors.hanada}"
    textColor: "{colors.cream}"
    rounded: "{rounded.cloth}"
    height: "28px"
  buy-button:
    textColor: "{colors.muted}"
    rounded: "{rounded.cloth}"
    padding: "6px 14px"
    height: "40px"
  buy-button-ok:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.cloth}"
  buy-button-ok-hover:
    backgroundColor: "{colors.cream-hover}"
  trade-shut:
    textColor: "{colors.faint}"
    rounded: "{rounded.tile}"
  list-item:
    textColor: "{colors.cream}"
    padding: "13px 0"
  button:
    textColor: "{colors.cream}"
    rounded: "{rounded.pill}"
    padding: "8px 18px"
    height: "42px"
  button-go:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
  button-go-hover:
    backgroundColor: "{colors.cream-hover}"
  panel-box:
    textColor: "{colors.cream}"
    rounded: "{rounded.cloth}"
    padding: "14px 16px"
  away-note:
    textColor: "{colors.cream}"
    rounded: "{rounded.cloth}"
    padding: "12px 14px"
  tab-bar:
    backgroundColor: "{colors.lining}"
    textColor: "{colors.muted}"
    height: "56px"
  tab-dot:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.tile}"
    height: "17px"
  house-pill:
    backgroundColor: "{colors.kachi}"
    textColor: "{colors.cream}"
    rounded: "{rounded.pill}"
    padding: "5px 14px 5px 5px"
  reach-pill:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "7px 16px"
    height: "40px"
  crest-disc:
    backgroundColor: "{colors.undyed}"
    textColor: "{colors.ink}"
    rounded: "{rounded.round}"
    size: "34px"
  chronicle-entry:
    textColor: "{colors.cream}"
    padding: "14px 0"
  choose-bar:
    backgroundColor: "{colors.lining}"
    textColor: "{colors.cream}"
    padding: "14px 18px 16px"
  house-card:
    backgroundColor: "{colors.lining}"
    textColor: "{colors.cream}"
    rounded: "{rounded.cloth}"
    padding: "12px"
  house-card-selected:
    backgroundColor: "{colors.lining-2}"
  treasure-tile:
    textColor: "{colors.muted}"
    rounded: "{rounded.cloth}"
    padding: "10px"
  toast:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "8px 18px"
---

# Design System: Tenka 天下

## Overview

**Creative North Star: "Indigo Cloth"**

Tenka is the Sengoku map's world, kept whole and made into a business you run. The ground is indigo (kachi at the edge, kon in the sea, lining for panels), text is unbleached cotton cream, and each house is a natural dye with a stencil motif. A strip of the dyed map sits at the head, a sticky header holds the year and the money, and below it a list of trades, each one a square you tap, a bar that fills in your house's own dye, and a price to buy more. A fixed tab bar carries the rest: upgrades, managers, the chronicle and the house.

The interface is quiet and Mincho-led. Cream is the one bright thing on the dark ground, and it marks what can be acted on now: a trade square that waits for a tap, a buy button you can afford, a price button you can pay, the selected buy mode, the count dots on tabs, the reach pill and the toast. Everything else recedes into muted indigo-tinted grey, dashed stitches and hairlines. The mood is a patient evening with a ledger and a history book, not a casino dashboard.

**Key Characteristics:**
- Indigo ground with the cotton weave (1px lines on a 3px pitch) on the map strip and the house picker.
- Cream is for what can be acted on now; waiting, shut or finished things are outlined, dashed or dimmed.
- Trade bars fill in the house's darkened dye under its own stencil motif.
- Mincho for names, kanji, the year and stories; gothic for money, counts, labels and controls.
- Dashed cream lines mean stitches: rows, seams, borders of waiting or optional things, focus.
- Crests are real kamon on a disc of the clan's own dye, darkened.
- Motion is small and eased on one curve.

## Colors

The Sengoku map's indigo palette, reduced to what a ledger needs; clan dyes reach the interface only through the map, the crest discs and the trade bars.

### Primary
- **The Indigo Vat** (kachi, kon, kon-light, hanada, lining, lining-2): kachi is the page, the sticky header, the house pill and the text on cream. Kon and kon-light are the sea in the map strip's radial grade and the lake and Ezo fills. Hanada is text selection, the scrollbar thumb and the trade bar's fallback fill. Lining is the tab bar, the choose bar and house cards; lining-2 is the trade tile and the selected house card.

### Neutral
- **Unbleached Cotton** (cream, cream-hover): all primary text, and the solid surface of whatever can be acted on now; cream at .14 (line), .32 (seam) and up to .5 alpha is every border, hairline and hover wash. cream-hover is the brighter cotton a cream surface turns on hover.
- **Undyed Cotton** (undyed): the crest-disc fallback ground behind a single kanji.
- **Ink** (ink, ink-soft): text on cream surfaces. ink is kachi under another name. ink-soft is defined but unused in the current build.
- **Indigo-tinted Greys** (muted, faint): muted is secondary text, unaffordable prices and notes; faint is shut trades, empty treasure slots and the credits.
- **Story Cotton** (story): the dimmed cream of long Mincho reading in chronicle entries and the picker's lede.

### Named Rules
**The Cream Marks Action Rule.** Cream marks what can be acted on now. A solid cream fill means "tap this": an idle trade square, an affordable buy or price button, the selected buy mode, a tab's count dot, the reach pill, the Go button, the toast. When the thing is no longer actionable it returns to outline or muted text. Cream never decorates.

**The Same Cloth Rule.** Token names and values match the Sengoku map's Indigo Cloth where the build uses them. A new colour needs a job the map's palette does not already do.

**The Own Dye Rule.** The player's house dye, darkened (30% for bar fills, 38% for crest discs), is the only clan colour in the interface, and only on the trade bars and the discs. It is set once, from the house, as the variables --dye and --dye-cloth on the page. No other element takes a dye.

## Typography

**Display Font:** Shippori Mincho B1, self-hosted as "Shippori" 400/700 (with Yu Mincho, Hiragino Mincho ProN, serif)
**Body Font:** Zen Kaku Gothic New, self-hosted as "Zen" 400/500 (with Yu Gothic UI, Hiragino Sans, sans-serif)

**Character:** A high-contrast Mincho carries the history, the year and the trade glyphs; a soft gothic handles money, costs and controls. All type sits on a nine-step rem ramp: .72, .84, .9, 1, 1.05, 1.25, 1.5, 2.2, 2.4.

### Hierarchy
- **Display** (700, 2.4rem, 1, -0.02em): the year in the sticky header, lining tabular numerals. Its era sits right-aligned in Mincho 400 1.05rem with its romanization in gothic .72rem muted.
- **Headline** (700, 2.2rem, 1.1): the picker's "Tenka 天下". The trade tile's kanji uses the same size and weight (glyph).
- **Money** (gothic 500, 1.5rem, 1.1): the money figure in the header; its unit is muted and its rate is muted .9rem, pushed right.
- **Title** (700, 1.25rem): tab and section headings, the choose bar and the present-day box, the tab bar's kanji.
- **Title-sm** (700, 1.05rem, 1.2): trade names, upgrade and manager names, chronicle entry names (`keep-all`, balanced, kanji kept whole), house names in the picker, subheads. Kanji beside a name is Mincho 400 .9rem muted.
- **Reading** (400, 1rem, 1.65, max 62ch, Mincho): a chronicle story. The picker's lede is 1.05rem.
- **Body** (400, 15px, 1.55, gothic): default text. Numbers use tabular lining numerals.
- **Control** (500, .9rem, gothic): buttons, buy mode switch, buy button, tab counts, toast.
- **Label** (400, .84rem): bar text, tips, item descriptions, where-lines, "Opens in 1550". Notes and facts are .9rem muted.
- **Micro** (.72rem): level badge, "profit ×3 at level 25" milestone notes, tab labels, the credits.

### Named Rules
**The English-then-Kanji Rule.** A name is the English followed by its kanji in Mincho (trade names, upgrades, entries, treasures, picker title).

**The Year Is Loud Rule.** The year is the largest text on the panel and the only display-size text there; the trade glyph shares its scale only because it is a single kanji in a square.

## Layout

A one-column panel, 460px at most, centred (`--col`), under a map strip. On a phone the page is the map strip (clamp(150px, 22dvh, 230px)), a sticky header (year with era, then money with rate, 12px 18px padding, dashed bottom seam), the panel, and a fixed tab bar. The panel's bottom padding (96px plus the safe area) clears the tab bar. Side padding is 18px; blocks sit 12 to 16px apart, subheads 22px above.

A trade is a two-column grid: a 66px tile at left (14px gap) and, stacked right, the name with its level note, the bar, and the buy row with its milestone note. Rows are separated by dashed hairlines, 16px above and 14px below. The next locked trade closes the list, drawn dashed. Upgrades and managers are two-column items (text, then a 96px minimum price button), 13px padding.

Choosing a province unrolls the strip to calc(100dvh - 150px) over .6s and shows the choose bar beneath it. The house pill sits top-left, the reach pill bottom-left, the close button top-right.

At 900px and up the body is a two-column grid: the map at full height on the left, the app (420 to 500px, dashed left seam) on the right, the header no longer sticky, the panel scrolling inside, the tab bar in flow at the foot. The choose bar floats over the map's bottom-left as a bordered 4px card. The picker is a fixed full-screen overlay, 560px max, houses in an auto-fill grid of 150px minimum columns.

Reduced motion cuts every animation and transition to .01ms.

## Elevation & Depth

Mostly flat: depth comes from tone (kachi page, lining and lining-2 panels, cream surfaces) and from dashed or hairline borders. Soft ambient shadows appear only on the three things that float over the map or the panel: the house pill (0 4px 14px at .3), the reach pill (0 6px 18px at .35) and the toast (0 8px 22px at .35). They are wide, blurred and offset only downward. The tab bar, header, tiles, buttons, rows and panels stay shadowless. Crest discs carry a zero-offset 1.5px cream ring at .55 rather than a shadow.

### Named Rules
**The Lifted Floaters Rule.** Only controls floating over the map or the panel carry a soft shadow. Rows, tiles, buttons and panels never do. No hard or offset shadows.

## Shapes

Barely softened corners on a short scale: 4px for bars, buy buttons, panel boxes, away note, treasure tiles, house cards and the choose bar on wide screens; 8px for the trade tile and the small badges (level, tab dots); 22px pills for buttons, the buy mode switch, the house pill, the reach pill and the toast; full circles for discs and the close button. A crest disc has a 1.5px cream ring at .55; the kanji fallback has none.

Dashed means rows, waiting or seam: trade and list rows, chronicle entries, the header and tab bar seams, the shut trade's tile, the away note, gone treasure tiles. Solid 1px lines at .32 frame the present-day and renown boxes and the level badge. Focus is a 1.5px dashed cream outline offset 3px. Reachable provinces on the open map are dashed cream and breathe (2.4s); the selected one goes solid and thicker.

## Components

### Year header
Sticky at the top of the page on phones, kachi ground with a dashed bottom seam. Left, the year in Display; right, the era in Mincho with romanization beneath. Below, the money in Money type, a muted unit and a muted rate at the far right.

### Buy mode switch
A 22px-radius pill with a 1.5px line border holding four buttons (×1, ×10, ×100, Max), 50px by 34px minimum, muted text. The pressed one fills cream with ink text. Right-aligned above the trades.

### Trade row
Grid of tile and content. The **tile** is a 66px square, 8px radius, lining-2 ground and a 1.5px seam border, a 2.2rem Mincho kanji and a level badge hanging off the bottom edge (kachi, 1px seam border, .72rem). When the trade waits for a tap (idle), the tile turns solid cream with ink text and its kanji nudges up and down (1.4s); pressing scales it to .95. The **bar** is 28px tall, 4px radius, a cream .08 trough; its fill is the house dye (--dye) with the stencil motif tiled over it (--dye-cloth), falling back to hanada; it shimmers when the trade runs so fast the fill would blur. Inside, the payout in 500 and the time left in muted. The **buy button** is a 40px, 4px-radius outlined button with muted text ("×10" count left, price right); when affordable it fills cream with ink text and brightens to cream-hover on hover. A muted .72rem milestone note ("twice as fast at level 25") sits at its right. The **shut** trade is the next locked one: dashed tile with no fill, faint kanji and name, and a muted line "Opens in 1550, when the house has earned ...".

### Upgrades and managers
List items on a dashed hairline: name with kanji and a muted .84rem description at left; a 96px-minimum pill button at right showing the price. Outlined while unaffordable (disabled), solid cream "go" when affordable. A hired manager shows a muted check and "Hired".

### Tab bar
Fixed to the bottom (in flow on wide screens), lining ground, dashed top seam, five equal buttons at 56px minimum: a 1.25rem Mincho kanji over a .72rem label, muted. The current tab turns cream and gains a 2px cream bar across the top edge. A count dot (cream, ink text, 17px, 8px radius) sits at the top-right of the kanji when something waits.

### Panel boxes
The present-day box and the renown box: 1px seam border, 4px radius, 14px 16px padding, a title, muted text and a button. The away note is the same shape in dashed seam, with a 32px dismiss target at its top-right.

### Buttons
42px tall, 22px-radius pills, 8px 18px padding, gothic 500 .9rem. Default: cream text, 1.5px cream border at .5; hover goes to full cream border with a .07 wash. Go: solid cream with ink text, hover cream-hover. Disabled: muted text, hairline border.

### Map strip, house pill, reach pill
The strip is the indigo radial grade under the weave. The house pill is a kachi .9 pill holding a 34px crest disc, the clan name in Mincho 1.05rem and a muted .72rem line. The reach pill is cream with ink text and a 15px SVG, 40px tall. When the map is open both hide and a 40px round close button takes the top-right.

### Open-map choose bar
Lining ground, 14px 18px padding, dashed seam bottom edge; a Mincho 1.25rem province name with muted kanji, a muted line, and a wrapping row of buttons.

### Chronicle entries
A two-column grid (46px, 1fr). Left: the year in Mincho 700 1rem muted, right-aligned, over a 38px crest disc. Right: the name in Title-sm with its kanji, a muted "place · clan" line and the story in Reading (Story Cotton, 62ch). A dashed hairline separates entries. An unread entry swaps the story for a "Read · profit +N%" button; new entries settle in (.8s, 10px drop and fade). House entries (the player's own heads) drop the disc and set the name in gothic 400 1rem muted.

### Crest disc
34px in the pill, 38px in the chronicle, 44px in the picker: a circle filled with the clan's dye darkened by 38%, a crest resist-dyed to cream inside, a 1.5px cream ring at .55. Without a crest, an undyed disc with the clan's first kanji in ink Mincho.

### House section and treasures
A Title heading, a facts block (muted lines, cream 500 terms), the renown box, "heads before" in two columns, treasure tiles in an auto-fill grid (128px min, 4px radius, 1px hairline, Mincho name in cream; gone ones dashed, faint) and a tools row of default buttons. Credits are .72rem faint.

### House picker
A fixed full-screen overlay on the indigo grade with the weave: headline with kanji, a Story Cotton Mincho lede above a 2px dashed seam, a grid of house cards (4px radius, 1.5px hairline border, lining ground; the pressed card has a full cream border and lining-2 ground) each with a 44px disc, the name and a muted line, then a bordered "chosen" box with a full-width Go button.

### Toast
A cream pill, ink text, gothic 500 .9rem, centred above the tab bar, rising and fading over 2.6s. Polite status; never blocks.

## Do's and Don'ts

### Do:
- **Do** use solid cream only for what can be acted on now (idle tile, affordable buy and price buttons, selected mode, count dots, reach pill, Go, toast) and return it to outline or muted when the action is gone.
- **Do** reuse the Sengoku map's token names and values (kachi, kon, hanada, lining, cream, undyed, muted, Shippori, Zen) before inventing one.
- **Do** set names as English then kanji in Mincho, and fill bars and crest discs only in the house's darkened dye.
- **Do** keep dashed lines for rows, seams, waiting states and focus, and 1px cream at .14 or .32 for hairlines and boxes.
- **Do** keep corners to 4px, 8px, the 22px pill and circles, and type to the nine-step rem ramp.
- **Do** ease motion on cubic-bezier(.16, 1, .3, 1), keep it small, and honour prefers-reduced-motion.
- **Do** keep tap targets at 40px or taller (buttons 42px, buy buttons and pills 40px, tabs 56px); the 34px mode buttons sit inside a 40px group.

### Don't:
- **Don't** fill a surface cream that cannot be acted on; shut, waiting or finished things stay dashed, outlined or dimmed.
- **Don't** use a clan dye, or any other colour, as an interface accent outside the bars and discs.
- **Don't** add shadows to cloth surfaces (rows, tiles, buttons, panels, tab bar) or any hard offset shadow.
- **Don't** use gilt, parchment, coin icons or game-HUD chrome; the year, the money and the bars are the interface.
- **Don't** mix a second display face or set names without their kanji.
