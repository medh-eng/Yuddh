# YUDDH art prompts: batch 9, "Rajendra's Sea Road" (Chola campaign, battle 1)

The next campaign to open is the **Chola** one. In about **1025 CE** the Chola emperor **Rajendra I** sent a fleet across the Bay of Bengal against **Sangrama Vijayottungavarman, king of Kadaram** (Kedah, on the Malay coast), the Srivijaya realm's port power. Rajendra's own Tamil inscriptions (from about his 14th regnal year, c. 1026) say Kadaram was taken and its king captured. Why it happened is argued (trade routes, a quarrel over Chola merchants, prestige), and Srivijaya's own side of the story is hardly recorded, so the game paints both sides with dignity and says in its History panel that the battle itself is invented.

Fixes to our old prototype: the old mission said Rajaraja, 1014. It was **Rajendra I** (son of Rajaraja), **c. 1025**. The Rajaraja card stays for later.

Shape of the battle: **ships and harbours.** The Chola side has warships and marines; the Srivijaya side has a rich port, merchant-fleet archers and a floating wall of boats.

This batch is **12 images**: 1 battlefield, 2 Durgs, 3 Chola cards, 6 Srivijaya cards. Paint the battlefield and Durgs first.

## Same rules as before

- Cards portrait 5:7, as large as the tool allows. Durgs square. Battlefield landscape 16:9. No text, borders or watermarks.
- **Chola cards, Durg and battlefield**: use the Chola era block from `PROMPTS-BATCH2.md` as it is (it already says c. 1014 CE, which is close enough; if you like, change the date in it to "around 1025 CE").
- **Srivijaya cards and Durg**: paste the same style block but replace its clothing sentence with this one:

```
Clothing, weapons and architecture of the Srivijaya maritime realm around 1025 CE, as seen in the reliefs of Borobudur and the ports of the Malay coast: kings and sailors of a rich trading empire (dignified, wealthy, not pirates): sarong-style wrapped cloths and sashes, bare chests with gold collars and heavy ear ornaments, tall pointed or tiered caps, curved krises and spears, long bows, outrigger ships with sails and carved prows, wooden harbour piers, stone and brick stupa-like towers with tiered roofs, tropical palms and incense smoke.
```

- Add "full figure with clear space above the head and below the feet" for single-person cards.
- Upload cards and Durgs to `art/source/cards/`, the battlefield to `art/source/battlefields/`, named exactly as below.

---

## Battlefield and Durgs (3)

**`kadaram.png`, battlefield, landscape 16:9** (Chola block, landscape)
```
Top-down painted cloth map of a tropical harbour on the Malay coast: blue-green sea along the top edge with Chola warships and Srivijaya trading ships at anchor, a long wooden pier and a sandy beach in the middle, palm groves and a river mouth along the bottom, a tiered stone temple tower and warehouses in one corner, nets and small boats. Same layout as the other battlefields: details only around the edges, the middle open and calm.
```

**`durg_gangaikonda.png`, the Chola capital** (Chola block, square)
```
Gangaikonda Cholapuram, the new capital of Rajendra I: a great stepped temple tower (vimana) in warm granite, a broad courtyard with a bronze lamp, a tank with water reflecting the tower, banners with a tiger emblem, gold light. Seen from the front, symmetrical, like the other Durgs.
```

**`durg_kadaram.png`, Kadaram, the Srivijaya harbour fortress** (Srivijaya block, square)
```
The port stronghold of Kadaram: a walled harbour town with a tiered stone-and-brick tower, wooden gate towers over the water, a chain of ships forming a floating wall in front, palm trees, incense smoke, gold roof ornaments. Seen from the front, symmetrical, like the other Durgs.
```

## Chola cards (3)

| File | Card | Prompt |
| --- | --- | --- |
| `ch_rajendra.png` | **Rajendra I**, Gangaikonda Chola, the emperor (7 cost unit) | Rajendra I stands at the prow of a great warship, crowned, gold armlets and a long sash, one hand on a sword, the other raised toward the far shore, fleet behind him, tiger banner, sea wind, a confident emperor not a brute. |
| `ch_vanigar.png` | **Ainnurruvar Guild Guard** (merchant-guard unit) | A guard of the Five Hundred merchant guild: a broad sturdy man with a spear and round shield beside stacked trade chests and a bale of cloth, guild banner, harbour behind. |
| `ch_kalam.png` | **Kalam, Chola Warship** (ship unit) | A big Chola war vessel under a square sail, tiger banner, archers along the rail, oars, carved prow, foaming sea. |

## Srivijaya cards (6)

| File | Card | Prompt |
| --- | --- | --- |
| `sv_sangrama.png` | **Sangrama Vijayottungavarman** (their king, 7 cost unit) | The king of Kadaram stands on the pier of his harbour town in a tiered gold cap, collars and ear ornaments, a kris at his belt, calm and proud, ships and the tiered tower behind, incense smoke. |
| `sv_nakhoda.png` | **Nakhoda, Ship Captain** (commander) | A weathered captain of a trading ship, wrapped sarong, bare chest with a gold collar, pointing out to sea with one hand, rope and sail behind. |
| `sv_dhanurdhar.png` | **Pemanah, Harbour Archer** (ranged unit) | A harbour archer drawing a long bow from a wooden pier, sarong and sash, quiver of arrows, boats behind. |
| `sv_perahu.png` | **Perahu Wall** (ship unit) | A line of trading boats lashed side by side as a floating wall, spearmen standing on the decks, sails furled, sea calm and glittering. |
| `sv_penjaga.png` | **Penjaga Pelabuhan, Harbour Guard** (defender) | A guard with a tall shield and spear at the harbour gate, tiered cap, carved gate posts, tiered tower behind. |
| `sv_api.png` | **Pelita Api, Fire Boats** (order) | Empty trade boats loaded with burning torch bundles drifting toward an enemy fleet at dusk, orange flames on dark water, smoke rising. |


---

## After the pictures arrive

Claude then builds the battle (`kadaram.ts`), adds the cards to `cards.json`, history note ("c. 1025 CE", Rajendra's Tamil prasasti, debated motive, battle invented; built 9 Nov 2026), tests balance, and opens the **Chola** tab on the campaign map. Later: Rajaraja's Lanka war, then Tarain (Rajput) with Pon's pick of sources.
