"""Plays the game in headless Chrome (phone and desktop sizes), saves screenshots to the folder given, and fails on
any page error. Run: python tools/shots.py <out folder>"""
import os, sys, threading, functools, http.server
from playwright.sync_api import sync_playwright

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass
srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=ROOT))
threading.Thread(target=srv.serve_forever, daemon=True).start()
URL = f"http://127.0.0.1:{srv.server_address[1]}/index.html"
errors = []
# move the save's clock back, before the page loads, as if the player had been away
AWAY = "const s = localStorage.getItem('tenka-save-3'); if (s && !sessionStorage.away) { const o = JSON.parse(s); o.savedAt -= %d * 1000; localStorage.setItem('tenka-save-3', JSON.stringify(o)); sessionStorage.away = 1; }"
# play forward in the page like a busy player: buy the cheapest things, hire managers, read, reach
FORWARD = """h => { const S = tenka.S, G = tenka.G;
  for (let i = 0; i < h * 12; i++) { for (const w of WORKS) G.run(S, w.id); G.tick(S, 300);
    for (const w of WORKS) if (G.isOpen(S, w.id)) { G.hire(S, w.id); while (G.buy(S, w.id, 1)) {} }
    for (const u of G.upgrades(S)) if (u.open && !u.owned) G.buyUpgrade(S, u.id);
    while (S.unread.length > 3) G.read(S, S.unread[0]);
    while (G.reachPoints(S) > 0 && G.reachable(S).length) G.reach(S, G.bestReach(S)); }
  tenka.S = S; }"""

def shot(pg, name, full=False):
    pg.wait_for_timeout(500)
    pg.screenshot(path=os.path.join(OUT, name + ".png"), full_page=full)

with sync_playwright() as p:
    br = p.chromium.launch(channel="chrome")
    for name, vp, mobile in [("phone", {"width": 390, "height": 844}, True), ("desk", {"width": 1440, "height": 900}, False)]:
        ctx = br.new_context(viewport=vp, device_scale_factor=2 if mobile else 1, is_mobile=mobile, has_touch=mobile)
        watch = lambda pg: (pg.on("pageerror", lambda e: errors.append(f"{name}: {e}")), pg.on("console", lambda m: m.type == "error" and errors.append(f"{name} console: {m.text}")))
        pg = ctx.new_page(); watch(pg)
        pg.goto(URL)
        pg.wait_for_selector("#pick:not([hidden])")
        shot(pg, f"{name}-1-pick")
        pg.click("#pick [data-clan='oda']")
        pg.click("#pick [data-act='begin']")
        pg.wait_for_timeout(500)
        shot(pg, f"{name}-2-start")
        # tap the paddies and buy, by hand, for a while
        for i in range(60):
            pg.click(".tile[data-id='paddies']")
            pg.wait_for_timeout(700)
            b = pg.locator(".trade[data-id='paddies'] .buy.ok")
            if b.count():
                b.click()
        shot(pg, f"{name}-3-tapping")
        pg.click(".modes [data-mode='max']")
        pg.evaluate(FORWARD, 1)
        pg.wait_for_timeout(600)
        shot(pg, f"{name}-4-hour")
        for t in ["upgrades", "managers", "chron", "house"]:
            pg.click(f"#tabs [data-tab='{t}']")
            shot(pg, f"{name}-5-{t}")
        pg.click("#tabs [data-tab='trades']")
        if pg.locator("#reachpill:not([hidden])").count():
            pg.click("#reachpill")
            pg.wait_for_timeout(900)
            shot(pg, f"{name}-6-map")
            pg.locator("#choose [data-act='auto']").click()
            pg.wait_for_timeout(2600)
        # six hours away
        pg.close()
        pg = ctx.new_page(); watch(pg)
        pg.add_init_script(AWAY % (6 * 3600))
        pg.goto(URL)
        pg.wait_for_selector("#panel .away")
        shot(pg, f"{name}-7-back")
        pg.evaluate(FORWARD, 30)
        shot(pg, f"{name}-8-later")
        pg.click("#tabs [data-tab='house']")
        pg.on("dialog", lambda d: d.accept())
        pg.click("[data-act='again']")
        pg.wait_for_selector("#pick:not([hidden])")
        shot(pg, f"{name}-9-again")
        pg.click("#pick [data-clan='shimazu']")
        pg.click("#pick [data-act='begin']")
        pg.wait_for_timeout(600)
        shot(pg, f"{name}-10-new-house")
        ctx.close()
    br.close()
srv.shutdown()
print("\n".join(errors) if errors else "no page errors")
sys.exit(1 if errors else 0)
