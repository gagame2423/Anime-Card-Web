/* Lifetime Auto Chess profile. Main-save transaction is authoritative; no network. */
(function(host){
 'use strict';
 const C=host.AutoChessSystem,R=host.AutoChessRanked,S=host.AutoChessSynergies,KEY='autochess_profile_stats',MAX=Number.MAX_SAFE_INTEGER;
 const object=v=>!!v&&typeof v==='object'&&!Array.isArray(v),safe=n=>Number.isSafeInteger(n)&&n>=0,number=n=>Number.isFinite(n)&&n>=0&&n<=MAX;
 const matchId=id=>/^chess_[a-z0-9]+_[a-z0-9]+$/.test(id),count=n=>safe(n)?n:0,add=(a,b)=>Math.min(MAX,a+b);
 const counters=['matches','wins','top4','placementTotal','placementSamples','longestWinStreak','threeStarFusions','totalGoldSpent'];
 let bridge={};
 const fresh=()=>({version:1,bannerCardId:null,peakElo:0,peakRank:'Iron IV',matches:0,wins:0,top4:0,placementTotal:0,placementSamples:0,longestWinStreak:0,threeStarFusions:0,totalDamageDealt:0,totalGoldSpent:0,cards:{},synergies:{},receipts:{}});
 function normalise(raw,rank={}){
  const p=fresh();if(object(raw)&&raw.version===1){for(const k of counters)p[k]=count(raw[k]);p.totalDamageDealt=number(raw.totalDamageDealt)?raw.totalDamageDealt:0;p.bannerCardId=C.card(raw.bannerCardId)?.id||null;p.peakElo=count(raw.peakElo);
   for(const [id,row]of Object.entries(object(raw.cards)?raw.cards:{}))if(C.card(id)&&object(row)&&safe(row.matches)&&safe(row.rounds))p.cards[id]={matches:row.matches,rounds:row.rounds};
   for(const [id,n]of Object.entries(object(raw.synergies)?raw.synergies:{}))if(S.definition(id)&&safe(n))p.synergies[id]=n;
   for(const [id,flags]of Object.entries(object(raw.receipts)?raw.receipts:{}).slice(-10000))if(matchId(id)&&[1,2,3].includes(flags))p.receipts[id]=flags;
  }
  p.matches=Math.max(p.matches,count(rank.matches));p.wins=Math.max(p.wins,count(rank.wins));p.peakElo=Math.max(p.peakElo,count(rank.elo),count(rank.peakElo));
  for(const [id,q]of Object.entries(rank.receipts||{}).slice(-10000))if(matchId(id)&&R.validQuote(q)){
   p.peakElo=Math.max(p.peakElo,q.before,q.after);if(!(p.receipts[id]&1)){p.placementTotal=add(p.placementTotal,q.placement);p.placementSamples=add(p.placementSamples,1);if(q.placement<=4)p.top4=add(p.top4,1);p.receipts[id]=(p.receipts[id]||0)|1;}
  }
  p.matches=Math.max(p.matches,p.placementSamples,p.wins);p.wins=Math.min(p.matches,p.wins);p.top4=Math.min(p.matches,Math.max(p.wins,p.top4));p.peakRank=R.rankOf(p.peakElo).label;trim(p);return p;
 }
 function trim(p){const keys=Object.keys(p.receipts);for(const key of keys.slice(0,Math.max(0,keys.length-10000)))delete p.receipts[key];}
 function valid(p){return object(p)&&p.version===1&&counters.every(k=>safe(p[k]))&&number(p.totalDamageDealt)&&safe(p.peakElo)&&p.peakRank===R.rankOf(p.peakElo).label&&(p.bannerCardId===null||!!C.card(p.bannerCardId))&&p.wins<=p.matches&&p.top4<=p.matches&&p.placementSamples<=p.matches&&object(p.cards)&&Object.keys(p.cards).length<=C.pools.flat().length&&Object.entries(p.cards).every(([id,v])=>!!C.card(id)&&object(v)&&safe(v.matches)&&safe(v.rounds))&&object(p.synergies)&&Object.keys(p.synergies).length<=S.DEFINITIONS.length&&Object.entries(p.synergies).every(([id,n])=>!!S.definition(id)&&safe(n))&&object(p.receipts)&&Object.keys(p.receipts).length<=10000&&Object.entries(p.receipts).every(([id,n])=>matchId(id)&&[1,2,3].includes(n));}
 function record(raw,match,rank){
  const p=normalise(raw,rank),own=match&&C.get(match);if(!match?.finished||match.abandoned||!own||!matchId(match.id)||!Number.isInteger(own.rank)||own.rank<1||own.rank>8||p.receipts[match.id]&2)return p;
  if(!(p.receipts[match.id]&1)){p.matches=add(p.matches,1);p.placementSamples=add(p.placementSamples,1);p.placementTotal=add(p.placementTotal,own.rank);if(own.rank===1)p.wins=add(p.wins,1);if(own.rank<=4)p.top4=add(p.top4,1);}
  const row=match.matchStats?.tacticians?.[own.id];if(row){
   p.longestWinStreak=Math.max(p.longestWinStreak,count(row.longestWinStreak));p.threeStarFusions=add(p.threeStarFusions,count(row.threeStarFusionsCount));p.totalDamageDealt=add(p.totalDamageDealt,number(row.totalDamageDealt)?row.totalDamageDealt:0);p.totalGoldSpent=add(p.totalGoldSpent,count(row.totalGoldSpent));
   for(const [id,u]of Object.entries(row.units||{}))if(C.card(id)&&count(u.roundsDeployed)>0){const old=p.cards[id]||{matches:0,rounds:0};p.cards[id]={matches:add(old.matches,1),rounds:add(old.rounds,count(u.roundsDeployed))};}
   for(const [id,t]of Object.entries(row.synergies||{}))if(S.definition(id))p.synergies[id]=add(p.synergies[id]||0,count(t.roundsActive));
  }
  p.receipts[match.id]=3;trim(p);return p;
 }
 function current(){return normalise(bridge.get?.(),bridge.rank?.()||R.current());}
 function refresh(){const p=current();try{host.localStorage.setItem(KEY,JSON.stringify(p));}catch(_){}return p;}
 function setBanner(id){if(id!==null&&!C.card(id))return false;const p=current();p.bannerCardId=id;return bridge.commit?.(p)===true;}
 function topCards(p=current()){return Object.entries(p.cards).filter(([id,v])=>C.card(id)&&v.matches>0).sort((a,b)=>b[1].matches-a[1].matches||b[1].rounds-a[1].rounds||a[0].localeCompare(b[0])).slice(0,6).map(([cardId,v])=>({card:C.card(cardId),...v}));}
 function favorites(p=current()){return Object.entries(p.synergies).filter(([,n])=>n>0).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,3).map(([id,rounds])=>({trait:S.definition(id),rounds}));}
 function publicMeta(){const p=current();return{bannerCardId:p.bannerCardId,peakElo:p.peakElo,peakRank:p.peakRank};}
 host.AutoChessProfile=Object.freeze({KEY,fresh,normalise,valid,record,current,refresh,setBanner,topCards,favorites,publicMeta,configure(options){bridge=options||{};refresh();}});
})(window);
