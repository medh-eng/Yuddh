# YUDDH art prompts: batch 16, "The Kalinga War" (Maurya campaign, battle 3, c. 261 BCE)

The Maurya campaign gets its third battle, and the most famous war in the story of the dynasty. **Ashoka**, grandson of Chandragupta, was crowned c. 268 BCE. In the **eighth year of his reign** (c. 261 BCE) he conquered **Kalinga**, the coastal country between the Mahanadi and the Godavari, on the Bay of Bengal, famous for its war elephants and its ports. The only source for the war is Ashoka's own **Major Rock Edict XIII**: he says that **one hundred and fifty thousand were carried away, one hundred thousand were killed, and many times that number died**, and that when he saw it he felt remorse (*anusocana*) and turned to *dhamma*. Nothing else about the fighting is recorded.

**Why this battle:** every earlier Maurya fight was about winning. This one is about what winning costs. It fits the game's **Dharma–Kuta meter** better than anything else in the Maurya story, and it gives the Maurya campaign a hinge: Chandragupta's empire ends its wars of conquest here.

Facts the game keeps honest (see the History note the battle will carry):
- **Ashoka's own figures are in the edict; the game uses no troop numbers.** The huge army sizes sometimes quoted for Kalinga (from Greek writers and later retellings) are not used.
- **Ashoka never names the king or the general of Kalinga.** So the game gives the Kalinga side no named hero: its leader is "the Kalinga commander", unnamed, painted with dignity.
- **The battlefield is a tradition.** The war is *presumed* to have been fought by the river **Daya** below the **Dhauli hills** near modern Bhubaneswar, where Ashoka's Kalinga edicts stand. The story that the Daya ran red is a later tradition, not evidence. The game says so.
- **The battle itself is invented.** The sources give the war and its cost, not the fight. **No Chandashoka, no "wicked Ashoka" legend** (that is a later Buddhist story and is not used).
- **Both sides painted with dignity.** Kalinga was a wealthy, organised country, not a foe to be ashamed of.
- **Era (c. 260 BCE):** the same as the other Maurya batches. Cotton dhoti and uttariya, turbans, heavy gold and bead jewellery, no stirrups, no armour plates, no metal helmets, as in the stone reliefs of Sanchi and Bharhut. **Elephants carry a mahout and one or two archers sitting on a pad, no wooden howdah** (the tower-howdah is later).

This batch is **9 images**: 1 battlefield, 1 Durg, 3 Maurya cards, 4 Kalinga cards. The Maurya Durg (`durg_maurya_camp`) and the existing Maurya and neutral cards are reused. Paint the battlefield and the Durg first.

## Same rules as before

- Cards portrait 5:7, as large as the tool allows. Durgs square, battlefield landscape 16:9. No text, borders or watermarks. Add "full figure with clear space above the head and below the feet" for single-person cards.
- **All cards and the Durg**: the **Maurya and neutral era style block** from `PROMPTS-BATCH2.md`. For **Kalinga** cards, paste the same block, then add this line: *"The Kalinga people are painted as a rich coastal kingdom of the Bay of Bengal: darker skin tones, cotton dhotis dyed deep red and indigo, gold and shell jewellery, tall plaited turbans, round leather shields, long spears, great painted elephants, and palm-lined shores."*
- **Battlefield**: the landscape style block from `PROMPTS-BATCH2.md` (top-down painted cloth map, details only around the edges, the middle open and calm).
- Upload cards and the Durg to `art/source/cards/`, the battlefield to `art/source/battlefields/`, named exactly as below. (Last time the two battlefields landed in the cards folder: please check the folder for those.)

---

## Battlefield (1)

**`dhauli.png`, landscape 16:9**
```
Top-down painted cloth map of the river plain below the Dhauli hills in Kalinga: a broad shallow river (the Daya) with sandbanks winding across the top edge, a low rocky hill with a smooth rock face and a carved stone elephant above it in one corner, paddy fields and coconut and palm groves along the edges, a coastal village of thatched huts with fishing boats drawn up on a creek in another corner, a cart road leading to a walled city in the far distance, scattered boulders, the open middle band kept calm, flat and dry. Same layout as the other battlefields: details only around the edges, the middle open and calm, aged cloth texture.
```

## Durg (1)

**`durg_tosali.png`, the Kalinga capital** (Kalinga line added, square)
```
A fortified Kalinga city of the third century BCE on a plain below low hills: a high earthen rampart faced with brick, round bastions and wooden gate towers with curved roofs, a great gate with elephants in front of it, thatched and tiled houses inside, palm trees and a harbour canal with sea-going boats leading toward the coast, warm morning light. Symmetrical, seen from the front, like the other Durgs.
```

## Maurya cards (3)

| File | Card | Prompt |
| --- | --- | --- |
| `m_ashoka.png` | **Ashoka Maurya** (the young emperor; legendary, 7 cost unit) | The emperor Ashoka as a young man of about thirty, standing on a low rise above a river plain at the moment of victory, in a fine cotton dhoti and uttariya, a tall jewelled turban and heavy gold jewellery, a straight sword in one hand held low, a Mauryan elephant and the saffron banner behind him, smoke and dust on the plain, a grave, thoughtful face rather than a triumphant one, full figure with clear space above the head and below the feet. |
| `m_mahamatra.png` | **Mahamatra** (the emperor's senior officer; 3 cost unit, draws a card and heals) | A Mauryan senior officer (mahamatra) in a plain cotton dhoti and a long coat with a sash, a scroll case in one hand and a staff of office in the other, kneeling beside a wounded soldier on a field while clerks and bearers wait behind him, calm and practical, full figure with clear space above the head and below the feet. |
| `m_shila_lekh.png` | **The Rock Edict** (order: the emperor's remorse; restores the Durg and moves Dharma) | A smooth grey granite rock face on a hillside with a Brahmi inscription being cut by two stonecutters with chisels and mallets, a Mauryan officer dictating beside them, the plain with a river far below in soft evening light, a feeling of a record made to last. Full painting, no readable text. |

## Kalinga cards (4)

| File | Card | Prompt |
| --- | --- | --- |
| `kl_gaja.png` | **Kalinga Gaja** (the famous Kalinga war elephant; 5 cost unit) | A great Kalinga war elephant in a painted forehead cloth and leather armour on its flanks, a mahout on its neck and two archers sitting on a thick pad on its back (no tower, no howdah), a red and indigo banner, advancing through shallow water with spray, a river and low hills behind. |
| `kl_sena.png` | **Kalinga Foot** (infantry of the coast; cheap unit) | A line of Kalinga foot soldiers on a riverbank in deep red dhotis and plaited turbans, long spears and round leather shields, close together and steady, coconut palms and a thatched village behind them, morning light, resolute faces, full figures. |
| `kl_dhanu.png` | **Kalinga Bowmen** (archers of the Eastern Ghats; 3 cost unit, ranged) | Kalinga archers kneeling and standing on a rocky hillside among scattered boulders, drawing long bows, quivers on their backs, the plain and river below them and Mauryan banners far off, tense, patient faces, full figures. |
| `kl_daya.png` | **The Daya in Spate** (order: the river and the hills help the defenders; damages the enemy line) | The Daya river running wide and fast across a plain below low rocky hills, a line of Kalinga defenders and an elephant waiting on the near bank while the far bank is dark with the advancing Mauryan host, rain clouds breaking, late golden light on the water. Full painting, no text. |

---

## After the pictures arrive

Claude builds **The Kalinga War** as Maurya battle 3 (Maurya campaign: Training Ground, First Throne, Indus Line, Kalinga; a win at the Indus Line will lead to Kalinga, and Kalinga on to the Digvijaya in the Gupta tab), with Ashoka as the player's hero. Planned cards: Ashoka (Raksha commander, +1 attack to the line), Mahamatra (draw and heal), The Rock Edict (restore the Durg, Dharma +1), Kalinga Gaja (sturdy elephant), Kalinga Foot (cheap), Kalinga Bowmen (ranged), The Daya in Spate (damage to the whole enemy front line). Claude adds a History note (c. 261 BCE; Rock Edict XIII is Ashoka's own account; the figures are his; the king of Kalinga is not named; the Daya-ran-red story marked TRADITION; Dhauli as the site marked "presumed"), balance tests, the Kalinga faction in the two-player list, and a playtest.
