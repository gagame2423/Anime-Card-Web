/* Mode-specific Elo: pure rank math, main-save receipts and disposable UI. */
(function(host){
 'use strict';
 const TIERS=Object.freeze([
  ['iron','Iron',0,4,'#9fabb9'],['bronze','Bronze',400,4,'#ce9569'],['silver','Silver',800,4,'#c9d9ee'],['gold','Gold',1200,4,'#f2c962'],
  ['platinum','Platinum',1600,4,'#7ad7e2'],['emerald','Emerald',2000,4,'#69ddae'],['diamond','Diamond',2400,4,'#a4bfff'],
  ['master','Master',2800,3,'#cc9dff'],['grandmaster','Grandmaster',3100,2,'#ff8588'],['challenger','Challenger',3300,0,'#a9eeff']
 ].map(([id,name,base,divisions,color],index)=>Object.freeze({id,name,base,divisions,color,index,image:'assets/items/'+id+'.png'})));
 const TABLES=Object.freeze([[25,18,12,6,4,2,1,1],[18,12,7,2,-5,-9,-13,-18],[12,7,3,-1,-6,-10,-14,-18],[8,3,-3,-6,-9,-12,-15,-18],[5,-3,-5,-8,-10,-13,-15,-18]].map(Object.freeze));
 const LEGACY_TABLES=[[8,5,3,1,-2,-4,-6,-8],[6,3,1,0,-3,-5,-7,-9],[5,1,-2,-4,-6,-8,-10,-12],[5,-2,-4,-6,-8,-10,-11,-12]];
 const CACHE_KEY='ac_elo_leaderboard_cache',LOCAL_CACHE_KEY='anime_card_rng_ac_elo_cache_v1',SEEN_KEY='ac_rankup_seen',TTL=60000,MAX=Number.MAX_SAFE_INTEGER;
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let bridge={},overlay=null,restore=null,promotion=null,seen=new Set(),leaderboardJob=null;
 const fresh=()=>({version:1,elo:0,wins:0,matches:0,peakElo:0,peakRank:'Iron IV',receipts:{}}),safe=n=>Number.isSafeInteger(n)&&n>=0&&n<=MAX;
 function rankOf(value){const elo=safe(value)?value:0,tier=TIERS.slice().reverse().find(t=>elo>=t.base)||TIERS[0],division=tier.divisions?Math.max(0,tier.divisions-1-Math.floor((elo-tier.base)/100)):null,roman=division===null?'':['I','II','III','IV'][division];return{...tier,division:roman,label:tier.name+(roman?' '+roman:''),elo,progress:tier.divisions?elo%100:null,milestone:Math.min(33,Math.floor(elo/100))};}
 function deltaFor(elo,placement){if(!Number.isInteger(placement)||placement<1||placement>8)throw Error('Invalid Elo placement.');const tier=rankOf(elo).index;return TABLES[tier<=2?0:tier<=4?1:tier<=6?2:tier<=8?3:4][placement-1];}
 function tacticalSummary(value){if(value===undefined||value===null)return{cohesion:0,itemization:0,fusion:0,total:0};if(!value||!['cohesion','itemization','fusion','total'].every(k=>Number.isInteger(value[k]))||value.cohesion<0||value.cohesion>3||value.itemization<0||value.itemization>2||value.fusion<0||value.fusion>1||value.total!==value.cohesion+value.itemization+value.fusion)throw Error('Invalid tactical score.');return Object.fromEntries(['cohesion','itemization','fusion','total'].map(k=>[k,value[k]]));}
 const ONLINE_ELO_MULTIPLIER=3;
 function quoteElo(placement,before=current().elo,tactical=null,online=false){
  if(!safe(before))throw Error('Invalid starting Elo.');
  const rule=deltaFor(before,placement),bonus=tacticalSummary(tactical),net=rule+bonus.total;
  const after=Math.max(0,Math.min(MAX,before+(online&&net>0?net*ONLINE_ELO_MULTIPLIER:net)));
  return{before,after,delta:after-before,rule,placement,tableVersion:online?4:3,tactical:bonus};
 }
 function rebaseQuote(q,before){return quoteElo(q.placement,before,q.tableVersion>=3?q.tactical:null,q.tableVersion===4);}
 function validQuote(q,placement=q?.placement){
  if(!q||!safe(q.before)||!Number.isInteger(placement)||placement<1||placement>8||![undefined,2,3,4].includes(q.tableVersion))return false;
  let expected;if(q.tableVersion>=3){try{expected=quoteElo(placement,q.before,q.tactical,q.tableVersion===4);}catch(_){return false;}return Object.keys(expected).every(k=>k==='tactical'||q[k]===expected[k]);}
  const tier=rankOf(q.before).index,rule=q.tableVersion===2?deltaFor(q.before,placement):LEGACY_TABLES[tier<=3?0:tier<=6?1:tier<=8?2:3][placement-1],after=Math.max(0,Math.min(MAX,q.before+rule));expected={before:q.before,after,delta:after-q.before,rule,placement};return Object.keys(expected).every(k=>q[k]===expected[k]);
 }
 function normalise(raw){const result=fresh();if(!raw||typeof raw!=='object'||Array.isArray(raw))return result;for(const key of ['elo','wins','matches'])if(safe(raw[key]))result[key]=raw[key];for(const [id,quote]of Object.entries(raw.receipts||{}).slice(-10000))if(/^chess_[a-z0-9]+_[a-z0-9]+$/.test(id)&&validQuote(quote))result.receipts[id]={...quote};result.peakElo=Math.max(result.elo,safe(raw.peakElo)?raw.peakElo:0,...Object.values(result.receipts).flatMap(q=>[q.before,q.after]));result.peakRank=rankOf(result.peakElo).label;result.matches=Math.max(result.matches,result.wins,Object.keys(result.receipts).length);return result;}
 function validProfile(p){return!!p&&p.version===1&&['elo','wins','matches'].every(k=>safe(p[k]))&&(p.peakElo===undefined||safe(p.peakElo)&&p.peakElo>=p.elo&&p.peakRank===rankOf(p.peakElo).label)&&p.receipts&&typeof p.receipts==='object'&&!Array.isArray(p.receipts)&&Object.keys(p.receipts).length<=10000&&Object.entries(p.receipts).every(([id,q])=>/^chess_[a-z0-9]+_[a-z0-9]+$/.test(id)&&validQuote(q));}
 function current(){const p=bridge.getProfile?.();return{elo:safe(p?.elo)?p.elo:0,wins:safe(p?.wins)?p.wins:0,matches:safe(p?.matches)?p.matches:0,peakElo:Math.max(safe(p?.peakElo)?p.peakElo:0,safe(p?.elo)?p.elo:0),peakRank:rankOf(Math.max(safe(p?.peakElo)?p.peakElo:0,safe(p?.elo)?p.elo:0)).label};}
 function snapshot(){const p=current();return{elo:p.elo,tier:rankOf(p.elo).index};}
 function applyProfile(raw,id,quote){const p=normalise(raw);if(p.receipts[id])return p;if(!/^chess_[a-z0-9]+_[a-z0-9]+$/.test(id)||!validQuote(quote)||quote.before!==p.elo)throw Error('Refresh the Elo quote before saving this placement.');p.elo=quote.after;p.peakElo=Math.max(p.peakElo,quote.before,quote.after);p.peakRank=rankOf(p.peakElo).label;p.matches=Math.min(MAX,p.matches+1);if(quote.placement===1)p.wins=Math.min(MAX,p.wins+1);p.receipts[id]={...quote};if(Object.keys(p.receipts).length>10000)delete p.receipts[Object.keys(p.receipts)[0]];return p;}
 function cleanup(node){if(!node)return;const callback=node.acCleanup;node.remove();callback?.();}
 function modal(root,className,label){
  const node=host.document.createElement('section');node.className='ac-ranked-layer '+className;node.setAttribute('role','dialog');node.setAttribute('aria-modal','true');node.setAttribute('aria-label',label);
  const previous=host.document.activeElement,changed=[...root.children].filter(n=>!n.inert);for(const sibling of changed)sibling.inert=true;
  node.acCleanup=()=>{for(const sibling of changed)if(sibling.isConnected)sibling.inert=false;const other=root.querySelector('.ac-ranked-layer');if(other){for(const sibling of root.children)sibling.inert=sibling!==other;}else{const dialog=root.querySelector('.ac-dialog-layer:not([hidden])'),shell=root.querySelector('.ac-shell');if(dialog)dialog.inert=false;if(shell)shell.inert=!!dialog||root.classList.contains('ac-in-lobby')||!root.querySelector('#acRotatePrompt')?.hidden;}if(previous?.isConnected&&!previous.closest('[inert]'))previous.focus();};
  node.addEventListener('keydown',event=>{event.stopPropagation();if(event.key==='Escape'){event.preventDefault();cleanup(node);if(overlay===node)overlay=null;if(promotion===node)promotion=null;}else if(event.key==='Tab'){const list=[...node.querySelectorAll('button:not(:disabled),a[href]')];if(!list.length)return;if(event.shiftKey&&host.document.activeElement===list[0]){event.preventDefault();list.at(-1).focus();}else if(!event.shiftKey&&host.document.activeElement===list.at(-1)){event.preventDefault();list[0].focus();}}});root.append(node);return node;
 }
 function promotionSeen(id){if(seen.has(id))return true;try{const rows=JSON.parse(host.sessionStorage.getItem(SEEN_KEY)||'[]');if(Array.isArray(rows))for(const key of rows.slice(-1000))seen.add(key);}catch(_){}return seen.has(id);}
 function showPromotion(match,root){
  const q=match.reward?.elo;if(!match.paid||!validQuote(q)||rankOf(q.after).milestone<=rankOf(q.before).milestone||promotionSeen(match.id)||!root?.isConnected)return;
  seen.add(match.id);if(seen.size>1000)seen.delete(seen.values().next().value);try{host.sessionStorage.setItem(SEEN_KEY,JSON.stringify([...seen]));}catch(_){}
  cleanup(promotion);const from=rankOf(q.before),to=rankOf(q.after),node=modal(root,'ac-rankup','Rank up: '+to.label);promotion=node;if(to.index>from.index)host.AutoChessAudio?.rankUp(from.index,to.index);node.style.setProperty('--ac-rank-color',to.color);
  node.innerHTML='<div class="ac-rankup-rays" aria-hidden="true"></div><div class="ac-rankup-particles" aria-hidden="true">'+Array.from({length:24},(_,i)=>'<i style="--angle:'+(i*15)+'deg;--distance:'+(115+i%5*21)+'px;--delay:'+(i%4*.06)+'s"></i>').join('')+'</div><div class="ac-rankup-card"><span class="ac-eyebrow">A NEW CHAPTER BEGINS</span><div class="ac-rankup-emblem"><img class="ac-rank-old" src="'+from.image+'" alt="'+esc(from.label)+'"><img class="ac-rank-new" src="'+to.image+'" alt="'+esc(to.label)+'"></div><h2>RANK UP!</h2><h3>'+esc(to.label)+'</h3><p>'+q.before+' → '+q.after+' Elo <strong>+'+q.delta+'</strong></p><button class="ac-primary" data-ac-ranked-close>Continue</button></div>';
  node.querySelector('button').addEventListener('click',()=>{cleanup(node);if(promotion===node)promotion=null;});node.querySelector('button').focus();
 }
 function invalidateLeaderboard(clearLocal=false){try{host.sessionStorage.removeItem(CACHE_KEY);if(clearLocal)host.localStorage.removeItem(LOCAL_CACHE_KEY);}catch(_){} }
 function offlineCache(){try{const data=JSON.parse(host.localStorage.getItem(LOCAL_CACHE_KEY)||'null'),uid=host.CloudSaveSystem?.activeUser?.uid||'local_player';return data?.uid===uid&&Array.isArray(data.rows)&&data.rows.length?data.rows.slice(0,50):null;}catch(_){return null;}}
 function cache(){try{const c=JSON.parse(host.sessionStorage.getItem(CACHE_KEY)||'null'),uid=host.CloudSaveSystem?.activeUser?.uid||'local_player';if(c?.uid===uid&&Date.now()-c.at>=0&&Date.now()-c.at<TTL&&Array.isArray(c.rows)&&c.rows.length)return c.rows;invalidateLeaderboard();}catch(_){}return null;}
 function entry(row){
  if(!row||typeof row.uid!=='string'||!row.uid.length||row.uid.length>128)return null;
  const numeric=v=>{const n=typeof v==='string'&&v.trim()?Number(v):v;return safe(n)?n:0;},elo=numeric(row.elo),r=rankOf(elo);
  return{uid:row.uid,name:String(row.name||row.displayName||'Player '+row.uid.slice(-6)).replace(/[\u0000-\u001f]/g,'').slice(0,40),elo,wins:numeric(row.wins),matches:Math.max(numeric(row.wins),numeric(row.matches??row.gamesPlayed)),rank:r.index,tier:r.id,division:r.division,avatar:r.image};
 }
 function mergedRows(rows){
  const map=new Map();for(const row of rows||[]){const next=entry(row);if(next)map.set(next.uid,next);}
  const me=current(),uid=host.CloudSaveSystem?.activeUser?.uid||'local_player',self=entry({uid,name:host.CloudSaveSystem?.publicName||'You',...me});map.set(uid,self);
  const sorted=[...map.values()].sort((a,b)=>b.elo-a.elo||b.wins-a.wins||a.name.localeCompare(b.name)),top=sorted.slice(0,50);if(!top.some(r=>r.uid===uid))top.push({...self,outsideTop:true});return top;
 }
 function rowsHTML(rows){const self=host.CloudSaveSystem?.activeUser?.uid||'local_player';return '<ol class="ac-elo-rows">'+mergedRows(rows).map((row,i)=>{const r=rankOf(row.elo);return '<li class="'+(row.uid===self?'is-self':'')+'"><b>'+(row.outsideTop?'YOU':'#'+(i+1))+'</b><img src="'+r.image+'" alt="'+r.name+'"><div><strong>'+esc(row.name)+(row.uid===self?' · YOU':'')+'</strong><small>'+r.label+(row.outsideTop?' · local entry outside fetched top 50':'')+'</small></div><span><strong>'+row.elo.toLocaleString()+' Elo</strong><small>'+row.wins.toLocaleString()+' wins · '+row.matches.toLocaleString()+' matches</small></span></li>';}).join('')+'</ol>';}
 function showLeaderboard({inMatch=false,root}={}){
  if(!root?.isConnected)return;if(overlay?.isConnected){overlay.querySelector('button')?.focus();return;}
  host.AutoChessPanels?.close(root);host.AutoChessRelicView?.hide(root);
  const node=modal(root,'ac-elo-leaderboard','Auto Chess Elo Leaderboard');overlay=node;const me=current(),r=rankOf(me.elo),uid=host.CloudSaveSystem?.activeUser?.uid||'local_player';
  node.innerHTML='<div class="ac-elo-panel"><header><div><span class="ac-eyebrow">AUTO CHESS · GLOBAL RANKED STANDINGS</span><h2>Elo Leaderboard</h2></div><div class="ac-elo-actions"><button class="ac-elo-refresh" data-ac-leaderboard-refresh>↻ Refresh</button><button class="ac-icon-button" data-ac-leaderboard-close aria-label="Close Elo leaderboard">×</button></div></header><div class="ac-elo-personal"><img src="'+r.image+'" alt=""><strong>'+r.label+'<small>'+me.elo.toLocaleString()+' Elo · '+me.wins+' first-place wins · '+me.matches+' matches</small></strong></div><p class="ac-elo-status" role="status" aria-live="polite"></p><div class="ac-elo-body"></div></div>';
  const button=node.querySelector('[data-ac-leaderboard-close]'),refresh=node.querySelector('[data-ac-leaderboard-refresh]');
  button.addEventListener('click',()=>{cleanup(node);if(overlay===node)overlay=null;});node.addEventListener('click',e=>{if(e.target===node)button.click();});button.focus();
  const body=node.querySelector('.ac-elo-body'),status=node.querySelector('.ac-elo-status'),freshCache=cache();let saved=freshCache||offlineCache(),loading=false;body.innerHTML=rowsHTML(saved||[]);
  const duringMatch=()=>inMatch||!!host.AutoChessOnline?.inMatch;
  function mark(text,mode){status.textContent=text;status.dataset.sync=mode;}
  async function load(force=false){
   if(loading||!node.isConnected)return;
   if(duringMatch()){refresh.disabled=true;mark('Offline cache + your current rating · global refresh is available in the invite lobby. No in-match cloud query.','cached');return;}
   const cloud=host.CloudSaveSystem?.autoChessService;
   if(!cloud?.available||host.navigator.onLine===false){mark('Offline cache · sign in with Email/Google and connect to refresh the global leaderboard.','offline');return;}
   loading=true;refresh.disabled=true;node.setAttribute('aria-busy','true');mark('Loading global top 50 from Cloud Firestore…','loading');
   if(!leaderboardJob||leaderboardJob.uid!==uid){const task={uid,promise:null};task.promise=Promise.resolve().then(()=>cloud.leaderboard()).finally(()=>{if(leaderboardJob===task)leaderboardJob=null;});leaderboardJob=task;}
   try{
    const result=await leaderboardJob.promise;if(!node.isConnected||uid!==(host.CloudSaveSystem?.activeUser?.uid||'local_player'))return;
    if(result.localOnly){mark('Cloud unavailable · cached players and your current rating are preserved. Refresh to retry.','offline');return;}
    const rows=(result.rows||[]).map(entry).filter(Boolean);body.innerHTML=rowsHTML(rows);saved=rows;
    mark(rows.length?'Synced · global top 50 by Elo · updated '+new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'}):'Synced · no remote players published yet. Your current local rating is shown.','synced');
    if(rows.length){const value=JSON.stringify({uid,at:Date.now(),rows});try{host.sessionStorage.setItem(CACHE_KEY,value);}catch(_){}try{host.localStorage.setItem(LOCAL_CACHE_KEY,value);}catch(_){}}else invalidateLeaderboard(true);
   }catch(error){if(node.isConnected){body.innerHTML=rowsHTML(saved||[]);mark(String(error?.code||'').includes('permission-denied')?'Cloud access denied · deploy the updated firestore.rules and sign in. Your local rating is safe.':'Cloud unavailable · cached players are preserved. Refresh to retry.','error');}}
   finally{loading=false;if(node.isConnected){refresh.disabled=duringMatch();node.setAttribute('aria-busy','false');}}
  }
  refresh.addEventListener('click',()=>void load(true));
  if(duringMatch())void load();else if(freshCache)mark('Cached global standings · your current local rating is refreshed. Use Refresh for the latest cloud results.','cached');else void load();
 }
 function disposeUI(){cleanup(promotion);cleanup(overlay);promotion=overlay=null;}
 host.AutoChessRanked=Object.freeze({TIERS,TABLES,CACHE_KEY,fresh,rankOf,deltaFor,quoteElo,rebaseQuote,ONLINE_ELO_MULTIPLIER,validQuote,normalise,validProfile,current,snapshot,applyProfile,showPromotion,showLeaderboard,mergedRows,entry,invalidateLeaderboard,disposeUI,configure(options={}){bridge=options;}});
})(window);
