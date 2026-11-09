"""Renders icon.png (256 px), icon-512.png and icon-180.png: indigo cloth, a disc of kasuri stripes in two clan dyes,
a sashiko ring, and the red thread of a cross-stitch, the map's mark for war.
Run: python tools/icon.py"""
import os
from playwright.sync_api import sync_playwright
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
<defs>
  <radialGradient id="g" cx="50%" cy="45%" r="70%"><stop offset="0" stop-color="#2a3170"/><stop offset="1" stop-color="#13152f"/></radialGradient>
  <pattern id="k" patternUnits="userSpaceOnUse" width="40" height="40" patternTransform="rotate(38)">
    <rect width="20" height="40" fill="#c06a2c"/><rect x="20" width="20" height="40" fill="#e2d9c5"/>
  </pattern>
  <clipPath id="c"><rect width="256" height="256" rx="52"/></clipPath>
</defs>
<g clip-path="url(#c)">
  <rect width="256" height="256" fill="url(#g)"/>
  <circle cx="128" cy="128" r="72" fill="url(#k)"/>
  <circle cx="128" cy="128" r="94" fill="none" stroke="#efe6d3" stroke-width="7" stroke-dasharray="17 12" stroke-linecap="round"/>
  <path d="M100 100L156 156M156 100L100 156" stroke="#13152f" stroke-width="22" stroke-linecap="round" opacity=".55"/>
  <path d="M100 100L156 156M156 100L100 156" stroke="#ff5b3f" stroke-width="13" stroke-linecap="round"/>
</g></svg>"""

with sync_playwright() as p:
    b = p.chromium.launch(channel="chrome")
    pg = b.new_page(viewport={"width": 256, "height": 256})
    pg.set_content(f"<body style='margin:0;background:transparent'>{SVG}</body>")
    pg.locator("svg").screenshot(path=os.path.join(ROOT, "icon.png"), omit_background=True)
    pg = b.new_page(viewport={"width": 256, "height": 256}, device_scale_factor=2)
    square = SVG.replace(' rx="52"', '')  # full-bleed: the phone rounds the corners itself
    pg.set_content(f"<body style='margin:0'>{square}</body>")
    pg.locator("svg").screenshot(path=os.path.join(ROOT, "icon-512.png"))
    b.close()
Image.open(os.path.join(ROOT, "icon-512.png")).convert("RGB").resize((180, 180), Image.LANCZOS).save(os.path.join(ROOT, "icon-180.png"))
print("icon.png, icon-512.png, icon-180.png")
