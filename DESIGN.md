---
name: Tenka 天下
description: A merchant house's shop front: the house curtain in the clan's dye with its crest, white plaster, dark wood signboards with gilt characters, gold plates only for what can be done now.
colors:
  plaster: "#f4f3f0"
  slip: "#ffffff"
  hairline: "#e1dbd2"
  hairline-strong: "#cdc3b6"
  sumi: "#231d18"
  sumi-2: "#3d342c"
  soft-ink: "#6c6158"
  wood: "#3b2b21"
  wood-raised: "#47352a"
  wood-deep: "#2c2019"
  on-wood: "#f1e7d6"
  on-wood-soft: "#c4b49f"
  gilt: "#e2c27f"
  gold: "#d9b56b"
  gold-hover: "#e6c47e"
  dye: "#82263a"
  dye-lit: "#953f51"
  recess: "#e8e4dd"
  shut: "#e9e6e1"
  plate: "#e6e2dc"
  plate-hover: "#dcd7cf"
typography:
  year:
    fontFamily: "Shippori, Yu Mincho, Hiragino Mincho ProN, serif"
    fontSize: "2.6rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontFeature: "lnum, tnum"
  headline:
    fontFamily: "Shippori, Yu Mincho, Hiragino Mincho ProN, serif"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1.2
  title:
    fontFamily: "Shippori, Yu Mincho, Hiragino Mincho ProN, serif"
    fontSize: "1.15rem"
    fontWeight: 400
    lineHeight: 1.2
  sign-character:
    fontFamily: "Shippori, Yu Mincho, Hiragino Mincho ProN, serif"
    fontSize: "2.1rem"
    fontWeight: 700
    lineHeight: 1
  reading:
    fontFamily: "Shippori, Yu Mincho, Hiragino Mincho ProN, serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
  figure:
    fontFamily: "Zen, Yu Gothic UI, Hiragino Sans, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 500
    lineHeight: 1.1
    fontFeature: "lnum, tnum"
  body:
    fontFamily: "Zen, Yu Gothic UI, Hiragino Sans, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Zen, Yu Gothic UI, Hiragino Sans, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 500
    lineHeight: 1.3
  caption:
    fontFamily: "Zen, Yu Gothic UI, Hiragino Sans, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 400
    lineHeight: 1.3
rounded:
  xs: "2px"
  sm: "4px"
  md: "6px"
  lg: "8px"
  pill: "50px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "18px"
  xl: "24px"
components:
  signboard:
    backgroundColor: "{colors.wood}"
    textColor: "{colors.on-wood}"
    rounded: "{rounded.md}"
    padding: "14px 14px 14px 12px"
  sign-tile:
    backgroundColor: "{colors.wood-deep}"
    textColor: "{colors.gilt}"
    typography: "{typography.sign-character}"
    rounded: "{rounded.sm}"
    size: "64px"
  sign-tile-ready:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.wood}"
  buy-plate:
    backgroundColor: "{colors.wood-deep}"
    textColor: "{colors.on-wood-soft}"
    rounded: "{rounded.sm}"
    height: "40px"
    padding: "6px 14px"
  buy-plate-ready:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.wood}"
  buy-plate-ready-hover:
    backgroundColor: "{colors.gold-hover}"
  button:
    backgroundColor: "{colors.plate}"
    textColor: "{colors.sumi}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    height: "42px"
    padding: "8px 18px"
  button-hover:
    backgroundColor: "{colors.plate-hover}"
  button-go:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.wood}"
  button-go-hover:
    backgroundColor: "{colors.gold-hover}"
  button-on-wood:
    backgroundColor: "{colors.wood-deep}"
    textColor: "{colors.on-wood}"
  slip:
    backgroundColor: "{colors.slip}"
    textColor: "{colors.sumi}"
    rounded: "{rounded.md}"
    padding: "12px 14px"
  mode-switch:
    backgroundColor: "{colors.recess}"
    rounded: "{rounded.lg}"
    padding: "3px"
  mode-switch-active:
    backgroundColor: "{colors.wood}"
    textColor: "{colors.on-wood}"
    rounded: "{rounded.md}"
  tab-sill:
    backgroundColor: "{colors.wood}"
    textColor: "{colors.on-wood-soft}"
    height: "56px"
  tab-sill-current:
    textColor: "{colors.gilt}"
  count-dot:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.wood}"
    rounded: "{rounded.pill}"
    height: "17px"
  shut-board:
    backgroundColor: "{colors.shut}"
    textColor: "{colors.soft-ink}"
    rounded: "{rounded.md}"
  curtain:
    backgroundColor: "{colors.dye}"
    textColor: "#ffffff"
    height: "140px"
---

# Design System: Tenka 天下

## Overview

**Creative North Star: "The Shop Curtain"**

The game is the front of a merchant house. At the top hangs the noren, the house curtain, dyed in the chosen clan's colour with the clan's crest across its three panels. Below it is white plaster, and on the plaster hang dark wooden signboards, one per trade, each with a single gilt character. Everything the player can do right now is on a gold plate; everything else is recessed, quiet, or empty. The look is calm, warm and a little ceremonial: light ground, one dyed colour, wood and gold.

Controls are filled or recessed shapes, never outlined. Depth comes from soft hanging shadows under wood and slips, and from tone. Lines are solid hairlines only. Type pairs a Mincho for names, years and sign characters with a Gothic for figures and interface.

The one variable is the house's dye. It is computed at runtime from the chosen clan (deepened until white text reaches 4.5:1) and set as `--dye` on the body. The stylesheet's #82263a is the fallback; every use of the dye must read the variable, never a literal.

**Key Characteristics:**
- Light plaster ground, dark wood boards, one clan dye, gold for the actionable.
- The crest is rendered as white cotton the dye never reached: it appears on the dye (curtain, house cards, chosen-house card) or on a deepened dye disc.
- Filled and recessed controls, no outlines; radii 4 and 6.
- Mincho 400 for names, years and kanji; Mincho 700 only for the gilt sign characters; Zen Gothic for figures and UI.
- Soft hanging shadows only.

## Colors

A plaster-and-wood palette with a single variable dye and a single warm metal.

### Primary
- **House Dye** (`dye`, #82263a fallback, set per clan by `dyeTheHouse()`): the curtain, the age band fill, house cards and the chosen-house card. Always deep enough for white text.
- **Lit Dye** (`dye-lit`, #953f51 fallback): the cycle bar fill on the dark boards; a lighter cut of the house dye (a darker cut for ochre dyes, which read as gold when lightened).

### Secondary
- **Gold Plate** (`gold`, `gold-hover`): only for what can be done now: an affordable buy plate, a go button, a ready sign tile, a count dot. Wood-dark text sits on it.
- **Gilt** (`gilt`): letters and thin marks on wood: sign characters, level plates, payout figures, the current tab, the focus ring on wood.

### Neutral
- **Plaster** (`plaster`): the page ground. **Slip** (`slip`): paper slips and treasure cards.
- **Hairline** and **Hairline Strong**: solid dividers, age band track, scrollbar.
- **Sumi** (`sumi`, `sumi-2`): body and reading text. **Soft Ink** (`soft-ink`): secondary text on plaster.
- **Wood** (`wood`, `wood-raised`, `wood-deep`): signboards (a gradient from raised to wood at 60%), the renown board, the chosen-house card, the tab sill, the toast and the active buy-mode segment; deep wood for tiles and level plates. **On Wood** and **On Wood Soft** are the text on wood.
- **Recess tones** (`recess`, `shut`, `plate`, `plate-hover`): quiet fills for the mode-switch track, the not-yet-open trade, province chips and plain buttons. Controls on wood use a black wash (rgba(0,0,0,.26)) instead.

### Named Rules
**The Gold Means Now Rule.** Gold appears only on something the player can act on at this moment. When it is not affordable, ready or unread, the plate drops to the recessed tone. Gold on a decorative element is a defect.

**The One Dye Rule.** The house dye is the only saturated colour on a screen. It owns the curtain, the age band and house cards, and its lit cut fills bars on wood. Do not add a second hue.

**The White Reads Rule.** Any dye that carries white text is deepened until the contrast is 4.5:1, by computation, not by eye.

## Typography

**Display Font:** Shippori Mincho 400 and 700 (with Yu Mincho, Hiragino Mincho ProN, serif)
**Body Font:** Zen Kaku Gothic 400 and 500 (with Yu Gothic UI, Hiragino Sans, sans-serif)

**Character:** The Mincho reads as lettering on a shop sign and in a chronicle; the Gothic keeps figures and controls plain. Both are self-hosted woff2 in `fonts/`.

### Hierarchy
- **Curtain lettering** (Yuji Syuku brush, 400, 1.75rem clan name and 1.05rem era year, vertical, white): only on the noren.
- **Year** (Mincho 400, 2.6rem, 1, -0.02em, tabular): the year, the one large number on plaster.
- **Headline** (Mincho 400, 1.5rem, 1.2): tab headings, the chosen house name. The house-choice title is 2.4rem.
- **Title** (Mincho 400, 1.15rem, 1.2): trade names, renown, chronicle entry titles, sub-headings. Items use 1.05rem.
- **Sign character** (Mincho 700, 2.1rem on the 64px tile; 1.25rem on the 44px item tag): the only 700 in the system, in gilt on wood.
- **Reading** (Mincho 400, 1rem, 1.7, max 62ch): chronicle stories and the pick-screen lede.
- **Figure** (Gothic 500, 1.5rem, 1.1, tabular lining): money. Smaller figures are Gothic 500 at .84 to .9rem.
- **Body** (Gothic 400, 15px, 1.55): descriptions.
- **Label** (Gothic 500, .9rem): buttons, buy plates, switch segments.
- **Caption** (Gothic, .72 to .84rem): meta lines, rates, level plates, tab labels, credits.

### Named Rules
**The Gilt Only Rule.** Weight 700 is for sign characters on wood. Names, years and headings stay at 400.

**The Figures Are Gothic Rule.** Money, levels, costs and rates use the Gothic with tabular lining numerals so columns do not jitter while counting.

## Layout

One centred column, max 560px, full height (100dvh): a shop front on top (curtain, year and wealth line, age band, next-trade line), a scrolling panel, and the wood tab sill at the bottom. At 600px and wider the column sits on a slightly darker surround (#e4e2de) with a hairline ring and a soft far shadow; the layout is otherwise unchanged. Panel gutter 18px; stacked boards 8 to 10px apart; internal padding 12 to 16px; gaps run 4, 6, 8, 12, 18. The house-choice screen is a full-viewport plaster sheet with an auto-fill grid of curtain cards (min 150px) and a sticky chosen-house card at the bottom. Safe-area insets are honoured (roof grey on top, the sill's padding at the bottom). Touch targets are 40px or more, except small caption text; motion respects `prefers-reduced-motion`.

## Elevation & Depth

Hybrid: tone does most of the work; wood and slips hang with soft shadows over the plaster.

### Shadow Vocabulary
- **Hang** (`0 1px 2px rgba(44,32,25,.18), 0 10px 20px -10px rgba(44,32,25,.45)`): signboards, items, renown board, chosen-house card, selected house card.
- **Slip** (`0 1px 2px rgba(44,32,25,.1), 0 6px 16px -10px rgba(44,32,25,.3)`): away report and present-day slips; treasure cards use the first layer only.
- **Toast** (`0 10px 24px -8px rgba(44,32,25,.5)`): the transient toast.
- **Column ring** (`0 0 0 1px hairline, 0 20px 60px -30px rgba(44,32,25,.35)`): the column on wide screens.

### Named Rules
**The Hanging Rule.** Shadows are soft, blurred and warm brown, and fall below what hangs. Never a hard offset, never a coloured glow.

## Shapes

Small, quiet radii: 4px for tiles, plates, bars and chips; 6px for boards, slips, buttons and the switch's segments; 8px for the switch track; 2px top corners over 6px bottom corners on curtain cards; a pill only for count dots; circles for crest discs. No outlines on controls: shape comes from fill. The only lines are solid 1px hairlines (between chronicle entries, under the shop front) and 1px inset gilt rings at 30 to 40% opacity around tiles and level plates on wood. Curtains are a wood rod (an 8px solid top border; 6px on cards), a hem, and 3px plaster slits; crests are clipped to a circle.

## Components

### Signboard (trade)
On each payout the square pulses and the payout's figure rises off the board in gilt (950ms, then removed); a square waiting for a tap breathes a gold ring outward. Dark wood gradient board, 6px radius, Hang shadow. Left: a 64px deep-wood tile with a gilt Mincho 700 character, tapped to run the trade, with a level plate straddling its bottom edge. Right: name in Mincho 400 (kanji in the softer on-wood), the cycle bar (8px, black-washed track, lit-dye fill moved by transform only), a meta line (manager, payout in gilt) and a buy plate. A tile that is idle and ready turns gold with a wood-dark character. The next locked trade is the **shut board**: a flat pale recess (#e9e6e1, no shadow) with a quieter tile and a line saying when it opens.

### Buy plate and buttons
Plates are filled, never outlined. On wood, the resting plate is a black wash with soft on-wood text; when affordable it becomes gold with wood text, a lighter gold on hover and a 98% press. On plaster, the plain button is the plate tone (6px radius, 42px tall) that darkens on hover; go buttons are gold. Disabled buttons keep their fill and drop to soft ink. Focus is a 2px wood outline at 2px offset, gilt on wood and on the sill.

### Shop row and buy-mode plate
The Shop opens on a sticky row: a recessed segmented switch for Trades / Upgrades / Managers (the selected one in wood, gold count dots for what can be bought) and one recessed plate that cycles Buy ×1, ×10, ×100, Max. Sticky at the top of the trades list, on a plaster band that fades into the boards scrolling under it. A recessed track (8px radius, 3px padding) holding ×1, ×10, ×100 and Max; the pressed segment is wood with on-wood text.

### Item (upgrade, manager)
A smaller signboard: a 44px gilt tag, name, one-line description, and a price button or a gilt "hired" check at the right (min 92px).

### Slips and treasures
White paper slips (6px radius, Slip shadow) for the away report (32px close target) and the present-day note; treasure cards are white with Mincho names.

### Renown board
A wood board in the signboard style with a gilt figure; its action is a gold go button when the gain is worth taking, otherwise a black-wash plate.

### Tab sill
A wood bar at the bottom, five equal tabs each with a Mincho kanji (1.3rem) over a small Gothic label; the current tab is gilt with a 2px gilt bar at its top edge. Count dots are gold pills with wood numerals.

### Curtain (house header and house cards)
The shop front, top down: a tiled roof edge (58px: courses of ridge and trough tiles from `art/roof.svg` running up behind the status bar and darkening toward the top, then the eave of dull grey fired-clay tiles: round tile ends with a three-comma tomoe in relief over scalloped trough lips, one repeating bay in `art/eave.svg`), a 12px wooden lintel with grain, then the noren hung below it: three separate cotton panels in the house dye (126px tall, side panels flexible, middle 74px, 4px gaps showing the dim shop inside), each with a darker sewn sleeve at the top, a hem line, soft vertical fold shading and a faint weave; the weave sits under the crest and lettering, which are undyed white. One crest is dyed across all three panels, sized per crest from how much of its square the drawing fills (`CREST_FILL` in ui.js) so the drawing always runs 14px past each slit and clears the sleeve and hem. The clan's kanji are brushed down the left panel and the era year down the right in Yuji Syuku (the `Brush` face, a small subset of only clan names and era years). The panels cast a soft shadow on the plaster below. Tapping the curtain sets the panels swaying one after another (rotate from the top, 1.1s), then opens the House tab. On its own, a breeze stirs the panels for about two seconds in every eleven, and the season drifts across the shop front by the real month (cherry petals in spring, green leaves in summer, maple leaves in autumn, snow in winter; seven pieces, fading out at the hem; hidden under reduced motion). It is the button that opens the House tab. House cards on the choice screen repeat it small in the same cloth (weave, folds, darker sleeve): wood top border, two slits at the hem showing the dim shop, a 52px crest; the selected card lifts 3px with a plaster-and-wood double ring. The chosen-house card wears a 72px mini curtain across the top of a wood board.

### Renown plate
A small recessed plate (名声 Renown n · +gain) to the right of the next-trade line under the age band; gold when beginning again pays (gain at least ten and at least the current renown). It opens the House. The curtain itself is decoration: a touch only sways it.

### Name board (hengaku)
Each room other than the Shop opens under a name board: dark wood, brushed gilt kanji (Yuji Syuku, 1.6rem) and the English name in Zen Gothic 500 beside it.

### Guest scroll
A hanging scroll 78×120px: brocade in the house dye with the cloth weave, a wooden roller on top and a darker one below, the portrait set in it (object-fit cover, sepia .28, saturation .75) or, without a portrait, the name brushed vertically on paper. The next guest to come shows as a rolled scroll. Welcoming unrolls the scroll from the top (clip-path, 900ms). Bond shows as five small dots, gold when filled.

### Tea mat
The tea ceremony sits on a tatami mat: woven straw (#cec38b to #c5b97f with a 3px weave) between two dark cloth borders (heri, 7px). A drawn tea bowl steams (three wisps, 2.6s) only while tea is served.

### Journey road and station signs
Each clerk on the road is a paper slip with two ends: the house's home province on the left in grey, and the destination on the right in ink. Between them runs a dotted road (hair-2 dots every 8px). The travelled part is a 2px line in the house dye with a 10px dye dot at its head, ringed in paper. It moves only by transform. Below the road it reads "On the road to Edo: back in 1 h 20 min", or, once home, "Home from Edo" with a gold Unload plate. The roads below are rows on the plaster, not boards. Each row has a 44px station sign in the house dye with a white Mincho 700 glyph (京, 東, 北…), the road's name, its hours and pay, and its three goods as small chips ("?" until found). The Send plate is gold while a clerk is free.

### Crossroads notice
A paper slip (white, the hang shadow) under a 6px band of the house dye, at the top of the trades. It has the year and "A crossroads 岐路" in small grey, the title in Mincho 1.35rem with its Japanese name brushed in the dye, and the situation in Mincho 1rem. The two ways are plain filled plates (#ece8e1), each with its name in Gothic 500 and its effect in grey. A way never taken carries a small chip in the dye ("New path · +1% for good"), not gold, since it is a reward rather than a price. Choosing it stamps a vermilion seal (決, #b8322a) onto that plate (380ms, a slight overshoot), the plate tints, and the notice gives way to the next one after 750ms. With Reduce Motion the choice is immediate.

### Age band
Five thin tracks (6px, 4px radius) over hairline, filling left to right with the house dye as the year advances, Mincho kanji age names below in soft ink (darker for past and current), and a 2px wood tick at the next trade's position.

### Chronicle entry
Year in Mincho at the left, a 38px crest disc (crest on a darkened dye, or the place's first kanji on a hairline disc), a Mincho 400 title, a place line, and a story in Mincho 1rem. Unread entries carry a gold read button. Rows divide by solid hairlines.

## Do's and Don'ts

### Do:
- Give each room one material of its own inside the shop-front world (scrolls for guests, tatami for tea, signboards for trades), and keep gold for what can be done now.
- **Do** read the dye from `--dye` and `--dye-lit`; give any new dyed surface those variables.
- **Do** reserve gold for what is actionable now; use the black wash or the plate tone for everything else.
- **Do** put gilt letters and figures on wood only; put sumi and soft ink on plaster only.
- **Do** build new controls as filled plates or recessed tracks with radius 4 or 6.
- **Do** use Mincho 400 for names and years, Mincho 700 only for sign characters, Gothic 500 with tabular numerals for figures.
- **Do** use the Hang shadow for anything on wood and the Slip shadow for paper.
- **Do** keep bars on the compositor: scale a filled layer with `transform`, never animate width.

### Don't:
- **Don't** outline a control; shape comes from fill.
- **Don't** use dashed lines; hairlines are solid.
- **Don't** add a second saturated hue beside the house dye, or gold on a decorative element.
- **Don't** set white on a dye that has not been deepened to 4.5:1.
- **Don't** use hard offset or coloured glow shadows.
- **Don't** set names, years or headings in weight 700.
- **Don't** show the crest on bare plaster; it belongs on a dye.
