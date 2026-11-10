"""Renders icon.png (256 px), icon-512.png and icon-180.png: the shop front in small, as in the game's banner:
a tiled eave with tomoe tile ends, a wooden lintel, and a madder-red curtain of three panels with 天 brushed across its slits.
Built from the game's own drawings (art/roof.svg, art/eave.svg) and brush font. Run: python tools/icon.py"""
import os, pathlib
from playwright.sync_api import sync_playwright
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
PAGE = """<!doctype html><meta charset="utf-8"><style>
@font-face { font-family: Brush; src: url(fonts/brush-400.woff2); }
html, body { margin: 0; background: transparent; }
#i { position: relative; width: 256px; height: 256px; overflow: hidden; background: #1a130f; }
#i.round { border-radius: 52px; }
.roof { position: absolute; left: 0; right: 0; top: 0; height: 36px;
  background: url(art/eave.svg) -6px 100% / 31px 36px repeat-x, #34363a; }
.beam { position: absolute; left: 0; right: 0; top: 36px; height: 10px; background: linear-gradient(#4a372b, #3b2b21); box-shadow: 0 3px 5px rgba(0,0,0,.45); z-index: 1; }
.cloth { position: absolute; left: 8px; right: 8px; top: 46px; bottom: 26px; border-bottom: 5px solid rgba(0,0,0,.28); background:
  repeating-linear-gradient(0deg, rgba(0,0,0,.05) 0 1px, transparent 1px 3px),
  linear-gradient(90deg, rgba(0,0,0,.16), transparent 14%, rgba(255,255,255,.05) 50%, transparent 80%, rgba(0,0,0,.18)), #8a2234;
  box-shadow: inset 0 18px 0 rgba(0,0,0,.16); }
.ten { position: absolute; left: 0; right: 0; top: 62px; text-align: center; font: 158px/1 Brush; color: #fff; }
.slit { position: absolute; top: 64px; bottom: 26px; width: 6px; background: #1a130f; }
</style><div id="i"><div class="roof"></div><div class="beam"></div><div class="cloth"></div><div class="ten">天</div>
<div class="slit" style="left:34px"></div><div class="slit" style="left:216px"></div></div>"""

tmp = pathlib.Path(ROOT, "_icon.html")  # beside the game, so the page can load its drawings and font
tmp.write_text(PAGE, encoding="utf8")
try:
    with sync_playwright() as p:
        b = p.chromium.launch(channel="chrome")
        # the favicon rounds its own corners; the home-screen icons are full-bleed (the phone rounds them)
        for scale, out, rnd in [(1, "icon.png", True), (2, "icon-512.png", False)]:
            pg = b.new_page(viewport={"width": 256, "height": 256}, device_scale_factor=scale)
            pg.goto(tmp.as_uri()); pg.wait_for_timeout(400)
            if rnd: pg.evaluate("document.getElementById('i').classList.add('round')")
            pg.locator("#i").screenshot(path=os.path.join(ROOT, out), omit_background=True)
        b.close()
finally:
    tmp.unlink()
Image.open(os.path.join(ROOT, "icon-512.png")).convert("RGB").resize((180, 180), Image.LANCZOS).save(os.path.join(ROOT, "icon-180.png"))
print("icon.png, icon-512.png, icon-180.png")
