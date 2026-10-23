/* Public Top-50 view. Uses aggregate profile documents, never private saves. */
(function(host){
 'use strict';
 const U=host.OnlineUtils,cache=new Map();let bridge={},sequence=0;
 async function render(force=false){const root=host.document.getElementById('leaderboardList'),status=host.document.getElementById('leaderboardStatus'),metric=host.document.getElementById('leaderboardMetric')?.value||'totalRolls';if(!root)return;const ticket=++sequence;U.text(status,'Loading Top 50…');
  try{const previous=cache.get(metric);const rows=!force&&previous&&Date.now()-previous.at<30000?previous.rows:await host.CloudSaveSystem.leaderboard(metric);if(ticket!==sequence)return;cache.set(metric,{at:Date.now(),rows});root.replaceChildren();const valid=rows.filter(row=>row&&typeof row.displayName==='string'&&Number.isFinite(row[metric])&&row[metric]>=0).slice(0,50);
   for(let i=0;i<valid.length;i++){const row=valid[i],line=U.make('article','leaderboard-row');if(host.CloudSaveSystem.activeUser?.uid===row.uid)line.classList.add('is-you');line.append(U.make('strong','leaderboard-rank','#'+(i+1)),U.make('span','leaderboard-name',row.displayName.slice(0,40)),U.make('strong','leaderboard-score',Math.floor(row[metric]).toLocaleString('en-US')));root.append(line);}
   U.text(status,valid.length?`Top ${valid.length} · ${({totalRolls:'Total Rolls',strongestPower:'Strongest Card Power',timeTrialRoom:'Normal Time Trial Room'})[metric]} · casual rankings`:'No players yet. Sign in and sync your progress to join.');
  }catch(error){if(ticket===sequence)U.text(status,error.message||'Leaderboard unavailable. Offline play is available.');}
 }
 host.LeaderboardSystem=Object.freeze({render,configure(options){bridge=options||{};host.document.getElementById('leaderboardOpenButton')?.addEventListener('click',()=>{bridge.open?.('leaderboardModal');void render();});host.document.getElementById('leaderboardMetric')?.addEventListener('change',()=>void render());host.document.getElementById('leaderboardRefresh')?.addEventListener('click',()=>void render(true));}});
})(window);
