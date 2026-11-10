# YUDDH art prompts: batch 18, "The Fall of Badami" (Chalukya campaign, battle 3, 642 CE)

The Chalukya campaign (Narmada, Pullalur) gets its third battle, and its darkest. After Pullalur, Mahendravarman's son **Narasimhavarman I** (Mamalla, "the great wrestler") became Pallava king in about 630 CE and set out to answer his father's defeat. In **642 CE** a Pallava army, which Tamil tradition says was led by the general **Paranjothi**, marched on **Vatapi (Badami)**, the Chalukya capital. **Pulakeshin II** met it on the outskirts of his city and is presumed to have died in the fighting. The Pallavas then held Vatapi for about twelve years (642 to c. 654). The Pallava side is recorded in the **Kuram plates** and the **Velurpalaiyam plates**: the king took "the pillar of victory standing in the centre of Vatapi" and earned the title *Vatapikonda*, "conqueror of Vatapi". The Pallava plates also say he defeated Pulakeshin earlier, at Pariyala, Manimangala and Suramara. The Chalukya record of the fall is silent, and Pulakeshin's son **Vikramaditya I** restored the kingdom by about 655 to 670.

**Why this battle:** the Narmada was a river held and Pullalur a field won; Badami is a **defence of the capital against an army that has already beaten you three times**. The history says the Chalukya lose. The game gives you the chance to do better, and its History note says plainly that in the sources you did not.

Facts the game keeps honest (the History note will say these):
- **The date is 642 CE** (the usual reading) and **Pulakeshin's death in the battle is "presumed"**, not recorded in so many words.
- **Paranjothi is a tradition.** The Tamil saint-poets' book (the Periya Puranam, twelfth century) tells of the Pallava general who destroyed Vatapi and brought back a Ganesha image; the Pallava plates do not name him. The game marks him TRADITION. **Vatapi Ganapati is not used.**
- **No troop numbers.** The site is "the outskirts of Vatapi", and the battle itself is invented from the outcome.
- **Both sides painted with dignity.** Pulakeshin is a great emperor in his last stand; Narasimhavarman is a wrestler-king and a builder (Mamallapuram is named after him), not a villain.
- **Era (c. 640 CE):** the same as Pullalur. Dhotis and sashes, quilted or light mail coats, round shields, spears, long bows, war elephants with howdahs, horses.

This batch is **9 images**: 1 battlefield, 1 Durg, 3 Chalukya cards, 4 Pallava cards. The Chalukya Durg (`durg_badami`), the Pallava cards already painted (`pv_gaja_vahini`, `pv_shilpi_sena`, `pv_mahendravarman`) and the existing Chalukya and neutral cards are reused. Paint the battlefield and the Durg first.

## Same rules as before

- Cards portrait 5:7, as large as the tool allows. Durgs square, battlefield landscape 16:9. No text, borders or watermarks. Add "full figure with clear space above the head and below the feet" for single-person cards.
- **Chalukya cards**: the Chalukya era block from `PROMPTS-BATCH2.md`, as in batches 7 and 15.
- **Pallava cards and Durg**: the neutral frame. Use this clothing sentence in every Pallava prompt: *"South Indian early seventh century dress: a white or ochre dhoti with a sash, gold armlets and a tall conical crown for the king, soldiers in short quilted coats or light mail, round shields, spears and bows, a lion or bull (Nandi) banner."*
- **Battlefield**: the landscape style block from `PROMPTS-BATCH2.md` (top-down painted cloth map, details only around the edges, the middle open and calm).
- Upload cards and the Durg to `art/source/cards/`, the battlefield to `art/source/battlefields/`, named exactly as below. **Please check the folder after uploading: battlefields have landed in `cards/` three times.**

---

## Battlefield (1)

**`vatapi.png`, landscape 16:9**
```
Top-down painted cloth map of the ground outside Badami in the Deccan: steep red sandstone cliffs and flat-topped hills along the top edge with the dark mouths of cave temples cut high in the rock, a long green lake with a stone-stepped ghat in one corner, a walled hill fort and a gate tower at the edge of a narrow valley, dry golden plain with scattered boulders and a few banyan and tamarind trees along the other edges, a cart road winding toward the gate, the open middle band kept calm, flat and dry. Same layout as the other battlefields: details only around the edges, the middle open and calm, aged cloth texture.
```

## Durg (1)

**`durg_pallava_camp.png`, the Pallava army before Vatapi** (Pallava, square)
```
A Pallava army camp of the seventh century on a dry plain below red sandstone cliffs: a ring of cloth tents and thatched shelters with the lion-and-Nandi banner on a tall pole, war elephants tethered under banyan trees, horse lines, cooking fires and carts, spearmen on guard around a wooden palisade with a gate, a stone shrine of the camp in the middle, warm late-afternoon light. Symmetrical, seen from the front, like the other Durgs.
```

## Chalukya cards (3)

| File | Card | Prompt |
| --- | --- | --- |
| `c_badami_rakshak.png` | **Badami Fort Guard** (unit; Raksha line-holder) | `Chalukya block. A Chalukya fort guard standing in a narrow gateway cut between red sandstone cliffs, a long spear and a tall round shield planted in front of him, a quilted coat and a plain turban, the boar banner on the rock above, calm and immovable, full figure with clear space above the head and below the feet.` |
| `c_badami_dhanu.png` | **Cliff Archers of Badami** (unit; ranged) | `Chalukya block. Chalukya archers on narrow ledges and cave-mouth terraces high in a red sandstone cliff, drawing long bows down toward a plain, quivers beside them, the green lake and the walled city far below in the evening light, steady and watchful faces, full figures.` |
| `c_shaila_dwar.png` | **The Cliff Gate** (order; arrows from the heights hit the enemy line) | `Chalukya block. A narrow stone gateway between two red cliffs with archers lining every ledge above it and boulders ready at the edge, an enemy column bunched below with shields raised against a rain of arrows, dust and low sun, a feeling of a mountain fortress that no army reaches easily. Full painting, no text.` |

## Pallava cards (4)

| File | Card | Prompt |
| --- | --- | --- |
| `pv_narasimhavarman.png` | **Narasimhavarman I, Mamalla** (legendary unit) | `Pallava clothing sentence. King Narasimhavarman I, the great wrestler-king, broad-shouldered and bare-chested in a dhoti and gold armlets with a tall conical crown, standing before a half-carved granite hill with sculptors at work in the background, a sword held low, a confident, patient face, full figure with clear space above the head and below the feet.` |
| `pv_paranjothi.png` | **Paranjothi, the Pallava general** (unit; tradition) | `Pallava clothing sentence. A Pallava general in a quilted coat and sash with a plain turban, standing in a war camp at dawn with a map cloth and a staff, elephants and spearmen forming up behind him, a stern, tired, practical face, full figure with clear space above the head and below the feet.` |
| `pv_mallar.png` | **Mamalla Wrestlers** (unit; heavy foot) | `Pallava clothing sentence. A line of powerful Pallava foot soldiers, wrestler-built, in short quilted coats with heavy round shields and short swords, advancing across a dusty plain toward red cliffs, a lion banner among them, determined faces, full figures.` |
| `pv_vijaya_stambha.png` | **The Pillar of Victory** (order) | `Pallava clothing sentence. A tall stone pillar standing in the middle of a captured hill-city square, Pallava soldiers and elephants gathered around it, a mason cutting a line of Grantha letters into its base, the red cliffs and cave temples behind in warm evening light, a feeling of a victory made permanent. Full painting, no readable text.` |

---

## After the pictures arrive

Claude builds **The Fall of Badami** as Chalukya battle 3 (Narmada, Pullalur, Badami). You play **Pulakeshin II** defending the capital; the enemy is Narasimhavarman's army. Planned cards: Fort Guard (Raksha), Cliff Archers (ranged), The Cliff Gate (damage to the enemy front line); Pallava Narasimhavarman (legendary), Paranjothi, Mamalla Wrestlers, The Pillar of Victory (a Kosha and card order), and the existing Pallava elephants and builders' guard. The battle is meant to be hard (about 45%): the Pallava side is stronger on the field and the Chalukya side owns the ground. Claude adds a History note (642 CE; Kuram and Velurpalaiyam plates for the Pallava claim; Paranjothi marked TRADITION; Pulakeshin's death marked "presumed"; the Chalukya recovery under Vikramaditya I as the epilogue), balance tests, the Pallava Narasimhavarman faction update in the two-player list, and a playtest.

**Not in this batch (optional, any time):** the six Rajput regalia medallions (`rg_rajput_1` to `6`); and batch 17 (Koppam, Chola battle 4) is still waiting for its paintings, which are not in the repository yet.
