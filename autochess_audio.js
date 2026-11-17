/* Small gesture-activated SFX pools. Settings belong to the existing global SFX controls. */
(function(host){
 'use strict';
 const RANK_FILES=Object.freeze(['itob','btos','stog','gtop','ptoe','etod','dtom','mtogm','gmtoc']);
 const FILES=Object.freeze({refresh:'shop',xp:'exp',level:'levelup',fuse:'fuse',victory:'win',defeat:'lose',buy:'buy',sell:'sell',deploy:'deploy',draft:'draft',travel:'travel'});
 const OPTIONAL=Object.freeze(['buy','sell','deploy','draft','travel']);
 const WARNING_SECONDS=10,MAX_ACTIVE=5,POOLS=new Map(),playing=new Set(),warned=new Set(),lastPlayed=new Map();
 let activated=false,wanted=false,epoch=0,serial=0;
 const settings=()=>({enabled:host.DropAudioSystem?.enabled!==false,volume:Math.max(0,Math.min(1,Number(host.DropAudioSystem?.volume??.8)||0))});
 function release(v){playing.delete(v);v.busy=false;v.ticket=++serial;v.fallback=null;}
 function silence(v){release(v);try{v.audio.pause();v.audio.currentTime=0;}catch(_){}}
 function stop(){epoch++;for(const v of [...playing])silence(v);}
 function pool(file){if(!/^[a-z0-9_]+$/i.test(file))return null;let p=POOLS.get(file);if(!p){p={file,missing:false,voices:[]};POOLS.set(file,p);}return p;}
 function voice(p){
  if(p.missing||!host.Audio)return null;let v=p.voices.find(v=>!v.busy);if(v||p.voices.length>=2)return v||null;
  try{const audio=new host.Audio('assets/audio/'+p.file+'.mp3');audio.preload='auto';v={audio,p,busy:false,ticket:0,kind:'',at:0,fallback:null};
   audio.onended=()=>release(v);
   audio.onerror=()=>{p.missing=true;const fallback=v.fallback,valid=v.busy;silence(v);if(valid&&fallback)play(fallback.file,fallback.kind,null,true);};
   p.voices.push(v);return v;
  }catch(_){p.missing=true;return null;}
 }
 function warm(){wanted=true;if(!activated||!host.Audio)return;for(const file of ['shop','exp','levelup','fuse','win','lose'])voice(pool(file));}
 function sync(){
  if(!playing.size)return;const s=settings();if(!s.enabled||!s.volume){stop();return;}
  for(const v of playing)if(v.audio.volume!==s.volume)v.audio.volume=s.volume;
 }
 function play(file,kind='countdown',fallback=null,fromFallback=false){
  const s=settings();if(!activated||!host.Audio||!s.enabled||!s.volume)return false;
  if(kind==='countdown'&&[...playing].some(v=>v.kind==='rank'))return false;
  const p=pool(file);if(!p)return false;if(p.missing)return fallback&&!fromFallback?play(fallback,kind,null,true):false;
  if(kind==='rank'||kind==='countdown')for(const v of [...playing])if(v.kind==='rank'||v.kind==='countdown')silence(v);
  if(playing.size>=MAX_ACTIVE){const oldest=[...playing].filter(v=>v.kind!=='rank').sort((a,b)=>a.at-b.at)[0];if(!oldest)return false;silence(oldest);}
  const v=voice(p);if(!v)return false;const ticket=++serial,generation=epoch;v.busy=true;v.ticket=ticket;v.kind=kind;v.at=host.performance?.now?.()||0;v.fallback=fallback?{file:fallback,kind}:null;playing.add(v);
  try{v.audio.volume=s.volume;v.audio.currentTime=0;
   Promise.resolve(v.audio.play()).then(()=>{if(generation!==epoch||v.ticket!==ticket){if(!v.busy)try{v.audio.pause();}catch(_){}return;}if(!settings().enabled)silence(v);}).catch(error=>{
    if(v.ticket!==ticket)return;const next=v.fallback;release(v);
    if(error?.name==='NotSupportedError'){p.missing=true;if(next&&!fromFallback&&generation===epoch)play(next.file,next.kind,null,true);}
   });
  }catch(_){release(v);return false;}return true;
 }
 function sfx(event){
  const file=FILES[event];if(!file)return false;const now=host.performance?.now?.()||0,previous=lastPlayed.get(event),gap=event==='deploy'?110:65;
  if(previous!==undefined&&now-previous<gap)return false;
  const played=play(file,'action');if(played)lastPlayed.set(event,now);return played;
 }
 function rankUp(from,to){if(!Number.isInteger(from)||!Number.isInteger(to)||to<=from||to<1||to>9)return false;return play(RANK_FILES[to-1],'rank',to===8?'mtog':null);}
 function countdown(s,remaining){
  if(!s||s.finished||!['planning','carousel','augment','combat'].includes(s.phase)||!(remaining>0&&remaining<=WARNING_SECONDS))return false;
  const key=s.id+'/'+host.AutoChessSystem.label(s);if(warned.has(key))return false;warned.add(key);if(warned.size>600)warned.delete(warned.values().next().value);return play('countdown10s');
 }
 function activate(){activated=true;if(wanted)warm();}
 for(const type of ['pointerdown','keydown'])host.document?.addEventListener(type,activate,{capture:true,passive:true});
 host.document?.getElementById('sfxToggleButton')?.addEventListener('click',()=>host.queueMicrotask(sync));
 for(const id of ['sfxVolumeRange','sfxVolumeNumber'])host.document?.getElementById(id)?.addEventListener('input',()=>host.queueMicrotask(sync));
 host.addEventListener('pagehide',stop);
 host.AutoChessAudio=Object.freeze({RANK_FILES,FILES,OPTIONAL,WARNING_SECONDS,play,sfx,warm,rankUp,countdown,sync,stop,diagnostics:()=>({cached:POOLS.size,voices:[...POOLS.values()].reduce((n,p)=>n+p.voices.length,0),active:playing.size,maxActive:MAX_ACTIVE})});
})(window);
