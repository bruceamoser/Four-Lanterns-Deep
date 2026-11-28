import { BOOKS } from "./study-books.mjs";

// Each row follows one printed book in page order. Renamed pages are deliberate
// dungeon adaptations. The inspector and the resolver use the same effect data.
const effect = (target, range, effects, extra = {}) => ({target, range, effects, category:"main", ...extra});
const hit = (type, amount, range = 12, extra = {}) => effect("enemy", range, [{kind:"damage", type, amount}], extra);
const burst = (type, amount, radius, range = 8) => hit(type, amount, range, {target:"ground", radius, allCreatures:true});
const line = (type, amount, range = 8, shape = "line") => hit(type, amount, range, {target:"ground", shape, allCreatures:true});
const mark = (key, rating, range = 6) => effect("enemy",range,[{kind:"condition",key,rating}]);
const shove = (amount,kind = "push",range=6) => effect("enemy",range,[{kind,amount}]);
const zone = (surface, radius=1, rounds=3, range=6, shape) => effect("ground",range,[{kind:"zone",surface,rounds}],{radius,shape});
const ward = (amount,turns=2, sustained=false) => effect("ally",6,[{kind:"barrier",amount,turns}],{sustained,category:"maneuver"});
const boost = (stats,turns=2,range=6) => effect("ally",range,[{kind:"buff",stats,turns}],{category:"maneuver"});
const blink = range => effect("ground",range,[{kind:"move",mode:"teleport"}],{category:"maneuver"});
const cure = (amount, radius=0) => effect("ally",6,[{kind:"heal",amount}],{field:true,radius});
const cleanse = (keys,amount) => effect("ally",6,[{kind:"cleanse",keys,amount}],{field:true});
const sense = (sense,range,minutes=0) => effect("self",0,[{kind:"sense",sense,range}],{field:true,ritualMinutes:minutes,category:"maneuver"});
const utility = (kind, params={}, minutes=1) => effect("ally",1,[{kind,...params}],{field:true,ritualMinutes:minutes});
const transfer = (amount, draw=false, range=6) => effect("ally",range,[{kind:"transferSP",amount,draw}],{otherOnly:true});
const extra = (spec, ...effects) => ({...spec,effects:[...spec.effects,...effects]});
const named = (name, spec) => ({...spec, dungeonName:name});
const timed = (minutes,spec) => ({...spec,field:true,ritualMinutes:minutes});
const a=[2,3,5], b=[3,5,7], c=[4,6,9], d=[5,8,12], e=[7,10,15];
const stagger = (rating) => ({kind:"condition",key:"dazed",rating,minimumBand:1});
const slow = (rating) => ({kind:"condition",key:"slowed",rating,minimumBand:1});
const burn = rating => ({kind:"condition",key:"burning",rating,minimumBand:1});
const step = {kind:"cue",steps:1,safe:true,minimumBand:1};
const shelter = (amount,radius) => ({...ward(amount,3),radius});
const rally = (stats,radius,turns=2) => ({...boost(stats,turns),radius});
const reveal = {kind:"reveal"};
const light = (size,rounds) => zone("light",size,rounds);
const veil = (size,rounds) => zone("smoke",size,rounds);
const snare = (size,rounds) => zone("difficult",size,rounds);
const wall = (rounds,range=8) => zone("wall",0,rounds,range,"wall");
const detect = (which,range) => sense(which,range);
const cleanseBody = n => cleanse(["poisoned","burning","bleeding"],n);
const cleanseMind = n => cleanse(["dazed","slowed"],n);
const barrier = n => ({kind:"barrier",amount:n,turns:2});
const hide = turns => boost({hidden:true},turns);
const scout = (title,which,range,minutes=1) => named(title,sense(which,range,minutes));

const pages = {
  flame:[hit("fire",a),named("Boil Water",utility("refill",{supply:"water"})),line("fire",a,3,"cone"),named("Searing Brand",extra(hit("fire",a,6),burn(2))),hit("fire",c),zone("fire",0,5,10,"wall"),burst("fire",c,2),extra(ward(6),{kind:"buff",stats:{damage:2},turns:2}),zone("fire",2,6,10),named("Cinder Mine",zone("trap",2,7,9)),burst("fire",e,3,12)],
  water:[extra(hit("cold",a),slow(1)),utility("refill",{supply:"water"}),cleanse(["poisoned"],3),named("Cold Lung",boost({reduction:2},3)),named("Glide over Ice",blink(4)),extra(shove(3),slow(2)),burst("cold",c,2),wall(5),line("cold",d,6,"cone"),extra(burst("cold",d,2),slow(2)),extra(line("cold",e,10),{kind:"push",amount:3,minimumBand:1})],
  earth:[named("Stone Tether",shove(1,"pull",4)),snare(1,3),wall(2,5),extra(line("physical",b,6),stagger(1)),ward(6,2,true),named("Stone Bastion",shelter(5,1)),boost({reduction:3},3),wall(6,10),snare(3,6),extra(hit("physical",d),slow(4)),extra(burst("physical",e,3),stagger(2))],
  air:[named("Breeze",shove(1)),named("Feather Step",boost({movement:2})),veil(1,4),extra(line("force",a,5),{kind:"push",amount:2}),blink(5),line("lightning",c,12),blink(8),wall(4,9),named("Forked Lightning",burst("lightning",d,2)),named("Call the Squall",zone("water",3,6)),extra(burst("lightning",e,3),stagger(2))],
  telekinesis:[hit("force",a),named("Mage Hand · Tug",shove(1,"pull")),hit("force",b),mark("slowed",3),named("Hurl Rubble",extra(hit("physical",b),stagger(1))),burst("force",b,1),shove(4,"pull",9),ward(8,2,true),wall(6),hit("force",e),extra(burst("force",d,3),{kind:"push",amount:4})],
  shaping:[named("Mend Guard",ward(2)),snare(1,3),named("Weighted Burden",mark("slowed",2)),scout("Read the Stone","path",7),named("Forge Heat",boost({damage:3})),wall(3),named("Fabricate Barricade",wall(5)),snare(2,6),named("Slip Through Stone",blink(7)),wall(8,10),named("Shatter the Form",extra(burst("physical",d,2),stagger(2)))],
  animation:[named("Flicker",light(1,3)),named("Servant's Guard",ward(3)),named("Snaring Rope",mark("slowed",2)),hit("physical",b,8),named("Flying Shards",burst("physical",b,1)),named("Scout Construct",sense("traps",8)),named("Sentry Construct",sense("creatures",10)),named("Guardian Construct",ward(9,3,true)),named("Sage Construct",sense("all",14,1)),named("Blade Swarm",line("physical",d,9,"cone")),named("Simulacrum Guard",rally({defense:2,damage:3},2,3))],
  imbuement:[light(1,6),boost({damage:2}),named("Searing Edge",boost({damage:3,attack:1})),named("Rune of Shelter",ward(6)),scout("Warning Rune","creatures",8),light(2,12),named("Consecrate Arms",boost({attack:2},3)),boost({damage:5},3),named("Contingent Ward",ward(10,3,true)),boost({dr:2,defense:1},4),named("Imbue the Company",rally({damage:4,attack:1},2,3))],
  restoration:[effect("ally",1,[{kind:"stabilize"}],{field:true}),cure(a),{...cure([1,2,3]),category:"maneuver",range:9},cleanseBody(3),timed(10,cure(b,1)),cure(b,2),extra(cleanseBody(5),{kind:"heal",amount:b}),cure(c,2),cure(e),extra(cure(d),barrier(8)),{...utility("returnRite",{},60),target:"self",context:"shrine"}],
  decay:[line("poison",a,3,"cone"),extra(hit("poison",a),{kind:"condition",key:"poisoned",rating:2,minimumBand:1}),mark("slowed",3),cleanse(["poisoned"],4),extra(hit("life",b,1),{kind:"heal",amount:[1,2,3],self:true}),mark("dazed",3),hit("life",d),extra(burst("poison",c,1),{kind:"condition",key:"poisoned",rating:3,minimumBand:1}),hit("life",e,3),extra(hit("life",[8,12,16]),stagger(2)),burst("life",e,3)],
  growth:[named("Bramble Patch",snare(1,2)),mark("slowed",2),named("Goodberry Poultice",cure(a)),scout("Roots Remember","path",8),zone("trap",1,4),snare(2,5),boost({dr:2},3),blink(7),named("Thorn Sentinel",zone("trap",2,5)),named("Thorn Hedge",wall(6)),named("Rootway",blink(12))],
  transformation:[named("Camouflage",hide(1)),blink(3),boost({movement:3},3),boost({defense:1,damage:1},3),boost({damage:4},3),named("Night Beacon",light(2,8)),named("Predator Form",boost({movement:2,damage:3},3)),cleanseMind(5),named("Pack Stride",rally({movement:3},2)),boost({dr:2,damage:4},4),named("Chimera Form",boost({dr:3,movement:3,damage:5},4))],
  detection:[detect("magic",6),named("Sense Contamination",effect("self",0,[{kind:"sense",sense:"supplies",range:5}],{field:true})),scout("Sense Hostility","creatures",7,0),detect("traps",7),extra(hit("radiant",a),reveal),{...utility("identify",{},10),context:"identify"},detect("creatures",12),scout("Read the Vault","traps",15),scout("Deep Aura Reading","magic",18),detect("path",16),sense("all",18)],
  farseeing:[named("Lantern Sight",light(1,5)),detect("path",6),detect("magic",8),detect("creatures",9),sense("all",8),sense("creatures",14,1),detect("traps",12),named("Watch the Approach",sense("creatures",16)),named("Watch the Vault",sense("all",13)),sense("path",25,1),sense("all",28,1)],
  echoes:[scout("Echo of Treasure","magic",5),scout("Old Footfalls","path",6),scout("Echo of Danger","traps",7),scout("Buried Memories","magic",10),scout("Guide's Echo","path",10),scout("Echo of the Hunt","creatures",11),scout("Locate the Stair","path",16),scout("Treasury Echo","magic",18),scout("Vault Legend","all",14),scout("Resonant Truth","traps",24),scout("Memory of the Deep","all",26)],
  portents:[boost({attack:1},1),boost({defense:1},2),detect("traps",6),detect("creatures",7),boost({defense:2},2),ward(7,2,true),sense("path",16,1),sense("all",13,1),boost({attack:2,defense:2},3),rally({defense:2},2),rally({defense:2,attack:2},2,3)],
  binding:[named("Voice of Command",mark("slowed",1,4)),shove(2),mark("slowed",3),zone("difficult",1,5),shove(4),mark("dazed",2),named("Binding Word",extra(hit("mental",c),slow(2))),mark("slowed",5),named("Break Resolve",extra(hit("mental",d),stagger(2))),wall(7),named("Prison of Will",extra(hit("force",e),slow(5)))],
  calling:[scout("Familiar Scout","creatures",4,0),scout("Tracking Familiar","creatures",8),named("Lantern Servant",light(1,5)),named("Spectral Claws",hit("physical",b,6)),named("Phantom Steed",boost({movement:4},3)),named("Spectral Pack",line("physical",c,5,"cone")),named("Elemental Ally",zone("fire",2,4)),named("Dragon Breath",line("fire",d,6,"cone")),named("Celestial Shelter",shelter(10,2)),named("Planar Guardian",ward(15,3,true)),named("Rift of Claws",burst("force",e,3))],
  passage:[named("Soft Landing",ward(2)),blink(3),blink(4),blink(6),blink(8),named("Circle of Passage",rally({movement:3},2)),blink(9),named("Phase Veil",hide(3)),blink(12),named("Gate Step",blink(15)),named("Pocket Sanctuary",shelter(15,2))],
  spirits:[hit("cold",a),named("Gentle Hand",effect("ally",1,[{kind:"stabilize"}],{field:true})),scout("Last Footsteps","path",9),shelter(5,1),ward(7,2,true),named("Grasping Dead",zone("difficult",2,5)),named("Shackle Spirit",mark("dazed",3)),sense("all",14,1),blink(8),named("Grave Host",zone("trap",2,7)),named("Lifegiving Breath",extra(cure(e),{kind:"stabilize"}))],
  emotion:[hit("mental",a),boost({attack:1,defense:1}),mark("dazed",1),cleanseMind(2),shove(2,"pull"),extra(hit("mental",b),{kind:"push",amount:2}),mark("dazed",3),extra(burst("mental",b,1),stagger(1)),named("Mass Hesitation",extra(burst("mental",c,2),slow(2))),named("Overwhelm Will",extra(hit("mental",d),stagger(3))),named("Repelling Chorus",extra(burst("mental",d,3),{kind:"push",amount:3}))],
  perception:[named("Illusory Cover",veil(1,2)),named("Veiled Passage",veil(1,4)),hide(1),boost({defense:2}),hide(2),veil(2,5),hide(4),snare(2,6),extra(blink(7),{kind:"buff",stats:{hidden:true},turns:2,self:true}),rally({hidden:true},2),named("Nightmare Landscape",zone("darkness",3,7))],
  dreams:[named("Restless Whisper",hit("mental",a)),named("Drowsiness",mark("slowed",2)),scout("Dream Scout","creatures",7),hit("mental",b),mark("dazed",2),extra(hit("mental",c),stagger(1)),named("Dreamwalk",blink(6)),named("Sleep Sigil",zone("trap",1,6)),named("Waking Nightmare",extra(hit("mental",d),stagger(2))),burst("mental",d,2),named("Astral Passage",blink(12))],
  thought:[named("Silent Cue",boost({attack:1},1)),scout("Read Trail Signs","path",5),detect("creatures",7),named("Battle Cant",boost({attack:1,defense:1},2)),named("Distant Warning",boost({defense:2},2,12)),rally({attack:1},2),named("Erase Your Trace",hide(3)),sense("traps",13,1),sense("creatures",18),named("Mental Breach",extra(hit("mental",d),stagger(1))),named("Thought Leech",extra(hit("mental",e),{kind:"buff",stats:{attack:2},turns:2,self:true}))],
  protection:[hit("radiant",a),ward(3),boost({dr:1},3),ward(6),boost({defense:2},3),ward(8,2,true),ward(10,4),shelter(7,1),shelter(10,2),extra(cleanseMind(6),barrier(8)),wall(9)],
  sanctuary:[boost({reduction:1},1),ward(3,3),hide(2),shelter(4,1),veil(2,6),zone("healing",1,5),zone("trap",2,5),wall(5),zone("difficult",3,6),shelter(12,2),shelter(16,3)],
  seals:[named("Chalk Seal",snare(1,2)),detect("creatures",7),named("Seal Passage",wall(2)),named("Find the Mechanism",detect("traps",8)),named("Warning Mouth",detect("creatures",11)),zone("trap",1,5),wall(5),scout("Mark Hidden Stores","magic",14),zone("trap",2,7),named("Sequester Ally",hide(4)),named("World Anchor",wall(9,12))],
  unraveling:[detect("magic",6),named("Counterward",ward(4)),cleanseMind(3),cleanseBody(3),named("Shatter Essence",hit("force",c)),cleanseMind(5),named("Sever Channel",extra(hit("mental",c),stagger(2))),extra(cleanseBody(5),{kind:"cleanse",keys:["dazed","slowed"],amount:5}),named("Null Mantle",shelter(10,2)),named("Sunder Enchantment",hit("force",e)),named("Unmake",extra(hit("force",[8,12,17]),stagger(2)))],
  channeling:[hit("force",a,6),transfer(2),transfer(2,true),transfer(4,true),transfer(4,false,12),named("Channel the Strike",boost({damage:4,attack:1})),transfer(6,true,10),transfer(7,false,10),named("Master's Conduit",boost({damage:6,attack:2},3)),transfer(9,true,12),transfer(12,false,12)],
};
export const SPELLS = BOOKS.flatMap(book => {
  const effects = pages[book.id];
  if (effects?.length !== book.pages.length) throw new Error("Incomplete spellbook " + book.id);
  return book.pages.map(([page,printedName,spCost],i) => {
    const spec = effects[i];
    return {id:"spell-"+book.id+"-"+page.toLowerCase(),linear:true, book:book.id, page, section:i<8 ? 1+Math.floor(i/2) : i-3,
      name:spec.dungeonName ?? printedName, printedName, spCost, discipline:"discipline-"+book.field,
      gamePower:true, deedsOnly:true, forgePower:true, spell:true, rank:1, minimumLevel:1, cost:0,
      description:spec.dungeonName ? "Dungeon adaptation of "+printedName+"." : printedName, ...spec};
  });
});

