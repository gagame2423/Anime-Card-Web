/* Pure tactical scoring from one actually fielded board; no rarity-only rewards. */
(function(host){
 'use strict';
 const C=host.AutoChessSystem,S=host.AutoChessSynergies,A=host.AutoChessAugments,R=host.RelicSystem;
 const zero=()=>({cohesion:0,itemization:0,fusion:0,total:0});
 function valid(score){return!!score&&['cohesion','itemization','fusion','total'].every(k=>Number.isInteger(score[k]))&&score.cohesion>=0&&score.cohesion<=3&&score.itemization>=0&&score.itemization<=2&&score.fusion>=0&&score.fusion<=1&&score.total===score.cohesion+score.itemization+score.fusion;}
 const summary=score=>valid(score)?Object.fromEntries(Object.keys(zero()).map(k=>[k,score[k]])):zero();
 function evaluate(p){
  const score=zero(),board=C.deployed(p),distinct=new Set(board.map(u=>u.cardId)),matches=(u,id)=>C.card(u)?.element===id||C.card(u)?.category.includes(id),traits=S.analyze(board,A.traits(p)),strong=traits.filter(t=>t.tier>=2).map(t=>({...t,real:new Set(board.filter(u=>matches(u,t.id)).map(u=>u.cardId)).size})).filter(t=>t.real>=3),contributors=new Set(board.filter(u=>strong.some(t=>matches(u,t.id))).map(u=>u.uid)),coverage=board.length?contributors.size/board.length:0,peak=Math.max(0,...strong.map(t=>t.tier));
  if(distinct.size>=3&&coverage>=.6&&strong.length){score.cohesion=1;if(coverage>=.75&&strong.some(t=>t.tier>=3&&t.real>=4))score.cohesion=2;if(coverage>=.85&&(strong.some(t=>t.tier===4&&t.real>=5)||strong.length>=2)&&distinct.size>=5)score.cohesion=3;}
  const equipped=board.filter(u=>u.relic&&R.validRoll(u.relic.roll)),items=equipped.map(u=>u.relic),value=(item,u)=>host.AutoChessAI?.relicValue(item,u,p)||0;
  let fitted=0,current=0;for(const u of equipped){const v=value(u.relic,u);current+=v;const roll=u.relic.roll,universal=roll.unique&&['enten_blade','god_leaf','nail'].includes(roll.kind);if(v>0&&(R.matchingUnit({card:C.card(u),relic:roll},roll)||universal))fitted++;}
  const matrix=board.map(u=>[...items.map(item=>value(item,u)),...Array(board.length).fill(0)]),assignment=host.AutoChessAI?.assignment(matrix)||[],optimal=assignment.reduce((n,j,i)=>n+(matrix[i]?.[j]||0),0),efficiency=optimal>0?current/optimal:0;
  if(fitted>=1&&efficiency>=.6)score.itemization=1;if(fitted>=2&&efficiency>=.85&&fitted/Math.max(1,equipped.length)>=.75)score.itemization=2;
  const fused=board.filter(u=>(u.fusionDepth||0)>=1&&strong.some(t=>matches(u,t.id)));if(score.cohesion&&fused.length)score.fusion=1;
  score.total=score.cohesion+score.itemization+score.fusion;
  return{...score,evidence:{units:board.length,distinct:distinct.size,coverage:Math.round(coverage*100),peakTier:peak,matchingRelics:fitted,equipped:equipped.length,itemEfficiency:Math.round(efficiency*100),alignedFusions:fused.length,traits:strong.map(t=>({id:t.id,tier:t.tier,real:t.real}))}};
 }
 function record(s,p,fielded=p){
  const row=s.matchStats?.tacticians?.[p.id];if(!row)return;const result={...evaluate(fielded),round:C.label(s)},old=row.strategy;
  row.strategy={version:1,final:result,peak:!old?.peak||result.total>old.peak.total?result:old.peak};
 }
 function forPlayer(s,p=C.get(s)){const row=s.matchStats?.tacticians?.[p.id]?.strategy;return row?.version===1&&valid(row.peak)?{...row.peak}: {...zero(),evidence:{units:0,coverage:0,matchingRelics:0,alignedFusions:0},round:null};}
 host.AutoChessStrategy=Object.freeze({zero,valid,summary,evaluate,record,forPlayer});
})(window);
