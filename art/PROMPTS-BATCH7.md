# YUDDH art prompts: batch 7, "The Narmada Line"

First battle of the third campaign, **Tigers of the South** (Chalukya). You play **Pulakeshin II** of Badami; the enemy is **Harsha of Kanauj**, the great northern emperor. Around 618–630 CE Harsha marched south with his elephant armies and was halted on the Narmada river. The Chalukya court poet **Ravikirti** recorded it in the Aihole inscription (634 CE), so the main source is the winner's own stone record; Harsha's side is known from his court poet **Bana** and the Chinese pilgrim Xuanzang. The date and the details of the fight are not known: the game uses creative freedom and says so.

Pulakeshin's side is the fast, clever hill kingdom (cavalry, a river ford, a banner everyone follows). Harsha's side is wide and heavy (a huge elephant corps, many spearmen, a generous and literary court).

This batch is **11 images**: 2 Durgs, 3 Chalukya cards, 6 Harsha (Vardhana) cards. The battlefield `narmada.png`, `c_pulakeshin`, `c_gaja`, `c_ashvarohi`, `c_senapati` are already painted. Do the two Durgs first.

## Same rules as before
- Cards are portrait 5:7, Durgs square, no text, borders or watermarks. Upload cards and Durgs to `art/source/cards/`, named exactly as below.
- For single people add "full figure with clear space above the head and below the feet".
- **Chalukya cards:** use the Chalukya era block from `PROMPTS-BATCH2.md` as it is.
- **Harsha (Vardhana) cards:** use the Gupta block from `PROMPTS-BATCH2.md`, but replace its clothing sentence with:

```
Clothing and architecture of the Vardhana court of Kanyakubja (Kanauj) around 620 CE, as seen in the Ajanta murals and the terracotta of the Ganges plain: fine white muslin with long scarves, jewelled turbans and ear ornaments, gold crowns for royalty, curved swords, long bows and tall spears, brick palaces with painted pavilions and white stupa-like shrines, a royal banner with a lion; no stirrups, no plate armour; the same Indian miniature painting style, so that they look like the northern court painted by the same hand.
```

---

## Durgs (2)

**`durg_badami.png`, Badami, the Chalukya capital** (Chalukya block, square)
```
Badami, the Chalukya capital, a fort-city between two red sandstone cliffs above a green lake, cave temples carved high in the rock, a stepped stone wall and gate across the narrow valley, the boar (Varaha) banner on the ridge, evening light turning the cliffs deep red. A mountain stronghold that no army reaches easily.
```

**`durg_kanauj.png`, Kanyakubja (Kanauj), Harsha's capital** (Vardhana block, square)
```
Kanyakubja, Harsha's capital on the Ganges, a broad white-and-ochre city with tiers of painted pavilions, gold-topped shrines and a long river wall with boat landings, a royal lion banner over the palace, elephants at the gate, scholars and monks on the steps, warm hazy afternoon light. The richest, widest empire of its age.
```

## Chalukya cards (3)

**`c_varaha_dhwaja.png`, Varaha Dhwaja, the boar banner** (order; Chalukya block)
```
A huge red banner with the Varaha boar emblem raised on a tall pole on a rocky ridge above the Deccan plateau, cavalry and foot soldiers streaming toward it from the plain below, dust and low sun, the banner bright against the sky. Rally and pride.
```

**`c_ravikirti.png`, Ravikirti, the poet of Aihole** (unit; Chalukya block)
```
Ravikirti, a learned court poet in a simple white dhoti and uttariya, seated on the steps of a temple carving verses into a stone slab with a chisel, palm-leaf manuscripts beside him, warriors resting below, the red rock of Aihole behind. Calm and exact: the man who made the victory permanent.
```

**`c_narmada_ghat.png`, Narmada Ghat, the river crossing** (order; Chalukya block)
```
The wide Narmada river at a ford, Chalukya archers and spearmen on the near bank behind planted shields, river boats and rafts tied up as barriers, the far bank covered with elephants and a distant host of tents, mist on the water, tense morning light. A river is the best wall.
```

## Harsha's army (6)

**`vd_harsha.png`, Harshavardhana, Emperor of Kanauj** (unit; Vardhana block)
```
Harsha, emperor of Kanauj, a tall, sensitive, dignified man in his thirties with a simple gold crown and a white scarf, standing on a richly decorated war elephant, one hand holding a sword, the other open as if giving a gift, ministers and a lion banner behind him. Mighty and generous, a poet as well as a general.
```

**`vd_gaja_vahini.png`, Vardhana Gaja Vahini, the elephant corps** (unit; Vardhana block)
```
A column of armoured war elephants with painted foreheads and banners advancing across a plain, the nearest large in the foreground with archers in a howdah and a mahout, dust and long shadows, the line of elephants stretching far into the distance. The famous northern elephant army, slow and overwhelming.
```

**`vd_ashvasena.png`, Kanyakubja Ashvasena, the cavalry** (unit; Vardhana block)
```
Kanyakubja horsemen in white and gold riding at a trot across a green plain, curved swords raised, the nearest rider large in the foreground, turbans streaming, banners and a river behind them. Fine horses and fine riders.
```

**`vd_bhata.png`, Vardhana Bhata, the spearmen** (unit; Vardhana block)
```
A dense block of Vardhana foot soldiers marching with long spears and oblong shields, the nearest man large in the foreground in a white tunic and a turban, rows of spears behind him, a lion banner and a river bank, steady and well-drilled. The weight of a great empire.
```

**`vd_bana.png`, Bana Bhatta, the court poet** (unit; Vardhana block)
```
Bana Bhatta, Harsha's court poet and biographer, a smiling man in a fine turban and white robes, seated on a carpet in a palace pavilion with a palm-leaf manuscript on his knee and a reed pen in his hand, courtiers listening, lamp-light and flowers. Witty, warm, writing the emperor's story.
```

**`vd_prayaga_dana.png`, Prayaga Dana, the great giving** (order; Vardhana block)
```
Harsha at the meeting of the Ganges and Yamuna at Prayaga distributing gifts: tables piled with gold, cloth and jewels, monks and the poor lined up on the sand in a long line, boats on the river, banners and tents on the bank, golden evening light. A king who gave away his treasure on purpose.

---

## When the paintings arrive

Upload to `art/source/cards/`, then Claude runs `npm run assets`, adds the seven cards and two Durgs to `cards.json`, builds `src/campaign/narmada.ts` (deck, story, history notes), a third campaign tab on the map, a test, and checks the balance.
