# YUDDH art prompts: batch 13, "The Second Battle of Tarain" (1192) and a Rajput map

The second half of the Rajput campaign's story. In **1192 CE**, a year after his wounding at Tarain, Mu'izz al-Din Muhammad of Ghor returned to the same plain with a rebuilt army and won. The Persian chroniclers (Minhaj-i Siraj, and Hasan Nizami who covers this campaign closely) describe a Ghurid army that kept its heavy cavalry in reserve, wore the Rajput line down with mounted archers and then struck hard; Prithviraj's host broke, and Prithviraj himself was captured and later killed (accounts of how and when differ). Delhi and Ajmer soon came under Ghurid rule, and Qutb al-Din Aibak, the sultan's slave-general, stayed behind as governor.

Facts the game keeps honest (same rules as batch 12: `docs/HISTORY-RESEARCH.md` §7.3):
- **No troop numbers, no speeches, no dialogue; Prithviraj Raso is not evidence.** The famous legends (the blinded Prithviraj, the arrow, the poet Chand Bardai) are later and are left out.
- **Dignity for both armies**, no caricature of faith or ethnicity.
- **What changed from 1191, in play:** the Ghurids no longer charge into the Rajput centre. They shoot, withdraw, bait the line and then send the reserve.
- This is the battle the player is **likely to lose if they play it like the first**. Open design question for Pon below.

**Design question (answer whenever you like, batch 13 can be painted either way):** should the player command **the Rajputs** (a hard, likely-lost fight, played for the lesson) or **the Ghurids** (the winning side, the sultan's patient plan)? Claude's suggestion: the player leads the **Ghurids** in battle 2 (a win teaches why the first Tarain was not the end), and a short epilogue on the screen tells the Rajput side's story. Both sets of cards are in this batch, so nothing is wasted.

This batch is **8 cards and 1 map**. The battlefield (`tarain.png`) and both Durgs from batch 12 are reused.

## Same rules as batch 12

- Cards portrait 5:7. The Rajput block and Ghurid block are the ones in `PROMPTS-BATCH12.md`. Add "full figure with clear space above the head and below the feet" for single-person cards. No text, borders or watermarks.
- Upload to `art/source/cards/` with the exact names below. The map goes to `art/source/battlefields/` (landscape 16:9, rules in `PROMPTS-MAPS.md`).

## Ghurid cards (4)

| File | Card | Prompt |
| --- | --- | --- |
| `gh_aibak.png` | **Qutb al-Din Aibak** (the sultan's slave-general, commander unit) | A Ghurid general in a mail shirt under a dark-green quilted coat, a round steel helmet, a sabre at his hip, standing in front of a line of his horsemen and pointing across a plain with one hand, a calm, shrewd face, the sultan's dark-green standard behind him, dust and low hills. |
| `gh_reserve.png` | **Mailed Reserve** (heavy cavalry held back, 6 cost unit) | A tight formation of heavily armoured Ghurid horsemen waiting in rank behind a low rise, mail and quilted coats, lances upright, armoured horses with dark-green saddle-cloths, the dawn light on their helmets, the silence before a charge. |
| `gh_feint.png` | **Feigned Flight** (order: horse archers wheel away and return) | A group of Ghurid horse archers turning in their saddles to shoot back as they gallop away across a dusty plain, a pursuing line of Rajput cavalry strung out behind them, the sultan's heavy horse waiting in the far distance, dust and low sun. |
| `gh_dawn.png` | **Dawn Charge** (order: the whole line strikes together) | The Ghurid line sweeping forward at first light across a flat plain, lances down, kettle-drums on a camel at the left edge, dark-green banners streaming, the Rajput camp small and still in the distance, long golden shadows. |

## Rajput cards (3)

| File | Card | Prompt |
| --- | --- | --- |
| `r_skanda.png` | **Skandaraja** (Chahamana commander; Skanda is named among Prithviraj's captains in later Persian accounts) | A grey-bearded Rajput general in mail and a saffron quilted coat, a round shield on his arm, a talwar drawn, standing in front of the Chahamana banner at dawn and looking at the horizon with a worried, steady face, the camp behind him. |
| `r_rana.png` | **Rana's Clan Foot** (clan infantry unit) | A line of Rajput clan infantry in quilted coats and turbans with round shields and spears, each man wearing his clan's colour on his turban, standing close together on a dusty plain, saffron banners above them, early light. |
| `r_charan.png` | **Charan Bard** (court poet who rides with the host; deploy: draw a card, restore 2 defence) | A court poet in a white robe and an orange turban on a mule at the edge of a Rajput camp, a palm-leaf scroll in one hand and the other raised as if reciting, soldiers in quilted coats listening around a fire, evening light. |

## Map (1)

| File | Prompt |
| --- | --- |
| `map_rajput.png` | See the Rajput entry added to `PROMPTS-MAPS.md` today. |

---

## After the pictures arrive

Claude builds `tarain2.ts` (the second Rajput-tab battle), the cards, a History note (1192, Persian sources, no numbers, "accounts differ" on Prithviraj's fate and on Tabarhinda), balance tests and the Rajput map. Planned effects: Aibak (Vega, deploy +1 attack to the line), Mailed Reserve (heavy Vega cavalry), Feigned Flight (2 damage to the enemy front line), Dawn Charge (+1 attack to all, draw 1); Skandaraja (Raksha, deploy +1 attack to the line), Rana's Clan Foot (cheap, sturdy), Charan Bard (draw a card, heal 2).
