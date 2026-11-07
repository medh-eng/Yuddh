# YUDDH art prompts: batch 6, "The Digvijaya"

The second battle of the Gupta campaign. Around 340 CE, Samudragupta (son of Chandragupta I, grandfather's namesake empire builder, later called the "Napoleon of India") set out on a *digvijaya*, a victory march over the world. His own court poet Harishena recorded it on the Allahabad Pillar: first the kings of the Ganges plain, among them **Achyuta** of Ahichchhatra, **Nagasena** and **Ganapati Naga** of the Naga country around Padmavati, were "uprooted" in battle. Then came the long march south, where he defeated twelve kings and, a mark of his policy, gave their kingdoms back as vassals. Gupta coins show him seated playing the veena, and he performed the Ashvamedha, the horse sacrifice of a conqueror.

The Naga battle is the Gupta empire's first great test: three kings allied, a forest country, clan warriors and archers behind shields, and war elephants.

This batch is **9 images**: 1 battlefield, 1 Durg, 6 Naga cards and 1 Gupta card. Paint the battlefield and the Durg first, then the Nagas, then the Veena.

## Same rules as before

- Cards are portrait 5:7. The Durg is square. The battlefield is landscape 16:9. No text, borders or watermarks.
- For **Gupta** cards use the Gupta style block and clothing sentence from `PROMPTS-BATCH2.md`.
- For **Naga** cards use the Gupta block with this clothing sentence instead:

```
Clothing and weapons of the Naga clans of the Ganges-Yamuna country around 340 CE, as seen in Naga coins and the terracotta and stone sculpture of Padmavati and Mathura: tall turbans and cloth head-bands, many strands of beads, bare chests with a sash, short dhotis with a patterned belt, round and oblong shields, spears, curved short swords and long bows, a cobra hood motif on banners and on the crown of kings; the same Indian miniature painting style, so that they look like a proud forest-and-river people painted by the same hand.
```

- Upload cards and the Durg to `art/source/cards/`, the battlefield to `art/source/battlefields/`, named exactly as below.
- Add "full figure with clear space above the head and below the feet" for single-person cards, as before.

---

## Setting (2)

**`padmavati.png`, battlefield, landscape 16:9** (Gupta block, landscape)
```
Top-down painted cloth map of the plain outside ancient Padmavati, the Naga capital, where two rivers meet: the wide meeting of the rivers along the top edge, a brick city wall with gate towers and cobra banners along the bottom edge, sal forest and clearings at the sides, small clan villages and tank ponds. Same layout as the other battlefields: details only around the edges, an open middle band where the cards sit, and an aged cloth texture. Green and ochre earth colours with touches of gold leaf.
```

**`durg_padmavati.png`, the Naga capital** (Naga block, square)
```
Padmavati, the Naga capital at the meeting of two rivers: a thick brick rampart with square gate towers, a great cobra-hooded standard above the gate, a stone-carved temple of Naga kings behind, forest closing in on both sides, river boats at the landing steps, green evening light and woodsmoke. A proud, old and fortified clan kingdom.
```

## The Naga kings and army (6)

**`na_ganapati_naga.png`, Ganapati Naga** (unit; Naga block)
```
Ganapati Naga, the most powerful of the three Naga kings, a broad-shouldered ruler in his middle years with a cobra-hooded gold crown and heavy bead necklaces, standing in a war-chariot with a spear in one hand and a round shield in the other, a cobra banner and forest-clan warriors behind him. Fierce, regal, rooted in his land.
```

**`na_nagasena.png`, Nagasena** (unit; Naga block)
```
Nagasena, a Naga king in a cloth turban with a gold cobra crest, riding on a war elephant in a howdah, one hand holding a long bow, the other raised giving orders, councillors and a tall banner behind him, lamp-light on his face. Thoughtful and watchful, the planner of the alliance.
```

**`na_achyuta.png`, Achyuta, king of Ahichchhatra** (unit; Naga block)
```
Achyuta, a young Naga king of Ahichchhatra, in a gold turban and beaded sash, riding at a gallop on a horse with a long spear, cavalry following in a loose line, fields and a river behind him. Bold and restless, the first of the three kings to take the field.
```

**`na_gana.png`, Naga Gana, clan warriors** (unit; Naga block)
```
A tight group of Naga clan spearmen advancing, the nearest man large in the foreground with a round shield and a spear, beaded sash and tall turban, behind him a bristle of spears and a cobra banner, forest edge and dust. Dense, loyal, close-knit.
```

**`na_dhanurdhar.png`, Naga Dhanurdhar** (unit; Naga block)
```
Naga archers shooting from the edge of a sal forest behind a wall of planted oblong shields, the nearest archer large in the foreground drawing a long bow, quivers and bead jewellery, a line of arrows in flight, dappled light through leaves. Patient hunters of the forest.
```

**`na_sarpa_vish.png`, Sarpa Vish** (order; Naga block)
```
A great cobra with its hood spread rising from a clay jar in the foreground, arrows with dark-tipped heads laid beside it, a Naga warrior's hands dipping an arrowhead into the venom, torch-light and green shadows. Dangerous, secretive, a Kuta weapon. No gore.
```

## The Gupta card (1)

**`g_veena.png`, Veena, the king's music** (order; Gupta block)
```
Samudragupta seated on a low couch in a palace hall with a veena across his lap, playing for a small circle of courtiers and poets, a sword laid at his side as if just put down, a lamp and a vase of flowers beside him, soft golden light. The warrior-king is also an artist: the scene of the gold coin that shows him with his veena.
```

---

## When the paintings arrive

Upload to `art/source/`, then Claude runs `npm run assets`, moves the seven cards from `pendingArt` into `yuddh` in `cards.json`, adds the scenario (`src/campaign/digvijaya.ts`, drafted in `art/digvijaya-draft/`), the deck entry, the map node, a test, and checks the balance (the draft already runs at about 50%).
