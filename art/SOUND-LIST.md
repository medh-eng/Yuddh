# YUDDH sound list

The game already plays synthesised stand-ins for every sound. **Any recording you add replaces its stand-in automatically, one sound at a time**, so add them in any order.

## Where to put files

Upload to `art/source/sfx/` on GitHub, named exactly as below. WAV or MP3 both work. I convert and trim them to small game files.

## Where sounds can come from

- **Record them yourself.** The best option for the signature sounds: a real shankh, a temple bell, a dhol or nagara, a bowstring. A phone in a quiet room works; hold it 30–50 cm away.
- **Pixabay Sound Effects** (pixabay.com/sound-effects): free, commercial use allowed, no attribution needed.
- **Freesound** (freesound.org): use only files marked CC0 for the Play Store release.
- Avoid anything taken from films, TV or other games.

## Sound effects (18)

Short is better: most should be under 1 second. Leave no silence at the start.

| File name | What it should sound like | Length | Priority |
| --- | --- | --- | --- |
| `conch` | A shankh blown: turn start, Shakti cards | 1.5–2.5 s | ★ first |
| `drum` | One deep nagara or dhol hit: enemy turn start | 0.5–1 s | ★ first |
| `clash` | Sword striking sword or shield | 0.3–0.6 s | ★ first |
| `bow` | Bowstring release with arrow whoosh | 0.3–0.5 s | ★ first |
| `arrowHit` | Arrow thudding into wood or a shield | 0.2–0.4 s | ★ first |
| `deploy` | A heavy footfall or thump, like troops landing in place | 0.3–0.5 s | ★ first |
| `fortHit` | Battering ram on a timber gate, with debris | 0.8–1.2 s | ★ first |
| `elephant` | War elephant trumpeting | 0.8–1.5 s | ★ first |
| `cardDraw` | Palm-leaf or thick paper sliding | 0.1–0.2 s | |
| `cardPlay` | A card placed firmly on a wooden table | 0.2–0.3 s | |
| `march` | A few marching footsteps with jingling anklets | 0.5–0.8 s | |
| `death` | A short, dignified fall: cloth, metal, a body to the ground (not gory) | 0.5–0.8 s | |
| `coin` | Gold coins clinking (treasury cards) | 0.3–0.5 s | |
| `yantra` | A trap springing: wooden mechanism snap with a bell shimmer | 0.5–0.8 s | |
| `fire` | A whoosh of fire catching | 0.8–1.2 s | |
| `click` | A soft wooden tap for buttons | under 0.1 s | |
| `victory` | Conch plus a short triumphant phrase on shehnai or brass | 2–4 s | |
| `defeat` | A slow, falling phrase on bansuri or a single deep drum | 2–3 s | |

## Music (6 pieces)

Indian instruments over a cinematic bed: shehnai, bansuri, pakhawaj, nagara, dhol, tanpura, sarangi. Each piece should loop cleanly (its end flows back into its start). WAV or MP3, 2–4 minutes.

| File name | Mood | Suggested raga or feel |
| --- | --- | --- |
| `music_title` | Grand, slow, ceremonial | Darbari: court and kingship |
| `music_briefing` | Thoughtful, low, storytelling | Tanpura drone with bansuri |
| `music_battle_calm` | Tension building, steady pulse | Marwa: dusk before battle |
| `music_battle_intense` | Driving drums, urgent | Pakhawaj and nagara rhythm, fast taal |
| `music_victory` | Triumphant, 20–40 s, does not loop | Bhairav: dawn |
| `music_defeat` | Sorrowful, 20–30 s, does not loop | Slow sarangi |

**About AI music tools** (for example Suno or Udio): most only allow commercial use on a paid plan. Check the terms before generating anything that will ship on the Play Store. Recording local musicians in Nagpur would give the game a sound nobody else has.
