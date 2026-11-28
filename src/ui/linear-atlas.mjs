import { LINEAR_FIELDS, LINEAR_PATHS, ROMAN, studyRoot } from "../core/linear-atlas.mjs";
import { forgeOwned, forgeBudget, forgeSpent, forgeRequirements, forgeRefundPlan, forgePowerText } from "../core/forge.mjs";
import { FORGE_NODE } from "../core/forge-catalog.mjs";
import { disciplinePrice, signatureLevel } from "../core/deeds-development.mjs";
import { trainingTarget } from "../core/experience.mjs";
import { POWERS } from "../core/powers.mjs";
import { disciplineIcon } from "./book-symbols.mjs";
import { esc,icon } from "./icons.mjs";
import "./linear-atlas.css";

const title = word => word[0].toUpperCase()+word.slice(1);
const statNames = {capacity:"carrying capacity",craftDiscount:"ingredient discount",craftSpeed:"craft speed",restSp:"SP recovered on a brief rest",forageStudy:"food foraging weight",maximumSp:"maximum SP",identify:"identification training"};
function details(node) {
  if (node.spec) return '<p>'+esc(forgePowerText(node.spec))+'</p>';
  if (node.pages) return node.pages.map(id=>{
    const p=POWERS[id];
    return '<article class="study-page"><strong>'+esc(p.name)+'</strong><span>'+p.spCost+' SP</span><p>'+esc(forgePowerText(p))+'</p></article>';
  }).join("");
  if (node.kind==="origin") return "<p>Opens this discipline’s arms for study.</p>";
  return Object.entries(node.stats??{}).map(([key,v])=>'<p>+'+(key.startsWith("craft")?Math.round(v*100)+"%":v)+' '+esc(statNames[key]??key)+'</p>').join("")+(node.recipes??[]).map(r=>'<p>Learn to craft '+esc(r.slice(7).replaceAll("-"," "))+'</p>').join("")+(node.grant?'<p>'+esc(node.grant.slice(8).replaceAll("-"," "))+'</p>':"");
}
export function linearAtlas({root,game,C,index,draft:initial,onChange,close,attempt}) {
  let draft=initial??game.party[index].draft;
  let field=(draft.classDisciplines[0]??"discipline-arms").slice(11), selected=null, confirm=false;
  const owned=()=>forgeOwned(draft,C);
  const live=!onChange;
  const edit=fn=>attempt(()=>{
    fn();
    if(live) draft=game.party[index].draft;
    else onChange(structuredClone(draft));
    confirm=false;
    draw();
  });
  function selectFirst() {
    const path=LINEAR_PATHS.find(p=>p.field===field);
    return owned().has(studyRoot(field)) ? (path.nodes.find(n=>!owned().has(n.id))??path.nodes.at(-1)).id : studyRoot(field);
  }
  root.innerHTML='<div class="veil forge-veil"><section class="forge-window linear-window" role="dialog" aria-label="Discipline atlas"><header class="forge-header"><div><span class="eyebrow">DISCIPLINE ATLAS</span><h2></h2></div><div class="study-currency"></div><button class="icon-button forge-close" aria-label="Close atlas">'+icon("close")+'</button></header><div class="study-layout"><aside class="study-shelf"><h3>Disciplines</h3><nav></nav><div class="study-signatures"></div></aside><main class="study-tracks"></main><aside class="study-reader"></aside></div></section></div>';
  root.querySelector(".forge-close").onclick=close;
  root.querySelector("h2").textContent=draft.name||"New adventurer";
  function draw(){
    const set=owned(), blocked=live?game.forgeReason(index):"", trained=draft.progression.level;
    const money=forgeBudget(draft,C)-forgeSpent(draft);
    const ready=live?trainingTarget(game.party[index]):trained;
    root.querySelector(".study-currency").innerHTML='<small>Level '+trained+'</small><strong>'+money+' DP</strong>'+(ready>trained?'<button class="primary" data-train '+(blocked?'disabled':'')+'>Train to level '+ready+'</button>':'');
    const trainButton=root.querySelector("[data-train]"); if(trainButton) trainButton.onclick=()=>edit(()=>game.trainForge(index));
    const shelf=root.querySelector(".study-shelf nav");
    shelf.innerHTML=[...LINEAR_FIELDS].sort((a,b)=>Number(set.has(studyRoot(b)))-Number(set.has(studyRoot(a)))||a.localeCompare(b)).map(f=>'<button data-field="'+f+'" aria-pressed="'+(f===field)+'">'+disciplineIcon("discipline-"+f)+'<span>'+title(f)+'</span><small>'+(set.has(studyRoot(f))?"◆":"◇")+'</small></button>').join("");
    shelf.querySelectorAll("button").forEach(b=>b.onclick=()=>{field=b.dataset.field;selected=null;confirm=false;draw();});
    const cls=C.choices.find(c=>c.id===draft.classId);
    const signatures=root.querySelector(".study-signatures");
    signatures.innerHTML=cls?[1,3,7].filter(t=>signatureLevel(draft,t)<=trained).map(t=>'<label>Level '+signatureLevel(draft,t)+' signature<select data-tier="'+t+'" '+(blocked||(live&&draft.signatures[t])?'disabled':'')+'><option value="">Choose signature</option>'+cls.signatures[t].map(id=>'<option value="'+id+'" '+(draft.signatures[t]===id?'selected':'')+'>'+esc(POWERS[id].name)+'</option>').join("")+'</select></label>').join(""):"";
    signatures.querySelectorAll("select").forEach(b=>b.onchange=()=>edit(()=>{const next=structuredClone(draft);next.signatures[b.dataset.tier]=b.value;if(live)game.forgeCommit(index,next);else draft=next;}));
    const rootId=studyRoot(field), known=set.has(rootId);
    selected??=selectFirst();
    const tracks=root.querySelector(".study-tracks");
    tracks.innerHTML='<header><div class="eyebrow">'+(known?"STUDIED DISCIPLINE":"NEW DISCIPLINE")+'</div><h2>'+title(field)+'</h2><button data-node="'+rootId+'">'+(known?"Study origin":"Learn discipline · "+disciplinePrice(draft,FORGE_NODE[rootId])+" DP")+'</button></header>'+LINEAR_PATHS.filter(p=>p.field===field).map(path=>'<section class="study-arm"><small>'+ (path.isBook?"SPELLBOOK":"TECHNIQUE ARM")+'</small><h3>'+esc(path.name)+'</h3><div class="study-steps">'+path.nodes.map((n,i)=>'<button data-node="'+n.id+'" class="'+(set.has(n.id)?"learned":set.has(n.requires[0])?"frontier":"locked")+(i===6?" mastery":"")+'" aria-pressed="'+(n.id===selected)+'" aria-label="'+esc(path.name+" · "+n.name)+'"><b>'+ROMAN[i]+'</b><span>'+esc(path.isBook?n.pages.map(id=>POWERS[id].name).join(" / "):n.name)+'</span></button>').join("")+'</div></section>').join("");
    tracks.querySelectorAll("[data-node]").forEach(b=>b.onclick=()=>{selected=b.dataset.node;confirm=false;draw();});
    const n=FORGE_NODE[selected], has=set.has(selected), reasons=forgeRequirements(n,draft,C), paid=draft.forge.nodes.includes(selected);
    const plan=paid&&confirm?forgeRefundPlan(draft,C,selected):null;
    const reader=root.querySelector(".study-reader");
    reader.innerHTML='<small class="eyebrow">'+(n.pages?"SPELLBOOK SECTION":n.stage===7?"MASTERY":title(field))+'</small><h2>'+esc(n.name)+'</h2><p class="study-price">'+(has?"Learned":disciplinePrice(draft,n)+" DP · Level "+(n.minimumLevel??1))+'</p>'+details(n)+(n.pages?'<p class="cost-note">Study adds these pages to your personal spellbook.</p>':n.spec?'<p class="cost-note">This arm uses one action slot through mastery.</p>':'')+(has?(paid?'<button data-refund '+(blocked?'disabled':'')+'>'+ (plan?'Confirm refund · '+plan.refund+' DP':'Refund this stage')+'</button>'+(plan?'<p>Removes '+plan.removed.map(id=>esc(FORGE_NODE[id].name)).join(", ")+'.</p>':''):''):'<button class="primary" data-study '+(blocked||reasons.length?'disabled':'')+'>Study · '+disciplinePrice(draft,n)+' DP</button><p>'+esc(blocked||reasons.join(" "))+'</p>');
    const buy=reader.querySelector("[data-study]"); if(buy) buy.onclick=()=>edit(()=>{if(live)game.editForge(index,{buy:selected});else {const why=forgeRequirements(n,draft,C);if(why.length)throw Error(why.join(" "));draft.forge.nodes.push(selected);}});
    const refund=reader.querySelector("[data-refund]"); if(refund) refund.onclick=()=>{if(!confirm){confirm=true;draw();return;}edit(()=>{if(live)game.editForge(index,{refund:selected});else draft=plan.draft;});};
  }
  draw();
  return ()=>{};
}

