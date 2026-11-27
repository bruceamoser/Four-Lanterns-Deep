import test from "node:test";
import assert from "node:assert/strict";
import {arena, fresh, drafts, C} from "./forge-fixture.mjs";
import {deathBand,spendDeedsGrit} from "../src/core/deeds-care.mjs";
import {deedsDamage} from "../src/core/deeds-damage.mjs";
import {forgeCharacter,forgeRequirements} from "../src/core/forge.mjs";
import {FORGE_NODE} from "../src/core/forge-catalog.mjs";
import {pathfind} from "../src/core/dungeon.mjs";

test("death rolls tally successes and failures separately and Grit is a choice",()=>{
  const s={status:"dying",hp:0,maxHp:17,gritAvailable:1,marks:0};
  const roll=(bands,avert)=>bands.reduce((s,b)=>deathBand(s,b,avert),s);
  assert.equal(roll(["strong","weak","standard","strong","strong"]).status,"stable");
  assert.equal(roll(["weak","weak","weak"],false).status,"dead");
  const restored=roll(["weak","weak","weak"],true);
  assert.equal(restored.hp,9); assert.equal(restored.gritAvailable,0);
  assert.equal(spendDeedsGrit({...s,status:"stable"}).hp,9);
  const g=arena(),h=g.active;
  g.suffer(h,100,"fire"); assert.equal(h.survival.status,"dying"); assert.equal(h.wounds.length,0);
  assert.ok(h.conditions.some(c=>c.key==="prone")); g.useGrit(h); g.recordScars(); g.recordScars();
  assert.equal(h.scars.length,1);
});

test("damage accepts all Deeds types, strongest defenses, one attack minimum and zero hazard damage",()=>{
  const components=[{type:"physical",amount:1},{type:"fire",amount:1}], resistances=[{type:"physical",value:3},{type:"fire",value:2}];
  assert.equal(deedsDamage({components,resistances}).total,1);
  assert.equal(deedsDamage({components,resistances,attack:false}).total,0);
  assert.equal(deedsDamage({components,immunities:["Physical","Fire"]}).total,0);
  assert.equal(deedsDamage({components:[{type:"force",amount:2},{type:"poison",amount:1}],weaknesses:[{type:"force",value:1},{type:"force",value:2}]}).total,5);
});

test("a specialist can reach the single-path mastery at seven without buying a second path or rank",()=>{
  const d=structuredClone(drafts[1]); d.progression.level=7;
  d.forge.nodes=["marksmanship:0:0","marksmanship:0:1","marksmanship:0:2","marksmanship:0:3"];
  assert.deepEqual(forgeRequirements(FORGE_NODE["marksmanship:0:4"],d,C),[]);
  d.progression.level=3; assert.match(forgeRequirements(FORGE_NODE["marksmanship:0:4"],d,C).join(" "),/level 7/);
  for (const cls of C.choices.filter(c=>c.kind==="class"))
    for(const level of [1,3,7]) assert.equal(cls.signatures[level].length,3);
  const wrong=structuredClone(drafts[0]); wrong.signatures[7]=C.choices.find(c=>c.id===wrong.classId).signatures[7][0];
  assert.equal(forgeCharacter(wrong,C).valid,false);
});

test("the seeded optional vault is sealed until the party picks a route and its state survives reload",()=>{
  const g=fresh(); g.campaign.depth=2; g.newFloor(); g.mode="exploration";
  const v=g.map.vault, chest=g.map.chests.find(c=>c.vault), keeper=g.enemies.find(e=>e.vaultKeeper);
  assert.equal(keeper.type,"creature-kobold-trapkeeper");
  assert.ok(chest.items.some(i=>i.appearance)); assert.ok(!pathfind(g.map,g.map.start,chest).length);
  const copy=fresh();
  for(const id of ["door","seam"]) {
    copy.load(structuredClone(g.snapshot()),{resume:false}); copy.mode="exploration";
    const entry=copy.map.vault[id];
    copy.party.forEach(h=>Object.assign(h,{x:entry.x-1,z:entry.z}));
    copy.party[0].preview.state.ranks["discipline-craft"]=1;
    copy.interact("vault:"+id);
    assert.ok(pathfind(copy.map,copy.map.start,chest).length,id);
    assert.equal(copy.map.vault.alarm,false);
    assert.equal(copy.map.vault[id].open,true);
    assert.equal(!!copy.map.vault[id==="seam"?"door":"seam"].open,false);
    const reopened=fresh(); reopened.load(copy.snapshot(),{resume:false}); assert.equal(reopened.map.vault[id].open,true);
  }
});

