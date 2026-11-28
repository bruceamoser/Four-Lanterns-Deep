# November 28 — The Living Atlas

- Ubuntu desktop, clean implementation worktree `/home/bmoser/Projects/FLD-Deeds-Review`.
- Branch `codex/linear-arms-and-spellbooks`, based on `4714fb52`. First implementation checkpoint `68e6f96`.
- [v0.10.0](https://github.com/bruceamoser/Four-Lanterns-Deep/releases/tag/v0.10.0) is the public stable release. [PR 211](https://github.com/bruceamoser/Four-Lanterns-Deep/pull/211) merged at `23889416d3869fe298e2df2c894eef09b7dde093`, the tagged commit.

## Implemented

Replaced new-hero Atlas development with 84 linear arms. A technique keeps one action ID as it evolves. Buying a section of any source book immediately grants all spells in that section to the purchasing hero. Fully implemented dungeon adaptations for 319 pages use the regular casting, inventory, recovery and combat authorities. The new edition has 100 XP levels, class/ancestry growth and class-priced roots. Personal book UI, Atlas, roster creation, Greyhaven respec and equipment attunement use the same purchased studies. [Design, migration and implementation coverage](../../linear-atlas.md).

## Verification

The direct Ubuntu launcher has passed silent native checks for spell study, immediate personal pages, an actual healing cast, team isolation, refunds and save-on-close. Full catalogue tests exercise 319 pages, ordered predecessors, every active martial stage, maximum level, equipment attunement, ritual rewards and migration. The 0.8.8 migration regression passes. All 411 automated tests passed including the additional supply regressions. The Linux AppImage, Debian package and Windows portable build are assembled. The game archives on both platforms contain all 58 approved creature models. A saved 0.9.0 AppImage journey upgraded to 0.10.0 with its vault balance intact. A damaged download was rejected, and an unsuccessful save blocked installation. See [PR 211](https://github.com/bruceamoser/Four-Lanterns-Deep/pull/211).

## Consumable playtest follow-up

A ten-second exploration step used to trigger additional water, food and torch rolls every 40, 80 and 25 squares. Stationary activity had separate timers. Replace these with per-hero 24-hour ration clocks and one hour of accumulated burning per torch. The die still shrinks on a one. A full d8 averages 18 uses. A follow-up arrow now stops if the previous shot killed its only target. Old saves keep their supplies and partial burn time. [Current rules and save behavior](../../supplies.md).

A paired simulation exercised both editions with the same input: 360 ten-second walking steps in darkness, eight hours of stationary work, then eight hours in camp. The old code checked each torch bearer’s water 13 times, food six times and fuel 22 times. The new code checked water and food zero times and fuel nine times. The native game then crossed the daily threshold on an actual dungeon step and retained it across save/reload.

Updated the native regression fixtures to use the current caster and study, the digital training threshold, and each approved creature’s actual attack. A separate legacy hero still exercises the old wound and treatment UI. The current production visual check also exercised Cinder Strider’s five configured animations.

## Published packages and resuming

The [finished installer workflow](https://github.com/bruceamoser/Four-Lanterns-Deep/actions/runs/46172165774) installed and exercised the Windows NSIS and Debian packages and ran the Linux AppImage. Linux and Windows each contain all 58 approved creature exports. The eleven public release asset digests and both updater feeds were verified. A muted, unmodified 0.9.0 AppImage discovered and downloaded 0.10.0 from the live feed. The full native Ubuntu launcher suite passed using isolated saves in the normal terminal AppArmor context, including actual spells, provisions, graphics, slot management and save on close.

Pull main on the other machine. Existing heroes can adopt the new Atlas at the character sheet in Greyhaven. The new supply cadence applies when the updated executable loads the run. The [progression reference](../../linear-atlas.md) includes the settings to revisit after extended human playtesting. Actual campaign hours to reach level 100 and player preferences for torch endurance remain playtest questions.

## Local state

Paid character exports and all 58 approved creature inputs are staged privately in this worktree. The installer, screenshots and synthetic QA profiles are local. Use an on-disk `TMPDIR` for packaging because the desktop’s shared memory-backed temporary directory has a quota. Personal save slots and installed binaries are outside the test profiles.
