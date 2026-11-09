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
AWAY = "const s = localStorage.getItem('tenka-save-2'); if (s && !sessionStorage.away) { const o = JSON.parse(s); o.savedAt -= %d * 1000; localStorage.setItem('tenka-save-2', JSON.stringify(o)); sessionStorage.away = 1; }"
# play forward in the page: hours of time away, the steward investing, everything read and reached
FORWARD = """h => { const S = tenka.S, G = tenka.G; for (let i = 0; i < h; i++) { G.away(S, 3600); G.buyAll(S); while (S.unread.length) G.read(S, S.unread[0]);
  while (G.reachPoints(S) > 0 && G.reachable(S).length) G.reach(S, G.bestReach(S)); } tenka.S = S; }"""

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
        pg.click("#pick [data-clan='takeda']")
        pg.click("#pick [data-clan='oda']")
        pg.click("#pick [data-act='begin']")
        pg.wait_for_timeout(600)
        shot(pg, f"{name}-2-start")
        for _ in range(14):
            pg.click("#nextcard")
            pg.wait_for_timeout(1300)
        shot(pg, f"{name}-3-growing")
        pg.click("#reachpill")
        pg.wait_for_timeout(900)
        shot(pg, f"{name}-4-map-open")
        pg.locator("#choose [data-act='auto']").click()
        pg.wait_for_timeout(700)
        shot(pg, f"{name}-5-soak")
        pg.wait_for_timeout(2500)
        # six hours away
        pg.close()
        pg = ctx.new_page(); watch(pg)
        pg.add_init_script(AWAY % (6 * 3600))
        pg.goto(URL)
        pg.wait_for_selector("#now .away")
        shot(pg, f"{name}-6-back")
        pg.locator("#chron [data-act='read']").first.click()
        pg.wait_for_timeout(300)
        pg.locator("#chron").scroll_into_view_if_needed()
        shot(pg, f"{name}-7-chronicle")
        pg.evaluate(FORWARD, 150)
        pg.evaluate("window.scrollTo(0, 0)")
        shot(pg, f"{name}-8-meiji")
        pg.evaluate(FORWARD, 200)
        pg.evaluate("window.scrollTo(0, 0)")
        shot(pg, f"{name}-9-later")
        pg.evaluate("() => { const S = tenka.S; S.year = S.yearF = 2026; tenka.G.arrive(S); tenka.S = S; }")
        shot(pg, f"{name}-10-present")
        shot(pg, f"{name}-11-full", full=True)
        pg.click("[data-act='newhouse']")
        pg.click("#pick [data-clan='shimazu']")
        pg.click("#pick [data-act='begin']")
        pg.wait_for_timeout(600)
        shot(pg, f"{name}-12-next-house")
        ctx.close()
    br.close()
srv.shutdown()
print("\n".join(errors) if errors else "no page errors")
sys.exit(1 if errors else 0)
