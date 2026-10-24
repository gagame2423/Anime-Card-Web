/* Authenticated Infinity API. Never grants rewards in localStorage. */
(function(host){
 'use strict';
 const API_URL='https://asia-east1-anime-card-web.cloudfunctions.net/infinityApi';
 let offset=0,status={available:false,message:'Weekly service has not connected yet.',week:null},requestId=0;
 async function request(action,data={},user=host.CloudSaveSystem?.activeUser){
  if(!user||user.isAnonymous||typeof user.getIdToken!=='function')throw Error('Google sign-in required.');
  let definitive=false;
  const controller=new AbortController(),timer=host.setTimeout(()=>controller.abort(),15000),started=Date.now();
  try{const token=await user.getIdToken();const response=await host.fetch(API_URL,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({action,...data}),signal:controller.signal,cache:'no-store'});
   definitive=true;const result=await response.json().catch(()=>null);if(!response.ok||!result?.ok)throw Error(result?.error||'Infinity service unavailable. Deploy the supplied Firebase Functions.');
   if(Number.isFinite(result.now))offset=result.now-(started+Date.now())/2;
   status={available:true,message:'Weekly service connected.',week:result.week||status.week};return result;
  }catch(error){throw Object.assign(Error(error.name==='AbortError'?'Infinity service timed out. Please retry.':error.message),{definitive});}
  finally{host.clearTimeout(timer);}
 }
 async function bootstrap(user){const ticket=++requestId;if(typeof user?.getIdToken!=='function'){status={available:false,message:'Weekly service requires the Google Auth SDK.',week:null};return null;}try{return await request('bootstrap',{},user);}catch(error){if(ticket===requestId)status={available:false,message:error.message,week:null};if(!error.definitive)throw Error('Weekly reward check did not finish. Retry Google sign-in before loading Cloud Save.');return null;}}
 host.InfinityCloudSystem=Object.freeze({API_URL,request,bootstrap,now:()=>Date.now()+offset,get status(){return{...status};}});
})(window);
