// Dungeon adaptations of Pointwork, Openings, Detection, Telekinesis and Soul Capacity.
const strike=(name,attribute,amount,cue={})=>({name,attribute,range:1,target:"enemy",category:"main",effects:[{kind:"damage",type:"physical",amount},{kind:"cue",minimumBand:1,...cue}]});
const spell=(name,spCost,range,target,effects,extra={})=>({name,spCost,range,target,effects,category:"main",spell:true,...extra});
const damage=(type,amount)=>({kind:"damage",type,amount});
const scan=(name,spCost,sense,range)=>spell(name,spCost,0,"self",[{kind:"sense",sense,range}],{field:true,category:"maneuver"});
export const DEEDS_POWERS = Object.entries({
  "direct-thrust":{...strike("Direct Thrust","agility",[1,2,4],{ally:false,safe:true}),weapon:"melee",oneHand:true},
  "passing-thrust":{...strike("Passing Thrust","agility",[2,3,5],{ally:false,safe:true,steps:2}),weapon:"melee",oneHand:true},
  "needle-eye":{...strike("Needle’s Eye","agility",[3,5,7],{ally:false,safe:true,steps:2}),weapon:"melee",oneHand:true},
  "exploit-opening":strike("Exploit the Opening","knowledge",[1,3,4],{ally:true}),
  "divide-attention":strike("Divide Their Attention","knowledge",[2,4,6],{ally:true,aid:true}),
  "spring-trap":strike("Spring the Trap","knowledge",[4,6,8],{ally:true,aid:true,ignoreTarget:true,steps:2}),
  "detect-magic":scan("Detect Magic",0,"magic",6),
  "find-traps":scan("Find Traps",2,"traps",6),
  "true-seeing":scan("True Seeing",3,"creatures",8),
  "find-path":scan("Find the Path",5,"path",16),
  "sight-true":scan("Sight True",6,"all",18),
  "arcane-bolt":spell("Arcane Bolt",0,12,"enemy",[damage("force",[2,3,5])]),
  "staying":spell("Staying",2,6,"enemy",[{kind:"condition",key:"slowed",rating:3}]),
  "shatter":spell("Shatter",3,6,"ground",[damage("force",[3,5,7])],{radius:1,allCreatures:true}),
  "force-ward":spell("Resilient Shell",4,6,"ally",[{kind:"barrier",turns:2,amount:7}]),
  "force-wall":spell("Wall of Force",5,6,"ground",[{kind:"zone",surface:"wall",rounds:3}],{shape:"wall"}),
  "force-lance":spell("Hammer Lance",5,12,"enemy",[damage("force",[4,6,8]),{kind:"push",amount:3,minimumBand:1}]),
  "force-crush":spell("Gravitic Well",6,12,"ground",[damage("force",[4,6,8]),{kind:"condition",key:"slowed",rating:3,minimumBand:1}],{radius:2}),
}).map(([slug,p])=>({id:"power-"+slug,gamePower:true,deedsOnly:true,forgePower:true,rank:1,description:p.name,...p}));

const power=(id)=>({name:DEEDS_POWERS.find(p=>p.id==="power-"+id).name,power:"power-"+id});
const improved=(name,power,changes,description)=>({name,upgrade:{power:"power-"+power,...changes},description});
const stat=(name,stats,description)=>({name,stats,description});
const schedule=entries=>entries.map((e,i)=>({...e,cost:[1,2,2,3,4,4,5][i],minimumLevel:[1,1,1,3,3,3,7][i]}));
export const DEEDS_PATHS = {
  fencing:[["Pointwork",schedule([
    power("direct-thrust"), improved("Direct Thrust II","direct-thrust",{fixedProfile:[2,3,5]},"Direct Thrust deals 2/3/5 physical damage."),
    improved("Direct Thrust III","direct-thrust",{strongSteps:2},"A Strong hit grants an optional two-square safe step."),
    power("passing-thrust"), improved("Passing Thrust II","passing-thrust",{fixedProfile:[2,4,6]},"Passing Thrust deals 2/4/6 physical damage."),
    improved("Passing Thrust III","passing-thrust",{strongSteps:3},"On Strong, reposition up to three squares."),
    power("needle-eye")])]],
  tactics:[["Openings",schedule([
    power("exploit-opening"),improved("Exploit the Opening II","exploit-opening",{fixedProfile:[2,4,5]},"Exploit the Opening deals 2/4/5 physical damage."),
    improved("Exploit the Opening III","exploit-opening",{ignoreTarget:true},"The attacked enemy cannot react to the ally’s step."),
    power("divide-attention"),improved("Divide Their Attention II","divide-attention",{fixedProfile:[3,5,7]},"Divide Their Attention deals 3/5/7 physical damage."),
    improved("Divide Their Attention III","divide-attention",{strongSteps:2},"A Strong hit grants your chosen ally up to two squares."),
    power("spring-trap")])]],
  divination:[["Detection",schedule([
    power("detect-magic"),power("find-traps"),stat("Identify",{identify:1},"Examine a carried find for ten minutes and spend 3 SP to learn its properties. Each roll uncovers one to three facts."),
    power("true-seeing"),stat("Scaling Analysis",{identify:1},"Each identification ritual reveals one additional fact."),
    power("find-path"),power("sight-true")])]],
  force:[["Telekinesis",schedule(["arcane-bolt","staying","shatter","force-ward","force-wall","force-lance","force-crush"].map(power))]],
  spellcraft:[["Soul Capacity",schedule([2,2,3,3,3,3,4].map((n,i)=>stat(["Soul Capacity I","Soul Capacity II","Soul Capacity III","Deep Reserves I","Deep Reserves II","Deep Reserves III","Soul Wellspring"][i],{maximumSp:n}, "Increase maximum SP by "+n+". Learning this circle preserves current SP."))) ]],
};

