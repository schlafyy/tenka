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

One centred column, max 560px, full height (100dvh), laid out after the user's reference idle game (2026-11-13): the **top bar** on every room (money, rate, year, three chips), a scrolling panel, and a **floating tab bar** over its foot. Only the Shop shows the shop front (roof, curtain, the street, age band, next-trade line) at the head of its panel; every other room opens with its own full-width hero (the alcove, the road scroll, the tea mat, the chronicle's head, the house register), then cards. A room's explanation is folded behind a small "?" (How it works), not printed. The panel's foot pads 100px plus the safe area so the last card clears the tab bar. At 600px and wider the column sits on a slightly darker surround (#e4e2de) with a hairline ring and a soft far shadow; the layout is otherwise unchanged. Panel gutter 18px; stacked boards 8 to 10px apart; internal padding 12 to 16px; gaps run 4, 6, 8, 12, 18. The house-choice screen is a full-viewport plaster sheet with an auto-fill grid of curtain cards (min 150px) and a sticky chosen-house card at the bottom. Safe-area insets are honoured (roof grey on top, the sill's padding at the bottom). Touch targets are 40px or more, except small caption text; motion respects `prefers-reduced-motion`.

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
On each payout the square pulses and the payout's figure rises off the board in gilt (950ms, then removed); a square waiting for a tap breathes a gold ring outward. A wood card (14px radius, a 2px dark under-edge) in three columns: a 60px deep-wood tile with a gilt Mincho 700 character, tapped to run the trade, with a level plate straddling its bottom edge; the name in Mincho 700, a 22px bar (dark track, lit-dye fill moved by transform only) with the payout and the cycle time written on it, and one meta line (manager, next milestone); then one big buy plate (78×60px, "Buy ×n" over the price), gold when affordable. A tile that is idle and ready turns gold with a wood-dark character. The next locked trade is the **shut board**: a flat pale recess (#e9e6e1, no shadow) with a quieter tile and a line saying when it opens.

### Buy plate and buttons
Plates are filled, never outlined. On wood, the resting plate is a black wash with soft on-wood text; when affordable it becomes gold with wood text, a lighter gold on hover and a 98% press. On plaster, the plain button is the plate tone (6px radius, 42px tall) that darkens on hover; go buttons are gold. Disabled buttons keep their fill and drop to soft ink. Focus is a 2px wood outline at 2px offset, gilt on wood and on the sill.

### Shop row and buy-mode plate
Under the shop front: a full-width segmented switch for Trades / Upgrades / Managers (12px track, the selected segment in deep wood, gold count pills for what can be bought), sticky as the list scrolls. On Trades, after the crossroads card, a BUY row of four plates (×1, ×10, ×100, Max); the chosen one is gold.

### Item (upgrade, manager)
A smaller signboard: a 44px gilt tag, name, one-line description, and a price button or a gilt "hired" check at the right (min 92px).

### Slips and treasures
White paper slips (6px radius, Slip shadow) for the away report (32px close target) and the present-day note; treasure cards are white with Mincho names.

### Renown board
A wood board in the signboard style with a gilt figure; its action is a gold go button when the gain is worth taking, otherwise a black-wash plate.

### Top bar
Deep wood with a faint grain, on every room, running up behind the status bar. A gold coin (石, or 円 in the yen ages), the money in gilt Mincho 700 (1.7rem) over "koku · +rate a second", and the year with its era at the right. Below, three chips (wood, 10px radius, a faint gilt ring, 44px tall): 名 Renown (and the renown waiting), 茶 tea (served and time left / kettle on / ready / shut), 旅 clerks (out and back in / home / free). A chip turns gold when it has something to do now; each opens its room, renown straight to its card in the House.

### Tab bar
Floating over the panel's foot: a deep-wood bar (22px radius, a soft shadow and a faint gilt ring), 10px from the sides and bottom, six equal tabs each with a Mincho kanji (1.3rem) over a small label in gilt; the current tab sits on a gold plate (16px radius) in wood. Count dots are vermilion pills (#b8322a) with white numerals, ringed in the bar's wood.

### Curtain (house header and house cards)
The shop front, only at the head of the Shop, top down: a tiled roof edge (56px: courses of ridge and trough tiles from `art/roof.svg`, then the eave of dull grey fired-clay tiles: round tile ends with a three-comma tomoe in relief over scalloped trough lips, one repeating bay in `art/eave.svg`), a 12px wooden lintel with grain, then the noren hung below it: three separate cotton panels in the house dye (126px tall, side panels flexible, middle 74px, 4px gaps showing the dim shop inside), each with a darker sewn sleeve at the top, a hem line, soft vertical fold shading and a faint weave; the weave sits under the crest and lettering, which are undyed white. One crest is dyed across all three panels, sized per crest from how much of its square the drawing fills (`CREST_FILL` in ui.js) so the drawing always runs 14px past each slit and clears the sleeve and hem. The clan's kanji are brushed down the left panel and the era year down the right in Yuji Syuku (the `Brush` face, a small subset of only clan names and era years). The panels cast a soft shadow on the plaster below. Tapping the curtain sets the panels swaying one after another (rotate from the top, 1.1s), then opens the House tab. On its own, a breeze stirs the panels for about two seconds in every eleven, and the season drifts across the shop front by the real month (cherry petals in spring, green leaves in summer, maple leaves in autumn, snow in winter; seven pieces, fading out at the hem; hidden under reduced motion). It is the button that opens the House tab. House cards on the choice screen repeat it small in the same cloth (weave, folds, darker sleeve): wood top border, two slits at the hem showing the dim shop, a 52px crest; the selected card lifts 3px with a plaster-and-wood double ring. The chosen-house card wears a 72px mini curtain across the top of a wood board.

The curtain itself is decoration: a touch only sways it.

### Guest alcove and scrolls
The Guests room opens on a tokonoma: a wood post at the left, a 14px lintel, a plastered wall (warm radial #f1ebdf to #e2d9c8) and a tatami strip below. On the wall hangs the guest at the door (or the next to come, greyed, or the last to join) as a 100×150 scroll, beside a kicker (VISITING NOW / COMES IN 1600 / WITH THE HOUSE), the name in Mincho 700, the Japanese name, role and life, two to three lines of their story, their gift on a pale chip, bond dots and the gold Welcome plate. Below, "With the house" with a count pill (met of 25) and a three-column gallery of small scrolls (62×92) on white cards, each with name, gift and bond; then the next guest as a shadowed portrait ("Comes in 1600") and one or two still-rolled scrolls marked with their age. A hanging scroll is brocade in the house dye with the cloth weave, a wooden roller on top and a darker one below, the portrait set in it (object-fit cover, sepia .28, saturation .75) or, without a portrait, the name brushed vertically on paper. Welcoming unrolls the scroll from the top (clip-path, 900ms). Bond shows as five small dots, gold when filled.

### Tea mat
The Tea room opens on a full-width tatami mat: woven straw (#cec38b to #c5b97f with a 3px weave) between two dark cloth borders (heri, 10px), a 112px drawn tea bowl that steams (three wisps) only while tea is served, the state and one gold Serve plate. Today's three tasks follow as white cards.

### Chronicle head and house register
The Chronicle opens on the head of a hand scroll: a wood roller, paper with a faint grain, 年代記 brushed vertically, the house's chronicle title, chapters read and new, and a gold Read all plate. The House opens on its register cover: the house dye with the cloth weave, the crest large in white, name, home, motto and its bonus, the head of the house, and everything together on a dark chip.

### The street
The street runs before the shop, under the curtain: a 50px packed-earth strip (#e3dacb to #d8cdba, a darker curb line) with the walkers' layer (120px) over the strip and the curtain's lower half, so passers-by cross in front of the noren. A guest at the door or a clerk home shows as a white paper tag with a dye chevron at the right of the strip; it opens their room. People are kage-e silhouettes 50px high, built from curved parts: legs that swing ±21° from the hip, kimono sleeves or coat arms that swing ±18° against them, and a soft shadow at the feet. Each figure has a stride, and street.js sets the step time (--step) from stride ÷ speed so the feet don't slide. Wheels turn. The front lane is in wood-deep. The back lane is scaled to .66 and coloured #8d7f70, for distance. Walkers bob 1.2px once a step; vehicles don't bob. At most five are on screen, and they spawn only while the street is in view. The house's own people carry a small paper name tag. With Reduce Motion, three people of the age stand still.

### Road scroll and roads
The Journeys room opens on a road scroll (dōchūzu) on paper (#f3ecdd to #e6dcc8, a faint grain) with a 6px wood edge below: two pale mountain ridges, two mist bands, a bay at the lower left, a few ink hills, and a dotted road winding from the home station at the right (a 30px sign in the house dye with the province's first kanji, its name below) to the left. Each open road has its station along the way, further for longer roads (1, 2, 4, 8 hours at .24, .44, .67, .9 of the road); a second road of the same length hangs above the road on a dotted spur, a third below. Station signs are deep wood with a gilt glyph and the destination below. A clerk on the road is a dye dot ringed in paper, with the travelled road drawn solid in the dye behind it. A white note at the top left says where the clerk is. Below: one card for famous goods found (count, a dye meter, "+1% to everything for each, for good"), then the roads as white cards: a 52px station sign in the dye, the road's name, its hours and pay or "On the road · back in…" with a dye meter or "Home from…", its three goods as chips (deep wood with the gilt Japanese name once found, "?" until), and one plate: Send (gold while a clerk is free), Away, or a gold Unload.

### Crossroads card
Folded, one white card (12px radius) between the shop switch and the BUY row: a round dye seal with 決, a kicker (CROSSROADS · year), the title in Mincho 700 and "Two ways for the house. Choose one.", with a chevron. Open, the situation in Mincho 1rem follows. The two ways are plain filled plates (#ece8e1), each with its name in Gothic 500 and its effect in grey. A way never taken carries a small chip in the dye ("New path · +1% for good"), not gold, since it is a reward rather than a price. Choosing it stamps a vermilion seal (決, #b8322a) onto that plate (380ms, a slight overshoot), the plate tints, and the notice gives way to the next one after 750ms. With Reduce Motion the choice is immediate.

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
