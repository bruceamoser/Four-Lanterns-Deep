# The Living Atlas

Four Lanterns Deep 0.10 uses the discipline and spellbook structure at Deeds of Legend revision `44ef046`. The design history introducing sequential study is in [7609c2f](https://github.com/bruceamoser/deeds-of-legend/commit/7609c2f). Seven-section books are specified in [748fba8](https://github.com/bruceamoser/deeds-of-legend/commit/748fba8). The current [Arms arm](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/arms.md) and [casting procedure](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/rules/magic.md) are the reference points.

## Study and play

The 21 disciplines have four independent arms each. There are 55 technique or passive arms and 29 source books. Class, culture and background each open one discipline. Extra disciplines cost the character’s class price. Each arm requires its preceding stage. Its seven purchases cost 1, 2, 2, 3, 4, 4 and 5 DP.

Measured Cut I deals 2/3/5. Its second stage deals 3/4/6. Its third stage adds Bleeding on Strong. Sweeping Blade turns that same shortcut into an adjacent sweep. Iron Tempest adds a follow-up move. Passive arms add their benefits directly to the relevant system, including armor qualification, crafting, foraging, spell capacity, recovery and market prices.

Each learned source-book section records all its pages in the hero’s personal spellbook. Sections I–IV each add two spells. V–VII each add one. All 319 pages have a game effect and the printed SP cost. A character can cast directly from their book or favorite a page for their combat bar. The source of truth is that hero’s ordered purchases. Creation, recruitment, training, refunds and reloading all derive the same set of pages. A refund removes dependent sections and invalid favorites.

The player sees the digital effect before buying. For example, Boil Liquid becomes Scalding Mist using a water flask. Teleportation Circle opens a return passage to Greyhaven. Knock opens a vault postern. True Resurrection uses the Shrine’s two unique offerings and eight hours. Several tabletop summons become casts representing the summoned creature’s intervention. Portable minions, arbitrary destinations, and freeform conversations are outside this edition’s effect set. Area targeting and some durations and defenses also have dungeon adaptations. A personal spellbook never needs a second inscription or preparation step.

## Digital growth

| Trained level | Total XP | Opens |
| --- | ---: | --- |
| 1 | 0 | Three starting disciplines, basic studies and first signature |
| 2 | 200 | First earned DP |
| 10 | 3,876 | Continued investment |
| 23 | 25,729 | Advanced techniques and sections, second signature and second Grit |
| 67 | 462,935 | Masteries, final sections, third signature and third Grit |
| 100 | 1,463,781 | Final training level |

Starting DP is eight plus Guile, Knowledge and Reason. Each level grants one DP. Adaptable adds one at creation and at each of nine later power bands. A character’s ancestry and class supply the same starting HP and SP as Deeds. Over the remaining 99 levels, the game distributes nine source levels of HP and SP in whole points. Spellcraft and other study benefits are separate. Encounters use the equivalent 1–10 power band plus dungeon depth. XP still rewards discoveries, encounters and recovered treasure equally for surviving expedition members. The curve is a tuning decision. End-to-end hours across a human 100-level campaign have yet to be measured.

Published 0.8 and 0.9 heroes can finish an expedition with their original rules. In Greyhaven, **Adopt the new Atlas** opens the rebuild. The 0.9 edition carries the character’s identity and origins into this preview. Its trained levels 1, 3, 7 and 10 correspond to digital levels 1, 23, 67 and 100. Intermediate XP is carried between corresponding thresholds. Earlier 30-level heroes are mapped across the full 100-level range. Lifetime XP, equipment and history stay on the same hero. Old studies are exchanged for the new budget only on confirmation.

## Source and art

The first-party book titles, section order, printed prices, technique names and nine gold discipline symbols come from Bruce Moser’s Deeds of Legend source at `44ef046`. The nine SVGs in `public/art/discipline-tokens` come from its `design/player-book/art/tokens` directory. The original pinned Foundry import remains in its vendor directory. The effect definitions, UI and digital tuning are game adaptations. The [complete coverage report](linear-atlas-coverage.json) lists the resulting game effects and costs for every purchasable stage. Regenerate it with `npm run coverage:abilities`. The source tables are in `src/core/study-books.mjs` and `study-arms.mjs`, with execution data in `spell-pages.mjs` and `linear-atlas.mjs`.
