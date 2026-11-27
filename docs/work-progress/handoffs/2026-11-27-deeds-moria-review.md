# November 27 — Deeds of Legend and Moria review

Ubuntu, `codex/deeds-rules-review`, based on main `87f1d67`. Game rules credit updated and research complete. Mechanical migration and the vault are proposed work.

- [Book and Moria review](../../deeds-moria-review.md) records Bruce’s progression, resurrection, save and paid potion identification decisions, the version comparison, the floor prototype proposal and a suggested conversion order.
- [Incoming tree review](../../deeds-tree-review.md) covers the active book index's 385 ordered training entries and 319 spells. [Outgoing ledger](../../deeds-forge-node-ledger.md) covers all 377 shipped Forge nodes. These are design dispositions, not claims of implementation.
- Reviewed the original VMS and Umoria implementation at the commits in [machine setup](../machines.md). All six Moria repositories were cloned outside the game. Book and Foundry worktrees were left untouched.
- Renamed the game's startup, HUD, Bestiary and help attribution, progression copy, project metadata and active onboarding. Kept the hashed historical import and technical application/save IDs.
- Verified production build, all 379 source tests and new attribution on the actual muted Linux desktop launcher in the normal unconfined terminal AppArmor context with an isolated profile. No new installer release. Windows desktop interaction was not tested locally.
- Next implementation is the versioned character/save conversion and shared Deeds resource, combat and recovery rules. Prototype the Vault and implement reviewed skill effects against the converted rules. Use the source pins and exact decisions from the review.

Additional equipment review sampled 5,000 depth-one FLD candidates and traced the original magic procedure, equipment restrictions, device activation and conditional powers. The comparison and example items are in the main review.
