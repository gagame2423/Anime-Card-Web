/* Optional, gesture-activated Ball vs Ball SFX. No audio dependency in the combat engine. */
(function(host){
 'use strict';
 const FOLDER='assets/audio/ball/',KEY='anime_card_rng_ball_audio_v1',MAX_ACTIVE=8;
 // [filename, channel, gain, minimum gap (ms), priority, maximum voices]
 const CUES=Object.freeze({
  ui_click:['ui_click.mp3','ui',.65,65,1,1],
  tab_switch:['tab_switch.mp3','ui',.75,90,2,1],
  card_select:['card_select.mp3','ui',.75,75,2,1],
  card_equip:['card_equip.mp3','ui',.85,100,3,1],
  mutation_change:['mutation_change.mp3','ui',.75,90,2,1],
  modal_open:['modal_open.mp3','ui',.8,120,3,1],
  modal_close:['modal_close.mp3','ui',.7,120,3,1],
  countdown:['countdown.mp3','match',.7,300,4,1],
  match_start:['match_start.mp3','match',.9,350,5,1],
  wall_bounce:['wall_bounce.mp3','wall',.43,110,1,2],
  collision_light:['collision_light.mp3','impact',.55,100,2,2],
  collision_heavy:['collision_heavy.mp3','impact',.75,115,3,2],
  critical_hit:['critical_hit.mp3','impact',.88,140,5,2],
  skill_cast:['skill_cast.mp3','skill',.8,180,4,2],
  passive_trigger:['passive_trigger.mp3','skill',.64,220,3,1],
  shield_hit:['shield_hit.mp3','shield',.48,130,2,1],
  shield_break:['shield_break.mp3','shield',.85,170,5,1],
  heal:['heal.mp3','heal',.67,180,3,2],
  dodge:['dodge.mp3','status',.55,170,2,1],
  status_apply:['status_apply.mp3','status',.55,200,2,1],
  knockout:['knockout.mp3','knockout',.8,200,5,1],
  victory:['victory.mp3','result',.9,300,7,1],
  defeat:['defeat.mp3','result',.9,300,7,1],
  draw:['draw.mp3','result',.75,300,7,1]
 });
 const FILES=Object.freeze(Object.fromEntries(Object.entries(CUES).map(([key,v])=>[key,FOLDER+v[0]])));
 const banks=new Map(),playing=new Set(),lastPlayed=new Map();
 let muted=false,volume=.75,active=false,activated=false,serial=0,warmTimer=0;
 try{const value=JSON.parse(host.localStorage.getItem(KEY)||'null');if(value&&typeof value==='object'){muted=value.muted===true;if(Number.isFinite(value.volume))volume=Math.max(0,Math.min(1,value.volume));}}catch(_){}
 const clock=()=>host.performance?.now?.()??Date.now();
 function settings(){
  const masterMuted=host.DropAudioSystem?.enabled===false,masterVolume=Math.max(0,Math.min(1,Number(host.DropAudioSystem?.volume??1)||0));
  return {muted,volume,masterMuted,masterVolume,effective:muted||masterMuted?0:volume*masterVolume};
 }
 function persist(){try{host.localStorage.setItem(KEY,JSON.stringify({muted,volume}));}catch(_){}}
 function release(voice){playing.delete(voice);voice.busy=false;voice.ticket=++serial;}
 function stopVoice(voice){release(voice);try{voice.audio.pause();voice.audio.currentTime=0;}catch(_){}}
 function stop(){for(const voice of [...playing])stopVoice(voice);}
 function missing(bank){
  if(bank.missing)return;bank.missing=true;
  for(const voice of bank.voices)stopVoice(voice);
 }
 function bankFor(key){
  if(!Object.hasOwn(CUES,key))return null;
  let bank=banks.get(key);if(!bank){bank={key,ready:false,missing:false,voices:[]};banks.set(key,bank);}return bank;
 }
 function createVoice(bank){
  if(!bank||bank.missing||!host.Audio)return null;
  try{
   const audio=new host.Audio(),voice={audio,bank,busy:false,ticket:0,priority:0,at:0};
   bank.voices.push(voice);
   audio.preload='auto';
   audio.oncanplay=()=>{if(!bank.missing)bank.ready=true;};
   audio.onloadeddata=()=>{if(!bank.missing)bank.ready=true;};
   audio.onended=()=>release(voice);
   audio.onerror=()=>missing(bank);
   audio.src=FILES[bank.key];
   return voice;
  }catch(_){missing(bank);return null;}
 }
 function prime(key){const bank=bankFor(key);if(bank&&!bank.missing&&!bank.voices.length)createVoice(bank);}
 function warm(channel){
  if(!active||!activated||!host.Audio||!settings().effective)return;
  // Optional files are requested once per cue, in small batches away from UI and physics.
  // Never spawn a second loading voice until the first file is known to be playable.
  const queue=Object.keys(CUES).filter(key=>(channel==='ui'?CUES[key][1]==='ui':true)&&!banks.get(key)?.voices.length&&!banks.get(key)?.missing);
  host.clearTimeout(warmTimer);
  function batch(){
   warmTimer=0;if(!active||!settings().effective||host.document?.hidden)return;
   for(let i=0;i<4&&queue.length;i++)prime(queue.shift());
   if(queue.length)warmTimer=host.setTimeout(batch,45);
  }
  if(queue.length)warmTimer=host.setTimeout(batch,0);
 }
 function activate(){activated=true;}
 function play(key,closing=false){
  const spec=CUES[key],s=settings();if(!spec||!activated||(!active&&!closing)||!s.effective||host.document?.hidden||!host.Audio)return false;
  const now=clock(),last=lastPlayed.get(key);if(last!==undefined&&now-last<spec[3])return false;
  const bank=bankFor(key);if(bank.missing)return false;
  let voice=bank.voices.find(v=>!v.busy);
  if(!voice&&(!bank.voices.length||bank.ready&&bank.voices.length<spec[5]))voice=createVoice(bank);
  if(!voice||bank.missing)return false;
  // High-impact cues can replace a low-priority tick, never the end-of-match fanfare.
  if(playing.size>=MAX_ACTIVE){
   const victim=[...playing].filter(v=>v.priority<spec[4]).sort((a,b)=>a.priority-b.priority||a.at-b.at)[0];
   if(!victim)return false;stopVoice(victim);
  }
  voice.busy=true;voice.priority=spec[4];voice.at=now;const ticket=++serial;voice.ticket=ticket;playing.add(voice);lastPlayed.set(key,now);
  try{
   voice.audio.volume=s.effective*spec[2];try{voice.audio.currentTime=0;}catch(_){}
   Promise.resolve(voice.audio.play()).then(()=>{
    // Rejections and a late autoplay resolution must not resurrect a stopped cue.
    if(voice.ticket!==ticket){if(!voice.busy)try{voice.audio.pause();}catch(_){}return;}
    if(!settings().effective||host.document?.hidden||!active&&!closing)stopVoice(voice);
   }).catch(error=>{
    if(voice.ticket!==ticket)return;
    if(error?.name==='NotSupportedError'||voice.audio.error)missing(bank);
    else stopVoice(voice);
   });
  }catch(error){if(error?.name==='NotSupportedError'||voice.audio.error)missing(bank);else stopVoice(voice);return false;}
  return true;
 }
 function batch(events){
  if(!active||!events?.length||!settings().effective)return;
  // One strongest event per channel per frame. Crit > heavy > light; shield
  // breaks, skill, healing and other important channels can still layer.
  const channels=new Map();
  for(const event of events){const key=typeof event==='string'?event:event?.cue,spec=CUES[key];if(!spec)continue;const previous=channels.get(spec[1]);if(!previous||CUES[previous][4]<spec[4])channels.set(spec[1],key);}
  for(const key of [...channels.values()].sort((a,b)=>CUES[b][4]-CUES[a][4]))play(key);
 }
 function sync(){
  const s=settings();if(!s.effective){stop();return;}
  for(const voice of playing){try{voice.audio.volume=s.effective*CUES[voice.bank.key][2];}catch(_){}}
 }
 function setMuted(value){muted=value===true;persist();sync();if(!muted&&active)warm('all');return settings();}
 function setVolume(value){const n=Number(value);if(Number.isFinite(n)){const wasSilent=!settings().effective;volume=Math.max(0,Math.min(1,n));persist();sync();if(wasSilent&&settings().effective&&active)warm('all');}return settings();}
 function enter(){stop();active=true;activate();lastPlayed.clear();play('modal_open');warm('ui');}
 function beginMatch(){stop();lastPlayed.clear();warm('all');}
 function leave(){
  stop();host.clearTimeout(warmTimer);warmTimer=0;active=false;play('modal_close',true);
 }
 function finish(winner){
  stop();play(winner==='player'?'victory':winner==='enemy'?'defeat':'draw');
 }
 // Browser autoplay rules: only the user's own pointer/key gestures unlock sounds.
 for(const type of ['pointerdown','keydown'])host.document?.addEventListener(type,activate,{capture:true,passive:true});
 host.document?.addEventListener('visibilitychange',()=>{if(host.document.hidden)stop();else if(active)warm('all');});
 host.addEventListener('pagehide',()=>{stop();host.clearTimeout(warmTimer);warmTimer=0;});
 host.document?.getElementById('sfxToggleButton')?.addEventListener('click',()=>host.queueMicrotask(sync));
 for(const id of ['sfxVolumeRange','sfxVolumeNumber'])host.document?.getElementById(id)?.addEventListener('input',()=>host.queueMicrotask(sync));
 host.BallAudio=Object.freeze({KEY,FOLDER,FILES,settings,setMuted,setVolume,activate,enter,beginMatch,leave,finish,play,batch,stop,sync,
  diagnostics:()=>({cached:banks.size,missing:[...banks.values()].filter(b=>b.missing).map(b=>b.key),voices:[...banks.values()].reduce((n,b)=>n+b.voices.length,0),active:playing.size,maxActive:MAX_ACTIVE})});
})(window);
