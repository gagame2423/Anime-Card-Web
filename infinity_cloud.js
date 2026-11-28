/* Local Infinity scores work offline; Firestore publishing is optional. */
(function(host){
 'use strict';
 const MAX_WAVE=Math.floor(Number.MAX_SAFE_INTEGER/100),U=host.OnlineUtils;
 function available(){return Boolean(host.CloudSaveSystem.authVerified&&host.CloudSaveSystem.firestore);}
 function localResult(message='Sign in to view the global weekly leaderboard.'){const week=host.InfinityRules.rotation();return{week,localOnly:true,localBest:host.InfinitySystem.getBest(week.id),rows:[],message};}
 async function submit(input,manual=false){
  const cloud=host.CloudSaveSystem,week=host.InfinityRules.rotation();if(input.weekId!==week.id||input.category!==week.category||!Number.isSafeInteger(input.highestWave)||input.highestWave<1||input.highestWave>MAX_WAVE)throw Error('Invalid wave or expired UTC week.');
  if(!available())return{week,highestWave:Math.max(input.highestWave,host.InfinitySystem.getBest(week.id)),localOnly:true};
  const user=cloud.activeUser,highestWave=await cloud.publishInfinity(user.uid,week.id,input.highestWave,manual);return{week,highestWave,localOnly:false};
 }
 async function board(){
  const cloud=host.CloudSaveSystem;if(!available())return localResult();const user=cloud.activeUser,week=host.InfinityRules.rotation();
  try{
   const snapshot=await U.timeout(cloud.firestore.collection('infinity_leaderboards').doc(week.id).get({source:'server'}));if(!available()||cloud.activeUser.uid!==user.uid)return localResult();
   const millis=v=>typeof v?.toMillis==='function'?v.toMillis():Number(v?.seconds||0)*1000;
   const rows=Object.entries(snapshot.exists?snapshot.data():{}).filter(([,v])=>v&&typeof v.displayName==='string'&&Number.isSafeInteger(v.highestWave)&&v.highestWave>0&&v.highestWave<=MAX_WAVE).map(([uid,row])=>({...row,uid}));
   rows.sort((a,b)=>b.highestWave-a.highestWave||millis(a.updatedAt)-millis(b.updatedAt)||a.uid.localeCompare(b.uid));return{week,rows:rows.slice(0,50),localOnly:false};
  }catch(error){cloud.noteError?.(error);return localResult('Global leaderboard unavailable: '+(error.message||'Please retry.')+' Your local best is retained.');}
 }
 host.InfinityCloudSystem=Object.freeze({submit,board,get available(){return available();},now:()=>Date.now(),get status(){return{available:available(),message:available()?'Global weekly leaderboard connected.':'Offline personal best · sign in for the global weekly leaderboard.',week:host.InfinityRules.rotation()};}});
})(window);
