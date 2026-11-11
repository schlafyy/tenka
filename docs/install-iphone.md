# Installing Tenka on an iPhone (the app, not the web page)

The iOS app is the same game wrapped as a real app. It has no status bar and no browser blur at the top, and it keeps its own save. Each change to the game builds a new `Tenka.ipa` on GitHub. You install it from a Windows PC with **Sideloadly** and a free Apple ID.

Status on 2026-11-10: the first `Tenka.ipa` is built and saved on the Desktop (`C:\Users\ok3yd\Desktop\Tenka.ipa`). It isn't installed on the phone yet.

## 1. Get the latest Tenka.ipa

The copy on the Desktop works. For a newer build, either ask Claude to fetch the latest one, or run:

```
gh run download -R schlafyy/tenka -n Tenka-ipa -D C:\Users\ok3yd\Desktop
```

(That takes the newest successful run of the "iOS app" workflow. Delete the old `Tenka.ipa` first, or it won't be overwritten.)

You can also get it from the browser: https://github.com/schlafyy/tenka/actions → "iOS app" → the newest green run → Artifacts → **Tenka-ipa** (a zip with the .ipa inside). Builds are kept for 30 days.

## 2. Install it with Sideloadly (first time: about 5 minutes)

1. Download **Sideloadly** from https://sideloadly.io and install it. If it asks for iTunes or iCloud for Windows, install the versions it links to: the ones from Apple's website, not the Microsoft Store.
2. Plug the iPhone into the PC with a cable and unlock it. If the phone asks "Trust this computer?", tap **Trust**.
3. Open Sideloadly and drag `Tenka.ipa` into the window. Type your **Apple ID** email, then click **Start**. Sign in with the Apple ID password, and a 2-factor code if one is asked. A spare Apple ID works too.
4. On the iPhone, go to **Settings → General → VPN & Device Management**, tap your Apple ID and choose **Trust**.
5. Open Tenka. If iOS says Developer Mode is needed, go to **Settings → Privacy & Security → Developer Mode**, turn it on, let the phone restart, and confirm.

## 3. Carry your game over (optional)

The app's save is separate from the home-screen web version's:
1. In the web version, open the **House** room and tap **Copy save**.
2. In the app, open the **House** room, tap **Load a save** and paste.

## 4. Every 7 days

With a free Apple ID, the app stops opening after 7 days. To fix it, plug the phone in and repeat step 2.3 with the same `Tenka.ipa`, or a newer one. The save stays.

A paid Apple Developer account (99 USD a year) removes this limit. It's also the way to publish: the build then gets signed and sent to TestFlight, and later to the App Store. See `docs/ios-readiness.md`.

## What to check once it runs

- The roof runs right to the top of the screen, with no clock and no blur.
- The game plays as on the web: trades, guests, journeys, the street at the bottom.
- Close and reopen the app: the save is still there.

## For Claude: how the app is built

- `ios/` holds the Capacitor 8 project.
  - `Info.plist`: the status bar is hidden, portrait only, no encryption.
  - `tools/icon.py` writes the 1024 icon and the launch screen.
- `npm run ios` copies the game into `www/` (`tools/www.js`) and syncs it into the app. Add any new game file to the FILES list in `tools/www.js`.
- `.github/workflows/ios.yml` builds an unsigned `Tenka.ipa` on **macos-15-intel**, because the arm64 pool ran out of machines twice. It runs on every push that touches game files, or by hand from the Actions tab.
- Inside the app, `ui.js` also writes the save to `@capacitor/preferences` and reads it back from there if the web view's copy is gone.
- `gh` has the `workflow` scope, so workflow changes can be pushed.
