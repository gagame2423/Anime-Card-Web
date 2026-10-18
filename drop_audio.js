/* Only this allowlist can play custom card-drop sounds. No preload during rolling. */
(function(host){
 'use strict';
 const KEY='anime_card_rng_sfx_enabled';
 const VOLUME_KEY='anime_card_rng_sfx_volume';
 let volume=.8;
 try{const raw=host.localStorage.getItem(VOLUME_KEY),saved=JSON.parse(raw);if(raw!==null&&typeof saved==='number'&&Number.isFinite(saved)&&saved>=0&&saved<=1)volume=saved;}catch(_){}
 const FILES=Object.freeze({'boss-event-alucard':'alucard','boss-event-lucius':'luciuszogratis','tower-champion-reaper':'aizenbeyond','tower-champion-normal':'equinox','tower-champion-shadow-200':'stwr','madara-lubu':'madaralubu','tower-champion-eclipse':'wou','akaza':'akaza','adult-gon':'adultgon'});
 let enabled=true,activated=false,active=null,pending=null,token=0;
 try{enabled=host.localStorage.getItem(KEY)!=='false';}catch(_){}
 const cache=new Map();
 function render(){const b=host.document?.getElementById('sfxToggleButton');if(b){b.textContent=enabled?'SFX ON':'SFX OFF';b.setAttribute('aria-pressed',String(enabled));}}
 function stop(resume=true){token++;pending=null;const old=active;active=null;if(old){old.pause();try{old.currentTime=0;}catch(_){}}if(resume&&old)host.BackgroundActivitySystem?.releaseSpecial?.();}
 function play(cardId){
  if(!host.Audio||!enabled||host.SandboxSystem?.active||!FILES[cardId])return false;
  if(!activated){pending=cardId;return false;}
  stop(false);const current=++token;
  host.BackgroundActivitySystem?.holdSpecial?.();
  let audio=cache.get(cardId);
  if(!audio){audio=new host.Audio(`assets/audio/${FILES[cardId]}.mp3`);audio.preload='none';cache.set(cardId,audio);}
  active=audio;audio.volume=volume;
  const finish=()=>{if(current!==token)return;token++;active=null;host.BackgroundActivitySystem?.releaseSpecial?.();};
  audio.onended=finish;audio.onerror=finish;
  try{Promise.resolve(audio.play()).catch(finish);}catch(_){finish();}
  return true;
 }
 function gesture(){activated=true;if(pending){const id=pending;pending=null;play(id);}}
 for(const event of ['pointerdown','keydown'])host.document?.addEventListener(event,gesture,{capture:true,passive:true});
 host.document?.getElementById('sfxToggleButton')?.addEventListener('click',()=>{enabled=!enabled;try{host.localStorage.setItem(KEY,JSON.stringify(enabled));}catch(_){}if(!enabled){pending=null;stop();}render();});
 host.addEventListener('pagehide',()=>{pending=null;stop(false);});render();
 host.DropAudioSystem=Object.freeze({KEY,VOLUME_KEY,FILES,play,stop,setVolume:value=>{const next=Number(value);if(!Number.isFinite(next))return;volume=Math.max(0,Math.min(1,next));if(active)active.volume=volume;try{host.localStorage.setItem(VOLUME_KEY,JSON.stringify(volume));}catch(_){}},get volume(){return volume;},get enabled(){return enabled;}});
})(window);
