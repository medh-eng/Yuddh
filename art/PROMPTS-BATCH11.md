# YUDDH art prompts: batch 11, "The Crossing to Lanka" (Chola campaign, battle 3)

The oldest war of the Chola campaign. In about **993 CE** a Chola army sent by **Rajaraja I** crossed the Palk Strait and took **Anuradhapura**, the ancient capital of Sri Lanka's north. King **Mahinda V** had already lost control: the Sinhalese chronicle (the Culavamsa) says his army, unpaid and in revolt, would not obey him, and he withdrew south to Ruhuna. The Chola inscriptions record the conquest; the island's side is told by the chronicle. Chola records call the conquered north *Ila-mandalam*, and a Chola officer renamed the port of Mahatittha (Mantota) *Rajarajapura*. The conquest of the whole island was completed by his son **Rajendra** around 1017, and Mahinda V was taken to India as a prisoner. Chola rule on the island ended in 1070 under **Vijayabahu I**.

The game follows the sources and keeps both voices: the Chola record that it was conquered, the chronicle that the king's own army had stopped obeying him. **The battle is invented.** The Chola army is the one the player commands; the Sinhalese side is painted with dignity: a rich, ancient, learned capital of tanks, stupas and monasteries, not a pushover. The hero card is the Rajaraja card already painted, so no new Chola king is needed.

Shape of the battle: **crossing and a city of water.** The Cholas arrive by ship in strength; Anuradhapura answers with elephants, archers, its tanks and monks, and a treasury that is empty (the enemy starts with less Kosha).

This batch is **11 images**: 1 battlefield, 1 Durg, 3 Chola cards, 6 Sinhalese cards. The Chola Durg is the Gangaikonda one again, so no new one is needed. Paint the battlefield and Durg first.

## Same rules as before

- Cards portrait 5:7, as large as the tool allows. Durg square. Battlefield landscape 16:9. No text, borders or watermarks.
- **Chola cards**: the Chola era block from `PROMPTS-BATCH2.md`, as in batches 9 and 10 (date "around 993 CE").
- **Sinhalese cards and Durg**: paste the same style block but replace its clothing sentence with this one:

```
Clothing, weapons and architecture of Anuradhapura, the Sinhalese capital of Sri Lanka, around 1000 CE, as seen in Anuradhapura-period stone carving and the Sigiriya frescoes: kings and soldiers of an ancient, rich, learned island kingdom (dignified, disciplined): cotton cloths wrapped at the waist with decorated sashes, jewelled crowns and tall turbans for the king, many strands of beads and gold armlets, round and oblong shields, curved swords, long bows and spears, war elephants with painted foreheads, Buddhist monks in saffron robes, great white bell-shaped stupas (dagobas), carved stone moonstones and guardstones at doorways, large stone reservoirs (wewas) with stepped banks, lotus ponds, coconut and palm trees; the same Indian miniature painting style.
```

- Add "full figure with clear space above the head and below the feet" for single-person cards.
- Upload cards and the Durg to `art/source/cards/`, the battlefield to `art/source/battlefields/`, named exactly as below.

---

## Battlefield and Durg (2)

**`anuradhapura.png`, battlefield, landscape 16:9** (Chola block, landscape)
```
Top-down painted cloth map of the outskirts of Anuradhapura in Sri Lanka: a huge white bell-shaped stupa in one corner, a great stone reservoir with stepped banks and lotus along the top edge, green paddy fields and coconut palms along the bottom, a paved road with carved stone moonstone steps in the middle edge, monastery walls and small shrines, a few elephants and bullock carts on the road. Same layout as the other battlefields: details only around the edges, the middle open and calm, aged cloth texture.
```

**`durg_anuradhapura.png`, the Sinhalese capital** (Sinhalese block, square)
```
The royal city of Anuradhapura seen from the front: a vast white stupa with a gold pinnacle rising over a walled city, stone steps with carved moonstones, a palace hall with tall stone pillars, a great reservoir in front with lotus flowers, palm trees, saffron-robed monks, war elephants at the gate, soft evening light. Symmetrical like the other Durgs.
```

## Chola cards (3)

| File | Card | Prompt |
| --- | --- | --- |
| `ch_vandiyadevan.png` | **Vallavaraiyan Vandiyadevan** (the general named in Chola records, 5 cost unit) | A Chola commander in a plain turban and gold-edged armour on the deck of a large ship, one hand on the mast, a long sword at his side, tiger banner above, the island coast visible ahead, calm and ready. |
| `ch_marakkalam.png` | **Marakkalam** (order: the crossing, draw 2 and gain Kosha) | Dozens of Chola ships with tiger sails crossing a bright blue strait at dawn, soldiers and horses on the decks, a sense of a fleet in order. |
| `ch_valangai.png` | **Valangai Regiment** (elite infantry unit) | A Chola Valangai soldier, one of the famed right-hand regiments, standing in lamellar armour with a round shield and a short sword, a tiger-emblem sash, a beach and a ship behind him, a steady, disciplined stance. |

## Sinhalese cards (6)

| File | Card | Prompt |
| --- | --- | --- |
| `si_mahinda.png` | **Mahinda V** (the king, 6 cost unit) | A crowned Sinhalese king in a jewelled collar and tall turban standing before a white stupa, one hand raised, a sword at his side, monks and a few loyal soldiers behind him, a tired but dignified ruler, full figure. |
| `si_gaja.png` | **Anuradhapura Gaja** (war elephants) | Two painted war elephants of Anuradhapura with howdahs and archers, standing before a white stupa, mahouts holding hooks, dust rising. |
| `si_dhanu.png` | **Sinhala Dhanurdhar** (archers, ranged unit) | A Sinhalese archer on a reservoir bank, long bow drawn, a coconut grove behind him, plain cotton cloth and a sash, a steady aim. |
| `si_bhikkhu.png` | **Maha Thera** (elder monk, draws a card) | A senior Buddhist monk in a saffron robe seated with a palm-leaf manuscript in a stone-pillared hall, a lamp beside him, a stupa glimpsed through the doorway, a calm, wise face. |
| `si_wewa.png` | **Wewa Jala** (order: the tank, gain Kosha and heal) | A vast stone reservoir at sunrise, stepped banks, lotus flowers in bloom, irrigation sluices and paddy fields below, farmers and a stone sluice gate, golden light on the water. |
| `si_ruhuna.png` | **Ruhuna Veera** (highland warrior, melee unit) | A Sinhalese warrior from the southern highlands of Ruhuna with a spear and round shield, a bare chest with bead necklaces, green hills and rock behind him, an alert, ready stance. |

---

## After the pictures arrive

Claude builds the battle (`lanka.ts`), adds the cards to `cards.json`, a History note ("c. 993 CE", Chola record and the Culavamsa both given, Mahinda V's unpaid army, the island completed c. 1017, ended 1070, battle invented), tests balance, and puts it in the Chola campaign. Planned effects: Vandiyadevan (deploy +1 attack to the line), Marakkalam (draw 2, gain 1 Kosha), Valangai (Raksha, tough); Mahinda V (Raksha, elephants +1), Anuradhapura Gaja (trample), Dhanurdhar (ranged), Maha Thera (draw), Wewa Jala (heal 4, gain 2 Kosha), Ruhuna Veera (cheap melee). The Sinhalese start with 0 Kosha (the empty treasury).

A note on order: chronologically Lanka (c. 993) comes first, then the Ganga (c. 1021), then Kadaram (c. 1025). The map lets the player open any battle; the order can be changed in `campaign.ts` if Pon prefers chronology.
