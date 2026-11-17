/* Public, bounded replay codec. No inventory, network, timers or account writes. */
(function(host){
 'use strict';
 const C=host.AutoChessSystem,A=host.AutoChessAugments,S=host.AutoChessSynergies,R=host.RelicSystem;
 const MAX_BYTES=5900,MAX_STAGES=600,KEY='anime_card_rng_ac_last_run_v1',elements=['Fire','Water','Nature','Electric','Dark','Holy'];
 const fields=['hp','atk','dodge','critChance','critDamage','expBonus','followChance','specialBonus','odmChainBonus','firstAttackBonus','perEnemyAtk'];
 const bytes=v=>host.OnlineUtils.bytes(JSON.stringify(v)).length;
 const stageNumber=key=>{const m=/^(\d{1,3})-([1-6])$/.exec(String(key));return m&&+m[1]>=1&&+m[1]<=100&&!(+m[1]===1&&+m[2]>4)?+m[1]*10+(+m[2]):-1;};
 const name=v=>String(v||'Player').replace(/[\u0000-\u001f]/g,'').slice(0,40);
 const uid=v=>typeof v==='string'&&v.length>0&&v.length<=128&&!/[\u0000-\u0020]/.test(v);
 function publicFields(meta){const r=host.AutoChessRanked.rankOf(Number.isSafeInteger(meta.elo)&&meta.elo>=0?meta.elo:0),peakElo=Math.max(r.elo,Number.isSafeInteger(meta.peakElo)&&meta.peakElo>=0?meta.peakElo:0);return{rank:r.index,tier:r.id,division:r.division,avatar:r.image,bannerCardId:C.card(meta.bannerCardId)?.id||null,peakElo,peakRank:host.AutoChessRanked.rankOf(peakElo).label};}
 function packRelic(r){if(!R.validRoll(r))return null;r=R.normalizeRoll(r);return[R.DEFINITIONS.findIndex(d=>d.kind===r.kind),['common','rare','legendary'].indexOf(r.rarity),r.unique?1:0,elements.indexOf(r.element),...fields.map(k=>Math.round((r[k]||0)*1000))];}
 function unpackRelic(row){
  if(!Array.isArray(row)||![14,15].includes(row.length)||row.some(n=>!Number.isInteger(n)))return null;
  const def=R.DEFINITIONS[row[0]],rarity=['common','rare','legendary'][row[1]];if(!def||!rarity||![0,1].includes(row[2])||row[3]<-1||row[3]>5)return null;
  const result={kind:def.kind,rarity,unique:!!row[2],element:elements[row[3]]??null,...Object.fromEntries(fields.map((k,i)=>[k,(row[4+i]||0)/1000]))};
  if(def.kind==='bomb')result.bombVersion=2;if(def.kind==='god_leaf'&&row.length===15)result.godLeafVersion=2;return R.validRoll(result)?R.normalizeRoll(result):null;
 }
 function record(s,final=false){
  if(!s.hybrid||s.finished&&!final)return;const p=C.get(s),stageKey=C.label(s),rows=s.hybrid.stages ||= {};
  if(Object.keys(rows).length>=MAX_STAGES&&!rows[stageKey])return;
  rows[stageKey]={stageKey,lastStandUsed:!!p.augmentState?.lastStandUsed,hp:p.hp,level:p.level,board:C.deployed(p).map(u=>({cardId:u.cardId,rarity:C.card(u).rarity,position:u.board,relicId:u.relic?.uid||null,relic:u.relic?C.clone(u.relic.roll):null})),synergies:S.analyze(C.deployed(p),A.traits(p)).filter(t=>t.tier).map(t=>({id:t.id,count:t.count,tier:t.tier})),augments:[...p.augments]};
 }
 function encode(meta,stages){
  const all=Object.entries(stages||{}).filter(([key])=>stageNumber(key)>0).sort((a,b)=>stageNumber(a[0])-stageNumber(b[0])).slice(0,MAX_STAGES);if(!all.length||!uid(meta.uid))return null;
  function build(rows){
   const cards=[],relics=[],boards=[],augments=[],indices=[new Map(),new Map(),new Map(),new Map()];
   const entry=(list,map,value)=>{const key=JSON.stringify(value);if(!map.has(key)){map.set(key,list.length);list.push(value);}return map.get(key);},packed={};
   for(const [key,row]of rows){
    const board=row.board.slice(0,11).map(u=>[entry(cards,indices[0],u.cardId),u.position,u.relic?entry(relics,indices[1],packRelic(u.relic)):-1]);
    packed[key]=[row.hp,row.level,entry(boards,indices[2],board),entry(augments,indices[3],row.augments.slice(0,3))];if(row.lastStandUsed)packed[key].push(1);
   }
   return{version:1,codec:'ac-run-1',uid:meta.uid,name:name(meta.name),matchId:String(meta.matchId||'').slice(0,80),placement:Math.max(1,Math.min(8,meta.placement||8)),elo:Math.max(0,Math.floor(meta.elo||0)),...publicFields(meta),wins:Math.max(0,Math.floor(meta.wins||0)),rounds:all.length,sampled:rows.length<all.length,cards,relics,boards,augments,stages:packed};
  }
  let rows=all,payload=build(rows);
  // Preserve the earliest and latest stage; evenly thin intermediate snapshots
  // only when required by the hard wire budget. Lookup uses the nearest past stage.
  while((bytes(payload)>MAX_BYTES||payload.relics.length>64)&&rows.length>2){rows=rows.filter((row,i)=>i===0||i===rows.length-1||i%2===0);if(rows.length===3&&bytes(build(rows))>MAX_BYTES)rows=[rows[0],rows[2]];payload=build(rows);}
  return bytes(payload)<=MAX_BYTES?payload:null;
 }
 function decode(input){
  try{
   if(!input||input.version!==1||input.codec!=='ac-run-1'||!uid(input.uid)||bytes(input)>6144||!Array.isArray(input.cards)||input.cards.length>C.pools.flat().length||input.cards.some(id=>!C.card(id))||!Array.isArray(input.relics)||input.relics.length>64||!Array.isArray(input.boards)||input.boards.length>MAX_STAGES||!Array.isArray(input.augments)||input.augments.length>16||!input.stages||typeof input.stages!=='object'||Array.isArray(input.stages))return null;
   const publicMeta=publicFields(input);if(['rank','tier','division','avatar','bannerCardId','peakElo','peakRank'].some(k=>Object.hasOwn(input,k)&&input[k]!==publicMeta[k]))return null;
   const relics=input.relics.map(unpackRelic);if(relics.some(r=>!r))return null;
   const augmentSets=input.augments.map(ids=>{if(!Array.isArray(ids)||ids.length>3||ids.some(id=>!A.get(id))||new Set(ids.map(id=>A.get(id).family)).size!==ids.length)throw Error('Invalid Augments.');return ids;});
   const boards=input.boards.map(rows=>{if(!Array.isArray(rows)||rows.length>11)throw Error('Invalid board.');const used=new Set();return rows.map(tuple=>{if(!Array.isArray(tuple)||tuple.length!==3||tuple.some(v=>!Number.isInteger(v)))throw Error('Invalid token.');const [ci,position,ri]=tuple,card=C.card(input.cards[ci]);if(!card||position<0||position>27||used.has(position)||ri<-1||ri>=relics.length)throw Error('Invalid tile.');used.add(position);return{cardId:card.id,rarity:card.rarity,position,relicId:ri>=0?'replay_relic_'+ri:null,relic:ri>=0?relics[ri]:null};});});
   const stages={};if(Object.keys(input.stages).length>MAX_STAGES)return null;
   for(const [key,row]of Object.entries(input.stages)){if(stageNumber(key)<0||!Array.isArray(row)||![4,5].includes(row.length)||row.some(v=>!Number.isInteger(v))||row.length===5&&row[4]!==1)return null;const [hp,level,bi,ai]=row,board=boards[bi],augments=augmentSets[ai];if(hp<0||hp>100||level<1||level>9||!board||!augments||board.length>C.teamCap({level,augments}))return null;if(row[4]&&!A.effects({augments}).lastStandHp)return null;stages[key]={stageKey:key,lastStandUsed:row[4]===1,hp,level,board,augments,synergies:S.analyze(board.map(u=>({card:C.card(u.cardId)})),A.traits({augments})).filter(t=>t.tier).map(t=>({id:t.id,count:t.count,tier:t.tier}))};}
   if(!Object.keys(stages).length)return null;
   return{uid:input.uid,name:name(input.name),...publicMeta,elo:Number.isSafeInteger(input.elo)&&input.elo>=0?input.elo:0,wins:Number.isSafeInteger(input.wins)&&input.wins>=0?input.wins:0,placement:input.placement,stages,sampled:!!input.sampled,wire:input};
  }catch(_){return null;}
 }
 function at(run,key){if(!run)return null;if(run.stages[key])return run.stages[key];const target=stageNumber(key),available=Object.keys(run.stages).filter(k=>stageNumber(k)<=target).sort((a,b)=>stageNumber(b)-stageNumber(a));return available.length?run.stages[available[0]]:null;}
 function last(){try{return decode(JSON.parse(host.localStorage.getItem(KEY)||'null'))?.wire||null;}catch(_){return null;}}
 function save(payload){if(!decode(payload))return false;try{host.localStorage.setItem(KEY,JSON.stringify(payload));return true;}catch(_){return false;}}
 host.AutoChessRuns=Object.freeze({MAX_BYTES,MAX_STAGES,KEY,bytes,stageNumber,name,uid,publicFields,packRelic,unpackRelic,record,encode,decode,at,last,save});
})(window);
