# Regalia: the weapons and ornaments earned by rank (optional, cosmetic)

Each empire has six pieces, one for each rank above Padati. They show as round medallions on the **Roll of Renown** (bright once earned, dim until then) and, later, around the player's profile portrait. Until a painting arrives the game draws a numbered stand-in, so nothing is blocked.

**File names:** `art/source/cards/rg_<empire>_<n>.png`, for example `rg_maurya_1.png` (n = 1 for Gulmapati up to 6 for Chakravartin). Then `npm run assets`, commit.
**Size:** square, 1024×1024, the object centred with a margin (it is cropped to a circle). Plain dark background, no text, no border.

**Shared style line (add to every prompt):** *museum-quality painted illustration of a single historical object, centred, three-quarter view, dramatic soft lighting, deep dark background, rich detail, in the same hand-painted style as the game's card paintings, no text, no letters, no people.*

Please keep to objects the period actually knew. Where the shape is a guess, say so in the credits file.

## Maurya (c. 320–185 BCE), sandstone red and gold
1. **rg_maurya_1 · Gulmapati**: a plain iron-tipped spear with a leather-wrapped shaft and a small red pennon.
2. **rg_maurya_2 · Nayaka**: a Mauryan bow of bamboo and horn, quiver of cane arrows beside it.
3. **rg_maurya_3 · Dandanayaka**: a bronze-fitted war drum on a wooden stand, with two drumsticks.
4. **rg_maurya_4 · Senapati**: a long curved sword (khadga) in a gilded scabbard, on a red cloth.
5. **rg_maurya_5 · Mahasenapati**: an ornate elephant goad (ankusha) with a lion-headed gold finial, in the style of the Sarnath lion capital.
6. **rg_maurya_6 · Chakravartin**: a golden wheel (chakra) with 24 spokes, resting on a polished sandstone base.

## Gupta (c. 320–550 CE), gold and deep blue
1. **rg_gupta_1**: a Gupta-era iron sword with a plain hilt, sheathed, on blue silk.
2. **rg_gupta_2**: a recurved cavalry bow with an archer's thumb ring beside it.
3. **rg_gupta_3**: a golden standard topped with a Garuda figure, furled blue banner.
4. **rg_gupta_4**: a gold dinar-style coin shown large, a king with a bow on its face (an invented king, not a real portrait).
5. **rg_gupta_5**: a ceremonial parasol (chhatra) of white silk with a gold handle and tassels.
6. **rg_gupta_6**: a horse-sacrifice emblem: a gilded horse statue on a stone plinth, in the manner of the Ashvamedha coins.

## Chalukya (c. 543–753 CE), Badami red and gold
1. **rg_chalukya_1**: a short round shield (phalaka) with a boar crest in bronze.
2. **rg_chalukya_2**: a curved dagger and a bronze belt buckle on red leather.
3. **rg_chalukya_3**: a stone-carved war-elephant goad with a boar-headed finial.
4. **rg_chalukya_4**: a gilded boar standard (the Chalukya emblem) on a tall pole.
5. **rg_chalukya_5**: a broad sword with a lion-pommel, carved in the manner of Badami cave brackets.
6. **rg_chalukya_6**: a golden crown-helmet with a boar crest, on a sandstone pedestal.

## Chola (c. 850–1279 CE), bronze and sea green
1. **rg_chola_1**: a short stabbing sword with a bronze hilt, in a leather sheath.
2. **rg_chola_2**: a bronze oar-blade and rope coil of a Chola war galley, on dark teak.
3. **rg_chola_3**: a Chola bronze lamp (a lit oil-lamp) shaped like a small tiger.
4. **rg_chola_4**: a bronze tiger standard (the Chola emblem) on a pole, banner furled.
5. **rg_chola_5**: a pair of bronze anklets or armlets worn by Chola commanders, with pearl inlay.
6. **rg_chola_6**: a bronze crown with a tiger crest, inspired by Chola bronzes (no face, no figure).

*Order of painting:* Maurya first (it is the most played). Do the rest as time allows; each missing one simply stays a numbered stand-in.

---

## First samples reviewed (10 Nov 2026) and the improved prompt rules

**Absorbed into the game:** `rg_maurya_1` spear, `_2` bow and quiver, `_3` drum, `_4` sword, `_5` lion-headed goad, `_6` golden wheel (the buff-sandstone version, which matches the Chunar sandstone of the Ashokan pillars), and `rg_gupta_1` sword on blue silk. The red-base wheel and the Mughal bow with thumb ring were not used (see below).

**What worked:** the dark background, the warm top-left light, the gold and sandstone palette, the gilded detail. The set already looks like one family.

**Two things to fix, both small:**
1. **Medallions are small (about 40 px on a phone).** Thin, long objects (spear, goad, bow) shrink to a line. The game now shows each picture at 85% so the tips are not cut by the circle, but for the rest, paint the object **bold and chunky, filling the central circle, nothing in the corners**.
2. **A few details are from a later age.** The Maurya sword has a Mughal-style knuckle-guard; the Maurya drum has pointed (Islamic-style) arches; the bow with the thumb ring is Mughal. At medallion size nobody sees this, so keep them if you like, or repaint with the corrections below.

### Shared style line v2 (use this for all the remaining pieces)
*Museum-quality hand-painted illustration of ONE historical object, in the same style as the game's card paintings. The whole object sits inside a circle that touches the middle of each edge of the square (nothing in the corners). Bold, simple silhouette that reads at thumbnail size; if the object is long, show it at a three-quarter angle, shortened, or curved, not as a thin diagonal. Warm light from the upper left, plain dark background (colour below), no text, no letters, no people, no frame.*

**Background colour per empire:** Maurya deep brown (done) · Gupta deep blue velvet · Chalukya dark red-brown · Chola dark sea-green.

### Optional repaints for Maurya (only if you want them period-exact)
- `rg_maurya_3` drum: *"a barrel-shaped war drum (dundubhi) of dark wood with two broad bronze bands, the body carved with a band of lotus petals like the Sanchi railing (no pointed arches), leather heads laced with cord, on a low wooden stand, two drumsticks leaning on it."*
- `rg_maurya_4` sword: *"a straight broad-bladed khadga with a gently leaf-shaped blade, a simple round disc pommel and a plain cross-guard (no knuckle-guard, no basket), in a leather scabbard with gilded fittings, lying on a red cloth, shortened to a three-quarter angle."*

### Gupta (pieces 2–6; sample 1 is done)
Palette: gold and deep blue. For 2, **the Mughal bow you painted is not Gupta**; keep it for Rajput (it will become `rg_rajput_2`, c. 1190 CE) and paint this instead.
2. `rg_gupta_2`: *"a long simple bow of bamboo with horn tips and a cloth-wrapped grip, strung, with a quiver of arrows with gold bands laid across it on blue silk, as on the archer-type Gupta coins (no thumb ring, no floral inlay)."*
3. `rg_gupta_3`: *"a golden standard: a tall pole topped by a Garuda with spread wings, a furled blue banner beneath it, shown at a three-quarter angle, filling the circle."*
4. `rg_gupta_4`: *"a large gold coin, front view, in the style of a Gupta dinar: a king in a dhoti holding a bow, facing left, a plain beaded rim, a few abstract marks instead of letters, on blue velvet. The king is an invented figure, not a real portrait."*
5. `rg_gupta_5`: *"a ceremonial parasol (chhatra) of white silk with a gold handle and gold fringe, opened, shown from slightly below, with a tassel on top."*
6. `rg_gupta_6`: *"a gilded standing horse statue on a low carved stone plinth, in the manner of the Ashvamedha coins, a ceremonial post beside it, front three-quarter view."*

### Chalukya (c. 543–753 CE; dark red-brown, Badami sandstone and gold)
1. `rg_chalukya_1`: *"a round bronze-bossed shield (phalaka) with a boar crest in raised bronze, red sandstone behind it."*
2. `rg_chalukya_2`: *"a curved dagger in an embossed leather sheath and a bronze belt buckle lying together on red leather."*
3. `rg_chalukya_3`: *"a stone-carved elephant goad with a boar-headed finial, short and chunky, on a red sandstone slab."*
4. `rg_chalukya_4`: *"a gilded boar standard (the Chalukya emblem): a golden boar on a tall pole with a crimson pennon, shortened to fit the circle."*
5. `rg_chalukya_5`: *"a broad straight sword with a lion pommel carved like a Badami cave bracket, in a red leather scabbard."*
6. `rg_chalukya_6`: *"a golden crown-helmet with a boar crest on a red sandstone pedestal, front three-quarter view."*

### Chola (c. 850–1279 CE; dark sea-green, bronze)
1. `rg_chola_1`: *"a short stabbing sword with a bronze hilt in a leather sheath, on dark teak."*
2. `rg_chola_2`: *"a broad bronze-tipped oar-blade crossed with a coil of rope, on dark teak planks."*
3. `rg_chola_3`: *"a bronze oil-lamp shaped like a small crouching tiger, lit, a warm flame."*
4. `rg_chola_4`: *"a bronze tiger standard on a short pole, banner furled, shown at a three-quarter angle."*
5. `rg_chola_5`: *"a pair of bronze armlets inlaid with pearls, side by side, on dark green cloth."*
6. `rg_chola_6`: *"a bronze crown with a tiger crest on a stone pedestal (no face, no figure), front three-quarter view."*

Name files `rg_<empire>_<n>.png` in `art/source/cards/`, as before; then `npm run assets` and commit (or just upload and tell Claude).
