/* Global sound preferences and the existing custom card reveal tracks. */
(function(host){
 'use strict';
 const KEY='anime_card_rng_sfx_enabled',VOLUME_KEY='anime_card_rng_sfx_volume';
 const FILES=Object.freeze({'boss-event-alucard':'alucard','boss-event-lucius':'luciuszogratis','tower-champion-reaper':'aizenbeyond','tower-champion-normal':'equinox','tower-champion-shadow-200':'stwr','madara-lubu':'madaralubu','tower-champion-eclipse':'wou','akaza':'akaza','adult-gon':'adultgon'});
 let enabled=true,volume=.8,pending=null,held=false;
 function read(){try{enabled=host.localStorage.getItem(KEY)!=='false';const raw=host.localStorage.getItem(VOLUME_KEY),v=Number(raw);volume=raw!==null&&Number.isFinite(v)?Math.max(0,Math.min(1,v)):.8;}catch(_){}}
 function render(){const b=host.document?.getElementById('sfxToggleButton');if(b){b.textContent=enabled?'SFX ON':'SFX OFF';b.setAttribute('aria-pressed',String(enabled));}host.SettingsSystem?.render?.();host.BallView?.audioSettings?.();}
 function release(){if(held){held=false;host.BackgroundActivitySystem?.releaseSpecial?.();}}
 function stop(){pending=null;host.GameAudio?.stop('drop');release();}
 function play(cardId){
  const audio=host.GameAudio;
  if(!enabled||!volume||host.SandboxSystem?.active||!FILES[cardId]||!audio)return false;
  if(!audio.activated){pending=cardId;return false;}
  stop();held=true;host.BackgroundActivitySystem?.holdSpecial?.();
  const started=audio.playFile(FILES[cardId],'drop',{channel:'special',priority:9,limit:1,gap:0,onEnd:release});
  if(!started)release();return started;
 }
 function setEnabled(value){enabled=value!==false;if(!enabled)stop();persist(KEY,enabled);host.GameAudio?.sync();render();}
 function setVolume(value){if(!Number.isFinite(Number(value)))return;volume=Math.max(0,Math.min(1,Number(value)));persist(VOLUME_KEY,volume);host.GameAudio?.sync();render();}
 function persist(key,value){try{host.localStorage.setItem(key,JSON.stringify(value));host.CloudSaveSystem?.markDirty();}catch(_){}}
 function gesture(){if(pending&&host.GameAudio){host.GameAudio.activate();const id=pending;pending=null;play(id);}}
 for(const event of ['pointerdown','keydown'])host.document?.addEventListener(event,gesture,{capture:true,passive:true});
 host.document?.getElementById('sfxToggleButton')?.addEventListener('click',()=>setEnabled(!enabled));
 host.addEventListener('storage',e=>{if(e.key===KEY||e.key===VOLUME_KEY||e.key===null){read();if(!enabled)stop();host.GameAudio?.sync();render();}});
 host.addEventListener('pagehide',stop);read();render();
 host.DropAudioSystem=Object.freeze({KEY,VOLUME_KEY,FILES,play,stop,setEnabled,setVolume,get volume(){return volume;},get enabled(){return enabled;}});
})(window);
