# iPhone readiness

Reviewed on 2026-11-10 with the apple-skills release review and Apple's interface guidelines, applied to what fits a web game. There are two stages: the game as a Home Screen web app now, and later as an App Store app (the same files wrapped with Capacitor).

## Fixed in this review

- **Credits for the crests.** 24 of the 34 crests are Creative Commons (CC BY or CC BY-SA), which require each author and licence to be named. The House room now lists every crest with its author, licence and Commons link, beside the portrait credits.
- **Keeping the save.** Safari can clear a site's storage after a week without a visit, and the Home Screen app keeps a save separate from Safari's. The game now asks the browser to keep its storage (`navigator.storage.persist()`). In a browser tab, the House room explains how to move the save to the Home Screen with Copy save and Load a save.
- **Taps.** Game controls no longer select text, zoom on a double tap or open the long-press menu. The small plates (the shop switch, the Buy plate, the Renown plate, the ✕ on the away note) now have tap areas of at least 44pt.
- **Manifest.** `id` added, and `theme_color` now matches the roof colour the page uses.
- Fixed earlier tonight (commit 16b9718): layout at 320pt and with larger text, Reduce Motion, VoiceOver labels, offline pictures, and checks on a pasted save.

## Still open: the Home Screen app

| Priority | What | Why it matters |
|---|---|---|
| Medium | No notifications ("tea is ready", "the house has hit the 24-hour cap") | Idle games live on gentle reminders. A Home Screen web app can only send them through Web Push, which needs a server. A native wrapper can schedule them on the phone. |
| Low | No launch image (`apple-touch-startup-image`) | iOS shows a blank screen for a moment while the game opens. |
| Low | No haptics | The web on iPhone has no vibration API. Capacitor's Haptics plugin can add a tick when a cycle pays and a firmer one for a new age. |

## Before the App Store (Capacitor)

**Needed**
1. **A Mac step for building.** Xcode only runs on macOS. Without a Mac, a cloud build works: GitHub Actions macOS runners or a service such as Codemagic can build and sign the app. The Apple Developer Program costs 99 USD a year and is needed for TestFlight and the App Store.
2. **Bundle the files in the app; don't load the website.** Apple rejects apps that only show a website (guideline 4.2, minimum functionality). The game is already fully offline, so Capacitor can ship `index.html`, the scripts, fonts, crests and portraits inside the app.
3. **Move the save to native storage.** A WebView's localStorage can be cleared by iOS. Keep `tenka-save-3` in `@capacitor/preferences` (or a file) and leave localStorage as the web fallback. The save is one JSON string, so this is a small change in `save()` and `load()` in ui.js.
4. **Privacy.** The game collects nothing, so the privacy label is "Data Not Collected". A privacy policy URL is still required: a short page on GitHub Pages is enough. Capacitor ships its own privacy manifest. Recheck it if plugins are added.
5. **Icons.** The App Store needs a 1024×1024 icon without transparency. `tools/icon.py` renders 512, so add a 1024 output; the drawing scales.
6. **Export compliance.** Set `ITSAppUsesNonExemptEncryption` to NO, since the game uses no encryption beyond the system's.

**Check before submitting**
- **Images that need attribution.** CC BY-SA crests are recoloured in the game. Attribution is in place. ShareAlike applies to the crest images themselves, not to the game. Keep the credits list reachable in the app.
- **Real people and brands.** Every guest has died, which is safer for publicity rights. Some guest texts name companies (department stores, car and electronics makers, Nintendo). That is fine as history inside the game, but keep brand names and logos out of the store listing and screenshots, which Apple checks against guideline 5.2 (intellectual property).
- **Age rating.** The history mentions wars without showing violence. The questionnaire will most likely give 4+ or 9+.
- **Dialogs.** Begin again, Start over and Load a save use the browser's `confirm` and `prompt`. Capacitor's WebView supports them. In-game sheets would look more native, but they aren't required.

## What's already in good shape

- Works fully offline, and the save stays on the phone. No accounts, tracking, ads or network calls.
- Safe areas, a status bar over the roof, portrait orientation, and no page bounce.
- VoiceOver headings and labels, Reduce Motion, and layout from 320pt with larger text.
- Smooth on a 4× slowed CPU (`tools/perf.py`). Bars animate only on the compositor.
