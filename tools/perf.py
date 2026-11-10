# Run: python tools/perf.py. Frame rate and long tasks on the trades tab, at phone size with 4x CPU slowdown (roughly a mid-range phone)
import os, threading, functools, http.server
from playwright.sync_api import sync_playwright
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=ROOT))
threading.Thread(target=srv.serve_forever, daemon=True).start()
URL = f"http://127.0.0.1:{srv.server_address[1]}/index.html"
with sync_playwright() as p:
    br = p.chromium.launch(channel="chrome")
    ctx = br.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=3, is_mobile=True, has_touch=True)
    pg = ctx.new_page(); pg.goto(URL); pg.wait_for_selector("#pick:not([hidden])")
    pg.click("#pick [data-act='begin']")
    pg.evaluate("""() => { const G = tenka.G, S = tenka.S; S.money = 1e60; G.earn(S, G.earnedFor(1990));
      for (const w of WORKS) { G.buy(S, w.id, 100); if (w.id.length % 2) G.hire(S, w.id); } for (const w of WORKS) G.run(S, w.id); S.money = 1e40; tenka.S = S; }""")
    cdp = ctx.new_cdp_session(pg); cdp.send("Emulation.setCPUThrottlingRate", {"rate": 4})
    pg.wait_for_timeout(1000)
    r = pg.evaluate("""() => new Promise(res => { const long = []; new PerformanceObserver(l => l.getEntries().forEach(e => long.push(Math.round(e.duration)))).observe({ type: 'longtask', buffered: false });
      let n = 0, worst = 0, t0 = performance.now(), prev = t0; const f = t => { n++; worst = Math.max(worst, t - prev); prev = t; if (t - t0 < 5000) requestAnimationFrame(f); else res({ fps: Math.round(n / ((t - t0) / 1000)), worstFrame: Math.round(worst), longTasks: long }); }; requestAnimationFrame(f); })""")
    print(r)
    br.close()
srv.shutdown()
