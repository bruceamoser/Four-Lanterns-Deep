# November 27 — Deeds rules implementation

Ubuntu, branch `codex/deeds-conversion`, based on merged PR 208 at `3d89fa1`. Implementation is in progress. Follow the [release plan](../../deeds-conversion.md).

- First code checkpoint adds version-three save envelopes with version-two reading, hero-edition-aware development, class prices, creation attribute bounds, distinct origins, HP/SP/Grit grants, positive-HP growth on training, retained SP on respec, basic attacks and the corresponding creation/Forge controls. Legacy heroes can complete their current encounter using their saved build, then choose the town respec to switch.
- Verified the changed budget, growth, respec and default hotbar expectations with focused tests. Release acceptance still requires the rest of the plan, complete source checks, a native upgrade test and actual qualified installers.
- Work in the clean review worktree. Preserve the primary checkout and private assets. No real player save or installed copy is needed for QA.

The discovery checkpoint wires a twelve-kind bottle appearance shuffle into each run, identified public shop stock, paid appraisal, and observation/tried state. Scrolls, wands, snares and two rare Hall offerings are usable from inventory. Creatures have role-based spoils and a saved claim flag. Revision-four enchanted gear can have training gates and rare items have a second compatible property. Legacy generation receipts retain their revision. The Shrine consumes both ritual ingredients and retains the death/return history.
