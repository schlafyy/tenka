# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The owner, playing on an iPhone (installed from Safari to the home screen) and sometimes on a Windows PC. They're interested in Japanese history and built the Sengoku map this game draws on. They play an idle game in short check-ins, a few times a day, and found the first version (a war game) hard to get into and too crowded.

## Product Purpose

An idle game about one Japanese house across 550 years, from 1467 to the present. You pick a house and its crest. It begins as a samurai family in the Ōnin War, becomes a daimyō house, then Meiji industrialists, then a modern company, under the same crest. Success: a newcomer understands what to do within a minute, each check-in has a few satisfying taps and something new to read, and over about two weeks the player watches Japan's history pass around their house.

## Positioning

History is the progression. The year moves forward only as the house prospers, so the player can never lose, only be slow. Each age brings new family trades, and real events arrive as short chapters with the real clans' names and crests. Most idle games put a theme on a counter; here the counter moves a real timeline and a real map.

## Operating Context

- Short sessions: open, see what happened while away, make a few taps, read a chapter, close.
- Time away counts toward progress, and a report on return says what happened.
- Long run: about two weeks from 1467 to the present (confirmed by the user). Reaching the present lets a new house begin in 1467, keeping heirlooms that speed it up.

## Capabilities and Constraints

- 2026-11-10 (afternoon): the user had not yet met a crossroads. Asked for "more to do in the game", they chose **Trade journeys** (clerks on real trade roads, back after hours with money and famous goods) over House records and Seasonal festivals, which are kept as ideas for later.
- 2026-11-10 (overnight, Claude's own choice, which the user invited: "a new mechanic... anything that would give the game an edge"): crossroads, real turning points where the house picks one of two merchant's ways for the run, with every way ever taken adding 1% for good. These are commercial decisions only, never sides in a war. Awaiting the user's verdict.
- 2026-11-10: the user asked to go the way of Blade Idle, with more rooms and more things to do, and historical characters. They chose: rooms of the house (Shop, Guests, Tea room, Chronicle, House), real historical figures as collectible guests who visit in their own years and boost trades, and no fighting. Living people are left out; portraits only when public domain or Creative Commons, credited in the game.
- Answers confirmed with the user on 2026-11-09: one house through the ages; time grows with the house; war appears only in the story and on the map, never as a mechanic; a run lasts about two weeks.
- The map is the 68 old provinces (令制国), reused from the Sengoku map project, with the real clans holding them year by year (data to 1945, then the modern state).
- The history text comes from the Sengoku map's events (1467–1945, written for that project from standard accounts). Post-war chapters are written for this game.
- War history after 1931 is told plainly and without glory. No militarist imagery (for example, the Rising Sun flag) appears anywhere.
- Offline after the first load; the save stays on the device (localStorage), with copy/load save to move it between devices.
- Hosted on GitHub Pages at https://schlafyy.github.io/tenka/; plain HTML/CSS/JS with no build step.
- "Tenka 天下" is a working title.

## Brand Commitments

- The look is a merchant house's front (chosen 2026-11-09, replacing the Indigo Cloth world the user found rough): the house curtain in the clan's dye, white plaster, dark wood signboards with gilt letters. Light, refined, never a generic mobile game, never plain, never dark.
- Each clan keeps its natural dye colour from the Sengoku map as its identity.
- The clans' real crests (kamon) and names are a favourite part and must stay prominent.
- Names lead in romanized English with the kanji beside them (Oda 織田, Owari 尾張).

## Evidence on Hand

- Province shapes: "Provinces of Japan with names.svg" by Ash_Crow, Wikimedia Commons, CC BY 2.5.
- Clan crests from Wikimedia Commons, each under its own licence (listed in `data/map.js`).
- Province yields are approximate Keichō-era figures; the history is simplified. Nothing may be presented as a sourced dataset.

## Product Principles

1. One screen, one obvious next tap: the player should never wonder what to do.
2. Idle first: everything keeps running without the player, and nothing is lost by being away.
3. The history is the reward: each chapter is short, real, and tied to a place on the map.
4. Glance, then go deeper: a line first, the full story on request.
5. Fewer, bigger numbers: one currency, a few trades per age, no screen of sliders.
