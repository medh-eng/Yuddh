# YUDDH art prompts: batch 12, "The First Battle of Tarain" (Rajput campaign, battle 1)

The opening of the **Rajput** campaign, and the first time the player is the Rajput side. In **1191 CE** Mu'izz al-Din Muhammad of Ghor (Muhammad bin Sam), ruler of Ghur and Ghazni, took the fortress of **Tabarhinda** (Bathinda) from the Chahamana realm and left a garrison in it. **Prithviraj III Chauhan** of Ajmer and Delhi marched out against him with his feudatories and the two armies met at **Tarain** (modern Taraori, Haryana). Minhaj-i Siraj (Tabaqat-i Nasiri, 1260) and later Persian chroniclers record that the Ghurid army was beaten and that Mu'izz al-Din was wounded and carried from the field; Minhaj credits **Govind Rai of Delhi** with the wound. Prithviraj then besieged Tabarhinda; later accounts differ on whether it fell or the garrison held until the sultan returned. **A year later, in 1192, the sultan came back** and won the second battle of Tarain (that is batch 13, later). The game's campaign is built on that gap: one victory did not settle the conflict.

Facts the game keeps honest (see `docs/HISTORY-RESEARCH.md` §7.3; Cynthia Talbot, *The Last Hindu Emperor*, is the careful modern study):

- **No troop numbers and no speeches.** The big figures in later retellings are not period evidence. The *Prithviraj Raso* is a much later poem and is not used as an eyewitness.
- **The battle itself is invented**; the sources give the outcome and a few names, not the fight.
- **Both armies are painted with dignity.** The Ghurid army is a disciplined, rich, professional force (horse archers, Turkic *ghulam* guards, hill infantry from Ghur), not a horde. No caricature of faith or ethnicity.
- Period look: late twelfth century, **mail, quilted coats, lances, stirrups, armoured horses, kettle-drums, brick and sandstone forts**. Not European plate armour.

Shape of the battle: **cavalry and dust.** The Rajputs have the home plain, elephants and a fort behind them (a slow, strong line, with Vega riders). The Ghurids have fast horse archers and a drummed signal that makes the whole line push at once.

This batch is **12 images**: 2 Durgs, 4 Rajput cards, 6 Ghurid cards. **The battlefield is already painted** (`tarain.png`), and the hero is the existing Prithviraj card. Paint the two Durgs first.

## Same rules as before

- Cards portrait 5:7, as large as the tool allows. Durgs square. No text, borders or watermarks.
- **Rajput cards and Durg**: the Rajput era block from `PROMPTS-BATCH2.md` (the c. 1150 CE one; say "around 1191 CE").
- **Ghurid cards and Durg**: paste the same style block but replace its clothing sentence with this one:

```
Clothing, weapons and architecture of the Ghurid sultanate of Ghur and Ghazni (eastern Afghanistan) around 1190 CE, as seen in Ghurid brick architecture and the Indo-Persian manuscript tradition: a disciplined, rich, professional army (dignified, never caricatured): mail shirts under quilted coats, round steel helmets with mail neck-guards, turbans and sashes, round shields, curved sabres, lances, composite bows, armoured horses with saddle-cloths, large kettle-drums carried on camels, brick and mud-brick forts with arched gateways and tall fluted brick minarets; the same Indian miniature painting style.
```

- Add "full figure with clear space above the head and below the feet" for single-person cards.
- Upload to `art/source/cards/` with the exact names below.

---

## Durgs (2)

**`durg_ajmer.png`, the Rajput capital** (Rajput block, square)
```
The hill-fort of Taragarh above the Chahamana capital Ajmer: a long sandstone wall climbing a rocky hill, round bastions and a gate with saffron banners, a city of flat-roofed houses and temples below, a calm lake (Anasagar) in front with a marble-white pavilion on its bank, war elephants and cavalry at the gate, warm evening light. Symmetrical, seen from the front, like the other Durgs.
```

**`durg_ghurid_camp.png`, the Ghurid camp at Tarain** (Ghurid block, square)
```
A Ghurid army camp on a dry plain at dusk: a large royal tent with a gold finial and dark-green and white banners, rows of smaller tents, armoured horses tethered in lines, a pair of large kettle-drums on camels in the foreground, cooking fires, a brick fort with an arched gate in the far distance, soldiers at rest in an orderly camp. Symmetrical, seen from the front, like the other Durgs.
```

## Rajput cards (4)

| File | Card | Prompt |
| --- | --- | --- |
| `r_govindaraja.png` | **Govindaraja of Delhi** (the Tomara lord of Delhi, a feudatory of Prithviraj; 5 cost unit) | A Rajput noble in mail and a saffron quilted coat on an armoured horse, a long lance couched under one arm and aimed at an unseen foe, a round shield on his back, the dust of a charge behind him, a fierce, clear-eyed face, full figure on the horse. |
| `r_sawar.png` | **Rajput Sawar** (armoured lancer, cavalry unit) | A single Rajput horseman at a gallop on a plain, lance lowered, quilted armour coat, round shield with a boss, a saffron pennant on the lance, sandy dust flying from the hooves, a flat dry horizon behind him. |
| `r_durgapala.png` | **Chahamana Durgapala** (fort guard, Raksha unit) | A Rajput fort guard standing in a sandstone gateway, a large round shield and a short spear, a mail shirt and a saffron turban, thick walls and a bastion behind him, calm and unmoving. |
| `r_samanta.png` | **Samanta Sabha** (order: the feudatories gather, draw cards) | A Rajput war council under a striped tent at dawn: several nobles in turbans and quilted coats standing around Prithviraj's seat, each with a banner of his own clan, lances stacked outside, horses waiting beyond the tent flap. |

## Ghurid cards (6)

| File | Card | Prompt |
| --- | --- | --- |
| `gh_muizz.png` | **Mu'izz al-Din Muhammad of Ghor** (the sultan, 6 cost unit) | A Ghurid sultan in a mail shirt under a dark-green quilted coat, a plain steel helmet with a neck-guard and a short plume, a curved sabre at his hip, mounted on an armoured horse, one hand raised to signal his drummers, a calm, determined face, full figure on the horse. |
| `gh_ghulam.png` | **Ghulam Sawar** (Turkic guard cavalry, heavy cavalry unit) | A heavily armoured Turkic horse-guard in mail and a steel helmet with a mail neck-guard on an armoured horse, a lance and a round shield, a dark-green saddle-cloth with gold edging, a disciplined stance, dry plain and dust behind him. |
| `gh_horse_archer.png` | **Ghurid Horse Archer** (ranged cavalry unit) | A mounted archer at full gallop twisting in the saddle to draw a composite bow, a quiver at his hip, a quilted coat and a round helmet, flying dust and a pale sky, the horse's mane streaming. |
| `gh_ghori.png` | **Ghur Spearman** (hill infantry, Raksha unit) | A Ghurid foot soldier from the hills of Ghur with a long spear and a tall round shield, a mail shirt and a turban, standing his ground on stony ground with a brick fort far behind him, a steady and disciplined stance. |
| `gh_naqqara.png` | **Naqqara** (order: the war-drums, +1 attack to all) | Two large kettle-drums carried on a camel with the drummer beating them, a dark-green banner above, ranks of armoured cavalry behind him turning to the sound, a dusty plain at dawn. |
| `gh_tabarhinda.png` | **The Fort Held** (order: the Tabarhinda garrison, heal and draw) | A brick fort on a mound with an arched gate and tall fluted brick turrets, dark-green banners on the wall, a garrison on the ramparts looking out across a flat plain, supplies and horses in the courtyard, calm light. |

---

## After the pictures arrive

Claude builds the battle (`tarain1.ts`), adds the cards to `cards.json` (Ghurid cards get their own `gh_` gallery tab), a History note ("1191 CE", the Persian and Sanskrit sources both named, Govindaraja credited by Minhaj, no numbers, the 1192 return foreshadowed), tests balance, and starts the **Rajput campaign** tab with this battle. Planned effects: Govindaraja (Vega, hits hard), Sawar (cheap Vega cavalry), Durgapala (Raksha, tough), Samanta Sabha (draw 2, gain 1 Kosha); Mu'izz al-Din (Vega, deploy +1 attack to the line), Ghulam Sawar (heavy cavalry), Horse Archer (ranged, Vega), Ghur Spearman (Raksha), Naqqara (+1 attack to all), The Fort Held (heal 4, draw 1). The Rajput side has the elephants and the Durg walls; the Ghurids have the speed.

Then batch 13 will be **The Second Battle of Tarain (1192)**, where the player leads the Ghurid side or Prithviraj's, whichever Pon prefers when we get there.
