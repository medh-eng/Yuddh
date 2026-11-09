# YUDDH: Rise of the Rajyas — design

*What the game is, how it plays, and why it is built this way. Updated at the end of each session (last: 9 Nov 2026). Tasks live in `TASKS.md`; technical working notes for Claude live in `CLAUDE.md`.*

## Vision
A KARDS-style tactical card game of ancient Indian empires, for **web now and Google Play later (landscape only)**. History, not mythology: real armies with epic unit names (Rathi, Maharathi, Atirathi), no gods as units. Tone: a "living miniature": Indian miniature painting, each empire's card frame carved from its own material (Maurya sandstone, Gupta gold, Chalukya red sandstone, Chola bronze, Rajput silver).

Owner: Pon (directs the work, generates all art with AI image tools from prompts Claude writes). Live: https://medh-eng.github.io/Yuddh/ · repo: https://github.com/medh-eng/Yuddh (public).

## The rules in one page
- **Board:** each side has a **Rajya line** (up to 4 units) behind a shared **Yudhbhumi** (front, up to 4 units, held by one side at a time). Each side has a **Durg** (capital, 24 health). Destroy the enemy Durg to win.
- **Kosha** is the resource: +1 maximum every turn. Cards cost Kosha; advancing or attacking costs the unit's *order cost* (the bronze coin, usually 1).
- **Turn:** play cards, advance units from the Rajya line to the Yudhbhumi, attack. A unit either advances **or** attacks in a turn, except **charging classes** (Cavalry, Chariot, Elite Chariot, Legendary Warrior). Only units on the Yudhbhumi can strike the Durg; a **Raksha** unit on the defender's Rajya line guards the Durg and must fall first.
- **Melee trades blows** (both deal damage); **ranged** units strike without a counter-blow.
- **Promotion:** a unit that destroys an enemy and survives becomes Veer (+1 health), then Mahaveer (+1 attack, +1 health more).
- **Trample:** a War Elephant that crushes a unit carries the spare damage to that side's Durg.
- **Seasons (Ritu):** Sharad (none), Varsha (mud: nothing advances and attacks in one turn), Grishma (ranged deal 1 less), Hemanta (+1 Kosha each turn). Chosen by the battle's seed.
- **Dharma–Kuta meter** (−3..+3 under each Durg): fair melee kills +1 Dharma; hidden traps, poison and spies −1. At +3 the Durg strikes +1 harder; at −3 orders and Yantras cost 1 less.
- **Morale and rout:** a blow that leaves a unit at or below a third of its maximum health (rounded up), when it was above that line before, breaks it. It flees to the Rajya line (if there is room), takes no action in its owner's next turn, then rallies. A routed unit strikes no counter-blow, and cutting it down earns no Dharma. An attacker that is broken by the counter-blow breaks too, unless it destroyed its foe. **Never broken:** Raksha shield-walls, Legendary Warriors, Mahaveer (twice-honoured) units, every unit of an army whose standard-bearer (Raja Dhwaja) still stands, and every unit of an army at full Dharma (+3). All numbers are in `rules.json` ("morale").
- **Yantras** are face-down traps that spring on their own trigger (when the enemy deploys, attacks your Durg, or attacks your unit).
- **River boats** (Sindhu Nauka): up to two ready Rajya-line units cross to the Yudhbhumi free and may strike that turn.
- **Pikes** (Seleucid Phalanx): a melee unit that advanced this turn and strikes it takes 2 extra damage.
- Two rulesets exist: `'classic'` (the original prototype, replayed by the golden test) and `'yuddh'` (everything above, and all new work). New rule changes go behind `st.rules === 'yuddh'`.

## Campaigns (Maurya "Rise of Magadha", then Gupta "The Golden Age")
| # | Battle | Enemy | Status |
|---|---|---|---|
| 0 | The Training Ground | Nanda border post (coached by Chanakya) | Done |
| 1 | The First Throne, Pataliputra, c. 321 BCE | Nanda court (Dhana Nanda, elephants, gold) | Done, approved at Gate 1 |
| 2 | The Indus Line, c. 305 BCE | Seleucus Nicator: pike phalanx, Companion cavalry, Cretan archers, stone-throwers | Built 7 Nov (all 10 batch 4 paintings in) |
| G1 | The Golden Age, Ujjain, c. 409 CE (Gupta campaign) | Rudrasimha III and the Western Satraps: horse-archers, lancers, silver, desert storm | Built 7 Nov |

Not locked: any battle can be started from the campaign map; a laurel marks battles won, "NEXT" marks the next unwon one. Winning a battle offers the next one. The nine battles of the prototype (`src/campaign/missions.ts`) are the later campaign's skeleton; the agreed direction is cinematic briefings, mid-battle events and an original narrator voice (not an imitation of a real person).

## Second campaign: The Golden Age (Gupta)
Battle 1 (built 7 Nov): Chandragupta II (Vikramaditya) against the Western Satraps (Saka, Rudrasimha III) at Ujjain, c. 409 CE. Theme: the Satraps are fast and fragile (horse-archers, lancers, silver for Kosha, a desert storm); the Gupta win with court and craft (Navaratna draws cards and moves toward Dharma, the Iron Pillar wards the Durg, Kalidasa draws). Balance ~53% (band 45–70%). Prompts in `art/PROMPTS-BATCH5.md`. A scenario may carry its own music (`Scenario.music`, falls back to the standard pieces) and the new sound effects `gallop` (cavalry) and `sandGust` (Marubhumi).

## The enemy's mind (AI levels)
- **easy / normal / hard:** the prototype's heuristics (golden-tested on the classic rules), made morale-aware under the Yuddh rules. Every battle is balanced against **normal** playing both sides.
- **search (Veteran foe):** `src/engine/search.ts`. Each turn it beam-searches its own sequences of plays, advances and attacks on copies of the board; unseen cards (the player's hand, hidden Yantras, its own deck order) are re-dealt at random so it never reads hidden information; the best finished turns are tested against the player's reply (the careful 'hard' heuristics, on three different re-deals) and it plays the first part of the best plan, planning again whenever the real game shows something it could not know. About 10 ms a turn. It beats the normal AI about 85% of the time over both seats (tests/search.test.ts). Sizes are in `rules.json` ("ai").
- The player chooses the foe on every briefing: **Foe: Standard** (default) or **Foe: Veteran** (one setting for the whole game, `src/campaign/difficulty.ts`). The tutorial is always standard.

## Art and sound
- Pon paints every card, Durg and battlefield from Claude's prompt sheets (`art/PROMPTS-*.md`) and uploads masters to `art/source/{cards,battlefields,sfx}/` named exactly by card id. `npm run assets` makes the game files; credits in `art/CREDITS.md`.
- Fonts: Cinzel (titles, names, numbers), Alegreya Sans (rules text), Cormorant Garamond (story lines only).
- Sound effects from Pixabay; music generated with Google Gemini (Pon confirmed commercial use).

## Architecture
- **Engine** (`src/engine/`): pure TypeScript, no DOM. Rules, AI, events. Runs in browser and node.
- **Data** (`src/data/`): *all balance lives in JSON.* `cards.json` (every card and empire), `decks.json` (the decks of each battle), `rules.json` (ranks, seasons, Dharma limit, charge classes, Kuta cards). A balance change is an edit there, never a code rewrite. Order effects that fit common patterns are data-driven too (`power`, `hqDamage`, `draw`, `dharma`, `reprisal` fields); a new *kind* of effect needs a few lines in `rules.ts`.
- **Campaign** (`src/campaign/`): scenario definitions (story text, Durgs, AI level, setup) + `campaign.ts` (order, progress). Decks come from `decks.json`.
- **Renderer** (`src/game/`): PixiJS 8 + GSAP; two screen modes (desktop 1920×1080 design space; phone landscape 720-high). Scenes: title, campaign map, battle, card gallery, preview.
- **Tests** (`tests/`): golden traces (154 games from the prototype, never break), rules, card mechanics, battle balance (AI vs AI win-rate bands), scripted real-mouse playtests in `tests/e2e/`.

## Balance targets (AI "normal" vs AI "normal", 200 seeded games)
- The First Throne: player side 55–80% (now ~62%, ~16 turns).
- The Indus Line: player side 45–70% (now ~55%, ~16 turns). Deliberately harder than the first battle; a human beats the AI more often than the AI beats itself.

## Gupta march south (built 9 Nov 2026)
Two Gupta battles from Samudragupta's southern expedition (Allahabad Pillar, Harishena): **The Great Forest** (Vyaghraraja of Mahakantara: Dhuan ambushers, forest elephants, a Kuta snare, ~49%) and **The Walls of Kanchi** (Vishnugopa, Pallava: Raksha walls, elephants, chariots, scholars, ~53%). The Gupta side adds Harishena (draw), Dakshinapatha (+1 attack, Kosha) and Grahana-Moksha (heal, draw, Dharma: "captured, then released"). Campaign order: Digvijaya, Great Forest, Kanchi, Golden Age. Where the Pillar is silent (battle sites, fights) the History notes say the game invents them.

## Decisions log
- 3 Nov 2026: web + TypeScript + Vite + PixiJS + GSAP; Google Play via wrapper in Phase 5; name "YUDDH: Rise of the Rajyas"; repo public.
- 4 Nov: Gate 1 (the look) approved.
- 5–6 Nov: KARDS-style reading panels and damage shields; seasons; Dharma–Kuta; tutorial; batch 3 cards.
- 7 Nov: UI polish (11 items); board units stay in straight lines (any unit can attack any enemy, so a zig-zag would teach the wrong rule); data moved out of code into `src/data/*.json`; The Indus Line + campaign map built; Seleucid cards use the neutral (teak) frame and their own gallery tab.
- 8 Nov: **Morale and rout** (Yuddh rules only; the classic ruleset and golden traces are untouched). Rebalanced by decks: Nanda lose one Rakshak and one Maharathi, Seleucids one Hetairoi, Naga one Chakravyuha (+ an Aakraman). **Search AI** and the Standard/Veteran foe choice. Batch 8 prompts for the march south.

## Chola campaign: Rajendra's Sea Road (built 9 Nov 2026)
Battle 1, **Kadaram** (c. 1025 CE): Rajendra I's fleet against Sangrama Vijayottungavarman, a Srivijaya port king. The Chola player has the Naval Supremacy passive (ranged units +1 attack), archers, marines, the Kalam warship, a merchant-guild guard that pays for itself and Rajendra (+1 attack to all). Kadaram answers with Raksha walls (Perahu Wall, harbour guards), harbour archers, a captain who rallies his line, a rich king and fire boats. About 63% for the player over 200 normal-vs-normal games. The History note says the battle is invented; the inscriptions only list what was taken. Next: **The Ganga Road** (c. 1019–22; the general Araiyan Rajarajan led it while Rajendra waited on the Godavari; Mahipala I of the Pala empire; conquests not kept), prompts in `art/PROMPTS-BATCH10.md`.

## Faction mastery (proposal, not built)
KARDS levels each nation with play. For YUDDH the same idea would be a light **empire rank**: wins and battles played with an empire's cards earn "Yash" (renown); at set levels the empire unlocks cosmetic card frames and a title, one extra starting card choice in its campaign and a Kirti bonus. Not stat boosts (they would break the balance bands) and no pay-to-win currency. See the answer in the session notes before building.
