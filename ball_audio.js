/* Shared gesture-activated, optional SFX pool for all game modes. */
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
 const extra=Object.freeze({
  win:['win.mp3','result',.9,300,7,1],
  summon:['summon.mp3','ui',.6,130,2,1,'ui_click'],
  rare_reveal:['rare_reveal.mp3','result',.85,350,5,1,'skill_cast'],
  relic_craft:['relic_craft.mp3','ui',.85,180,4,1,'fuse'],
  fuse:['fuse.mp3','ui',.85,140,4,1,'card_equip'],
  level:['levelup.mp3','ui',.85,180,5,1,'skill_cast'],
  dock:['sailing/dock.mp3','sea',.72,220,3,1,'ui_click'],
  undock:['sailing/undock.mp3','sea',.72,220,3,1,'ui_click'],
  flag_capture:['sailing/flag_capture.mp3','sea',.85,300,4,1,'skill_cast'],
  danger_zone:['sailing/danger_zone.mp3','sea',.72,600,3,1,'status_apply'],
  storm_zone:['sailing/storm_zone.mp3','sea',.85,600,4,1,'status_apply'],
  island_raid:['sailing/island_raid.mp3','alert',.9,800,6,1,'match_start'],
  golden_bounty:['sailing/golden_bounty.mp3','alert',.85,1000,6,1,'skill_cast'],
  capture_success:['sailing/capture_success.mp3','capture',.85,300,5,1,'card_equip'],
  capture_fail:['sailing/capture_fail.mp3','capture',.75,300,4,1,'defeat'],
  ship_sink:['sailing/ship_sink.mp3','sea',.8,500,5,1,'knockout'],
  sea_beast_roar:['sailing/sea_beast_roar.mp3','alert',.9,800,6,1,'match_start'],
  sea_beast_hit:['sailing/sea_beast_hit.mp3','impact',.8,180,4,1,'collision_heavy']
 });
 const banks=new Map(),playing=new Set(),lastPlayed=new Map();
 let activated=false,active=false,serial=0;
 const clamp=n=>Math.max(0,Math.min(1,Number(n)||0));
 const clock=()=>host.performance?.now?.()??Date.now();
 function settings(){
  const muted=host.DropAudioSystem?.enabled===false,volume=clamp(host.DropAudioSystem?.volume??.8);
  return {muted,volume,masterMuted:muted,masterVolume:volume,effective:muted?0:volume};
 }
 function mode(){return host.SailingSea?.active?'sailing':host.BallArena?.active?'ball':host.AutoChessView?.active?'chess':'main';}
 function spec(key,group=mode()){if(key==='victory'&&group!=='ball')key='win';const ball=Object.hasOwn(CUES,key),row=ball?CUES[key]:Object.hasOwn(extra,key)?extra[key]:null;return row?{path:(ball?FOLDER:'assets/audio/')+row[0],channel:row[1],gain:row[2],gap:row[3],priority:row[4],limit:row[5],fallback:row[6]}:null;}
 function release(v){
  if(!v.busy)return;
  playing.delete(v);v.busy=false;v.ticket=++serial;
  const end=v.end;v.end=null;v.fallback=null;
  try{end?.();}catch(_){}
 }
 function silence(v){release(v);try{v.audio.pause();v.audio.currentTime=0;}catch(_){}}
 function stop(group){for(const v of [...playing])if(!group||v.group===group)silence(v);}
 function bank(path){let b=banks.get(path);if(!b){b={path,missing:false,ready:false,voices:[]};banks.set(path,b);}return b;}
 function missing(b){
  if(b.missing)return;b.missing=true;
  for(const v of b.voices){const next=v.busy?v.fallback:null;silence(v);if(next){if(next.file)playFile(next.file,next.group,next.opts);else play(next.key,next.group);}}
 }
 function createVoice(b){
  if(b.missing||!host.Audio)return null;
  try{
   const audio=new host.Audio(),v={audio,b,busy:false,ticket:0};b.voices.push(v);
   audio.preload='auto';audio.oncanplay=audio.onloadeddata=()=>{b.ready=true;};
   audio.onended=()=>release(v);audio.onerror=()=>missing(b);audio.src=b.path;return v;
  }catch(_){missing(b);return null;}
 }
 function prime(path){if(!host.Audio||!activated||!settings().effective)return;const b=bank(path);if(!b.missing&&!b.voices.length)createVoice(b);}
 function playSpec(s,group,opts={}){
  if(!s||!activated||!settings().effective||host.document?.hidden||!host.Audio)return false;
  const b=bank(s.path),fallback=opts.fallback||s.fallback,now=clock();
  if(b.missing)return fallback?play(fallback,group):false;
  const key=group+'/'+s.path,prev=lastPlayed.get(key);
  if(prev!==undefined&&now-prev<s.gap)return false;
  if(s.channel==='countdown'&&[...playing].some(v=>v.channel==='rank'))return false;
  if(['rank','countdown'].includes(s.channel))for(const v of [...playing])if(['rank','countdown'].includes(v.channel))silence(v);
  let v=b.voices.find(v=>!v.busy);
  if(!v&&(!b.voices.length||b.ready&&b.voices.length<s.limit))v=createVoice(b);
  if(!v||b.missing)return false;
  if(playing.size>=MAX_ACTIVE){
   const victim=[...playing].filter(v=>v.priority<s.priority).sort((a,b)=>a.priority-b.priority||a.at-b.at)[0];
   if(!victim)return false;silence(victim);
  }
  v.busy=true;v.group=group;v.channel=s.channel;v.gain=s.gain;v.priority=s.priority;v.at=now;v.end=opts.onEnd||null;v.fallback=opts.fileFallback?{file:opts.fileFallback,group,opts:{...opts,fileFallback:null}}:fallback?{key:fallback,group}:null;
  const ticket=++serial;v.ticket=ticket;playing.add(v);lastPlayed.set(key,now);
  function failed(error){if(v.ticket!==ticket)return;if(error?.name==='NotSupportedError'||v.audio.error)missing(b);else silence(v);}
  try{
   v.audio.volume=settings().effective*s.gain;try{v.audio.currentTime=0;}catch(_){}
   Promise.resolve(v.audio.play()).then(()=>{if(v.ticket!==ticket){if(!v.busy)try{v.audio.pause();}catch(_){}return;}if(!settings().effective||host.document?.hidden)silence(v);}).catch(failed);
  }catch(error){failed(error);return false;}return true;
 }
 function play(key,group=mode()){return playSpec(spec(key,group),group);}
 function playFile(file,group=mode(),opts={}){
  if(!/^[a-z0-9_]+$/i.test(file))return false;
  const s={path:'assets/audio/'+file+'.mp3',channel:opts.channel||'action',gain:opts.gain??1,gap:opts.gap??65,priority:opts.priority??4,limit:opts.limit??2};
  // Rank fallback files retain their original root path.
  const fallback=opts.fileFallback;
  if(fallback&&bank(s.path).missing)return playFile(fallback,group,{...opts,fileFallback:null});
  return playSpec(s,group,{...opts,onEnd:opts.onEnd});
 }
 function batch(events,group=mode()){
  if(!events?.length||!settings().effective)return;
  const channels=new Map();
  for(const event of events){const key=typeof event==='string'?event:event?.cue,s=spec(key,group);if(!s)continue;const old=channels.get(s.channel);if(!old||old.priority<s.priority)channels.set(s.channel,{key,priority:s.priority});}
  for(const row of [...channels.values()].sort((a,b)=>b.priority-a.priority))play(row.key,group);
 }
 function sync(){const s=settings();if(!s.effective){stop();return;}for(const v of playing)try{v.audio.volume=s.effective*v.gain;}catch(_){}}
 function setMuted(value){host.DropAudioSystem?.setEnabled(value!==true);return settings();}
 function setVolume(value){host.DropAudioSystem?.setVolume(value);return settings();}
 function activate(){
  if(activated)return;activated=true;
  host.setTimeout(()=>{if(!host.document?.hidden){for(const cue of ['ui_click','collision_light','skill_cast'])prime(FILES[cue]);prime('assets/audio/win.mp3');}},40);
 }
 function diagnostics(){return {cached:banks.size,missing:[...banks.values()].filter(b=>b.missing).map(b=>b.path),voices:[...banks.values()].reduce((n,b)=>n+b.voices.length,0),active:playing.size,maxActive:MAX_ACTIVE};}
 // Combat messages are data only. No audio is played by a simulation or a worker.
 function combatCue(message,tone=''){
  const t=String(tone).toLowerCase(),m=String(message||'');
  if(t==='heal'||/\[(?:HEAL|REVIVE)\]|\bhealed [0-9,.]+ HP/i.test(m))return 'heal';
  if(t==='dodge'||/\[DODGE\]/i.test(m))return 'dodge';
  if(t==='crit'||t==='critical'||/\[CRIT(?:ICAL HIT!)?\]|^[✦★]\s*(?:CRIT\s*)?[−-]/i.test(m))return 'critical_hit';
  if(/shield.*(?:break|shatter|destroy)|\[SHIELD BREAK\]/i.test(m))return 'shield_break';
  if(t==='shield'||/\[SHIELD\]/i.test(m))return 'shield_hit';
  if(/\[(?:KO|KNOCKOUT|DEFEATED|DEATH)\]|\b(?:was|is) defeated\b/i.test(m))return 'knockout';
  if(t==='debuff'||/\[(?:DEBUFF|STUN|FREEZE|BURN|BLEED|POISON|FEAR|HINDRED|HYPNOSIS)\]/i.test(m))return 'status_apply';
  if(t==='passive'||t==='skill'||t==='mana'||t==='aoe'||/\[(?:PASSIVE|CHAMPION|SKILL|SPECIAL|ULTIMATE)\]/i.test(m))return 'skill_cast';
  if(t==='damage'||t==='attack'||/\bdealt [0-9,.]+ damage\b/i.test(m))return 'collision_light';
  return null;
 }
 for(const type of ['pointerdown','keydown','click'])host.document?.addEventListener(type,e=>{if(e.isTrusted)activate();},{capture:true,passive:true});
 host.document?.addEventListener('visibilitychange',()=>{if(host.document.hidden)stop();});
 host.addEventListener('pagehide',()=>stop());
 host.GameAudio=Object.freeze({FILES,settings,setMuted,setVolume,activate,play,playFile,prime,batch,stop,sync,diagnostics,combatCue,get activated(){return activated;}});
 host.BallAudio=Object.freeze({KEY,FOLDER,FILES,settings,setMuted,setVolume,activate,
  enter(){stop();active=true;play('modal_open','ball');},beginMatch(){stop('ball');},
  leave(){stop('ball');active=false;play('modal_close','ball');},
  finish(winner){stop('ball');play(winner==='player'?'victory':winner==='enemy'?'defeat':'draw','ball');},
  play:key=>active&&play(key,'ball'),batch:e=>active&&batch(e,'ball'),stop:()=>stop('ball'),sync,diagnostics});
})(window);
