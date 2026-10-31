/* Public Top-50 profiles and the client-side weekly Infinity partition. */
(function(host){
 'use strict';
 const U=host.OnlineUtils,cache=new Map();let bridge={},sequence=0;
 async function render(force=false){
  const root=host.document.getElementById('leaderboardList'),status=host.document.getElementById('leaderboardStatus'),metric=host.document.getElementById('leaderboardMetric')?.value||'totalRolls';if(!root)return;
  const infinity=metric==='infinity',field=infinity?'highestWave':metric,key=(infinity?'infinity:'+host.InfinitySystem.week().id:metric)+':'+host.CloudSaveSystem.activeUser.uid+':'+Boolean(host.CloudSaveSystem.firestore)+':'+host.CloudSaveSystem.cloudReady,ticket=++sequence;U.text(status,'Loading Top 50…');
  try{
   const previous=cache.get(key);let result;
   if(!force&&previous&&Date.now()-previous.at<30000)result=previous.result;
   else result=infinity?await host.InfinityCloudSystem.board():await host.CloudSaveSystem.leaderboardView(metric);
   if(ticket!==sequence)return;cache.set(key,{at:Date.now(),result});if(cache.size>8)cache.delete(cache.keys().next().value);root.replaceChildren();
   const rows=result.rows.filter(row=>row&&typeof row.displayName==='string'&&Number.isFinite(row[field])&&row[field]>=0).slice(0,50);
   for(let i=0;i<rows.length;i++){const row=rows[i],line=U.make('article','leaderboard-row');if(host.CloudSaveSystem.activeUser?.uid===row.uid)line.classList.add('is-you');line.append(U.make('strong','leaderboard-rank','#'+(i+1)),U.make('span','leaderboard-name',row.displayName.slice(0,40)),U.make('strong','leaderboard-score',Math.floor(row[field]).toLocaleString('en-US')));root.append(line);}
   U.text(status,(result.localOnly?(result.message||'Offline personal best, not the global leaderboard')+' · '+(result.localBest?'Personal best: '+result.localBest+' · ':''):'')+(infinity?`${result.week.id} · ${result.week.category} · Enemies: ${result.week.element} · Monday 00:00 UTC reset · Personal weekly reward: highest wave × 100 Star Orbs`:(rows.length?`Top ${rows.length} · ${({totalRolls:'Total Rolls',strongestPower:'Strongest Card Power',timeTrialRoom:'Normal Time Trial Room'})[metric]}`:'No players yet. Cloud sync is optional.')));
  }catch(error){if(ticket===sequence)U.text(status,error.message||'Leaderboard unavailable. Please retry.');}
 }
 host.LeaderboardSystem=Object.freeze({render,configure(options){bridge=options||{};host.addEventListener('cloud-session-ready',()=>{cache.clear();if(!host.document.getElementById('leaderboardModal')?.classList.contains('hidden'))void render(true);});host.document.getElementById('leaderboardOpenButton')?.addEventListener('click',()=>{bridge.open?.('leaderboardModal');void render();});host.document.getElementById('leaderboardMetric')?.addEventListener('change',()=>void render());host.document.getElementById('leaderboardRefresh')?.addEventListener('click',()=>void render(true));}});
})(window);
