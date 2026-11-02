# YUDDH — Rise of the Rajyas

A tactical card game of ancient India, in the tradition of WWII card games like KARDS: two
capitals, one contested line between them, and a single treasury that has to pay for both
your army and the orders that command it.

Play it by opening **`index.html`** in any browser — no install, no build step, no network.
It is one self-contained file, so it also works offline and from a phone.

---

## What is in it

- **Nine single-player missions** — a guided tutorial, then eight historical situations from
  the Mauryan rise to the Deccan wars. Fixed decks, fixed situations, three kinds of objective
  (break the Durg, survive N turns, win before a deadline).
- **Five playable empires** — Maurya, Gupta, Chalukya, Chola, Rajput — each with its own passive
  and card pool, plus a neutral mercenary pool.
- **50 cards** across four types: Units, Mantras (one-shot orders), **Yantras** (defence cards set
  face down that spring on the enemy's turn) and **Shakti** (expensive power cards).
- **Meta progression** — battles pay *Kirti*, which buys permanent upgrades. A unit gains +1/+1 per
  level; a Mantra, Yantra or Shakti costs 1 less Kosha per level. Two levels per card, saved in
  the browser.
- **Skirmish** — any empire, any ally, three AI levels, with your upgrades applied.
- **Procedural everything** — card art is SVG generated from each card's identity, sound effects
  and the music bed are synthesised with the Web Audio API. No image or audio files at all, which
  is why the whole game is one 134 KB file.

## The rules in one page

**The board.** Each side has a **Rajya** line (four units) where their Durg — the capital — sits,
and a shared **Yudhbhumi** that only one side can hold at a time. Units in your Rajya can only
strike enemy units standing in the Yudhbhumi; that is how you break an enemy's hold on it. To
reach the enemy Durg or their rear line, a unit must spend Kosha to **advance** into the
Yudhbhumi.

**Kosha.** Every card has a deployment cost. Every move and every attack costs that unit's
**operation cost** again. The treasury grows by one each turn (maximum 12) and refills at the
start of your turn. Over-extend and you own an army you cannot afford to command.

**Combat.** Melee attackers take a counter-blow; ranged attackers do not. A Durg can only be
attacked from the Yudhbhumi.

**Keywords.** *Vega* — acts the turn it arrives. *Raksha* — enemy attacks in that line must hit
it first (it shields units, not your Durg). *Dhuan* — cannot be attacked until it attacks.

**Card types.** *Units* fight. *Mantras* resolve immediately. *Yantras* are set face down (two at
a time) and spring automatically — Vighna destroys a unit as it is deployed, Kavach prevents 4
damage to your Durg, Pratikar punishes any unit that attacks yours. *Shakti* are the decisive
strokes: Agni Baan, Chakravyuha, Ashwamedha.

## The chronicle

| # | Mission | Place | Year | Objective |
|---|---------|-------|------|-----------|
| 0 | The Training Ground | Magadha | tutorial | Break the Durg |
| 1 | The First Throne | Pataliputra | c. 321 BCE | Break the Durg |
| 2 | The Indus Line | the Indus | c. 305 BCE | Break the Durg |
| 3 | The Golden Age | Ujjain | 4th c. CE | Break the Durg |
| 4 | Pulakeshin's Stand | the Narmada | c. 620 CE | Survive 9 turns |
| 5 | The Sea Road | Thanjavur | c. 1014 CE | Break the Durg |
| 6 | Prithviraj's Charge | Tarain | 1191 CE | Break the Durg in 12 turns |
| 7 | The Burning Library | Nalanda | c. 8th c. CE | Break the Durg |
| 8 | Samrat | the Deccan | c. 1160 CE | Break the Durg |

## Project layout

```
index.html          the built game (single file, committed so Pages works)
src/engine.js       rules engine: cards, board, legality, actions, AI, events
src/campaign.js     the nine missions, their decks, objectives and scripted hands
src/meta.js         Kirti, upgrades, saved progress
src/art.js          procedural SVG card art and battlefield backdrop
src/audio.js        procedural Web Audio sound effects and music
src/template.html   the interface (screens, board, animations, codex)
src/build.js        concatenates src/ into index.html
test/               engine tests: card mechanics, mission balance, AI levels
```

Rebuild after editing anything in `src/`:

```bash
node src/build.js
```

## Testing

The rules engine is deliberately free of DOM code, so it can be simulated headlessly:

```bash
node test/yantra-test.js     # 8 mechanics assertions: yantras, shakti, upgrades, events
node test/mission-test.js    # 60 AI-played games per mission, prints win rates
node test/ai-check.js        # AI difficulty levels head to head
```

Current mission win rates, with the AI playing the player's side:

| Mission | Win rate |
|---|---|
| Tutorial / The First Throne | 100% (they are meant to be won) |
| The Indus Line / The Golden Age | 42–47% |
| Pulakeshin's Stand / The Sea Road | 62–65% |
| Prithviraj's Charge / The Burning Library | 55–57% |
| Samrat | 37% |

## Known limitations

- **Skirmish balance is not tight.** Across a round robin the empires land between roughly 40%
  and 68% — Gupta is currently the strongest. The campaign is unaffected because its decks are
  fixed.
- **The AI is heuristic, not searching.** Three levels exist, but "Untried" is the only one that
  is clearly weaker; the other two play about evenly. Mission difficulty comes from the
  situation, not from a deeper opponent.
- **No network play, no accounts, no monetisation** — it is a single-player game by design.

## Roadmap ideas

1. More missions — the engine already supports any scenario, objective and scripted opening hand.
2. A genuinely stronger AI (search over the attack sequence rather than heuristics).
3. Deck building for skirmish, so the card pool becomes a toy rather than a fixed list.
4. Better art: the procedural motifs are a stand-in for real illustrations.

## Licence

No licence file is included, which means the default is all rights reserved. If you want others
to reuse it, add a `LICENSE` (MIT is the usual choice for a project like this).
