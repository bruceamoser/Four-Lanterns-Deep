# Which Forge purchases earn their place in the dungeon?

November 27 design review against Deeds main `44ef046` and FLD `87f1d67`. The active book index gives 21 disciplines. Thirteen have four seven-entry physical, social or practical paths each. Spellcraft adds three seven-entry training paths and the Channeling spellbook. Seven other disciplines each teach four spellbooks. That gives **385 training entries in 55 paths and 319 spell profiles in 29 books**. Learning a spellbook section can grant multiple spells. Neither number represents how many buttons a player should see.

The current game has **377 nodes, 72 paths, 18 origins and 33 intersections**. Its arena test actually executes learned active powers, and its upgrade test checks that targeted power data changes. Those tests establish a working starting point. They cannot tell us whether a purchase remains worthwhile after adding SP, changing HP growth, removing numerical wounds or changing the pricing of disciplines. [Current catalog](../src/core/forge-catalog.mjs) · [current executable tests](../tests/forge.test.mjs) · [book learning rules](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/rules/learning.md).

## Purchases that change meaning

| Current choice | Proposed disposition | What the player should see or do |
|---|---|---|
| Melee attack and Bow attack | Move basic strikes to the universal bar. Purchase technique or profile improvements. | A newly created hero with compatible gear can always attack. The first Arms or Marksmanship purchase previews the improvement to that strike. |
| Direct Thrust I from the new Fencing path | Bring across early. | A one-handed fencer deals 1/2/4. On Standard or Strong, highlight legal landing squares for the optional one-square step. That step avoids movement reactions. Declining the step completes the attack. |
| Tactics' Exploit the Opening | Bring across early. | One hero attacks. On a qualifying result the player chooses a different willing hero and a legal destination. Preview the reactions that ally might provoke. The third improvement exempts only the attacked enemy. |
| Renew Flesh, Stabilize powers, wound-treatment grants | Replace obsolete wound healing, give everyone Stabilize, preserve distinct rescue upgrades. | A medic can improve the action cost, range or result of rescue. Their sheet distinguishes bandaging Bleeding, restoring HP and consuming a patient's first-aid allowance. A Hall scar never appears as a debuff to cure. |
| Paid spell, reaction, movement and ranged upgrades | Reprice after the relevant base system lands. | Preview SP and legal range on the bar, show the current reaction window, and use the same movement exemption in the preview and resolver. Repeated free-action or reaction grants need a bounded trigger to prevent loops. |
| Origin/rank nodes, older elemental roots, rank-gated gear | Map origins to the new class prices and seven-step paths. | Elemental branches such as Flame and Frost become lines within Elements. A flaming sword can require a particular learned Flame section. Repeated origin choices cannot mint DP. Armor still supplies its resistance when worn untrained, with the effective Agility penalty. |
| Flaming Arrow, Furnace Blade and other contact nodes | Keep an optional FLD layer and price separately. | Flame and Marksmanship contacts can produce Flaming Arrow. A pure archer can still reach a complete Marksmanship mastery at level 7. A combination should change a target, timing, terrain interaction or tactical decision. Check its actual effect before retaining the name. |
| Identify and Detect Magic | Connect both to hidden loot. | Detection gives a clue. A successful identification procedure writes specific facts to the company journal. Attunement remains a separate equipment check. Test shop, floor, pack, handoff and reload with an unknown item. |
| Book effects relying on narration, e.g. *A Treaty in Common Words* | Omit the tabletop option or design a named replacement with a real interaction. | Leadership can rally allies immediately. Negotiation needs a merchant, surrender or release decision with a measurable outcome. Avoid selling seven ranks of flavor text. |

Ancestry traits and the 90 class signature choices need the same test as a paid skill. For example, the Warden’s *Death from the Blind Spot* can check a tracked or previously damaged target and preview its legal approach. The Odd’s *A Door Where There Wasn’t* needs a visible empty square beyond a one-square barrier and must track which hero may cross it. A halfling’s *Quick Tongue* needs an actual negotiation before the benefit can be worth one of two ancestry picks. Map by the current rule text and stable source ID since some filenames retain older ability names. [Warden signature](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/cards/signature-warden-know-what-you-hunt.md) · [Odd signature](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/cards/signature-odd-change-the-question.md) · [halfling traits](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/ancestries/halfling.md).

## Physical, practical and social trees

Each cell names a printed path and the runtime interaction it needs. This is a path-level feasibility review; individual strength, action timing, and purchase price still require encounter tests. “Hold” means leave the option off the purchase screen until the game has a worthwhile use. One unavailable entry must never block a viable later purchase.

| Discipline | First path | Second path | Third path | Fourth path |
|---|---|---|---|---|
| Arms | Bladework — keep flexible attack stat and sweeping targets | Impact — use the real collision resolver | Dueling — interrupt after defense, before damage | Unarmed — grapples and legal empty-hand attacks |
| Fencing | Pointwork — strike and optional safe step | Footwork — preview route and exempt steps | Blade Contact — parry/counter timing | Blade Tricks — check held weapon and show disarm, recovery or fallback attack |
| Tactics | Openings — ally moves after the attack | Coordination — cue exactly one ally and show expiry | Contingencies — optional ally-defense reactions | Foresight — mark a target and show the pending benefit |
| Armor | Advance — preview difficult terrain discounts | Bracing — apply highest Stability once per impact | Deflection — reduce the matching damage event | Harness — armor training, bulk and rescue |
| Guard | Shieldwork — actual held shield and push | Shelter — visible adjacent protection | Interception — choose who takes damage | Watchfulness — escort and rescue movement |
| Marksmanship | Precision — preview the shot's complete outcome | Pinning — conditions and escape | Readiness — trigger from a visible enemy movement | Thrown Weapons — explicit held item, return/drop and ricochet geometry |
| Athletics | Climbing — hold until a generated climb has an alternate route | Leaping — show the landing and route saved | Balance — retain Prone prevention, gate rope-group rescues on actual falls | Swimming — hold until deep water and towing exist |
| Subterfuge | Locks — lock difficulty, progress and alternate entry | Sleight — adapt to carried keys or unattended objects | Traps — visible detection/disarm/trigger states | Stealth — concealment and alert state; give a concealed route a map effect |
| Wilderness | Tracking — reveal actual creature family and direction | Animal Handling — adapt to eligible beasts with explicit temporary AI changes | Trailcraft — react to generated natural hazards | Provisioning — actual refill and camp shelter within printed time |
| Medicine | First Aid — spend the patient's shared allowance | Nursing — condition care and a timed patient assignment | Resuscitation — exact Dying trigger and rescue | Diagnosis — reveal a treatable condition and legal remedy |
| Craft | Repairs — require a damaged object with an outcome worth repairing | Mixtures — craft a carried flask and deploy its smoke | Safeguards — hold until mechanisms can fail | Workshop — keep recipes, replace a civic-project mastery with an expedition workshop objective |
| Scholarship | Investigation — uncover a real room clue, item property or danger | Planning — reveal a traversable retreat or tactical square | Disputation — replace open argument with an observable tactical effect or omit | Languages — hold until generated inscriptions have repeatable discovery value |
| Influence | Negotiation — gate on merchant terms or surrender | Leadership — rally a named ally | Rejoinder — adapt to interrupt a visible enemy command | Pressure — eligible enemies can surrender or withdraw under explicit conditions |
| Spellcraft | Soul Capacity — track current/max SP separately | Mind Capacity — scale the same reserve and preview marginal benefit | Recovery — clock, daily allowance and interruption | Channeling — preserve party SP accounting, forbid recursive transfers |

## Spellbook review

The table covers all 29 books. “Bring across” gives the clearest candidates in that book, “Adapt or hold” gives its implementation boundary. Passing the screen for one spell does not automatically admit its siblings. Affected heroes, school, paid SP, focus, cast time, target and duration belong on every eventual ability record. [Book profiles](https://github.com/bruceamoser/deeds-of-legend/tree/44ef046/design/spellbooks).

| Discipline / book | Bring across | Adapt or hold |
|---|---|---|
| Elements / Flame | Fire Bolt, cone attacks, Wall of Fire | Boil Liquid needs a useful prepared-water or crafting target. Separate ally-hitting areas from selected enemies. |
| Elements / Water | Ray of Frost, replenishment, Wall of Ice | Water Walk and Tsunami require passable water and legal displacement. |
| Elements / Earth | Stoneskin, Wall of Stone, movement control | Rope, excavation and reshaping need explicit surface tags and route validation. |
| Elements / Air | Fog Cloud, Lightning Bolt, Gust of Wind | Flying requires legal endpoints and landing on expiry. Regional weather needs a dungeon effect. |
| Life / Restoration | Stabilization, targeted and party healing | Use Life resistance, SP and Dying rules. Restrict resurrection to the agreed rare Hall ritual. |
| Life / Transformation | Jump, Longstrider, Darkvision | Require readable forms, legal footprints and held-gear behavior before offering polymorph. Hues needs an observable purpose. |
| Life / Growth | Entangle, Spike Growth, Wall of Thorns | Plant conversation needs authored information. Tree travel needs linked, visible destinations. |
| Life / Decay | Poison, life drain, weakening | Resolve immunity and ongoing effects per target. Cap drain by actual loss where the spell requires it. |
| Mentalism / Thought | Detect Thoughts can expose a creature's committed intention | Messages between four player-controlled heroes need a concrete effect. Hold memory editing and unrestricted questioning. |
| Mentalism / Emotion | Heroism, Fear, Confusion | Charm and domination require eligible targets, allowed commands and an end condition the AI obeys. |
| Mentalism / Perception | Invisibility, Mirror Image, decoy | An illusion needs an AI perception result and examination rules. Pure disguise needs an encounter where identity matters. |
| Mentalism / Dreams | Sleep, Hypnotic Pattern, nightmare attacks | Hold remote dream messages and astral travel pending meaningful destinations. |
| Divination / Detection | Detect Magic, Find Traps, See Invisibility, Identify | “Evil” or analysis needs trustworthy creature/item tags. Preserve partial identification. |
| Divination / Farseeing | Nightsight, Locate Object, Arcane Eye | Bound scouting to the actual generated floor. Show range, obstruction and what remains unknown. |
| Divination / Echoes | Item Vision can read specific provenance or traits | Require stored facts. Hold open-ended history such as visions across ages. |
| Divination / Portents | True Strike, Guidance, Foresight | Adapt questions about the future to committed enemy intent or known hazard facts; never promise an RNG outcome. |
| Invocation / Spirits | Chill Touch, undead control, spirit guardians | Speaking with the dead needs authored clues. Lifegiving shares the same lifetime return record as True Resurrection. |
| Invocation / Calling | Summon a bounded, controllable combatant | Provide placement, controller, turn budget and disappearance at 0. Hold extraplanar bargains and mounts without travel utility. |
| Invocation / Binding | Hold, Banishment, Forcecage | Give control effects escape rules. Hold open-ended commands or long-term obligations. |
| Invocation / Passage | Misty Step and short teleports | Validate floor, return anchor and destination. Hold plane travel or private realms until they have playable spaces. |
| Force / Telekinesis | Arcane Bolt, Shatter, pushes and barriers | Object lifting and reverse gravity need valid mass/elevation/landing rules. |
| Force / Shaping | Grease, unlocking and bounded terrain manipulation | Require damageable or alterable objects before selling repair or fabrication. Preserve reachability. |
| Force / Animation | Dancing Weapon, timed animated helpers | Give each a model, controller and expiry. Hold multi-tier sentient-item counsel without an actual advice interaction. |
| Force / Imbuement | Light, elemental weapon and equipment enchantment | Track actual held item, owner and expiry after transfer. Restrict contingent triggers to implemented events. |
| Wards / Protection | Shield, damage-type protection, Death Ward | Specify defense-roll versus post-damage timing and strongest matching benefits. |
| Wards / Unraveling | Remove Curse, Counterspell, Dispel Magic | Effects need a source and removable tags. Telegraph a legal interrupt before it vanishes. |
| Wards / Sanctuary | Personal wards, quiet movement, camp shelter | Make shelter change the camp safety check. Hold fortresses and mansions pending a tactical or expedition use. |
| Wards / Seals | Alarm, Arcane Lock, Knock, Glyph of Warding | Link alarms to actual enemy movement and locks to persistent doors. Avoid a second pocket inventory through Secret Chest until storage is specified. |
| Spellcraft / Channeling | Give Power, Draw Power, directed transfers | Commit costs before transfer, cap receivable SP, and prevent a channel from recursively channeling another spell. |

## What constitutes a working purchase

Test the pre-purchase and post-purchase hero in the same seeded situation. Record the target, preview, committed action, costs, applied difference and what survives save/load. Exercise at least one failure case. For example, a Fencing upgrade can prevent one enemy's reaction while a second enemy can still react. An identification upgrade must change what the party can subsequently recognize. Test the choices from a four-hero hotbar, not only a catalog lookup.

The exact 377 current purchases, their existing effects and migration dependencies are indexed in the [current Forge node ledger](deeds-forge-node-ledger.md). Final spell-by-spell balance and native encounter acceptance are future implementation work.

## Entry-by-entry design triage

These dispositions refer to the converted rules and the proposed dungeon features. **Bring across** means the printed outcome supplies a clear game action, even where its implementation is pending. **Adapt** requires a specific game interaction, target model, information source or timing change. **Hold** leaves it out of purchases until the expedition can support it. The path and book reviews above describe the dependencies. These labels describe design fit, not completed implementation.

<details><summary>385 training entries by path and purchase order</summary>

Read left to right in printed order. K = bring across, A = adapt, H = hold. The seventh entry is the mastery.

| Discipline | Path | Steps I–VII |
|---|---|---|
| Arms | [Bladework](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/arms.md) | K · K · K · K · K · K · A |
| Arms | [Impact](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/arms.md) | K · K · K · K · K · K · A |
| Arms | [Dueling](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/arms.md) | K · K · K · K · K · K · K |
| Arms | [Unarmed](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/arms.md) | K · K · K · A · A · A · A |
| Fencing | [Pointwork](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/fencing.md) | K · K · K · K · K · K · K |
| Fencing | [Footwork](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/fencing.md) | K · K · K · K · K · K · A |
| Fencing | [Blade Contact](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/fencing.md) | K · K · K · K · K · K · K |
| Fencing | [Blade Tricks](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/fencing.md) | A · A · A · A · A · A · A |
| Tactics | [Openings](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/tactics.md) | K · K · K · K · K · K · A |
| Tactics | [Coordination](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/tactics.md) | K · K · K · K · K · K · A |
| Tactics | [Contingencies](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/tactics.md) | K · K · K · K · K · K · A |
| Tactics | [Foresight](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/tactics.md) | K · K · K · A · A · A · A |
| Armor | [Advance](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/armor.md) | K · K · K · K · K · K · K |
| Armor | [Bracing](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/armor.md) | K · K · K · K · K · K · A |
| Armor | [Deflection](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/armor.md) | K · K · K · K · K · K · K |
| Armor | [Harness](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/armor.md) | K · K · K · K · K · K · A |
| Guard | [Shieldwork](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/guard.md) | K · K · K · K · K · K · A |
| Guard | [Shelter](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/guard.md) | K · K · K · K · K · K · A |
| Guard | [Interception](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/guard.md) | K · K · K · K · K · K · A |
| Guard | [Watchfulness](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/guard.md) | K · K · K · A · A · A · A |
| Marksmanship | [Precision](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/marksmanship.md) | K · K · K · K · K · K · K |
| Marksmanship | [Pinning](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/marksmanship.md) | K · K · K · K · K · K · K |
| Marksmanship | [Readiness](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/marksmanship.md) | A · A · A · A · A · A · A |
| Marksmanship | [Thrown Weapons](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/marksmanship.md) | A · A · A · A · A · A · A |
| Athletics | [Climbing](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/athletics.md) | H · H · H · H · H · H · H |
| Athletics | [Leaping](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/athletics.md) | A · A · A · A · A · A · A |
| Athletics | [Balance](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/athletics.md) | K · K · K · H · H · H · H |
| Athletics | [Swimming](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/athletics.md) | H · H · H · H · H · H · H |
| Subterfuge | [Locks](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/subterfuge.md) | A · A · A · A · A · A · A |
| Subterfuge | [Sleight](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/subterfuge.md) | A · A · A · H · H · H · H |
| Subterfuge | [Traps](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/subterfuge.md) | A · A · A · A · A · A · A |
| Subterfuge | [Stealth](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/subterfuge.md) | K · K · K · K · K · K · A |
| Wilderness | [Tracking](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/wilderness.md) | A · A · A · A · A · A · A |
| Wilderness | [Animal Handling](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/wilderness.md) | A · A · A · A · A · A · A |
| Wilderness | [Trailcraft](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/wilderness.md) | A · A · A · A · A · A · A |
| Wilderness | [Provisioning](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/wilderness.md) | K · K · K · A · A · A · A |
| Medicine | [First Aid](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/medicine.md) | K · K · K · K · K · K · K |
| Medicine | [Nursing](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/medicine.md) | K · K · K · A · A · A · A |
| Medicine | [Resuscitation](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/medicine.md) | K · K · K · K · K · K · K |
| Medicine | [Diagnosis](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/medicine.md) | A · A · A · A · A · A · A |
| Craft | [Repairs](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/craft.md) | A · A · A · A · A · A · A |
| Craft | [Mixtures](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/craft.md) | K · K · K · K · K · K · A |
| Craft | [Safeguards](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/craft.md) | H · H · H · H · H · H · H |
| Craft | [Workshop](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/craft.md) | K · K · K · A · A · A · H |
| Scholarship | [Investigation](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/scholarship.md) | A · A · A · A · A · A · H |
| Scholarship | [Planning](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/scholarship.md) | A · A · A · A · A · A · K |
| Scholarship | [Disputation](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/scholarship.md) | H · H · H · H · H · H · A |
| Scholarship | [Languages](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/scholarship.md) | H · H · H · H · H · H · H |
| Influence | [Negotiation](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/influence.md) | A · A · A · A · A · A · H |
| Influence | [Leadership](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/influence.md) | K · K · K · K · K · K · K |
| Influence | [Rejoinder](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/influence.md) | H · H · H · A · A · A · A |
| Influence | [Pressure](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/influence.md) | A · A · A · A · A · A · A |
| Spellcraft | [Soul Capacity](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/spellcraft.md) | K · K · K · K · K · K · K |
| Spellcraft | [Mind Capacity](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/spellcraft.md) | K · K · K · K · K · K · K |
| Spellcraft | [Recovery](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/disciplines/spellcraft.md) | K · K · K · K · K · K · K |

</details>

<details><summary>319 individual spell dispositions by book</summary>

| Book | Bring across | Adapt | Hold |
|---|---|---|---|
| [Flame](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/spellbooks/flame.md) | Fire Bolt, Burning Hands, Scorching Ray, Wall of Fire, Fireball, Fire Shield, Fire Storm, Meteor Swarm | Boil Liquid, Heat Metal, Delayed Blast Fireball | — |
| [Water](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/spellbooks/water.md) | Ray of Frost, Create or Destroy Water, Ice Storm, Wall of Ice, Cone of Cold, Freezing Sphere | Purify Food and Drink, Tsunami | Water Breathing, Water Walk, Control Water |
| [Earth](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/spellbooks/earth.md) | Earthwall, Stoneskin, Wall of Stone | Enchanted Rope, Loosen Earth, Cracks Call, Stone Shape, Flesh to Stone, Earthquake | Meld into Stone, Move Earth |
| [Air](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/spellbooks/air.md) | Fog Cloud, Gust of Wind, Lightning Bolt, Wind Wall, Chain Lightning | Elementalism — Air, Feather Fall, Storm of Vengeance | Levitate, Fly, Control Weather |
| [Restoration](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/spellbooks/restoration.md) | Spare the Dying, Cure Wounds, Healing Word, Lesser Restoration, Prayer of Healing, Mass Healing Word, Mass Cure Wounds, Heal | Greater Restoration, Regenerate, True Resurrection | — |
| [Transformation](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/spellbooks/transformation.md) | Longstrider, Darkvision, Freedom of Movement | Jump, Enlarge/Reduce — Living | Hues, Alter Self, Polymorph, Animal Shapes, Shapechange, True Polymorph — Living |
| [Growth](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/spellbooks/growth.md) | Entangle, Goodberry, Spike Growth, Tree Skin, Wall of Thorns | Druidcraft, Plant Growth | Speak with Plants, Tree Stride, Awaken, Transport via Plants |
| [Decay](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/spellbooks/decay.md) | Poison Spray, Ray of Sickness, Ray of Enfeeblement, Protection from Poison, Blight, Harm, Finger of Death, Circle of Death | Vampiric Touch, Bestow Curse, Contagion | — |
| [Thought](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/spellbooks/thought.md) | — | Comprehend Languages, Detect Thoughts, Inner Thoughts, Mind Scan, Mind Probe | Message, Tongues, Sending, Telepathic Bond, Modify Memory, Thought Steal |
| [Emotion](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/spellbooks/emotion.md) | Vicious Mockery, Heroism, Fear | Charm Person, Calm Emotions, Charm Monster, Confusion, Dominate Person, Antipathy/Sympathy | Suggestion, Mass Suggestion |
| [Perception](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/spellbooks/perception.md) | Invisibility, Greater Invisibility | Minor Illusion, Silent Image, Mirror Image, Major Image, Hallucinatory Terrain, Mislead | Disguise Self, Seeming, Programmed Illusion |
| [Dreams](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/spellbooks/dreams.md) | Sleep, Hypnotic Pattern, Phantasmal Killer, Weird | Phantasmal Force, Sign of Sleep | Dreams, Dream Message, Dream, Lord Dream, Astral Projection |
| [Detection](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/spellbooks/detection.md) | Detect Magic, Detect Poison and Disease, See Invisibility, Identify, True Seeing | Detect Evil and Good, Find Traps, Analysis, Detect Magic — Scaling Analysis, Find the Path, Sight True | — |
| [Farseeing](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/spellbooks/farseeing.md) | Nightsight | Clairvoyance, Locate Object, Locate Creature, Arcane Eye, Scrying, Long Ear, Watch II, Watch True, Long Sense, Long Sense True | — |
| [Echoes](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/spellbooks/echoes.md) | — | Origins, Power Lore, Item Vision, Delving, Vision Location, Legend Lore | Past Visions, Vision Guide, Past Store, Past Truth, Vision Behind — Ages |
| [Portents](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/spellbooks/portents.md) | True Strike, Guidance, Foresight, Foresight — Shared Vigil | Augury, Intuitions, Anticipations I, Spell Anticipations, Divination, Anticipations True | Commune |
| [Spirits](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/spellbooks/spirits.md) | Chill Touch, Spirit Guardians | Gentle Repose, Speak with Dead, Lifekeeping, Animate Dead, Control Undead, Etherealness, Create Undead, Lifegiving | Contact Other Plane |
| [Calling](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/spellbooks/calling.md) | — | Familiar, Find Familiar, Summon Animal, Conjure Animals, Conjure Elemental, Summon Dragon, Conjure Celestial | Unseen Servant, Phantom Steed, Planar Ally, Gate — Calling |
| [Binding](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/spellbooks/binding.md) | Hold Person, Hold Monster, Forcecage | Command, Magic Circle, Banishment, Dominate Monster | Thaumaturgy, Planar Binding, Geas, Imprisonment |
| [Passage](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/spellbooks/passage.md) | Misty Step, Blink, Dimension Door | Landing, Long Door, Teleportation Circle, Passwall, Teleport | Plane Shift, Gate — Passage, Demiplane |
| [Telekinesis](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/spellbooks/telekinesis.md) | Arcane Bolt, Magic Missile, Staying, Resilient Sphere, Wall of Force | Mage Hand, Levitate — Objects, Shatter, Telekinesis, Disintegrate | Reverse Gravity |
| [Shaping](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/spellbooks/shaping.md) | Grease | Mending, Enlarge/Reduce — Objects, Unlocking Ways, Heat Metal — Forge, Stone Shape — Craft, Fabricate, Passwall — Workshop, Meld Wall | Earthen Transmutations, True Polymorph — Objects |
| [Animation](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/spellbooks/animation.md) | — | Unseen Servant — Workshop, Enchanted Rope — Rigging, Dancing Weapon, Animate Objects, Animate Objects — Greater | Prestidigitation, Low Intelligence, Medium Intelligence, High Intelligence, Very High Intelligence, Simulacrum |
| [Imbuement](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/spellbooks/imbuement.md) | Light, Magic Weapon, Elemental Weapon | Rune Mastery, Continual Flame, Holy Symbol, Weapon I, Contingency, Armor IV, Imbue Spell | Magic Mouth |
| [Protection](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/spellbooks/protection.md) | Sacred Flame, Shield, Mage Armor, Bladeturn, Protection from Energy, Death Ward, Mind Blank | Protection from Evil and Good, Warding Bond, Globe of Invulnerability, Prismatic Wall | — |
| [Unraveling](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/spellbooks/unraveling.md) | Detect Magic — Threads, Remove Curse | Counterspell, Dispel Magic, Cancel Essence, Cancel Mentalism, Cancel Channeling, Dispel True, Antimagic Field, Cancel True, Unessence | — |
| [Sanctuary](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/spellbooks/sanctuary.md) | Resistance, Sanctuary, Antilife Shell | Quiet Ways, Tiny Hut, Guards and Wards, Forbiddance | Private Sanctum, Hallow, Magnificent Mansion, Mighty Fortress |
| [Seals](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/spellbooks/seals.md) | Glyph of Warding | Mage Seal, Alarm, Arcane Lock, Knock, Magic Mouth — Warning, Rune Mastery — Seal, Symbol | Secret Chest, Sequester, Gate — World Anchor |
| [Channeling](https://github.com/bruceamoser/deeds-of-legend/blob/44ef046/design/spellbooks/channeling.md) | Power Shock, Give Power, Draw Power, Siphon Power, Distant Channel, Directed Siphon, Greater Channel | Channel Spell, Lord Channels, Rechanneling, Power Bridge | — |

</details>
