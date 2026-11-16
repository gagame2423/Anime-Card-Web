/* Match SFX use the existing assets/audio directory and global SFX preferences. */
(function(host){
 'use strict';
 const RANK_FILES=Object.freeze(['itob','btos','stog','gtop','ptoe','etod','dtom','mtogm','gmtoc']);
 const WARNING_SECONDS=10;let activated=false,active=null,generation=0;const warned=new Set();
 const settings=()=>({enabled:host.DropAudioSystem?.enabled!==false,volume:Math.max(0,Math.min(1,Number(host.DropAudioSystem?.volume??.8)||0))});
 function stop(){generation++;if(active){active.audio.onended=active.audio.onerror=null;try{active.audio.pause();active.audio.currentTime=0;}catch(_){}active=null;}}
 function sync(){if(!active)return;const s=settings();if(!s.enabled||!s.volume){stop();return;}active.audio.volume=s.volume;}
 function play(file,kind='countdown',fallback=null){
  const s=settings();if(!activated||!host.Audio||!s.enabled||!s.volume||kind==='countdown'&&active?.kind==='rank')return false;
  stop();const ticket=++generation;let fallbackUsed=false;
  function begin(name){if(ticket!==generation)return;let audio;try{audio=new host.Audio('assets/audio/'+name+'.mp3');audio.preload='none';audio.volume=settings().volume;}catch(_){return;}
   active={audio,kind};const finish=()=>{if(ticket!==generation||active?.audio!==audio)return;audio.onended=audio.onerror=null;active=null;};
   audio.onended=finish;audio.onerror=()=>{if(ticket!==generation)return;if(fallback&&!fallbackUsed){fallbackUsed=true;audio.onended=audio.onerror=null;try{audio.pause();}catch(_){}begin(fallback);}else finish();};
   try{Promise.resolve(audio.play()).catch(()=>{if(ticket===generation)finish();});}catch(_){finish();}
  }begin(file);return true;
 }
 function rankUp(from,to){if(!Number.isInteger(from)||!Number.isInteger(to)||to<=from||to<1||to>9)return false;return play(RANK_FILES[to-1],'rank',to===8?'mtog':null);}
 function countdown(s,remaining){
  if(!s||s.finished||!['planning','carousel','augment','combat'].includes(s.phase)||!(remaining>0&&remaining<=WARNING_SECONDS))return false;
  const key=s.id+'/'+host.AutoChessSystem.label(s);if(warned.has(key))return false;warned.add(key);if(warned.size>600)warned.delete(warned.values().next().value);return play('countdown10s');
 }
 for(const type of ['pointerdown','keydown'])host.document?.addEventListener(type,()=>{activated=true;},{capture:true,passive:true});
 host.document?.getElementById('sfxToggleButton')?.addEventListener('click',()=>host.queueMicrotask(sync));
 for(const id of ['sfxVolumeRange','sfxVolumeNumber'])host.document?.getElementById(id)?.addEventListener('input',()=>host.queueMicrotask(sync));
 host.addEventListener('pagehide',stop);
 host.AutoChessAudio=Object.freeze({RANK_FILES,WARNING_SECONDS,play,rankUp,countdown,sync,stop});
})(window);
