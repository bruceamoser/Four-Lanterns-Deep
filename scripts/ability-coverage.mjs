import { LINEAR_PATHS, LINEAR_FIELDS } from "../src/core/linear-atlas.mjs";
import { SPELLS } from "../src/core/spell-pages.mjs";
import { forgePower, forgePowerText } from "../src/core/forge.mjs";
import {
  FORGE_NODES,
  FORGE_DISCIPLINES,
  FORGE_PATHS,
} from "../src/core/forge-catalog.mjs";
import { RELICS } from "../src/core/treasure.mjs";
import { POWERS } from "../src/core/powers.mjs";
import { RECIPES } from "../src/core/recipes.mjs";
import { DUNGEON_TRAITS } from "../src/core/ancestry-game.mjs";
import fs from "node:fs/promises";
import { coverage } from "../src/core/abilities.mjs";
const input = JSON.parse(
  await fs.readFile(
    new URL("../public/vendor/hol/data/choices.json", import.meta.url),
    "utf8",
  ),
);
const abilities = input.records
  .filter((c) => c.kind === "ability")
  .map((c) => ({
    id: c.id,
    name: c.name,
    decision: coverage(c.id).decision ?? "keep",
    ...coverage(c.id),
    source: c.source.path,
    sourceHash: c.source.sha256,
  }));
const counts = abilities.reduce(
  (n, a) => ({ ...n, [a.status]: (n[a.status] ?? 0) + 1 }),
  {},
);
await fs.writeFile(
  new URL("../docs/ability-coverage.json", import.meta.url),
  JSON.stringify(
    {
      sourceCommit: input.sourceCommit,
      counts,
      abilities,
      ancestryTraits: Object.entries(DUNGEON_TRAITS).map(([id, t]) => ({
        id,
        name: input.records.find((c) => c.id === id).name,
        ...t,
        source: input.records.find((c) => c.id === id).source,
      })),
      signatureCount: abilities.filter((a) =>
        a.id.startsWith("ability-signature-"),
      ).length,
    },
    null,
    2,
  ) + "\n",
);
console.log(JSON.stringify({ total: abilities.length, ...counts }));

await fs.writeFile(
  new URL("../docs/game-power-coverage.json", import.meta.url),
  JSON.stringify(
    {
      revision: 5,
      ruleset: "deeds-discipline-forge-v2",
      bookCommit: "44ef046880502c0902d9d610a0782d8af2c8ce68",
      policy:
        "Deeds uses class-priced disciplines, connected paths, pure masteries and optional confluences. Power previews use an unupgraded Arcanist. The source table indexed in ability-coverage.json describes the legacy edition.",
      counts: {
        disciplines: FORGE_DISCIPLINES.length,
        paths: FORGE_PATHS.length,
        nodes: FORGE_NODES.length,
        confluences: FORGE_NODES.filter((n) => n.kind === "intersection")
          .length,
        powers: new Set(FORGE_NODES.map((n) => n.power).filter(Boolean)).size,
        classSignatures: Object.values(POWERS).filter(p => p.signature).length,
        recipes: RECIPES.length,
        namedRelics: Object.keys(RELICS).length,
      },
      classSignatures: Object.values(POWERS).filter(p => p.signature).map(({id,name,classId,minimumLevel}) => ({id,name,classId,minimumLevel})),
      disciplines: FORGE_DISCIPLINES,
      paths: FORGE_PATHS,
      nodes: FORGE_NODES,
      powers: [...new Set(FORGE_NODES.map((n) => n.power).filter(Boolean))].map(
        (id) => {
          const p = forgePower(POWERS[id], {
            draft: { forge: {version: 2}, classId: "class-arcanist" },
            preview: {
              forge: {
                stats: {},
                profiles: { melee: [1, 1, 2], ranged: [1, 1, 2] },
                upgrades: [],
              },
            },
          });
          return { ...p, description: forgePowerText(p) };
        },
      ),
      recipes: RECIPES,
      namedRelics: RELICS,
    },
    null,
    2,
  ) + "\n",
);


// One line per arm keeps the source-to-runtime coverage report reviewable.
const reviewed = LINEAR_PATHS.map(path=>({
  discipline:path.field, arm:path.name, type:path.isBook?"spellbook":"technique",
  stages:path.nodes.map(node=>({
    stage:node.stage, level:node.minimumLevel, dp:node.cost, name:node.name,
    ...(node.pages?{pages:node.pages.map(id=>{const p=POWERS[id];return {id,source:p.printedName,name:p.name,sp:p.spCost,effect:forgePowerText(p)};})}
      :node.spec?{action:node.power,effect:forgePowerText(node.spec)}:{stats:node.stats,recipes:node.recipes,grant:node.grant}),
  })),
}));
await fs.writeFile(new URL("../docs/linear-atlas-coverage.json",import.meta.url),
  '{"source":"44ef046","fields":'+LINEAR_FIELDS.length+',"pages":'+SPELLS.length+',"arms":[\n'+reviewed.map(r=>JSON.stringify(r)).join(",\n")+'\n]}\n');
