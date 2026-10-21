/* Persistent UI preferences. Only the permanent Base Luck component is capped. */
(function(host){
  'use strict';
  const rows=[['music',()=>host.BackgroundActivitySystem],['sfx',()=>host.DropAudioSystem]];
  const KEY='anime_card_rng_settings_v1';
  const fresh=()=>({version:1,baseLuck:null,spookySpeedUp:false});
  const validSave=v=>Boolean(v&&v.version===1&&(v.baseLuck===null||typeof v.baseLuck==='number'&&Number.isFinite(v.baseLuck)&&v.baseLuck>=1)&&typeof v.spookySpeedUp==='boolean');
  let preferences=fresh(),bridge={},refs={},mounted=false;
  try{const saved=JSON.parse(host.localStorage.getItem(KEY)||'null');if(validSave(saved))preferences=saved;}catch(_){}
  function maxBaseLuck(){return Math.max(1,Number(bridge.maxBaseLuck?.())||1);}
  function baseLuck(max=maxBaseLuck()){return preferences.baseLuck===null?max:Math.max(1,Math.min(max,preferences.baseLuck));}
  function commit(next){if(bridge.canAct?.()===false)return false;try{host.localStorage.setItem(KEY,JSON.stringify(next));preferences=next;bridge.onChange?.();render();return true;}catch(_){render();return false;}}
  function setBaseLuck(value){const max=maxBaseLuck(),number=Number(value);if(value!==null&&!Number.isFinite(number))return false;const chosen=value===null?max:Math.max(1,Math.min(max,number));return commit({...preferences,baseLuck:chosen>=max-1e-9?null:chosen});}
  function setSpookySpeedUp(value){return commit({...preferences,spookySpeedUp:value===true});}
  function render(){for(const [prefix,get] of rows){const system=get();if(!system)continue;const value=String(Math.round(system.volume*100));for(const suffix of ['Range','Number']){const node=host.document?.getElementById(prefix+'Volume'+suffix);if(node&&host.document.activeElement!==node)node.value=value;}}
    const max=maxBaseLuck(),chosen=baseLuck(max);for(const node of [refs.luckRange,refs.luckNumber])if(node){node.max=String(max);if(host.document.activeElement!==node)node.value=String(Number(chosen.toFixed(4)));}
    if(refs.luckStatus)refs.luckStatus.textContent=`Base Luck ${chosen.toFixed(2)} / ${max.toFixed(2)} • ${preferences.baseLuck===null?'MAX (follows upgrades)':'Custom'} • Total ${(Number(bridge.totalLuck?.())||chosen).toFixed(2)}x`;
    if(refs.speedToggle)refs.speedToggle.checked=preferences.spookySpeedUp;
    if(refs.speedLabel)refs.speedLabel.textContent=preferences.spookySpeedUp?'ON • 1s / turn':'OFF • 2s / turn';
  }
  function mount(){if(mounted)return;const root=host.document?.getElementById('settingsModal');if(!root)return;mounted=true;
    for(const [prefix,get] of rows){const range=root.querySelector('#'+prefix+'VolumeRange'),number=root.querySelector('#'+prefix+'VolumeNumber');if(!range||!number)continue;
      const commit=(source,final=false)=>{if(source.value.trim()===''){if(final){source.value=String(Math.round(get().volume*100));}return;}const raw=Number(source.value);if(!Number.isFinite(raw))return;const value=Math.round(Math.max(0,Math.min(100,raw)));get()?.setVolume(value/100);range.value=String(value);if(source!==number||final)number.value=String(value);};
      range.addEventListener('input',()=>commit(range));number.addEventListener('input',()=>commit(number));number.addEventListener('change',()=>commit(number,true));
    }
    refs={luckRange:root.querySelector('#luckConfigRange'),luckNumber:root.querySelector('#luckConfigNumber'),luckStatus:root.querySelector('#luckConfigStatus'),speedToggle:host.document.getElementById('spookySpeedUpToggle'),speedLabel:host.document.getElementById('spookySpeedUpState')};
    refs.luckRange?.addEventListener('input',()=>{setBaseLuck(refs.luckRange.value);refs.luckRange.value=String(baseLuck());if(refs.luckNumber)refs.luckNumber.value=String(baseLuck());});
    refs.luckNumber?.addEventListener('change',()=>{setBaseLuck(refs.luckNumber.value.trim()===''?null:refs.luckNumber.value);refs.luckNumber.value=String(baseLuck());});
    root.querySelector('#luckConfigReset')?.addEventListener('click',()=>setBaseLuck(null));
    refs.speedToggle?.addEventListener('change',()=>{if(!setSpookySpeedUp(refs.speedToggle.checked))refs.speedToggle.checked=preferences.spookySpeedUp;});
    render();
  }
  host.addEventListener('storage',event=>{if(event.key!==KEY&&event.key!==null)return;try{const next=event.key===null||event.newValue===null?fresh():JSON.parse(event.newValue);if(validSave(next)){preferences=next;bridge.onChange?.();render();}}catch(_){}});
  host.SettingsSystem=Object.freeze({KEY,mount,render,validSave,baseLuck,setBaseLuck,setSpookySpeedUp,configure:options=>{bridge=options||{};render();},get spookySpeedUp(){return preferences.spookySpeedUp;},reset:()=>{commit(fresh());}});mount();
})(window);
