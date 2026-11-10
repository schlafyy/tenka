"""Cuts the bundled Japanese fonts down to the characters the game uses (they are 2-15 MB whole).
Run after changing any text: python tools/subset_fonts.py [folder with the full .ttf files, default fonts-src/]
Sources (SIL Open Font License): github.com/google/fonts ofl/shipporiminchob1, ofl/zenkakugothicnew and ofl/yujisyuku,
saved as <family>_<File>.ttf and <family>_OFL.txt."""
import os, sys, string, subprocess
from fontTools import subset

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
FONTS = {  # output name -> source file
    "mincho-400": "shipporiminchob1_ShipporiMinchoB1-Regular.ttf",
    "mincho-700": "shipporiminchob1_ShipporiMinchoB1-Bold.ttf",
    "gothic-400": "zenkakugothicnew_ZenKakuGothicNew-Regular.ttf",
    "gothic-500": "zenkakugothicnew_ZenKakuGothicNew-Medium.ttf",
    "brush-400": "yujisyuku_YujiSyuku-Regular.ttf",
}


def used_chars():
    chars = set(string.printable) | set("ōūāēīŌŪĀ–—‘’“”…·×½¼●○⌂−→←年元一二三四五六七八九十万石春夏秋冬")
    for f in ("index.html", "ui.js", "game.js", "data/game-data.js", "data/map.js"):
        chars |= set(open(os.path.join(ROOT, f), encoding="utf8").read())
    return "".join(sorted(c for c in chars if c.isprintable()))


def brush_chars():
    # only what the curtain writes: clan names, era names and era years
    js = ("Object.assign(globalThis, require('./data/map.js'), require('./data/game-data.js')); const s = new Set('平成令和元年一二三四五六七八九十天下座敷茶室年代記家岐路旅');"
          "for (const g of [...GUESTS, ...CROSSROADS]) for (const c of g.ja) s.add(c);"
          "for (const e of ERAS) for (const c of e[2]) s.add(c); for (const c of Object.values(CLANS)) for (const x of c.ja) s.add(x);"
          "process.stdout.write([...s].join(''))")
    return subprocess.run(["node", "-e", js], cwd=ROOT, capture_output=True, text=True, encoding="utf8", check=True).stdout


# Neither Japanese font has the Latin vowels with a macron (Ryōma, Ōmi), so phones drew them from a heavier system font.
# They are built here from each font's own letter and macron, as composite glyphs.
MACRONS = {"ā": "a", "ē": "e", "ī": "ı", "ō": "o", "ū": "u", "Ā": "A", "Ē": "E", "Ī": "I", "Ō": "O", "Ū": "U"}


def add_macrons(font):
    from fontTools.pens.boundsPen import BoundsPen
    from fontTools.pens.ttGlyphPen import TTGlyphPen
    cmap, gs = font.getBestCmap(), font.getGlyphSet()
    def box(g):
        pen = BoundsPen(gs); gs[g].draw(pen); return pen.bounds
    mac = cmap[0xAF]
    mx0, my0, mx1, _ = box(mac)
    for ch, base in MACRONS.items():
        if ord(ch) in cmap or ord(base) not in cmap:
            continue
        b = cmap[ord(base)]
        x0, _, x1, y1 = box(b)
        # centred over the letter, a small gap above it (a little less above a capital)
        dx, dy = round((x0 + x1) / 2 - (mx0 + mx1) / 2), round(y1 + (70 if base.isupper() else 100) - my0)
        pen = TTGlyphPen(gs)
        pen.addComponent(b, (1, 0, 0, 1, 0, 0)); pen.addComponent(mac, (1, 0, 0, 1, dx, dy))
        name = "uni%04X" % ord(ch)
        font["glyf"][name] = pen.glyph()
        font["glyf"][name].recalcBounds(font["glyf"])
        font["hmtx"][name] = font["hmtx"][b]
        if "vmtx" in font: font["vmtx"][name] = font["vmtx"][b]
        for t in font["cmap"].tables:
            if t.isUnicode(): t.cmap[ord(ch)] = name


def main(src):
    text = used_chars()
    out = os.path.join(ROOT, "fonts")
    os.makedirs(out, exist_ok=True)
    for name, file in FONTS.items():
        opts = subset.Options()
        opts.flavor = "woff2"
        opts.layout_features = ["*"]
        font = subset.load_font(os.path.join(src, file), opts)
        if name != "brush-400": add_macrons(font)
        sub = subset.Subsetter(opts)
        sub.populate(text=brush_chars() if name == "brush-400" else text)
        sub.subset(font)
        path = os.path.join(out, name + ".woff2")
        subset.save_font(font, path, opts)
        print(name, os.path.getsize(path) // 1024, "KB")
    for lic in ("shipporiminchob1_OFL.txt", "zenkakugothicnew_OFL.txt", "yujisyuku_OFL.txt"):
        with open(os.path.join(src, lic), encoding="utf8") as a, open(os.path.join(out, lic.replace("_OFL", "-OFL")), "w", encoding="utf8") as b:
            b.write(a.read())


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "fonts-src"))
