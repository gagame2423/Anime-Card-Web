/* Mode-specific Elo: pure rank math, main-save receipts and disposable UI. */
(function(host){
 'use strict';
 const TIERS=Object.freeze([
  ['iron','Iron',0,4,'#9fabb9'],['bronze','Bronze',400,4,'#ce9569'],['silver','Silver',800,4,'#c9d9ee'],['gold','Gold',1200,4,'#f2c962'],
  ['platinum','Platinum',1600,4,'#7ad7e2'],['emerald','Emerald',2000,4,'#69ddae'],['diamond','Diamond',2400,4,'#a4bfff'],
  ['master','Master',2800,3,'#cc9dff'],['grandmaster','Grandmaster',3100,2,'#ff8588'],['challenger','Challenger',3300,0,'#a9eeff']
 ].map(([id,name,base,divisions,color],index)=>Object.freeze({id,name,base,divisions,color,index,image:'assets/items/'+id+'.png'})));
 const TABLES=Object.freeze([[8,5,3,1,-2,-4,-6,-8],[6,3,1,0,-3,-5,-7,-9],[5,1,-2,-4,-6,-8,-10,-12],[5,-2,-4,-6,-8,-10,-11,-12]].map(Object.freeze));
 const CACHE_KEY='ac_elo_leaderboard_cache',SEEN_KEY='ac_rankup_seen',TTL=600000,MAX=Number.MAX_SAFE_INTEGER;
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let bridge={},overlay=null,restore=null,promotion=null,seen=new Set(),leaderboardJob=null;
 const fresh=()=>({version:1,elo:0,wins:0,matches:0,receipts:{}}),safe=n=>Number.isSafeInteger(n)&&n>=0&&n<=MAX;
 function rankOf(value){const elo=safe(value)?value:0,tier=TIERS.slice().reverse().find(t=>elo>=t.base)||TIERS[0],division=tier.divisions?Math.max(0,tier.divisions-1-Math.floor((elo-tier.base)/100)):null,roman=division===null?'':['I','II','III','IV'][division];return{...tier,division:roman,label:tier.name+(roman?' '+roman:''),elo,progress:tier.divisions?elo%100:null,milestone:Math.min(33,Math.floor(elo/100))};}
 function deltaFor(elo,placement){if(!Number.isInteger(placement)||placement<1||placement>8)throw Error('Invalid Elo placement.');const tier=rankOf(elo).index;return TABLES[tier<=3?0:tier<=6?1:tier<=8?2:3][placement-1];}
 function quoteElo(placement,before=current().elo){if(!safe(before))throw Error('Invalid starting Elo.');const rule=deltaFor(before,placement),after=Math.max(0,Math.min(MAX,before+rule));return{before,after,delta:after-before,rule,placement};}
 function validQuote(q,placement=q?.placement){if(!q||!safe(q.before)||!Number.isInteger(placement)||placement<1||placement>8)return false;const expected=quoteElo(placement,q.before);return Object.keys(expected).every(k=>q[k]===expected[k]);}
 function normalise(raw){const result=fresh();if(!raw||typeof raw!=='object'||Array.isArray(raw))return result;for(const key of ['elo','wins','matches'])if(safe(raw[key]))result[key]=raw[key];for(const [id,quote]of Object.entries(raw.receipts||{}).slice(-10000))if(/^chess_[a-z0-9]+_[a-z0-9]+$/.test(id)&&validQuote(quote))result.receipts[id]={...quote};return result;}
 function validProfile(p){return!!p&&p.version===1&&['elo','wins','matches'].every(k=>safe(p[k]))&&p.receipts&&typeof p.receipts==='object'&&!Array.isArray(p.receipts)&&Object.keys(p.receipts).length<=10000&&Object.entries(p.receipts).every(([id,q])=>/^chess_[a-z0-9]+_[a-z0-9]+$/.test(id)&&validQuote(q));}
 function current(){const p=bridge.getProfile?.();return{elo:safe(p?.elo)?p.elo:0,wins:safe(p?.wins)?p.wins:0,matches:safe(p?.matches)?p.matches:0};}
 function snapshot(){const p=current();return{elo:p.elo,tier:rankOf(p.elo).index};}
 function applyProfile(raw,id,quote){const p=normalise(raw);if(p.receipts[id])return p;if(!/^chess_[a-z0-9]+_[a-z0-9]+$/.test(id)||!validQuote(quote)||quote.before!==p.elo)throw Error('Refresh the Elo quote before saving this placement.');p.elo=quote.after;p.matches=Math.min(MAX,p.matches+1);if(quote.placement===1)p.wins=Math.min(MAX,p.wins+1);p.receipts[id]={...quote};if(Object.keys(p.receipts).length>10000)delete p.receipts[Object.keys(p.receipts)[0]];return p;}
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
  cleanup(promotion);const from=rankOf(q.before),to=rankOf(q.after),node=modal(root,'ac-rankup','Rank up: '+to.label);promotion=node;node.style.setProperty('--ac-rank-color',to.color);
  node.innerHTML='<div class="ac-rankup-rays" aria-hidden="true"></div><div class="ac-rankup-particles" aria-hidden="true">'+Array.from({length:24},(_,i)=>'<i style="--angle:'+(i*15)+'deg;--distance:'+(115+i%5*21)+'px;--delay:'+(i%4*.06)+'s"></i>').join('')+'</div><div class="ac-rankup-card"><span class="ac-eyebrow">A NEW CHAPTER BEGINS</span><div class="ac-rankup-emblem"><img class="ac-rank-old" src="'+from.image+'" alt="'+esc(from.label)+'"><img class="ac-rank-new" src="'+to.image+'" alt="'+esc(to.label)+'"></div><h2>RANK UP!</h2><h3>'+esc(to.label)+'</h3><p>'+q.before+' → '+q.after+' Elo <strong>+'+q.delta+'</strong></p><button class="ac-primary" data-ac-ranked-close>Continue</button></div>';
  node.querySelector('button').addEventListener('click',()=>{cleanup(node);if(promotion===node)promotion=null;});node.querySelector('button').focus();
 }
 function cache(){try{const c=JSON.parse(host.sessionStorage.getItem(CACHE_KEY)||'null');return c&&Date.now()-c.at>=0&&Date.now()-c.at<TTL&&Array.isArray(c.rows)?c.rows:null;}catch(_){return null;}}
 function rowsHTML(rows){const safeRows=rows.filter(r=>typeof r.uid==='string'&&typeof r.name==='string'&&safe(r.elo)&&safe(r.wins)).sort((a,b)=>b.elo-a.elo||b.wins-a.wins||a.name.localeCompare(b.name)).slice(0,50),self=host.CloudSaveSystem?.activeUser?.uid;return safeRows.length?'<ol class="ac-elo-rows">'+safeRows.map((row,i)=>{const r=rankOf(row.elo);return '<li class="'+(row.uid===self?'is-self':'')+'"><b>#'+(i+1)+'</b><img src="'+r.image+'" alt="'+r.name+'"><div><strong>'+esc(row.name.slice(0,40))+(row.uid===self?' · YOU':'')+'</strong><small>'+r.label+'</small></div><span><strong>'+row.elo.toLocaleString()+' Elo</strong><small>'+row.wins.toLocaleString()+' first-place wins</small></span></li>';}).join('')+'</ol>':'<p class="ac-owned-empty">No published ranked runs yet.</p>';}
 function showLeaderboard({inMatch=false,root}={}){
  if(!root?.isConnected)return;if(overlay?.isConnected){overlay.querySelector('button')?.focus();return;}
  const node=modal(root,'ac-elo-leaderboard','Auto Chess Elo Leaderboard');overlay=node;const me=current(),r=rankOf(me.elo);
  node.innerHTML='<div class="ac-elo-panel"><header><div><span class="ac-eyebrow">AUTO CHESS · LAST PUBLISHED RUNS</span><h2>Elo Leaderboard</h2></div><button class="ac-icon-button" aria-label="Close Elo leaderboard">×</button></header><div class="ac-elo-personal"><img src="'+r.image+'" alt=""><strong>'+r.label+'<small>'+me.elo.toLocaleString()+' Elo · '+me.wins+' first-place wins</small></strong></div><p class="ac-elo-status" role="status"></p><div class="ac-elo-body"></div></div>';
  const button=node.querySelector('button');button.addEventListener('click',()=>{cleanup(node);if(overlay===node)overlay=null;});node.addEventListener('click',e=>{if(e.target===node)button.click();});button.focus();
  const body=node.querySelector('.ac-elo-body'),status=node.querySelector('.ac-elo-status'),saved=cache();
  if(saved){body.innerHTML=rowsHTML(saved);status.textContent='Cached top 50 · refresh window 10 minutes';return;}
  if(inMatch){body.innerHTML=rowsHTML(host.AutoChessOnline?.cached()||[]);status.textContent='Cached recent-run sample. Open the leaderboard in the invite lobby to refresh the global top 50. No in-match query.';return;}
  const cloud=host.CloudSaveSystem?.autoChessService;if(!cloud?.available||host.navigator.onLine===false){body.innerHTML=rowsHTML(host.AutoChessOnline?.cached()||[]);status.textContent='Local/cached results · sign in and go online to load the global top 50.';return;}
  status.textContent='Loading global top 50…';leaderboardJob ||= cloud.leaderboard().finally(()=>{leaderboardJob=null;});
  void leaderboardJob.then(result=>{if(!node.isConnected)return;const rows=result.rows||[];body.innerHTML=rowsHTML(rows);status.textContent=result.localOnly?'Local/cached results':'Global top 50 · Elo descending · published at match completion';if(!result.localOnly)try{host.sessionStorage.setItem(CACHE_KEY,JSON.stringify({at:Date.now(),rows:rows.map(row=>({uid:row.uid,name:row.name,elo:row.elo,wins:row.wins}))}));}catch(_){};}).catch(()=>{if(node.isConnected){body.innerHTML=rowsHTML(host.AutoChessOnline?.cached()||[]);status.textContent='Leaderboard unavailable · cached recent runs shown.';}});
 }
 function disposeUI(){cleanup(promotion);cleanup(overlay);promotion=overlay=null;}
 host.AutoChessRanked=Object.freeze({TIERS,TABLES,CACHE_KEY,fresh,rankOf,deltaFor,quoteElo,validQuote,normalise,validProfile,current,snapshot,applyProfile,showPromotion,showLeaderboard,disposeUI,configure(options={}){bridge=options;}});
})(window);
