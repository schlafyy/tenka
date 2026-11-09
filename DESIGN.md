---
name: Tenka 天下
description: One house across 550 years, played on a length of indigo-dyed cotton; the counter moves a real timeline and the house's dye soaks across the map.
colors:
  kachi: "#13152f"
  kon: "#1a1e47"
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
    fontSize: "3.4rem"
    fontWeight: 700
    lineHeight: 0.9
    letterSpacing: "-0.02em"
    fontFeature: "lnum, tnum"
  headline:
    fontFamily: "Shippori, Yu Mincho, Hiragino Mincho ProN, serif"
    fontSize: "2.2rem"
    fontWeight: 700
    lineHeight: 1.1
  title:
    fontFamily: "Shippori, Yu Mincho, Hiragino Mincho ProN, serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.2
  title-sm:
    fontFamily: "Shippori, Yu Mincho, Hiragino Mincho ProN, serif"
    fontSize: "1.12rem"
    fontWeight: 700
    lineHeight: 1.3
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
  label:
    fontFamily: "Zen, Yu Gothic UI, Hiragino Sans, sans-serif"
    fontSize: "0.82rem"
    fontWeight: 400
    lineHeight: 1.4
  control:
    fontFamily: "Zen, Yu Gothic UI, Hiragino Sans, sans-serif"
    fontSize: "0.92rem"
    fontWeight: 500
    lineHeight: 1.2
rounded:
  cloth: "4px"
  card: "6px"
  pill: "22px"
  pill-house: "30px"
  round: "50%"
spacing:
  gap-sm: "8px"
  gap-md: "12px"
  gutter: "18px"
  row: "14px"
components:
  next-card:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "14px 16px"
  next-card-hover:
    backgroundColor: "{colors.cream-hover}"
  next-card-wait:
    textColor: "{colors.cream}"
    rounded: "{rounded.card}"
  button:
    textColor: "{colors.cream}"
    rounded: "{rounded.pill}"
    padding: "8px 18px"
    height: "42px"
  button-go:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
  trade-row:
    textColor: "{colors.cream}"
    padding: "11px 2px"
  trade-row-shut:
    textColor: "{colors.faint}"
  reach-pill:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "7px 16px"
    height: "40px"
  house-pill:
    backgroundColor: "{colors.kachi}"
    textColor: "{colors.cream}"
    rounded: "{rounded.pill-house}"
    padding: "5px 14px 5px 5px"
  crest-disc:
    backgroundColor: "{colors.undyed}"
    textColor: "{colors.ink}"
    rounded: "{rounded.round}"
    size: "34px"
  crest-disc-entry:
    rounded: "{rounded.round}"
    size: "38px"
  crest-disc-picker:
    rounded: "{rounded.round}"
    size: "44px"
  away-note:
    textColor: "{colors.cream}"
    rounded: "{rounded.cloth}"
    padding: "12px 14px"
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
    rounded: "{rounded.card}"
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

Tenka is the Sengoku map's world, kept whole and made into something you tend. The ground is indigo (kachi at the edge, kon in the sea, lining for panels), text is unbleached cotton cream, and each house is a natural dye with a stencil motif on a map of 68 resist-dyed provinces. What the game adds is a scroll of things to do and read, set under a strip of that same cloth: the year, the money, one cream card for the next thing to buy, quiet rows for the other trades, then a chronicle and the house's own page. The map is a strip at the head of the scroll and unrolls to nearly full height only when you choose a province; on wide screens it holds the left and the scroll runs on the right.

The interface is quiet and Mincho-led. Cream is the one bright thing on the dark ground, and it is spent on the single action that matters now (the next card, the reach pill, the primary button, the toast). Everything else recedes into muted indigo-tinted grey, dashed stitches and hairlines. The mood is a patient evening with a history book, not a dashboard.

**Key Characteristics:**
- Indigo ground with the cotton weave (1px lines on a 3px pitch) on the map strip and the house picker.
- One cream thing at a time: the next-decision card is the only large cream surface in the scroll.
- Mincho for names, kanji, the year, card titles and chronicle stories; gothic for counts, labels and controls.
- Dashed cream lines mean stitches: seams, borders of waiting or optional things, focus, selection.
- Crests are real kamon on a disc of the clan's own dye, darkened.
- Motion is small and eased on one curve: a stamp, a settle, a breathing dashed province, a toast.

## Colors

The Sengoku map's indigo palette, reduced to what a text-led scroll needs; the clan dyes live in the map's data and reach the interface only through the map and the crest discs.

### Primary
- **The Indigo Vat** (kachi, kon, hanada, lining, lining-2): kachi is the page, the pill and the text on cream. Kon is the open sea in the map strip's radial grade (lighter centre #252c63, out to kachi). Hanada is text selection and the scrollbar thumb. Lining is the choose bar and the house cards; lining-2 is the selected house card. Same names and values as the Sengoku map, except lining-2, which is new here.

### Neutral
- **Unbleached Cotton** (cream, cream-hover): all primary text, the next card, primary buttons, the reach pill and the toast as solid surfaces; cream at .14 to .6 alpha is every border, hairline and hover wash. cream-hover is the brighter cotton a cream surface turns on hover.
- **Undyed Cotton** (undyed): the crest-disc fallback ground behind a single kanji, when a house has no crest.
- **Ink** (ink, ink-soft): text on cream surfaces. ink is kachi under another name; ink-soft is the secondary line on the next card.
- **Indigo-tinted Greys** (muted, faint): muted is secondary text, costs not yet affordable and notes; faint is shut trades, empty treasure slots and the credits. faint is lighter here (#8f94b8) than the map's (#8489ad) so small type clears contrast on the scroll.
- **Story Cotton** (story): the dimmed cream of long Mincho reading in chronicle entries and the picker's lede, a step under full cream so paragraphs sit back from titles.

### Named Rules
**The One Cream Rule.** A solid cream surface means "this is the thing to tap now". There is one large one in the scroll (the next card); the reach pill, the primary button and the toast are small and rare. Waiting, optional or finished things are outlined in dashed cream or dimmed, never filled.

**The Same Cloth Rule.** Token names and values match the Sengoku map's Indigo Cloth where the build uses them. A new colour needs a job the map's palette does not already do.

**The Own Dye Rule.** A crest disc is filled with the clan's own dye darkened by 38%, then the crest is resist-dyed to cream over it. The disc never takes a colour that is not a clan dye.

## Typography

**Display Font:** Shippori Mincho B1, self-hosted as "Shippori" 400/700 (with Yu Mincho, Hiragino Mincho ProN, serif)
**Body Font:** Zen Kaku Gothic New, self-hosted as "Zen" 400/500 (with Yu Gothic UI, Hiragino Sans, sans-serif)

**Character:** The same pairing as the map: a high-contrast Mincho carries the history and the one number that matters (the year); a soft gothic handles counts, costs and controls.

### Hierarchy
- **Display** (700, 3.4rem, 0.9, -0.02em): the year, with lining tabular numerals. The era sits beside it, right-aligned, in Mincho 400 1.15rem with its romanization in gothic .8rem muted.
- **Headline** (700, 2.2rem, 1.1): the picker's "Tenka 天下"; its kanji is Mincho.
- **Title** (700, 1.25rem, 1.2): the next card's verb, the choose bar, and chronicle and house section headings. The next card's glyph is a 2.8rem Mincho kanji and trade-row glyphs are 1.1rem Mincho. Both are language text.
- **Title-sm** (700, 1.12rem, 1.3): chronicle entry names, `word-break: keep-all` and balanced, with the kanji kept whole (`nowrap`). House picker names are 1.08rem; subheads are 1.02rem.
- **Reading** (400, 1rem, 1.65, max 62ch, Mincho): a chronicle entry's short story. The picker's lede is 1.05rem.
- **Body** (400, 15px, 1.55, gothic): money line (1.06rem), notes, trade names. Numbers use tabular lining numerals.
- **Label** (400, .76 to .9rem, gothic, no uppercase, no tracking): costs, "level 3", "opens in 1550", where-lines, gifts, credits. Mostly muted.
- **Control** (500, .9 to .92rem, gothic): buttons, pills and the toast.

### Named Rules
**The English-then-Kanji Rule.** A name is the English followed by its kanji in Mincho (the picker title, entry names, treasures, mottoes), as in the map.

**The Year Is Loud Rule.** The year is the largest type in the scroll and the only display-size text there. Nothing else competes with it in size.

## Layout

One column, 460px at most, centred (`--col`), on a scroll that pages: the map strip, then "the present" (year, money, pace, away note, next card, trades), a dashed seam, the chronicle, a dashed seam, the house page. Side padding is 18px. Vertical rhythm is 8px between related controls, 10 to 16px between blocks, 18 to 22px around seams and subheads. Trade rows are 11px tall in padding with a 1px hairline between.

The map strip is clamp(210px, 31dvh, 320px) tall and, on choosing a province, animates to calc(100dvh - 150px) over .6s while the choose bar appears beneath it. The house pill sits top-left, the reach pill bottom-right, the close button top-right of the strip. Safe-area insets are respected at top and bottom.

At 900px and up the page is a two-column grid: the map fills the left at full height and the scroll runs on the right (400 to 480px) with a dashed left seam; the choose bar floats at the map's bottom-left as a 6px-rounded card (width min(440px, 100vw - 540px)). The picker is a fixed full-screen overlay, 560px max, with houses in an auto-fill grid of 150px minimum columns.

Reduced motion cuts every animation and transition to .01ms.

## Elevation & Depth

Mostly flat: depth comes from tone (kachi page, lining panels, cream surfaces) and from dashed or hairline borders. Soft ambient shadows are used only on things that float over the map or the scroll: the house pill (0 4px 14px at .3), the reach pill (0 6px 18px at .35), the next card (0 8px 22px at .28) and the toast (0 8px 22px at .35). They are wide, blurred and offset only downward. This departs from the Sengoku map, which has no drop shadows; the cloth itself (map strip, panels, rows, entries) stays shadowless, and the waiting card loses its shadow entirely.

### Named Rules
**The Lifted Cream Rule.** Only solid cream or dark floating controls carry a soft shadow. Outlined, dashed and hairline things never do. No hard or offset shadows.

## Shapes

Barely softened corners: 4px for the away note and treasure tiles, 6px for cards (next card, present, chosen, house cards, the choose bar on wide screens). Buttons, the reach pill and the toast are 22px pills; the house pill is a 30px pill; discs and the close button are full circles. A crest disc has a 1.5px cream ring at .55; the kanji fallback disc has none.

Dashed means optional, waiting or seam: the waiting next card, the away note, the seams between sections, chronicle entry borders, gone treasure tiles, the choose bar's bottom edge. Solid 1px lines at .14 are the hairlines between trade rows. Focus is a 1.5px dashed cream outline offset 3px. Reachable provinces on the open map are dashed cream and breathe (2.4s); the selected one goes solid and thicker (2.6px).

## Components

### Next-decision card
The one cream card. A 2.8rem Mincho glyph at left in a 48px column, a title block (verb in Title, "Level 3 → 4" and "+120 a second" in gothic .84rem ink-soft), and the cost right-aligned in gothic 500 1.02rem with a small line under it. 6px radius, 14px gap, padding 14px 16px. Hover brightens to cream-hover; press scales to .985; on purchase the glyph "stamps" (scale 1.18 to 1 over .35s). The waiting state is a translucent cream .1 fill with a dashed seam border, cream text, muted secondary lines, no shadow and no hover. Below it, an underlined muted text action ("Spend it all on the best trades") appears only when two or more trades are affordable.

### Trade rows
Quiet: no fill, no card. A 20px Mincho glyph column, the name with a muted small "level N", and a muted right-aligned cost that turns cream once affordable. 11px vertical padding, 1px hairline between rows. Hover underlines the name in seam colour. Shut trades are faint, disabled and read "opens in 1550". Earlier ages fold into a `details` row with a rotating chevron and the combined income.

### Away note
A 4px-radius dashed seam box under the year: a Mincho 1.05rem heading ("While you were away, ..."), muted body, a 32px dismiss target at top-right with a 12px cross.

### Map strip, house pill, reach pill
The strip is the indigo radial grade under the weave. The house pill is a kachi .9 pill holding a 34px crest disc, the clan name in Mincho 700 1.12rem and a muted small line. The reach pill is cream with ink text and a 15px SVG, 40px tall. When the map is open both hide and a 40px round close button (kachi .78, 1.5px cream ring at .5) takes the top-right.

### Open-map choose bar
Lining ground, 14px 18px padding, a dashed seam bottom edge; a Mincho 1.25rem province name with muted kanji, a muted .88rem line, and a wrapping row of buttons (primary "Reach ..." and a secondary "Later"). On wide screens it floats over the map as a bordered 6px card.

### Buttons
42px tall pills, 8px 18px padding, gothic 500 .92rem. Default: cream text, 1.5px cream border at .5; hover goes to full cream border with a .07 wash. Go: solid cream with ink text, hover cream-hover. Disabled: .4 opacity. One Go button per block.

### Chronicle entries
A two-column grid (46px, 1fr). Left: the year in Mincho 700 1rem muted, right-aligned, over a 38px crest disc. Right: an entry name in Title-sm with its kanji, a muted "place · clan" line, and the short story in Reading (Story Cotton, 62ch). A dashed hairline at .14 separates entries. An unread entry swaps the story for a "Read · income +N%" button; new entries settle in (.8s, 10px drop and fade). House entries (the player's own heads) drop the disc and set the name in gothic 400 .98rem muted.

### Crest disc
34px in the pill, 38px in the chronicle, 44px in the picker: a circle filled with the clan's dye darkened by 38%, a crest resist-dyed to cream inside, a 1.5px cream ring at .55. Without a crest, an undyed disc with the clan's first kanji in ink Mincho.

### House section and treasures
A Title heading with a muted count, a facts block (muted lines, cream 500 terms), "heads before" in two columns, treasure tiles in an auto-fill grid (128px min, 4px radius, 1px hairline, Mincho name in cream; gone ones dashed, faint and empty) and a tools row of default buttons. Credits are .76rem faint.

### House picker
A fixed full-screen overlay on the indigo grade with the weave: headline with kanji, a Story Cotton Mincho lede above a dashed seam, a grid of house cards (6px radius, 1.5px hairline border, lining ground; the pressed card has a full cream border and lining-2 ground) each with a 44px disc, the name and a small muted line, then a bordered "chosen" panel with a full-width Go button.

### Toast
A cream pill, ink text, gothic 500 .9rem, centred above the bottom safe area, rising and fading over 2.6s. Polite status; never blocks.

## Do's and Don'ts

### Do:
- **Do** spend solid cream on the one action that is next (card, reach pill, Go button, toast) and outline everything else in dashed or hairline cream.
- **Do** reuse the Sengoku map's token names and values (kachi, kon, hanada, lining, cream, undyed, muted, Shippori, Zen) before inventing one.
- **Do** set names as English then kanji in Mincho, and put crest discs on the clan's darkened dye with the crest resist-dyed to cream.
- **Do** keep dashed lines for seams, waiting states, focus and selection, and 1px .14 cream for hairlines between rows.
- **Do** keep corners to 4px, 6px, the 22px pill and circles.
- **Do** ease motion on cubic-bezier(.16, 1, .3, 1), keep it small, and honour prefers-reduced-motion.
- **Do** keep tap targets at 40px or taller (buttons 42px, close and reach pills 40px).

### Don't:
- **Don't** add a second large cream surface to the scroll; waiting and optional things stay outlined.
- **Don't** use a clan dye, or any colour, as an interface accent. Dyes belong to the map and the discs.
- **Don't** add shadows to cloth surfaces (rows, entries, panels, seams) or any hard offset shadow.
- **Don't** use gilt, parchment, game-HUD chrome or legends; the year and the next card are the interface.
- **Don't** mix a second display face or set names without their kanji.
