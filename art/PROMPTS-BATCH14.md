# YUDDH art prompts: batch 14, "The Battle of Chandawar" (Rajput campaign, battle 3, 1194 CE)

The Rajput campaign moves east. After Tarain, Mu'izz al-Din Muhammad of Ghor turned on the next great power of the Ganga plain: the **Gahadavala** kingdom of **Jayachandra**, lord of **Kannauj and Varanasi (Kashi)**. In **1194 CE** the two armies met at **Chandawar**, on the **Yamuna** near modern Firozabad, Uttar Pradesh. The Persian chroniclers (Hasan Nizami, *Taj al-Ma'athir*, and Ibn al-Athir, *al-Kamil*) agree on the shape of it: the Gahadavala host was strong in **war elephants**, Jayachandra rode one himself, and the Ghurid army, led in the field by the sultan with **Qutb al-Din Aibak** in his service, won. Jayachandra was killed on his elephant (the accounts differ on the detail). The Gahadavala heartland, Kannauj and Varanasi, passed under Ghurid control.

**Why this battle:** Tarain 1191 you won, Tarain 1192 you could win only if you held. Chandawar is a different problem: your **elephants are strong but tall targets**, and the enemy has learned to shoot the drivers. The player leads the **Rajput** side (the Gahadavala host, fought in the Rajput style) as before.

Facts the game keeps honest (see `docs/HISTORY-RESEARCH.md` §7.3; Cynthia Talbot, *The Last Hindu Emperor*, and Peter Jackson, *The Delhi Sultanate*, are the careful modern studies):
- **No troop numbers and no speeches.** The huge figures in the chronicles (for elephants and men) are not trusted. **No Jaichand-as-traitor legend:** the story that Jayachandra invited the Ghurids against Prithviraj is a later tradition and is **not used**.
- **The battle itself is invented**; the sources give the outcome and Jayachandra's death on the elephant, not the fight.
- **Both armies painted with dignity.** Late twelfth century: mail, quilted coats, lances, stirrups, armoured elephants with howdahs, composite bows, brick and sandstone forts. Not European plate.

This batch is **9 images**: 1 battlefield, 1 Durg, 4 Rajput (Gahadavala) cards, 3 Ghurid cards. The Ghurid Durg (`durg_ghurid_camp`) and the existing Ghurid, Rajput and Aibak cards are reused. Paint the battlefield and the Durg first.

## Same rules as before

- Cards portrait 5:7, as large as the tool allows. Durgs square, battlefield landscape 16:9. No text, borders or watermarks. Add "full figure with clear space above the head and below the feet" for single-person cards.
- **Rajput cards and Durg**: the Rajput era block from `PROMPTS-BATCH2.md` (the c. 1150 CE one; say "around 1194 CE").
- **Ghurid cards**: the Ghurid clothing sentence from `PROMPTS-BATCH12.md` (same as batch 13).
- **Battlefield**: the landscape style block from `PROMPTS-BATCH2.md` (top-down painted cloth map, details only around the edges, the middle open and calm).
- Upload cards and the Durg to `art/source/cards/`, the battlefield to `art/source/battlefields/`, named exactly as below.

---

## Battlefield (1)

**`chandawar.png`, landscape 16:9**
```
Top-down painted cloth map of the Yamuna riverbank near Chandawar: a broad river with sandbars and a shallow ford crossing the top edge, low ravines and tamarisk scrub along the near bank, golden dry fields and a faint cart road in the open middle band kept calm, a mango grove and a small village with a mud-brick temple in one corner, reeds and a few herons at the water's edge, trampled grass where a great army has passed, a few abandoned bullock carts. Same layout as the other battlefields: details only around the edges, the middle open and calm, aged cloth texture.
```

## Durg (1)

**`durg_kannauj_gahadavala.png`, the Gahadavala capital** (Rajput block, square)
```
Kannauj above the Ganga around 1194 CE: a long pale sandstone and brick fort wall with round bastions and a tall gateway, saffron and gold banners, a city of flat-roofed houses and shikhara temples rising behind it, the broad river in front with stone ghats and boats, a row of armoured war elephants and cavalry at the gate, warm evening light. Symmetrical, seen from the front, like the other Durgs.
```

## Rajput (Gahadavala) cards (4)

| File | Card | Prompt |
| --- | --- | --- |
| `r_jayachandra.png` | **Jayachandra Gahadavala** (the king of Kannauj and Varanasi; 7 cost unit, legendary) | A Gahadavala king in mail and a saffron quilted coat with a gold-edged crown-helmet, riding a great armoured war elephant under a white canopy, a long spear in one hand and the other hand steadying himself on the howdah rail, a driver (mahout) in front, banners of gold and saffron, dust and the Yamuna river behind, a grave, resolute face, full elephant visible. |
| `r_howdah.png` | **Howdah Elephant** (an armoured elephant with archers on its back; 5 cost unit, ranged) | An armoured war elephant in quilted barding and a painted forehead plate, a wooden howdah on its back with two archers drawing bows and a banner-bearer behind them, the mahout on its neck, advancing across a dry plain with dust rising, a river glinting far behind. |
| `r_kashi_sena.png` | **Kashi Foot** (infantry from the Gahadavala heartland; cheap unit) | A line of infantry from the Gahadavala country in quilted coats and turbans with long spears and round shields, close together on a dusty riverbank, a temple spire and mango trees behind them, saffron and gold pennants, morning light, steady faces. |
| `r_ghat.png` | **Hold the Ford** (order: the host guards the crossing; restore Durg defence and draw) | Gahadavala soldiers and elephants drawn up on the bank of a wide river at a shallow ford, spearmen at the water's edge, an elephant standing in the shallows with its driver calm, archers on the bank, the far bank dark with distant horsemen, evening light on the water. |

## Ghurid cards (3)

| File | Card | Prompt |
| --- | --- | --- |
| `gh_marksmen.png` | **Elephant-Shooters** (Ghurid foot archers trained against elephants; 4 cost unit, ranged) | A rank of Ghurid foot archers in mail under dark-green quilted coats, kneeling and standing, drawing composite bows at a tall target above the frame (an unseen elephant), arrows in the air, a river and reeds behind them, calm, trained, disciplined faces, dust and low sun. |
| `gh_light_horse.png` | **Ghurid Light Horse** (fast skirmishing cavalry; 2 cost unit, vega) | A single Ghurid light horseman at full gallop through shallow water at a river ford, a short lance in one hand and a round shield on his back, a dark-green coat, spray flying from the hooves, the far bank behind him, early light. |
| `gh_crossing.png` | **The Ford Crossed** (order: your units get +1 attack and you draw a card) | The Ghurid army crossing a river at a ford at dawn: mailed horsemen in the shallows lance-first, kettle-drums on a camel mid-stream, dark-green banners above the water, a column of infantry behind, the sultan's standard on the far bank, the sun rising over the river. |

---

## After the pictures arrive

Claude builds `chandawar.ts` (third Rajput-tab battle; player = Rajput, Kannauj Durg), the cards (planned: Jayachandra Vega/Raksha commander with +1 attack to the line, Howdah Elephant ranged and sturdy, Kashi Foot cheap, Hold the Ford heals and draws; Elephant-Shooters ranged and deal extra damage to elephants, Ghurid Light Horse Vega, The Ford Crossed +1 attack and draw), a History note (1194, Hasan Nizami and Ibn al-Athir, no numbers, "accounts differ" on the detail of Jayachandra's death, and the Jaichand-traitor legend marked TRADITION and not used), balance tests and a playtest.
