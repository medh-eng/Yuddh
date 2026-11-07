# YUDDH art prompts: batch 5, "The Golden Age"

The first battle of the Gupta campaign. Around 409 CE, Chandragupta II (called Vikramaditya, "Sun of Valour"), son of Samudragupta, marched west against the Western Kshatrapas, the last of the Saka (Scythian) dynasties that had ruled Gujarat and Malwa for three centuries from Ujjain. Their last king, Rudrasimha III, fell, and Ujjain became the Gupta's second capital. His court was said to hold nine great scholars, the Navaratna, among them the poet Kalidasa. In Delhi stands the Iron Pillar of his age, which has not rusted in 1,600 years.

Little is known about the fighting itself, so the cards are drawn from the armies and the court of the time.

This batch is **11 images**: 2 Durgs, 5 Satrap (Saka) cards and 4 Gupta cards. The battlefield is already painted (`ujjain.png`). Paint the two Durgs first, then the Satraps, then the Gupta cards.

## Same rules as before

- Cards are portrait 5:7. Durgs are square. No text, borders or watermarks.
- For **Gupta** cards, paste the **Maurya and neutral era style block** from `PROMPTS-BATCH2.md`, but swap its "Clothing, weapons…" sentence for the **Gupta** sentence in that file.
- For **Satrap** cards, use the Gupta block, then replace the clothing sentence with this one:

```
Clothing and weapons of the Western Kshatrapas (Saka, from the Central Asian steppe) around 400 CE: pointed felt caps and cloth helmets, long belted tunics over trousers and boots, quilted and scale coats, recurved composite bows, long lances, horses with ornate saddle cloths, quicker and more angular than the Indian figures; the same Indian miniature painting style, so that they look foreign and tough but painted by the same hand.
```

- Upload cards and Durgs to `art/source/cards/`, named exactly as below.
- Add "full figure with clear space above the head and below the feet" for single-person cards, as before.

---

## The setting (2): Durgs, square

**`durg_ujjain.png`: the Gupta capital, Ujjain** (Gupta block)
```
The golden-age city of Ujjain on the Shipra river: a high earth-and-brick rampart with gate towers, early Hindu temple spires and a great Shiva temple rising behind, a Gupta garuda banner on the gate, scholars and merchants at the river steps, warm golden evening light on gold-leaf domes. Rich, learned and secure.
```

**`durg_satrap_camp.png`: the Satrap stronghold** (Satrap block)
```
A fortified Saka-Kshatrapa stronghold on a dry Malwa plain: a thick mud-brick wall with square towers, felt tents and wagons crowded behind it, horse herds in a corral, banners of the Western Kshatrapas, dusty air and a low red sun. Tough, foreign, nomad-turned-lord.
```

## The Satrap army (5)

**`sa_rudrasimha.png`: Rudrasimha III, the last Kshatrapa king** (unit; Satrap block)
```
Rudrasimha III, the last Western Kshatrapa king, a proud heavy-set man with a thick moustache and a pointed gold-embroidered cap, wearing a quilted scale coat and a long cloak, holding a lance and sitting on an armoured horse, his horsemen and a dry walled city behind him. Defiant, doomed, dignified.
```

**`sa_ashva_dhanurdhar.png`: Saka horse-archers** (unit; Satrap block)
```
Saka horse-archers at full gallop across dry grassland, the nearest rider large in the foreground twisted in the saddle shooting a recurved bow backwards, pointed cap, long tunic, quiver on his hip, more riders behind in a loose swarm, dust and long shadows.
```

**`sa_bhalladhari.png`: Saka lancers** (unit; Satrap block)
```
Heavily armoured Saka cavalry advancing at a trot with long lances levelled, the nearest rider large in the foreground, scale coat and pointed helmet, his horse in quilted barding, a wall of lance points behind him against a red sky.
```

**`sa_marubhumi.png`: the desert storm** (order; Satrap block)
```
A huge wall of sand and dust rolling across a plain toward a city, horsemen riding at its edge half hidden in the storm, a few figures covering their faces with cloth, the sun a dim orange disc. Fierce and swirling, a force of nature on the Satraps' side.
```

**`sa_mudra.png`: silver mudra and the caravans** (order; Satrap block)
```
A heavily laden trade caravan of camels and wagons arriving at a gate, a Saka moneychanger counting piles of silver drachma coins stamped with a king's profile, merchants from far lands in bright cloth, bales of silk and sacks of spice, warm lamp light. The wealth that paid for the Satraps' armies.
```

## The Gupta court (4)

**`g_vikramaditya.png`: Chandragupta II, Vikramaditya** (unit; Gupta block)
```
Chandragupta II, called Vikramaditya, a tall handsome emperor in the prime of his life, gold crown and jewelled collar, wearing fine armour of the golden age over a silk cloth, one hand on a long straight sword, a great Garuda standard and his war elephants behind him, calm confidence as if the battle is already won.
```

**`g_navaratna.png`: the Nine Gems** (order; Gupta block)
```
Nine learned men seated in a semicircle in a Gupta court hall, each different: an astronomer with a star chart, a poet with a palm-leaf book, a physician with herbs, a mathematician with a counting board, a scribe, a musician with a veena, and so on, an emperor on a throne seen from behind in the foreground, oil lamps glowing. Wisdom as an army.
```

**`g_kalidasa.png`: Kalidasa the poet** (unit; Gupta block)
```
Kalidasa, the poet of the golden age, a lean thoughtful man in white muslin with a gold necklace, writing on a palm-leaf manuscript with a reed pen, sitting on a stone bench in a palace garden, flowering trees, a peacock and a clouded sky behind him. Gentle, inspired.
```

**`g_loha_stambha.png`: the Iron Pillar** (yantra; Gupta block)
```
A tall slender iron pillar with a lotus capital standing in the courtyard of a Gupta temple, the metal dark and smooth with a faint gold shine, rows of lamps at its base, pilgrims touching it with their hands, golden evening sky. Quiet, ancient, unbreakable.
```

---

## Music for the Gupta campaign (3 pieces, optional)

The game plays its standard music until these are delivered, then switches to them for The Golden Age automatically. Upload to `art/source/sfx/`, WAV or MP3, 2–4 minutes, each looping cleanly. The Gupta age was the age of the veena, flute and courtly song: softer and more melodic than the Maurya pieces, with the war drums arriving later.

| File name | Mood | Prompt for the music tool |
| --- | --- | --- |
| `music_gupta_briefing` | Warm, courtly, storytelling | `Indian classical court music, 4th century India, a slow raga Yaman on veena with a soft tanpura drone and a distant bansuri flute, gentle tabla in the background, warm and thoughtful, golden-age poetry, no vocals, cinematic, seamless loop` |
| `music_gupta_calm` | Steady tension, riding to war | `Cinematic Indian orchestral underscore, a steady dhol and pakhawaj pulse at walking pace, sarangi and bansuri melody in raga Marwa, low brass-like drones, the feeling of a cavalry army riding west at dusk, tense but dignified, no vocals, seamless loop` |
| `music_gupta_intense` | Fast, driving, cavalry battle | `Fast cinematic Indian battle music, galloping rhythm on dhol and nagara in a fast 16-beat cycle, shehnai and sarangi leading a driving melody in raga Bhairavi, bursts of brass-like drones, an urgent horse-charge feeling, no vocals, seamless loop` |

(As before, check the music tool's licence terms for commercial use.)

## Sounds

Nothing is missing: all effects arrived in batch 4. If you want to add new ones for The Golden Age, say so and I will wire them: a **horse gallop** (0.8 s) and a **wind and sand gust** (1 s) for Marubhumi Toofan.

---

Once these paintings are in, The Golden Age becomes the first battle of the Gupta campaign: Samudragupta's son against the Satraps of Ujjain, with Navaratna and the Iron Pillar in your deck.
