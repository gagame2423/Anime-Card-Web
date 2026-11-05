/* Shared online primitives. No game, account or progression writes. */
(function(host){
 'use strict';
 // TURN Metered tại asia-east; sửa tài khoản và mật khẩu tại đây.
 const TURN_SERVER=Object.freeze({
  urls:Object.freeze([
   'turn:asia-east.relay.metered.ca:80',
   'turn:asia-east.relay.metered.ca:80?transport=tcp',
   'turn:asia-east.relay.metered.ca:443',
   'turns:asia-east.relay.metered.ca:443?transport=tcp'
  ]),
  username:'5f8cac6d17564fc244d394c6',
  credential:'tAjn0uV941oFLsvf'
 });
 const encoder=new TextEncoder();
 const bytes=text=>encoder.encode(String(text));
 async function hash(text){if(!host.crypto?.subtle)throw Error('Online play requires HTTPS or localhost and Web Crypto.');return [...new Uint8Array(await host.crypto.subtle.digest('SHA-256',bytes(text)))].map(n=>n.toString(16).padStart(2,'0')).join('');}
 function token(length=16){if(!host.crypto?.getRandomValues)throw Error('Secure randomness is unavailable.');return [...host.crypto.getRandomValues(new Uint8Array(length))].map(n=>n.toString(16).padStart(2,'0')).join('');}
 function stable(value){if(value===null||typeof value!=='object')return JSON.stringify(value);if(Array.isArray(value))return '['+value.map(stable).join(',')+']';return '{'+Object.keys(value).sort().filter(k=>value[k]!==undefined).map(k=>JSON.stringify(k)+':'+stable(value[k])).join(',')+'}';}
 function text(node,value){if(node&&node.textContent!==String(value))node.textContent=String(value);}
 function make(tag,className='',value){const n=host.document.createElement(tag);n.className=className;if(value!==undefined)n.textContent=value;return n;}
 const PEER_CONNECT_TIMEOUT_MS=20000;
 const STUN_SERVERS=Object.freeze(['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302','stun:stun2.l.google.com:19302']);
 function peerOptions(){
  const iceServers=STUN_SERVERS.map(urls=>({urls}));
  const credential=String(TURN_SERVER.credential||'').trim();
  // Bỏ qua TURN nếu chưa điền mật khẩu.
  if(credential&&credential!=='PASTE_YOUR_PASSWORD_HERE'){
   iceServers.push({urls:[...TURN_SERVER.urls],username:TURN_SERVER.username,credential});
  }else{
   host.console?.warn?.('TURN chưa được cấu hình: điền credential trong TURN_SERVER của online_utils.js. Chỉ sử dụng STUN.');
  }
  return{config:{iceServers},debug:1};
 }
 const gameJobs=new Map();
 function loadGameScript(declaration){
  const src=declaration?.src;if(!src)return Promise.reject(Error('Missing game script declaration.'));
  if(gameJobs.has(src))return gameJobs.get(src);
  const job=new Promise((resolve,reject)=>{const script=host.document.createElement('script');let done=false;script.async=false;script.dataset.gameResource='true';
    const finish=error=>{if(done)return;done=true;host.clearTimeout(timer);script.onload=script.onerror=null;if(error){script.remove();reject(error);}else resolve();};
   const timer=host.setTimeout(()=>finish(Error('Game module took too long to load: '+src.split('/').pop())),15000);
   script.onload=()=>finish();script.onerror=()=>finish(Error('Could not load game module: '+src.split('/').pop()));script.src=src;host.document.head.append(script);});
  gameJobs.set(src,job);return job;
 }
 const sdkJobs=new Map();
 function loadSdk(id,ready){if(ready())return Promise.resolve();if(sdkJobs.has(id))return sdkJobs.get(id);const declaration=host.document.getElementById(id);if(!declaration?.src)return Promise.reject(Error('Missing SDK declaration: '+id));
  const job=new Promise((resolve,reject)=>{const script=host.document.createElement('script');script.async=true;script.dataset.onlineResource='true';let done=false;const finish=error=>{if(done)return;done=true;host.clearTimeout(timeout);script.onload=script.onerror=null;if(error){script.remove();reject(error);}else resolve();};const timeout=host.setTimeout(()=>finish(Error('Online service took too long to load. Check your connection and retry.')),12000);script.onload=()=>finish(ready()?null:Error('Online SDK could not initialize.'));script.onerror=()=>finish(Error('Online service unavailable. Check your connection and retry.'));script.src=declaration.src;host.document.head.append(script);});
  sdkJobs.set(id,job);job.catch(()=>sdkJobs.delete(id));return job;
 }
 function timeout(promise,ms=15000,message='Online service did not respond. Check your connection and retry.'){let timer;return Promise.race([promise,new Promise((_,reject)=>{timer=host.setTimeout(()=>reject(Error(message)),ms);})]).finally(()=>host.clearTimeout(timer));}
 function error(message,code){return Object.assign(Error(message),{code});}
 host.OnlineUtils=Object.freeze({bytes,hash,token,stable,text,make,loadSdk,loadGameScript,peerOptions,STUN_SERVERS,PEER_CONNECT_TIMEOUT_MS,timeout,error});
})(window);
