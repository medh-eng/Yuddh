# YUDDH art prompts: batch 10, "The Ganga Road" (Chola campaign, battle 2)

The second battle of the **Chola** campaign. Around **1019 to 1022 CE** a Chola army marched north from the Godavari through Kalinga and Odisha into Bengal, and its hardest fight was against **Mahipala I of the Pala empire**, the king who had rebuilt the Palas' fortunes and was a patron of the great Buddhist monasteries of Bihar and Bengal. At the end of it the army reached the Ganga and carried its water south. Rajendra then built a new capital, **Gangaikonda Cholapuram** ("the city of the Chola who took the Ganga"), and dug a great tank there, which his inscription calls a **"liquid pillar of victory"**.

Facts the game keeps honest (checked against Rajendra's inscriptions as summarised in standard histories):

- **Rajendra did not lead this march himself.** His general **Araiyan Rajarajan** commanded it; the emperor waited on the Godavari and met the army on its return. So this battle's Chola hero is the **general**, not the emperor. (Rajendra's card from batch 9 can still be in the deck as the one who sends the army.)
- The inscription names the kings beaten on the way (Indraratha of Kalinga, Ranasura of South Radha, Govindachandra of Vangala) and then **Mahipala**. It does not say how the fight went: **the battle is invented**.
- The conquests were **not kept**: the army went home with the water, the tribute and the prestige. The History panel will say so.

Shape of the battle: **a river and elephants.** The Cholas are tired, far from home and fast; the Palas have the home ground, the famous Pala war elephants and boats on the river.

This batch is **12 images**: 1 battlefield, 1 Durg, 4 Chola cards, 6 Pala cards. Paint the battlefield and the Durg first. The Chola Durg is the Gangaikonda one from batch 9; no new one is needed.

## Same rules as before

- Cards portrait 5:7, as large as the tool allows. Durg square. Battlefield landscape 16:9. No text, borders or watermarks.
- **Chola cards**: the Chola era block from `PROMPTS-BATCH2.md`, as in batch 9 (date "around 1021 CE").
- **Pala cards and Durg**: paste the same style block but replace its clothing sentence with this one:

```
Clothing, weapons and architecture of the Pala empire of Bengal and Bihar around 1020 CE, as seen in Pala-period stone and bronze sculpture and palm-leaf manuscript paintings: kings and soldiers of a rich, learned river empire (dignified, disciplined): fine cotton dhotis with sashes, jewelled crowns and tall turbans for the king, long strands of beads, gold armlets and large ear ornaments, bare chests or light cotton jackets, curved swords, long bows, spears and round shields, war elephants with painted foreheads and howdahs, long river boats with raised prows, brick temples with tiered towers and terracotta plaques, stupas and monastery courtyards, banana and palm groves, the wide brown Ganga; the same Indian miniature painting style.
```

- Add "full figure with clear space above the head and below the feet" for single-person cards.
- Upload cards and the Durg to `art/source/cards/`, the battlefield to `art/source/battlefields/`, named exactly as below.

---

## Battlefield and Durg (2)

**`ganga.png`, battlefield, landscape 16:9** (Chola block, landscape)
```
Top-down painted cloth map of the Ganga in Bengal in the monsoon season: the wide brown river along the top edge with long river boats and a ferry, a stone bathing ghat with steps and small shrines in the middle of the bank, a flat green plain of rice fields and banana groves along the bottom, a brick monastery courtyard with a stupa in one corner, a village on a mound, a causeway, cattle and egrets. Same layout as the other battlefields: details only around the edges, the middle open and calm.
```

**`durg_pala.png`, the Pala river fortress** (Pala block, square)
```
A Pala river-fortress town on the Ganga: a brick wall with gate towers, a tall tiered brick temple tower and a white stupa inside, a monastery courtyard, war elephants at the water's edge, long river boats moored at the ghat, banana palms, gold roof ornaments, soft monsoon light. Seen from the front, symmetrical, like the other Durgs.
```

## Chola cards (4)

| File | Card | Prompt |
| --- | --- | --- |
| `ch_araiyan.png` | **Araiyan Rajarajan** (the general, 6 cost unit) | A Chola general in gold-edged armour and a plain turban on horseback at a river bank, one hand pointing north across the water, tiger banner behind, a column of spearmen and elephants following, a calm, tired and determined commander, not an emperor. |
| `ch_velaikkarar.png` | **Velaikkarar** (elite bodyguard unit) | Two Chola royal guards of the Velaikkarar, the king's sworn bodyguard, standing shoulder to shoulder with long swords and round shields, tiger-emblem sashes, a banner above, calm and unmoving. |
| `ch_ganga_jal.png` | **Ganga Jal** (order, heal + draw + Dharma) | Soldiers filling large bronze pots with water at a river ghat at dawn, a brahmin priest blessing them, golden light on the water, pots stacked on a bullock cart for the long road south. |
| `ch_marg.png` | **Kalinga Marg** (order, +1 attack and Kosha) | A long column of Chola soldiers, elephants and baggage carts on a hill road through a green coastal land, tiger banners, the sea glittering far to the right, a sense of a very long march. |

## Pala cards (6)

| File | Card | Prompt |
| --- | --- | --- |
| `pl_mahipala.png` | **Mahipala I** (the Pala king, 7 cost unit) | A crowned Pala king in jewelled collar and tall turban, seated high on a war elephant at the river bank, a spear in one hand, standing monks and banners behind, a dignified and watchful ruler, full figure on the elephant. |
| `pl_gaja.png` | **Pala Gaja** (war elephants) | Two Pala war elephants with painted foreheads and howdahs charging along a river bank, mahouts with hooks, archers in the howdahs, spray from the water. |
| `pl_nauka.png` | **Nauka Sena** (river boat archers) | A line of long river boats with raised prows on the wide brown Ganga, archers standing and drawing long bows, a banner at the stern, a misty morning. |
| `pl_dhanurdhar.png` | **Gauda Dhanurdhar** (archers, ranged unit) | A Pala foot archer kneeling on a river bank with a long bow and a quiver, a banana grove behind him, plain cotton clothes, a calm steady aim. |
| `pl_acharya.png` | **Vihara Acharya** (scholar, draws a card) | A Buddhist monastery teacher in a plain robe, standing in a brick courtyard with a palm-leaf manuscript in his hands, a stupa and a few students behind him, a thoughtful face. |
| `pl_baadh.png` | **Ganga Baadh** (order: the monsoon flood) | The Ganga in flood, brown water spilling over its banks across fields and a causeway, a few boats and a bullock cart caught in the current, grey monsoon sky. |

---

## After the pictures arrive

Claude builds the battle (`ganga.ts`), adds the cards to `cards.json`, a History note ("c. 1019–1022 CE", the general led it, the emperor waited on the Godavari, Mahipala named, battle invented, conquests not kept), tests balance, and puts it in the Chola campaign after Kadaram. Planned card effects: Araiyan (deploy: +1 attack to the line), Velaikkarar (Raksha, tough), Ganga Jal (heal, draw, one step toward Dharma), Kalinga Marg (+1 attack to all, +1 Kosha); Pala: Mahipala (Raksha, elephants get +1), Pala Gaja (trample), Nauka Sena (ranged), Dhanurdhar, Vihara Acharya (draw), Ganga Baadh (damage to every enemy on the Yudhbhumi).

A note on order: the real events run Ganga (c. 1021) before Kadaram (c. 1025). The map lets the player open any battle, and the "NEXT" marker follows list order. If Pon prefers chronology, Kadaram and Ganga swap places in `campaign.ts` (one line).
