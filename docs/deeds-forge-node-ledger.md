# Existing Forge purchases at the Deeds conversion

Snapshot of the 377 shipped node IDs at FLD `87f1d67`. Use these stable IDs when translating saves. Each row identifies the declared behavior and the main dependency to check before re-offering it. These are catalog-level findings. The named engine operation can have different costs, timing or legal targets under the new rules. See the [tree review](deeds-tree-review.md) for the play decisions.

## Flame

| Existing node | Purchase | Current effect | Conversion check |
|---|---|---|---|
| `flame:origin` | Flame | discipline access | Remap to the distinct origin choices, class price and new discipline taxonomy. |
| `flame:rank2` | Flame II | rank and enchantment access | Map old equipment eligibility and purchased investments to specific learned path steps. |
| `flame:rank3` | Flame III | rank and enchantment access | Map old equipment eligibility and purchased investments to specific learned path steps. |
| `flame:0:0` | Ember Lance | Ember Lance · damage, condition | Map into a spellbook section, apply class casting and the printed SP/action cost. |
| `flame:0:1` | Hot spark | damage, condition · improve Ember Lance | Check an observable change to the learned parent after remapping. |
| `flame:0:2` | Kindling | passive burning | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `flame:0:3` | Searing lance | damage, condition · improve Ember Lance | Check an observable change to the learned parent after remapping. |
| `flame:1:0` | Flame Fan | Flame Fan · damage | Map into a spellbook section, apply class casting and the printed SP/action cost. |
| `flame:1:1` | Feed the fire | passive burningDamage | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `flame:1:2` | Firebreak | Firebreak · zone | Map into a spellbook section, apply class casting and the printed SP/action cost. |
| `flame:1:3` | Sunburst | Sunburst · damage | Map into a spellbook section, apply class casting and the printed SP/action cost. |
| `flame:2:0` | Ash Veil | Ash Veil · zone, buff | Map into a spellbook section, apply class casting and the printed SP/action cost. |
| `flame:2:1` | Thick ash | zone, buff · improve Ash Veil | Check an observable change to the learned parent after remapping. |
| `flame:2:2` | Searing Mark | Searing Mark · buff | Map into a spellbook section, apply class casting and the printed SP/action cost. |
| `flame:2:3` | Pyre | passive fire | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `flame:3:0` | Cinderlight | Cinderlight · zone | Map into a spellbook section, apply class casting and the printed SP/action cost. |
| `flame:3:1` | Lasting ember | zone · improve Cinderlight | Check an observable change to the learned parent after remapping. |
| `flame:3:2` | Heat shield | passive barrier | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `flame:3:3` | Phoenix spark | passive killHeal | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |

## Marksmanship

| Existing node | Purchase | Current effect | Conversion check |
|---|---|---|---|
| `marksmanship:origin` | Marksmanship | discipline access | Remap to the distinct origin choices, class price and new discipline taxonomy. |
| `marksmanship:rank2` | Marksmanship II | rank and enchantment access | Map old equipment eligibility and purchased investments to specific learned path steps. |
| `marksmanship:rank3` | Marksmanship III | rank and enchantment access | Map old equipment eligibility and purchased investments to specific learned path steps. |
| `marksmanship:0:0` | Bow attack | Bow Attack · damage | Universal basic attack. Offer a technique upgrade at this position. |
| `marksmanship:0:1` | Steady release | replace ranged profile with 1/2/2 | Reprice against the free universal attack. Apply strongest replacement once. |
| `marksmanship:0:2` | Draw weight | replace ranged profile with 1/2/3 | Reprice against the free universal attack. Apply strongest replacement once. |
| `marksmanship:0:3` | Killing flight | replace ranged profile with 2/3/5 | Reprice against the free universal attack. Apply strongest replacement once. |
| `marksmanship:0:4` | Twin Shot | Twin Shot · damage | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `marksmanship:1:0` | Far sight | passive rangedRange | Reprice around 6/12/18 range bands and extended-range modifiers. |
| `marksmanship:1:1` | Long draw | passive rangedRange | Reprice around 6/12/18 range bands and extended-range modifiers. |
| `marksmanship:1:2` | Hunter’s Focus | Hunter’s Focus · buff | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `marksmanship:1:3` | Horizon shot | passive rangedRange | Reprice around 6/12/18 range bands and extended-range modifiers. |
| `marksmanship:2:0` | Barbed Volley | Barbed Volley · damage, condition | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `marksmanship:2:1` | Open wounds | passive bleeding | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `marksmanship:2:2` | Serrated arrow | damage, condition · improve Barbed Volley | Check an observable change to the learned parent after remapping. |
| `marksmanship:2:3` | Piercing Flight | Piercing Flight · damage | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `marksmanship:3:0` | Point-blank Shot | Point-Blank Shot · damage, push | Retest legal destination, Stability and actual impact using Deeds collision timing. |
| `marksmanship:3:1` | Leg Shot | Leg Shot · damage, condition | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `marksmanship:3:2` | Moving aim | passive moveDamage | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `marksmanship:3:3` | Covering Shot | Covering Shot · damage, buff | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |

## Wilderness

| Existing node | Purchase | Current effect | Conversion check |
|---|---|---|---|
| `wilderness:origin` | Wilderness | discipline access | Remap to the distinct origin choices, class price and new discipline taxonomy. |
| `wilderness:rank2` | Wilderness II | rank and enchantment access | Map old equipment eligibility and purchased investments to specific learned path steps. |
| `wilderness:rank3` | Wilderness III | rank and enchantment access | Map old equipment eligibility and purchased investments to specific learned path steps. |
| `wilderness:0:0` | Snaring Roots | Snaring Roots · zone | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `wilderness:0:1` | Tight roots | zone · improve Snaring Roots | Check an observable change to the learned parent after remapping. |
| `wilderness:0:2` | Hunting Snare | Hunting Snare · zone | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `wilderness:0:3` | Waiting snare | zone · improve Hunting Snare | Check an observable change to the learned parent after remapping. |
| `wilderness:1:0` | Field Replenishment | Field Replenishment | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `wilderness:1:1` | Forager Remedies | Forager Remedies · passive hp | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `wilderness:1:2` | Trail packs | passive capacity | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `wilderness:1:3` | Hardy traveler | passive hp | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `wilderness:2:0` | Briar Lash | Briar Lash · damage, pull | Retest legal destination, Stability and actual impact using Deeds collision timing. |
| `wilderness:2:1` | Long briar | damage, pull · improve Briar Lash | Retest legal destination, Stability and actual impact using Deeds collision timing. |
| `wilderness:2:2` | Tearing thorns | passive bleeding | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `wilderness:2:3` | Thorny lash | damage, pull · improve Briar Lash | Retest legal destination, Stability and actual impact using Deeds collision timing. |
| `wilderness:3:0` | Brush Cover | Brush Cover · buff | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `wilderness:3:1` | Thick canopy | buff · improve Brush Cover | Check an observable change to the learned parent after remapping. |
| `wilderness:3:2` | Nightfall | Nightfall · zone, buff | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `wilderness:3:3` | Forest step | passive movement | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |

## Life

| Existing node | Purchase | Current effect | Conversion check |
|---|---|---|---|
| `life:origin` | Life | discipline access | Remap to the distinct origin choices, class price and new discipline taxonomy. |
| `life:rank2` | Life II | rank and enchantment access | Map old equipment eligibility and purchased investments to specific learned path steps. |
| `life:rank3` | Life III | rank and enchantment access | Map old equipment eligibility and purchased investments to specific learned path steps. |
| `life:0:0` | Mending Touch | Mending Touch · heal | Distinguish universal Stabilize, SP healing, condition care and first-aid allowance. |
| `life:0:1` | Kind touch | heal · improve Mending Touch | Distinguish universal Stabilize, SP healing, condition care and first-aid allowance. |
| `life:0:2` | Distant touch | heal · improve Mending Touch | Distinguish universal Stabilize, SP healing, condition care and first-aid allowance. |
| `life:0:3` | Renewal | passive heal | Distinguish universal Stabilize, SP healing, condition care and first-aid allowance. |
| `life:1:0` | Living Ward | Living Ward · barrier | Map into a spellbook section, apply class casting and the printed SP/action cost. |
| `life:1:1` | Living shelter | barrier · improve Living Ward | Check an observable change to the learned parent after remapping. |
| `life:1:2` | Renewal Circle | Renewal Circle · zone | Map into a spellbook section, apply class casting and the printed SP/action cost. |
| `life:1:3` | Sheltering care | passive healingWard | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `life:2:0` | Cleanse Blood | Cleanse Blood · cleanse | Map into a spellbook section, apply class casting and the printed SP/action cost. |
| `life:2:1` | Pure blood | cleanse · improve Cleanse Blood | Check an observable change to the learned parent after remapping. |
| `life:2:2` | Renew Flesh | Renew Flesh · wound, heal | Replace wound-table interaction with distinct Deeds medical care. |
| `life:2:3` | Second breath | passive hp | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `life:3:0` | Vital Spark | Vital Spark · heal | Distinguish universal Stabilize, SP healing, condition care and first-aid allowance. |
| `life:3:1` | Bright spark | heal · improve Vital Spark | Distinguish universal Stabilize, SP healing, condition care and first-aid allowance. |
| `life:3:2` | Life Spring | Life Spring · zone | Map into a spellbook section, apply class casting and the printed SP/action cost. |
| `life:3:3` | Abundant spring | zone · improve Life Spring | Check an observable change to the learned parent after remapping. |

## Medicine

| Existing node | Purchase | Current effect | Conversion check |
|---|---|---|---|
| `medicine:origin` | Medicine | discipline access | Remap to the distinct origin choices, class price and new discipline taxonomy. |
| `medicine:rank2` | Medicine II | rank and enchantment access | Map old equipment eligibility and purchased investments to specific learned path steps. |
| `medicine:rank3` | Medicine III | rank and enchantment access | Map old equipment eligibility and purchased investments to specific learned path steps. |
| `medicine:0:0` | Field Care | Field Care · stabilize, cleanse | Distinguish universal Stabilize, SP healing, condition care and first-aid allowance. |
| `medicine:0:1` | Clean dressing | stabilize, cleanse · improve Field Care | Distinguish universal Stabilize, SP healing, condition care and first-aid allowance. |
| `medicine:0:2` | Dressing Maker | Dressing Maker · passive heal | Distinguish universal Stabilize, SP healing, condition care and first-aid allowance. |
| `medicine:0:3` | Practiced care | stabilize, cleanse · improve Field Care | Distinguish universal Stabilize, SP healing, condition care and first-aid allowance. |
| `medicine:1:0` | Field Antidote | Field Antidote · cleanse, heal | Distinguish universal Stabilize, SP healing, condition care and first-aid allowance. |
| `medicine:1:1` | Strong antidote | cleanse, heal · improve Field Antidote | Distinguish universal Stabilize, SP healing, condition care and first-aid allowance. |
| `medicine:1:2` | Purging Tonic | Purging Tonic · cleanse | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `medicine:1:3` | Deep purge | cleanse · improve Purging Tonic | Check an observable change to the learned parent after remapping. |
| `medicine:2:0` | Emergency Care | Emergency Care · stabilize, heal | Distinguish universal Stabilize, SP healing, condition care and first-aid allowance. |
| `medicine:2:1` | Rapid recovery | stabilize, heal · improve Emergency Care | Distinguish universal Stabilize, SP healing, condition care and first-aid allowance. |
| `medicine:2:2` | Battle Surgeon | Battle Surgeon · stabilize, heal | Distinguish universal Stabilize, SP healing, condition care and first-aid allowance. |
| `medicine:2:3` | Surgeon’s hands | passive heal | Distinguish universal Stabilize, SP healing, condition care and first-aid allowance. |
| `medicine:3:0` | Clear Head | Clear Head · cleanse | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `medicine:3:1` | Clear mind | cleanse · improve Clear Head | Check an observable change to the learned parent after remapping. |
| `medicine:3:2` | Field signal | cleanse · improve Clear Head | Check an observable change to the learned parent after remapping. |
| `medicine:3:3` | Healthy reserve | passive hp | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |

## Radiance

| Existing node | Purchase | Current effect | Conversion check |
|---|---|---|---|
| `radiance:origin` | Radiance | discipline access | Remap to the distinct origin choices, class price and new discipline taxonomy. |
| `radiance:rank2` | Radiance II | rank and enchantment access | Map old equipment eligibility and purchased investments to specific learned path steps. |
| `radiance:rank3` | Radiance III | rank and enchantment access | Map old equipment eligibility and purchased investments to specific learned path steps. |
| `radiance:0:0` | Dawn Ray | Dawn Ray · damage | Map into a spellbook section, apply class casting and the printed SP/action cost. |
| `radiance:0:1` | Bright ray | damage · improve Dawn Ray | Check an observable change to the learned parent after remapping. |
| `radiance:0:2` | Judgment’s Cone | Judgment’s Cone · damage | Map into a spellbook section, apply class casting and the printed SP/action cost. |
| `radiance:0:3` | Luminous edge | passive radiant | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `radiance:1:0` | Guiding Light | Guiding Light · zone, reveal | Require actual unrevealed information and persist the discovery. |
| `radiance:1:1` | Steady beacon | zone, reveal · improve Guiding Light | Require actual unrevealed information and persist the discovery. |
| `radiance:1:2` | Revealing Brand | Revealing Brand · reveal, condition, zone | Require actual unrevealed information and persist the discovery. |
| `radiance:1:3` | Distant brand | reveal, condition, zone · improve Revealing Brand | Require actual unrevealed information and persist the discovery. |
| `radiance:2:0` | Dawn Shield | Dawn Shield · barrier, cleanse | Map into a spellbook section, apply class casting and the printed SP/action cost. |
| `radiance:2:1` | Strong dawn | barrier, cleanse · improve Dawn Shield | Check an observable change to the learned parent after remapping. |
| `radiance:2:2` | Halo Ward | Halo Ward · barrier | Map into a spellbook section, apply class casting and the printed SP/action cost. |
| `radiance:2:3` | Halo strength | passive barrier | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `radiance:3:0` | Kindle Courage | Kindle Courage · cleanse, buff | Map into a spellbook section, apply class casting and the printed SP/action cost. |
| `radiance:3:1` | Lasting courage | cleanse, buff · improve Kindle Courage | Check an observable change to the learned parent after remapping. |
| `radiance:3:2` | Warmth | passive heal | Distinguish universal Stabilize, SP healing, condition care and first-aid allowance. |
| `radiance:3:3` | Dawn reserve | passive hp | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |

## Frost

| Existing node | Purchase | Current effect | Conversion check |
|---|---|---|---|
| `frost:origin` | Frost | discipline access | Remap to the distinct origin choices, class price and new discipline taxonomy. |
| `frost:rank2` | Frost II | rank and enchantment access | Map old equipment eligibility and purchased investments to specific learned path steps. |
| `frost:rank3` | Frost III | rank and enchantment access | Map old equipment eligibility and purchased investments to specific learned path steps. |
| `frost:0:0` | Winter Bolt | Winter Bolt · damage, condition | Map into a spellbook section, apply class casting and the printed SP/action cost. |
| `frost:0:1` | Cold point | damage, condition · improve Winter Bolt | Check an observable change to the learned parent after remapping. |
| `frost:0:2` | Deep chill | passive freezing | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `frost:0:3` | Winter reach | damage, condition · improve Winter Bolt | Check an observable change to the learned parent after remapping. |
| `frost:1:0` | Frost Patch | Frost Patch · zone | Map into a spellbook section, apply class casting and the printed SP/action cost. |
| `frost:1:1` | Slow thaw | zone · improve Frost Patch | Check an observable change to the learned parent after remapping. |
| `frost:1:2` | Glacial Wall | Glacial Wall · zone | Map into a spellbook section, apply class casting and the printed SP/action cost. |
| `frost:1:3` | Ice armor | passive barrier | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `frost:2:0` | Brittle Armor | Brittle Armor · condition, buff | Map into a spellbook section, apply class casting and the printed SP/action cost. |
| `frost:2:1` | Fracture | passive shatter | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `frost:2:2` | Splinter | passive shatter | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `frost:2:3` | Permafrost | passive permafrost, damage | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `frost:3:0` | Cool Blood | Cool Blood · cleanse | Map into a spellbook section, apply class casting and the printed SP/action cost. |
| `frost:3:1` | Calm blood | cleanse · improve Cool Blood | Check an observable change to the learned parent after remapping. |
| `frost:3:2` | Dousing Rain | Dousing Rain · zone | Map into a spellbook section, apply class casting and the printed SP/action cost. |
| `frost:3:3` | Rime Shell | Rime Shell · barrier | Map into a spellbook section, apply class casting and the printed SP/action cost. |

## Calling

| Existing node | Purchase | Current effect | Conversion check |
|---|---|---|---|
| `calling:origin` | Calling | discipline access | Remap to the distinct origin choices, class price and new discipline taxonomy. |
| `calling:rank2` | Calling II | rank and enchantment access | Map old equipment eligibility and purchased investments to specific learned path steps. |
| `calling:rank3` | Calling III | rank and enchantment access | Map old equipment eligibility and purchased investments to specific learned path steps. |
| `calling:0:0` | Spirit Ward | Spirit Ward · barrier | Map into a spellbook section, apply class casting and the printed SP/action cost. |
| `calling:0:1` | Strong spirit | barrier · improve Spirit Ward | Check an observable change to the learned parent after remapping. |
| `calling:0:2` | Patient spirit | barrier · improve Spirit Ward | Check an observable change to the learned parent after remapping. |
| `calling:0:3` | Spirit shelter | passive barrier | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `calling:1:0` | Spirit Needle | Spirit Needle · damage | Map into a spellbook section, apply class casting and the printed SP/action cost. |
| `calling:1:1` | Keen whisper | damage · improve Spirit Needle | Check an observable change to the learned parent after remapping. |
| `calling:1:2` | Phantom Sentry | Phantom Sentry · zone | Map into a spellbook section, apply class casting and the printed SP/action cost. |
| `calling:1:3` | Lingering sentry | zone · improve Phantom Sentry | Check an observable change to the learned parent after remapping. |
| `calling:2:0` | Spectral Hand | Spectral Hand · pull | Retest legal destination, Stability and actual impact using Deeds collision timing. |
| `calling:2:1` | Distant hand | pull · improve Spectral Hand | Retest legal destination, Stability and actual impact using Deeds collision timing. |
| `calling:2:2` | Spirit Crossing | Spirit Crossing · swap | Map into a spellbook section, apply class casting and the printed SP/action cost. |
| `calling:2:3` | Far crossing | swap · improve Spirit Crossing | Check an observable change to the learned parent after remapping. |
| `calling:3:0` | Wisp Lantern | Wisp Lantern · zone | Map into a spellbook section, apply class casting and the printed SP/action cost. |
| `calling:3:1` | Watchful wisp | zone · improve Wisp Lantern | Check an observable change to the learned parent after remapping. |
| `calling:3:2` | Ancestral Guidance | Ancestral Guidance · buff | Map into a spellbook section, apply class casting and the printed SP/action cost. |
| `calling:3:3` | Enduring guidance | buff · improve Ancestral Guidance | Check an observable change to the learned parent after remapping. |

## Mind

| Existing node | Purchase | Current effect | Conversion check |
|---|---|---|---|
| `mind:origin` | Mind | discipline access | Remap to the distinct origin choices, class price and new discipline taxonomy. |
| `mind:rank2` | Mind II | rank and enchantment access | Map old equipment eligibility and purchased investments to specific learned path steps. |
| `mind:rank3` | Mind III | rank and enchantment access | Map old equipment eligibility and purchased investments to specific learned path steps. |
| `mind:0:0` | Mind Needle | Mind Needle · damage | Map into a spellbook section, apply class casting and the printed SP/action cost. |
| `mind:0:1` | Sharp thought | damage · improve Mind Needle | Check an observable change to the learned parent after remapping. |
| `mind:0:2` | Fracture Focus | Fracture Focus · damage, condition | Map into a spellbook section, apply class casting and the printed SP/action cost. |
| `mind:0:3` | Mental edge | passive mental | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `mind:1:0` | Telekinetic Shove | Telekinetic Shove · push, condition | Retest legal destination, Stability and actual impact using Deeds collision timing. |
| `mind:1:1` | Strong shove | push, condition · improve Telekinetic Shove | Retest legal destination, Stability and actual impact using Deeds collision timing. |
| `mind:1:2` | Force Hand | Force Hand · push | Retest legal destination, Stability and actual impact using Deeds collision timing. |
| `mind:1:3` | Psychic impact | passive impact | Retest legal destination, Stability and actual impact using Deeds collision timing. |
| `mind:2:0` | Distract | Distract · buff | Map into a spellbook section, apply class casting and the printed SP/action cost. |
| `mind:2:1` | Persistent distraction | buff · improve Distract | Check an observable change to the learned parent after remapping. |
| `mind:2:2` | Mindstorm | Mindstorm · damage, condition | Map into a spellbook section, apply class casting and the printed SP/action cost. |
| `mind:2:3` | Dazed prey | passive dazed | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `mind:3:0` | Shared Focus | Shared Focus · buff | Map into a spellbook section, apply class casting and the printed SP/action cost. |
| `mind:3:1` | Distant focus | buff · improve Shared Focus | Check an observable change to the learned parent after remapping. |
| `mind:3:2` | Lasting focus | buff · improve Shared Focus | Check an observable change to the learned parent after remapping. |
| `mind:3:3` | Precise mind | passive critical | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |

## Subterfuge

| Existing node | Purchase | Current effect | Conversion check |
|---|---|---|---|
| `subterfuge:origin` | Subterfuge | discipline access | Remap to the distinct origin choices, class price and new discipline taxonomy. |
| `subterfuge:rank2` | Subterfuge II | rank and enchantment access | Map old equipment eligibility and purchased investments to specific learned path steps. |
| `subterfuge:rank3` | Subterfuge III | rank and enchantment access | Map old equipment eligibility and purchased investments to specific learned path steps. |
| `subterfuge:0:0` | Vanish | Vanish · buff | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `subterfuge:0:1` | Patient shadow | buff · improve Vanish | Check an observable change to the learned parent after remapping. |
| `subterfuge:0:2` | Ambush | passive ambush | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `subterfuge:0:3` | Silent execution | passive ambush | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `subterfuge:1:0` | Sidestep | Sidestep · move, buff | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `subterfuge:1:1` | Long sidestep | move, buff · improve Sidestep | Check an observable change to the learned parent after remapping. |
| `subterfuge:1:2` | Shadow Step | Shadow Step · move, buff | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `subterfuge:1:3` | Escape Route | Escape Route · move, buff | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `subterfuge:2:0` | Pocket Sand | Pocket Sand · condition | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `subterfuge:2:1` | Wider throw | condition · improve Pocket Sand | Check an observable change to the learned parent after remapping. |
| `subterfuge:2:2` | Low Blow | Low Blow · damage, condition | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `subterfuge:2:3` | Venomhand | passive venom, damage | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `subterfuge:3:0` | Smoke Screen | Smoke Screen · zone | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `subterfuge:3:1` | Lingering smoke | zone · improve Smoke Screen | Check an observable change to the learned parent after remapping. |
| `subterfuge:3:2` | Exploit distraction | passive flanker | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `subterfuge:3:3` | Slip away | passive killMove | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |

## Athletics

| Existing node | Purchase | Current effect | Conversion check |
|---|---|---|---|
| `athletics:origin` | Athletics | discipline access | Remap to the distinct origin choices, class price and new discipline taxonomy. |
| `athletics:rank2` | Athletics II | rank and enchantment access | Map old equipment eligibility and purchased investments to specific learned path steps. |
| `athletics:rank3` | Athletics III | rank and enchantment access | Map old equipment eligibility and purchased investments to specific learned path steps. |
| `athletics:0:0` | Fleet Step | Fleet Step · buff | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `athletics:0:1` | Quick Roll | Quick Roll · move, cleanse | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `athletics:0:2` | Long stride | passive movement | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `athletics:0:3` | Bounding Step | Bounding Step · move, buff | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `athletics:1:0` | Vault | Vault · move | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `athletics:1:1` | Long vault | move · improve Vault | Check an observable change to the learned parent after remapping. |
| `athletics:1:2` | Sure landing | move · improve Vault | Check an observable change to the learned parent after remapping. |
| `athletics:1:3` | Great vault | move · improve Vault | Check an observable change to the learned parent after remapping. |
| `athletics:2:0` | Shoulder Check | Shoulder Check · push | Retest legal destination, Stability and actual impact using Deeds collision timing. |
| `athletics:2:1` | Driving shoulder | push · improve Shoulder Check | Retest legal destination, Stability and actual impact using Deeds collision timing. |
| `athletics:2:2` | Hard landing | passive impact | Retest legal destination, Stability and actual impact using Deeds collision timing. |
| `athletics:2:3` | Momentum | passive moveDamage | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `athletics:3:0` | Drag to Safety | Drag to Safety · pull, barrier | Retest legal destination, Stability and actual impact using Deeds collision timing. |
| `athletics:3:1` | Long reach | pull, barrier · improve Drag to Safety | Retest legal destination, Stability and actual impact using Deeds collision timing. |
| `athletics:3:2` | Rescue Line | Rescue Line · pull | Retest legal destination, Stability and actual impact using Deeds collision timing. |
| `athletics:3:3` | Strong back | passive capacity | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |

## Storm

| Existing node | Purchase | Current effect | Conversion check |
|---|---|---|---|
| `storm:origin` | Storm | discipline access | Remap to the distinct origin choices, class price and new discipline taxonomy. |
| `storm:rank2` | Storm II | rank and enchantment access | Map old equipment eligibility and purchased investments to specific learned path steps. |
| `storm:rank3` | Storm III | rank and enchantment access | Map old equipment eligibility and purchased investments to specific learned path steps. |
| `storm:0:0` | Static Arc | Static Arc · damage | Map into a spellbook section, apply class casting and the printed SP/action cost. |
| `storm:0:1` | High voltage | damage · improve Static Arc | Check an observable change to the learned parent after remapping. |
| `storm:0:2` | Thunder Line | Thunder Line · damage, push | Retest legal destination, Stability and actual impact using Deeds collision timing. |
| `storm:0:3` | Conductor | passive chain | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `storm:1:0` | Gale Bolt | Gale Bolt · damage, push | Retest legal destination, Stability and actual impact using Deeds collision timing. |
| `storm:1:1` | Driving gale | damage, push · improve Gale Bolt | Retest legal destination, Stability and actual impact using Deeds collision timing. |
| `storm:1:2` | Crosswind | Crosswind · move | Map into a spellbook section, apply class casting and the printed SP/action cost. |
| `storm:1:3` | Storm impact | passive impact | Retest legal destination, Stability and actual impact using Deeds collision timing. |
| `storm:2:0` | Tailwind | Tailwind · buff | Map into a spellbook section, apply class casting and the printed SP/action cost. |
| `storm:2:1` | Lasting wind | buff · improve Tailwind | Check an observable change to the learned parent after remapping. |
| `storm:2:2` | Storm Hop | Storm Hop · move, buff | Map into a spellbook section, apply class casting and the printed SP/action cost. |
| `storm:2:3` | Stormrunner | passive moveDamage | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `storm:3:0` | Gust Screen | Gust Screen · buff | Map into a spellbook section, apply class casting and the printed SP/action cost. |
| `storm:3:1` | Holding wind | buff · improve Gust Screen | Check an observable change to the learned parent after remapping. |
| `storm:3:2` | Static charge | passive lightning | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `storm:3:3` | Charged shelter | passive barrier | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |

## Arms

| Existing node | Purchase | Current effect | Conversion check |
|---|---|---|---|
| `arms:origin` | Arms | discipline access | Remap to the distinct origin choices, class price and new discipline taxonomy. |
| `arms:rank2` | Arms II | rank and enchantment access | Map old equipment eligibility and purchased investments to specific learned path steps. |
| `arms:rank3` | Arms III | rank and enchantment access | Map old equipment eligibility and purchased investments to specific learned path steps. |
| `arms:0:0` | Melee attack | Melee Attack · damage | Universal basic attack. Offer a technique upgrade at this position. |
| `arms:0:1` | Measured edge | replace melee profile with 1/2/2 | Reprice against the free universal attack. Apply strongest replacement once. |
| `arms:0:2` | Heavy edge | replace melee profile with 1/2/3 | Reprice against the free universal attack. Apply strongest replacement once. |
| `arms:0:3` | Master’s edge | replace melee profile with 2/3/5 | Reprice against the free universal attack. Apply strongest replacement once. |
| `arms:0:4` | Sweeping Blade | Sweeping Blade · damage | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `arms:1:0` | Driving Cut | Driving Cut · damage, push | Retest legal destination, Stability and actual impact using Deeds collision timing. |
| `arms:1:1` | Hard contact | passive impact | Retest legal destination, Stability and actual impact using Deeds collision timing. |
| `arms:1:2` | Crushing contact | passive impact | Retest legal destination, Stability and actual impact using Deeds collision timing. |
| `arms:1:3` | Battering Cut | Battering Cut · damage, push | Retest legal destination, Stability and actual impact using Deeds collision timing. |
| `arms:2:0` | Hamstring | Hamstring · damage, condition | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `arms:2:1` | Deep cut | damage, condition · improve Hamstring | Check an observable change to the learned parent after remapping. |
| `arms:2:2` | Pommel Rattle | Pommel Rattle · damage, condition | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `arms:2:3` | Punish openings | passive critical | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `arms:3:0` | Blade Ward | Blade Ward · buff, counter | Retest defense and Reaction timing with two eligible heroes. |
| `arms:3:1` | Flanking edge | passive flanker | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `arms:3:2` | Execution Edge | Execution Edge · buff | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `arms:3:3` | Follow through | passive killMove | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |

## Armor

| Existing node | Purchase | Current effect | Conversion check |
|---|---|---|---|
| `armor:origin` | Armor | discipline access | Remap to the distinct origin choices, class price and new discipline taxonomy. |
| `armor:rank2` | Armor II | rank and enchantment access | Map old equipment eligibility and purchased investments to specific learned path steps. |
| `armor:rank3` | Armor III | rank and enchantment access | Map old equipment eligibility and purchased investments to specific learned path steps. |
| `armor:0:0` | Light armor | ability-wear-light-armor | Map to the Deeds equipment or basic-action rule and test with held/worn gear. |
| `armor:0:1` | Padding | passive hp | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `armor:0:2` | Medium armor | ability-wear-medium-armor | Map to the Deeds equipment or basic-action rule and test with held/worn gear. |
| `armor:0:3` | Heavy armor | ability-wear-heavy-armor | Map to the Deeds equipment or basic-action rule and test with held/worn gear. |
| `armor:1:0` | Brace | Brace · buff | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `armor:1:1` | Hold fast | buff · improve Brace | Check an observable change to the learned parent after remapping. |
| `armor:1:2` | Iron Skin | Iron Skin · buff | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `armor:1:3` | Adamant Ward | Adamant Ward · barrier | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `armor:2:0` | Plated Advance | Plated Advance · buff | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `armor:2:1` | Load bearing | passive capacity | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `armor:2:2` | Clear Visor | Clear Visor · cleanse, barrier | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `armor:2:3` | Iron endurance | passive hp | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `armor:3:0` | Deflecting Stance | Deflecting Stance · buff | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `armor:3:1` | Layered ward | passive barrier | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `armor:3:2` | Reinforced Guard | Reinforced Guard · barrier | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `armor:3:3` | Tempered body | passive reduction | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |

## Guard

| Existing node | Purchase | Current effect | Conversion check |
|---|---|---|---|
| `guard:origin` | Guard | discipline access | Remap to the distinct origin choices, class price and new discipline taxonomy. |
| `guard:rank2` | Guard II | rank and enchantment access | Map old equipment eligibility and purchased investments to specific learned path steps. |
| `guard:rank3` | Guard III | rank and enchantment access | Map old equipment eligibility and purchased investments to specific learned path steps. |
| `guard:0:0` | Shield block | ability-shield-block | Map to the Deeds equipment or basic-action rule and test with held/worn gear. |
| `guard:0:1` | Stand Firm | Stand Firm · buff | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `guard:0:2` | Firm footing | buff · improve Stand Firm | Check an observable change to the learned parent after remapping. |
| `guard:0:3` | Hold the Line | Hold the Line · buff | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `guard:1:0` | Guardian Link | Guardian Link · guard | Retest defense and Reaction timing with two eligible heroes. |
| `guard:1:1` | Close formation | guard · improve Guardian Link | Retest defense and Reaction timing with two eligible heroes. |
| `guard:1:2` | Shielding Step | Shielding Step · swap, barrier | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `guard:1:3` | Safe harbor | passive barrier | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `guard:2:0` | Retaliating Guard | Retaliating Guard · counter | Retest defense and Reaction timing with two eligible heroes. |
| `guard:2:1` | Counter edge | passive physical | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `guard:2:2` | Exact reply | passive critical | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `guard:2:3` | Patient guard | counter · improve Retaliating Guard | Retest defense and Reaction timing with two eligible heroes. |
| `guard:3:0` | Warning Call | Warning Call · buff | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `guard:3:1` | Loud warning | buff · improve Warning Call | Check an observable change to the learned parent after remapping. |
| `guard:3:2` | Guarded Retreat | Guarded Retreat · buff | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `guard:3:3` | Rearguard | passive hp | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |

## Influence

| Existing node | Purchase | Current effect | Conversion check |
|---|---|---|---|
| `influence:origin` | Influence | discipline access | Remap to the distinct origin choices, class price and new discipline taxonomy. |
| `influence:rank2` | Influence II | rank and enchantment access | Map old equipment eligibility and purchased investments to specific learned path steps. |
| `influence:rank3` | Influence III | rank and enchantment access | Map old equipment eligibility and purchased investments to specific learned path steps. |
| `influence:0:0` | Rally | Rally · buff | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `influence:0:1` | Carrying voice | buff · improve Rally | Check an observable change to the learned parent after remapping. |
| `influence:0:2` | Press Advantage | Press the Advantage · buff | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `influence:0:3` | Coordinated blows | passive flanker | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `influence:1:0` | Reassuring Word | Reassuring Word · heal | Distinguish universal Stabilize, SP healing, condition care and first-aid allowance. |
| `influence:1:1` | Firm reassurance | heal · improve Reassuring Word | Distinguish universal Stabilize, SP healing, condition care and first-aid allowance. |
| `influence:1:2` | Second Wind | Second Wind · resource | Check the granted action budget for repeatable extra-action loops. |
| `influence:1:3` | Renewed courage | passive heal | Distinguish universal Stabilize, SP healing, condition care and first-aid allowance. |
| `influence:2:0` | Draw Attention | Draw Attention · buff | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `influence:2:1` | Commanding call | buff · improve Draw Attention | Check an observable change to the learned parent after remapping. |
| `influence:2:2` | Demoralize | Demoralize · buff | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `influence:2:3` | Crushing morale | buff · improve Demoralize | Check an observable change to the learned parent after remapping. |
| `influence:3:0` | Rouse | Rouse · cleanse | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `influence:3:1` | Distant courage | cleanse · improve Rouse | Check an observable change to the learned parent after remapping. |
| `influence:3:2` | Shared resolve | passive barrier | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `influence:3:3` | Rallying care | passive rallyMove | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |

## Scholarship

| Existing node | Purchase | Current effect | Conversion check |
|---|---|---|---|
| `scholarship:origin` | Scholarship | discipline access | Remap to the distinct origin choices, class price and new discipline taxonomy. |
| `scholarship:rank2` | Scholarship II | rank and enchantment access | Map old equipment eligibility and purchased investments to specific learned path steps. |
| `scholarship:rank3` | Scholarship III | rank and enchantment access | Map old equipment eligibility and purchased investments to specific learned path steps. |
| `scholarship:0:0` | Read the Depths | Read the Depths · survey | Require actual unrevealed information and persist the discovery. |
| `scholarship:0:1` | Surveyor’s ward | survey · improve Read the Depths | Require actual unrevealed information and persist the discovery. |
| `scholarship:0:2` | Expedition packs | passive capacity | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `scholarship:0:3` | Careful route | passive movement | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `scholarship:1:0` | Anatomist’s Strike | Anatomist’s Strike · damage, condition | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `scholarship:1:1` | Exact incision | damage, condition · improve Anatomist’s Strike | Check an observable change to the learned parent after remapping. |
| `scholarship:1:2` | Expose Weakness | Expose Weakness · buff | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `scholarship:1:3` | Critical study | passive critical | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `scholarship:2:0` | Threat Analysis | Threat Analysis · buff | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `scholarship:2:1` | Lasting analysis | buff · improve Threat Analysis | Check an observable change to the learned parent after remapping. |
| `scholarship:2:2` | Calculated Opening | Calculated Opening · resource, buff | Check the granted action budget for repeatable extra-action loops. |
| `scholarship:2:3` | Exploit formation | passive flanker | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `scholarship:3:0` | Measured Advice | Measured Advice · buff | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `scholarship:3:1` | Clear advice | buff · improve Measured Advice | Check an observable change to the learned parent after remapping. |
| `scholarship:3:2` | Alchemical Primer | Alchemical Primer · passive capacity | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `scholarship:3:3` | Practiced process | passive craftSpeed | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |

## Craft

| Existing node | Purchase | Current effect | Conversion check |
|---|---|---|---|
| `craft:origin` | Craft | discipline access | Remap to the distinct origin choices, class price and new discipline taxonomy. |
| `craft:rank2` | Craft II | rank and enchantment access | Map old equipment eligibility and purchased investments to specific learned path steps. |
| `craft:rank3` | Craft III | rank and enchantment access | Map old equipment eligibility and purchased investments to specific learned path steps. |
| `craft:0:0` | Field Artisan | Field Artisan | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `craft:0:1` | Efficient hands | passive craftSpeed | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `craft:0:2` | Resourceful Maker | Resourceful Maker · passive capacity | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `craft:0:3` | Master Artisan | Master Artisan | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `craft:1:0` | Apothecary Apprentice | Apothecary Apprentice · passive heal | Distinguish universal Stabilize, SP healing, condition care and first-aid allowance. |
| `craft:1:1` | Measured batches | passive craftSpeed | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `craft:1:2` | Greater remedies | recipe-greater-healing-bottle | Keep as a recipe unlock with actual ingredients, work time and product. |
| `craft:1:3` | Restoration formula | recipe-restoration-draught | Keep as a recipe unlock with actual ingredients, work time and product. |
| `craft:2:0` | Makeshift Screen | Makeshift Screen · zone | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `craft:2:1` | Lasting screen | zone · improve Makeshift Screen | Check an observable change to the learned parent after remapping. |
| `craft:2:2` | Repair Ward | Repair Ward · barrier | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `craft:2:3` | Reinforced repair | barrier · improve Repair Ward | Check an observable change to the learned parent after remapping. |
| `craft:3:0` | Edge Honing | Edge Honing · buff | Retain as a tactical candidate. Verify targeting, cost and a meaningful band outcome. |
| `craft:3:1` | Long honing | buff · improve Edge Honing | Check an observable change to the learned parent after remapping. |
| `craft:3:2` | Tool belt | passive capacity | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |
| `craft:3:3` | Prepared armor | passive barrier | Compare before/after with fixed dice and gear. Audit matching bonus caps and stacking. |

## Optional combinations

| Existing node | Purchase | Current effect | Conversion check |
|---|---|---|---|
| `intersection:flaming-arrow` | Flaming Arrow | Flaming Arrow · damage, condition | Optional combination. Verify distinct effect and point cost beside single-path mastery. |
| `intersection:thorn-arrow` | Thorn Arrow | Thorn Arrow · damage, condition | Optional combination. Verify distinct effect and point cost beside single-path mastery. |
| `intersection:renewing-grove` | Renewing Grove | Renewing Grove · zone, barrier | Optional combination. Verify distinct effect and point cost beside single-path mastery. |
| `intersection:vital-surgery` | Vital Surgery | Vital Surgery · heal, stabilize, cleanse | Optional combination. Verify distinct effect and point cost beside single-path mastery. |
| `intersection:purifying-light` | Purifying Light | Purifying Light · heal, cleanse | Optional combination. Verify distinct effect and point cost beside single-path mastery. |
| `intersection:aurora-ward` | Aurora Ward | Aurora Ward · barrier, cleanse | Optional combination. Verify distinct effect and point cost beside single-path mastery. |
| `intersection:winter-spirit` | Winter Spirit | Winter Spirit · damage, condition | Optional combination. Verify distinct effect and point cost beside single-path mastery. |
| `intersection:psychic-crossing` | Psychic Crossing | Psychic Crossing · swap, barrier | Optional combination. Verify distinct effect and point cost beside single-path mastery. |
| `intersection:phantom-knife` | Phantom Knife | Phantom Knife · damage, buff | Optional combination. Verify distinct effect and point cost beside single-path mastery. |
| `intersection:shadow-dancer` | Shadow Dancer | Shadow Dancer · move, buff | Optional combination. Verify distinct effect and point cost beside single-path mastery. |
| `intersection:thunder-charge` | Thunder Charge | Thunder Charge · damage, push | Optional combination. Verify distinct effect and point cost beside single-path mastery. |
| `intersection:firestorm` | Firestorm | Firestorm · damage, condition, push | Optional combination. Verify distinct effect and point cost beside single-path mastery. |
| `intersection:iron-cleave` | Iron Cleave | Iron Cleave · damage, barrier | Optional combination. Verify distinct effect and point cost beside single-path mastery. |
| `intersection:bastion` | Bastion | Bastion · barrier, guard | Optional combination. Verify distinct effect and point cost beside single-path mastery. |
| `intersection:rallying-bulwark` | Rallying Bulwark | Rallying Bulwark · barrier, buff | Optional combination. Verify distinct effect and point cost beside single-path mastery. |
| `intersection:battle-plan` | Battle Plan | Battle Plan · buff, barrier | Optional combination. Verify distinct effect and point cost beside single-path mastery. |
| `intersection:alchemical-insight` | Alchemical Insight | Alchemical Insight · passive craftDiscount | Optional combination. Verify distinct effect and point cost beside single-path mastery. |
| `intersection:tempered-edge` | Tempered Edge | Tempered Edge · buff, barrier | Optional combination. Verify distinct effect and point cost beside single-path mastery. |
| `intersection:furnace-blade` | Furnace Blade | Furnace Blade · damage, condition, push | Optional combination. Verify distinct effect and point cost beside single-path mastery. |
| `intersection:armored-volley` | Armored Volley | Armored Volley · damage, barrier | Optional combination. Verify distinct effect and point cost beside single-path mastery. |
| `intersection:sheltering-thicket` | Sheltering Thicket | Sheltering Thicket · barrier, cleanse | Optional combination. Verify distinct effect and point cost beside single-path mastery. |
| `intersection:inspiring-renewal` | Inspiring Renewal | Inspiring Renewal · heal, buff | Optional combination. Verify distinct effect and point cost beside single-path mastery. |
| `intersection:clinical-precision` | Clinical Precision | Clinical Precision · damage, condition | Optional combination. Verify distinct effect and point cost beside single-path mastery. |
| `intersection:rune-lantern` | Rune Lantern | Rune Lantern · zone, barrier | Optional combination. Verify distinct effect and point cost beside single-path mastery. |
| `intersection:cinder-tempest` | Cinder Tempest | Cinder Tempest · damage, condition | Optional combination. Verify distinct effect and point cost beside single-path mastery. |
| `intersection:unbroken-company` | Unbroken Company | Unbroken Company · barrier, cleanse, buff | Optional combination. Verify distinct effect and point cost beside single-path mastery. |
| `intersection:verdant-resurrection` | Verdant Renewal | Verdant Renewal · heal, stabilize, cleanse | Optional combination. Verify distinct effect and point cost beside single-path mastery. |
| `intersection:phantom-hunt` | Phantom Hunt | Phantom Hunt · damage, condition, buff | Optional combination. Verify distinct effect and point cost beside single-path mastery. |
| `intersection:glacial-engine` | Glacial Engine | Glacial Engine · damage, condition, zone | Optional combination. Verify distinct effect and point cost beside single-path mastery. |
| `intersection:sunfire-sanctuary` | Sunfire Sanctuary | Sunfire Sanctuary · barrier, heal, cleanse | Optional combination. Verify distinct effect and point cost beside single-path mastery. |
| `intersection:thunderous-assault` | Thunderous Assault | Thunderous Assault · damage, push | Optional combination. Verify distinct effect and point cost beside single-path mastery. |
| `intersection:silent-storm` | Silent Storm | Silent Storm · damage, condition, buff | Optional combination. Verify distinct effect and point cost beside single-path mastery. |
| `intersection:fourfold-aegis` | Fourfold Aegis | Fourfold Aegis · barrier, heal, cleanse | Optional combination. Verify distinct effect and point cost beside single-path mastery. |
