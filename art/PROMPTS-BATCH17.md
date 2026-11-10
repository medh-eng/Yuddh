# YUDDH art prompts: batch 17, "Koppam" (Chola campaign, battle 4, 1052 or 1054 CE)

The Chola campaign (Lanka, Ganga, Kadaram) gets its fourth battle, and the Chola story's hardest day. **Rajadhiraja I**, son of Rajendra I, led the Chola army north against the **Western Chalukya** king **Someshvara I** (Ahavamalla, who later called himself Trailokyamalla, "lord of the three worlds"), the rival power of the Deccan. The two armies met at **Koppam** (identified with Koppal, by the Tungabhadra or Krishna; the site is argued over). The Chola sources, above all the **Manimangalam record of Rajendra II (1055)** and the Thanjavur temple inscriptions, agree on the shape of it: the Chola king rode a **war elephant** into the fighting and was **killed on it by a downpour of arrows**; his brother **Rajendra II**, wounded early and then held back, **returned, rallied the army and turned the battle**, and was crowned on the field. The Chalukya side's own record is mostly silent and later Chalukya sources celebrate the war as theirs. Rajadhiraja is remembered in Tamil as *Yanai-mel-thunjina Devar*, "the king who died on the elephant".

**Why this battle:** it is the first Chola fight where **losing your king is part of the story and you can still win**. The player starts with Rajadhiraja's host. The plan is a battle that turns when the king's elephant falls and Rajendra II takes over.

Facts the game keeps honest (the History note will say these):
- **The date is 1052 or 1054 CE** (sources differ), and **the place is argued**: Koppal, on the Tungabhadra, is the usual reading. The game says "c. 1052–54 CE".
- **Both sides claim it.** The Chola inscriptions claim victory, elephants, horses and Someshvara's queens as booty. Chalukya records do not agree, and the claim that Someshvara's brother Jayasimha died there is doubted (he lived on). The game gives the Chola reading as "the Chola record says" and does not call it settled.
- **No troop numbers.** The huge counts in some retellings (a thousand elephants and so on) are not used.
- **The battle itself is invented**; the sources give the outcome, the king's death on the elephant and the rally.
- **Both armies painted with dignity.** Someshvara I is a serious king and general, not a villain.
- **Era (c. 1050 CE):** South and Deccan India. Dhotis and sashes, gold armlets and ear ornaments, quilted or leather coats and light mail on soldiers, round shields, spears, long bows, war elephants with **wooden howdahs and painted armour** (by now correct), horses, banners (the Chola tiger, the Chalukya boar-and-sun is later; use plain saffron and red).

This batch is **9 images**: 1 battlefield, 1 Durg, 3 Chola cards, 4 Western Chalukya cards. The Chola Durg (`durg_gangaikonda`) and the existing Chola and neutral cards are reused. Paint the battlefield and the Durg first.

## Same rules as before

- Cards portrait 5:7, as large as the tool allows. Durgs square, battlefield landscape 16:9. No text, borders or watermarks. Add "full figure with clear space above the head and below the feet" for single-person cards.
- **Chola cards**: the Chola era block from `PROMPTS-BATCH2.md`, as in batches 9 to 11 (say "around 1050 CE").
- **Western Chalukya cards and Durg**: the neutral frame. Use this clothing sentence in every Western Chalukya prompt: *"Deccan early eleventh century dress: a dhoti and sash, gold armlets and a tall crown for the king, soldiers in quilted coats or light mail with round shields, spears and long bows, red and saffron banners, stone temples of the Kannada country."*
- **Battlefield**: the landscape style block from `PROMPTS-BATCH2.md` (top-down painted cloth map, details only around the edges, the middle open and calm).
- Upload cards and the Durg to `art/source/cards/`, the battlefield to `art/source/battlefields/`, named exactly as below. **Please double-check the battlefield goes in `battlefields/`** (twice it has landed in `cards/`).

---

## Battlefield (1)

**`koppam.png`, landscape 16:9**
```
Top-down painted cloth map of the plain of Koppam in the Deccan: a broad river with sandbanks and a stony ford across the top edge, dry golden-brown plain with scattered thorn trees and low granite boulders in the open middle band kept calm, a small hill with a stone temple and a tank in one corner, a village of flat-roofed houses and a few bullock carts in another, dry streams and a faint cart road, a few vultures in the sky, trampled grass where a great army has passed. Same layout as the other battlefields: details only around the edges, the middle open and calm, aged cloth texture.
```

## Durg (1)

**`durg_kalyani.png`, the Western Chalukya capital** (neutral frame, square)
```
Kalyani, the Western Chalukya capital around 1050 CE: a high stone fort wall of dressed granite with round bastions and a tall gateway, carved stone temples with star-shaped plans rising behind it, saffron and red banners, a stepped tank with a pavilion before the walls, elephants and cavalry at the gate, dry hills beyond, warm evening light. Symmetrical, seen from the front, like the other Durgs.
```

## Chola cards (3)

| File | Card | Prompt |
| --- | --- | --- |
| `ch_rajadhiraja.png` | **Rajadhiraja I** (the Chola king on his elephant; legendary, 7 cost unit) | Chola era block. King Rajadhiraja, a broad, grave man of about fifty in a gold crown-helmet, quilted armour and gold armlets, riding a great armoured war elephant with a painted forehead plate and a wooden howdah, a long spear in one hand, a mahout in front, tiger banners above, arrows in the air around the howdah, dust and a river behind, a resolute, unflinching face, the full elephant visible. |
| `ch_rajendra2.png` | **Rajendra II** (the brother who turned the battle; legendary, 6 cost unit) | Chola era block. Prince Rajendra II, wounded, with a cloth bound round one arm, in quilted armour and a gold crown-helmet, standing in the howdah of a battered, arrow-struck war elephant and raising his hand to rally scattered soldiers who are turning back, a drummer beating a war-drum beside him, tiger banners lifted again, golden light after dust, full figure with clear space above the head and below the feet. |
| `ch_veera_ani.png` | **The Rally on the Field** (order: units get +1 attack, draw a card, restore the Durg) | Chola era block. Chola soldiers, elephants and horsemen wheeling about and re-forming into a line across a dusty plain at the call of a drum, a new tiger banner raised on a tall pole, a crowned prince on an elephant at the centre, the broken howdah of a fallen king's elephant in the foreground, late light breaking through the dust. Full painting, no text. |

## Western Chalukya cards (4)

| File | Card | Prompt |
| --- | --- | --- |
| `wc_someshvara.png` | **Someshvara I** (Ahavamalla, the Western Chalukya king; legendary, 6 cost unit) | Western Chalukya clothing sentence. King Someshvara I, a vigorous man of about forty-five with a trimmed moustache, in a gold crown-helmet, quilted armour over a red dhoti and gold armlets, a long bow in one hand, standing beside his war elephant on a dry plain with red and saffron banners behind him and a ford in the far distance, alert and commanding, full figure with clear space above the head and below the feet. |
| `wc_dhanu.png` | **Chalukya Archer Corps** (disciplined archers; 3 cost unit, ranged) | Western Chalukya clothing sentence. A dense rank of Chalukya archers in quilted coats and round caps, standing in two rows and drawing long bows in unison at a tall target above the frame, quivers at their hips, arrows in flight, dry plain and boulders behind them, steady faces, low sun. |
| `wc_gaja.png` | **Kalyani Gaja** (a Chalukya war elephant; 5 cost unit) | Western Chalukya clothing sentence. An armoured Western Chalukya war elephant with a painted forehead and quilted barding, a wooden howdah with two archers and a spearman, a red banner, a mahout on its neck, advancing across a dry plain with dust rising and the river glinting behind, full elephant visible. |
| `wc_barsha.png` | **A Downpour of Arrows** (order: damage to every enemy unit on the front line; the arrows that fell a king) | Western Chalukya clothing sentence. A great volley of arrows arcing in a dark cloud over a plain toward a lone Chola war elephant with a howdah, Chalukya archers in ranks beneath it with bows lifted, the sun low and red behind the arrows, tension rather than gore. Full painting, no text. |

---

## After the pictures arrive

Claude builds **Koppam** as Chola battle 4 (Chola campaign: Lanka, Ganga, Kadaram, Koppam, in date order the last), with Rajadhiraja as the player's hero. Planned design: Rajadhiraja (legendary elephant commander, deploy +1 attack to the line); Rajendra II (legendary reserve commander: strong, but only joins if Rajadhiraja has fallen, or a Rally order is played); The Rally on the Field (+1 attack, draw, heal the Durg); Chalukya side: Someshvara I, the Archer Corps (extra damage to elephants, the `vsElephant` rule from Chandawar), Kalyani Gaja, A Downpour of Arrows (damage to the whole front line). Claude adds a History note (1052 or 1054 and the disputed place; Manimangalam record 1055 and the Thanjavur inscriptions; "the Chola record says"; no numbers; the Chalukya side silent or claiming otherwise; Jayasimha's death doubted), the Chalukya and Chola factions to the two-player lists, balance tests, and a playtest.
