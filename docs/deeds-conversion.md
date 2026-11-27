# Deeds conversion and Moria loot

Release target 0.9.0. The [rules review](deeds-moria-review.md), [incoming skill review](deeds-tree-review.md) and [current Forge ledger](deeds-forge-node-ledger.md) define the scope. Advance the following checkpoints on the implementation branch. Mark each complete only with playable evidence.

| Checkpoint | Acceptance |
|---|---|
| Saves and development | A copy of a 0.8.8 combat run, reserve, Hall, equipment, XP, spent Grit and recall passage survive migration. A player can rebuild choices in town. New origin, attribute, DP, class signature, mastery and resource rules agree between creation, preview and play. |
| Combat and care | Test each effect independently at Weak, Standard and Strong. Verify casting, resistance, forced movement, dying, stabilized defense, Grit, scars, first aid, interrupted camp and safe rest in the four-hero loop. |
| Loot and knowledge | Identify gives the complete gear card when identification finishes. An eligible wearer gains an unknown item's active damage in the attack preview immediately. Shops sell labeled stock. Discoveries persist per run. Confirm drops, consumable use, charged devices and rare resurrection through inventory, town, combat, recall and reload. |
| Floor and Forge | A seeded vault has two ways in, a trapkeeper, alarm, lock, ore, identifiable bottle and recoverable tool. Each purchasable skill changes an implemented interaction. Test dedicated and hybrid builds at levels 1, 3, 7 and 10. |
| Ship | Check old-to-new upgrade, isolated native Linux play, expedition balance and both installer platforms. Stage licensed assets, test actual installers, publish and verify the public update feed after all checkpoints pass. |

## Breadth that players can feel

Koeneke's VMS catalog has 44 distinct potion names, 40 scroll names, 24 wand names and 23 staff names. Some reach the same effect in different ways. Stone to Mud can buy a route, detection can buy information, teleport-away can buy time, and a poorly understood device can even heal or hasten a monster. These offer different reasons to carry something into the next room. [VMS object catalog](https://github.com/dungeons-of-moria/vms-moria/blob/adce6c8/source/include/values.inc)

| Family to support | Example decisions for four heroes |
|---|---|
| Damage and exposure | Give the Flame-trained frontliner the Ember Edge or equip a reach weapon to protect the archer. Damage types, range and conditional riders appear in the attack preview. |
| Control and rescue | Pin the alarm runner, repel a pack, lure it away with a decoy or pull a fallen ally behind the guard. |
| Terrain and routes | Spend a limited tunnel charge to reach a seam, bridge a gap, force a barricade or retreat to a mapped exit. |
| Perception and knowledge | Locate a hidden mechanism, read enemy intent, reveal an invisible threat or appraise a recovered item. |
| Recovery, light and supplies | Weigh antitoxin, a beacon, a water refill, a ration cache and a charged healing device against the same carrying capacity. |
| Equipment synergies and risk | Slay tagged enemies, react to an ally being hit, or trade stronger damage for a drawback that the party can manage. |
| Expedition and the town | Return scrolls, keys, recipes, rare ritual resources and saleable ore compete with another round of combat loot. |

Count a new capability when the target, timing, route, resource, interaction or party decision changes. Track the families actually encountered during seeded play at shallow, middle and deep floors, the distribution of effects per carrier and the share of pickups immediately sold. Use the tabletop disciplines and finite-use equipment as different ways into these choices. A noncaster should be able to spend a scarce charge to solve a problem a specialist can solve repeatedly.

## Occurrence in the original

The original VMS death routine first checks what the species carries, then independently rolls the flagged quantity chances and adds any guaranteed dice. The random integer is 1–100, so the two literal comparisons give 59% and 89%. Of 279 template entries, 160 have neither object nor gold flags, 115 have both, three only objects and one only gold. A kobold can drop one object or gold pile 59% of the time. A Black Orc gets an 89% chance. A Young Blue Dragon combines both chances with a guaranteed 1d2, giving one to four payouts and 2.98 on average before placement. The original top quantity flag actually rolls 4d3. Umoria uses 4d2. Ordinary object quality follows dungeon depth. [VMS death routine](https://github.com/dungeons-of-moria/vms-moria/blob/adce6c8/source/include/moria.inc#L2319-L2340) · [creature flags](https://github.com/dungeons-of-moria/vms-moria/blob/adce6c8/source/include/values.inc) · [Umoria death routine](https://github.com/dungeons-of-moria/umoria/blob/3bf8abc/src/monster.cpp#L1399-L1460)

A floor makes a room-only ordinary object pass centered on seven placements, an eligible-floor object pass centered on two, and a separate gold pass centered on two. Each uses a standard deviation of three. A normal item draw selects a catalog row eligible for the depth. One draw in twenty opens the full pool. For chests this yields approximately 0.087% of ordinary object draws at depth 1, 0.766% at depth 7, 1.23% at depth 25 and 1.74% at depth 50. These are per draw. Generating a chest and obtaining its contents are separate events. A surviving small wooden chest can be empty (4.51%) or pay twice. A surviving large steel chest pays 2d2 times. Traps resolve before contents and an explosion can destroy the chest. [Floor allocation](https://github.com/dungeons-of-moria/vms-moria/blob/adce6c8/source/include/generate.inc#L851-L866) · [base draw](https://github.com/dungeons-of-moria/vms-moria/blob/adce6c8/source/include/misc.inc#L1723-L1775) · [opening a chest](https://github.com/dungeons-of-moria/vms-moria/blob/adce6c8/source/include/moria.inc#L2710-L2758)

FLD should separately roll source, number of rewards, category, eligible item and power. Recoverable creature tools should match the creature's role. Give treasure rooms a reason to explore, preserve essential market stock, and record claims before XP or further encounters can process the same kill again.

## 0.9.0 qualification

The executable Forge contains 427 circles in 23 displayed discipline origins, with 77 paths, 33 confluences and three class signature choices at each of three tiers for each of ten classes. The five new paths have seven sections. Existing dungeon paths retain their authored lengths. The original source review records deferred tabletop and narrative abilities. The 52 dungeon finds comprise 22 potions, nine scrolls, 13 wands, six implements and two ritual offerings. The separate return scroll keeps its existing passage behavior.

Run `node scripts/deeds-migration-check.mjs` with the 0.8.8 tag fetched. It runs the tagged engine to make an old combat save, loads it in the current engine, extracts, rebuilds a hero and reloads the result. Assertions cover an active encounter, reserve, Hall, return passage, original hero ID, possessions, XP, spent Grit and injury history. Both stages use a synthetic company and temporary storage.

Run `node scripts/deeds-balance-check.mjs` for the fixed-seed survey. Each row covers 64 independently generated floors for a four-hero company. From level three it includes a legal Flaming Arrow hybrid. From level seven the party also contains a dedicated Arms mastery. Each floor resolves the carrying roll for every generated creature. The merchant exercise takes the first eight accessible non-guardian items, keeps all magical finds and sells duplicate ordinary supplies with a positive price. The final column describes that scripted company's choices.

| Hero level / depth | Creatures | Carriers with loot | Carriers with two items | Enchanted pieces | Distinct dungeon finds | Pickups sold / sampled |
|---|---:|---:|---:|---:|---:|---:|
| 1 / 1 | 1,609 | 597 | 0 | 75 | 26 | 112 / 512 |
| 3 / 6 | 2,302 | 876 | 45 | 162 | 51 | 117 / 512 |
| 7 / 12 | 2,458 | 916 | 60 | 139 | 50 | 107 / 512 |
| 10 / 20 | 2,461 | 957 | 55 | 161 | 50 | 105 / 512 |

The 256 floors contained 99 optional vaults. One run's discoveries are independent of another's. This samples availability and stock turnover. Actual player preferences, perceived difficulty and whole-campaign retreat frequency require player sessions.

### Combat pacing

`node scripts/deeds-encounter-check.mjs` runs a four-hero doorway drill against three foes with the live action resolver, defense reactions and creature AI. It uses 16 matched dice seeds per row for each policy. Heroes hold position, accept Shield Block, decline opportunity prompts and withdraw when anyone drops. The referee stops the drill after ten rounds. The only difference between policies is whether the arcanist uses the learned Ember Lance. Both companies can use Flaming Arrow from level three.

| Hero level | Opposition | Without Lance, clears / 16 | Median rounds | With Lance, clears / 16 | Median rounds |
|---:|---|---:|---:|---:|---:|
| 1 | Wolves | 11 | 6 | 16 | 4 |
| 3 | Goblin Spearhands | 15 | 5 | 16 | 3.5 |
| 7 | Barrow Guards | 16 | 6.5 | 16 | 5 |
| 10 | Wights | 15 | 9 | 16 | 7 |

Without Lance there were six withdrawals and one ten-round stop. With Lance all 64 fights cleared. Ranged magical offense earns a place in these compositions. The encounter shape favors a stationary caster. Walls, lighting, ambushes, attrition and a human player's positioning can change the result.
