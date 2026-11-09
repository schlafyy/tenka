"""Renders icon.png (256 px), icon-512.png and icon-180.png: a shop curtain in madder red on white plaster,
hung from a wooden rod, split in three, with 天 in a white circle across the middle.
Run: python tools/icon.py"""
import os
from playwright.sync_api import sync_playwright
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
<defs><clipPath id="c"><rect width="256" height="256" rx="52"/></clipPath></defs>
<g clip-path="url(#c)">
  <rect width="256" height="256" fill="#f4f3f0"/>
  <rect x="0" y="30" width="256" height="196" fill="#82263a"/>
  <rect x="0" y="22" width="256" height="16" fill="#3b2b21"/>
  <circle cx="128" cy="134" r="35" fill="#fff"/>
  <text x="128" y="150" text-anchor="middle" font-family="Yu Mincho, Hiragino Mincho ProN, serif" font-size="44" fill="#82263a">天</text>
  <rect x="80" y="62" width="7" height="164" fill="#f4f3f0"/>
  <rect x="169" y="62" width="7" height="164" fill="#f4f3f0"/>
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
