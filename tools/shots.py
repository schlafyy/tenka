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

def shot(pg, name):
    pg.wait_for_timeout(400)
    pg.screenshot(path=os.path.join(OUT, name + ".png"))

def dismiss(pg):
    for _ in range(12):
        b = pg.locator("#modal:not([hidden]) .choice, #modal:not([hidden]) [data-m='ok']")
        if not b.count():
            return
        b.first.click()
        pg.wait_for_timeout(150)

with sync_playwright() as p:
    br = p.chromium.launch(channel="chrome")
    for name, vp, mobile in [("phone", {"width": 390, "height": 844}, True), ("desk", {"width": 1440, "height": 900}, False)]:
        ctx = br.new_context(viewport=vp, device_scale_factor=2 if mobile else 1, is_mobile=mobile, has_touch=mobile)
        pg = ctx.new_page()
        pg.on("pageerror", lambda e: errors.append(f"{name}: {e}"))
        pg.on("console", lambda m: m.type == "error" and errors.append(f"{name} console: {m.text}"))
        pg.goto(URL)
        pg.wait_for_selector("#modal:not([hidden])")
        shot(pg, f"{name}-1-welcome")
        pg.click("#modal [data-m='oda']")
        pg.wait_for_timeout(300)
        shot(pg, f"{name}-2-onin")
        dismiss(pg)
        shot(pg, f"{name}-3-start")
        # tap Mikawa through the page's own selection, then march
        pg.evaluate("document.querySelector('.prov[data-p=mikawa]').dispatchEvent(new MouseEvent('click', {bubbles: true}))")
        pg.wait_for_timeout(300)
        shot(pg, f"{name}-4-mikawa")
        pg.click("#panel [data-act='march']", timeout=5000)
        pg.evaluate("tenka.G.tick(tenka.S, 60); tenka.refresh()")
        shot(pg, f"{name}-5-campaign")
        # a few years on: wars won, retainers, reforms, tea, house
        pg.evaluate("""() => { const S = tenka.S, G = tenka.G; for (let i = 0; i < 400; i++) { G.tick(S, 10);
            for (const l of G.freeLeaders(S)) { const t = G.PIDS.find(p => !G.targetable(S, p) && G.plan(S, p, 0, l).need <= S.troops); if (t) G.march(S, t, G.plan(S, t, 0, l).need, l); } }
            S.kan += 20000; S.koku += 3e5; G.findMeibutsu(S, ['tsukumo']); tenka.refresh(); }""")
        dismiss(pg)
        shot(pg, f"{name}-6-later")
        for t in ["reforms", "retainers", "tea", "house"]:
            dismiss(pg)
            pg.click(f"#tabs [data-tab='{t}']")
            shot(pg, f"{name}-7-{t}")
        dismiss(pg)
        pg.click("#panel [data-act='retire']")
        shot(pg, f"{name}-8-retire")
        pg.click("#modal [data-m='takeda']")
        dismiss(pg)
        shot(pg, f"{name}-9-run2")
        # reload: the save comes back
        pg.reload()
        pg.wait_for_timeout(500)
        clan = pg.evaluate("tenka.S && tenka.S.clan")
        assert clan == "takeda", clan
        ctx.close()
    br.close()
srv.shutdown()
print("\n".join(errors) or "no page errors")
sys.exit(1 if errors else 0)
