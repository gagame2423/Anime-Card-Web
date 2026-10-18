/* Settings UI coordination only. Audio modules own playback and persistence. */
(function(host){
  'use strict';
  const rows=[['music',()=>host.BackgroundActivitySystem],['sfx',()=>host.DropAudioSystem]];
  let mounted=false;
  function render(){for(const [prefix,get] of rows){const system=get();if(!system)continue;const value=String(Math.round(system.volume*100));for(const suffix of ['Range','Number']){const node=host.document?.getElementById(prefix+'Volume'+suffix);if(node&&host.document.activeElement!==node)node.value=value;}}}
  function mount(){if(mounted)return;const root=host.document?.getElementById('settingsModal');if(!root)return;mounted=true;
    for(const [prefix,get] of rows){const range=root.querySelector('#'+prefix+'VolumeRange'),number=root.querySelector('#'+prefix+'VolumeNumber');if(!range||!number)continue;
      const commit=(source,final=false)=>{if(source.value.trim()===''){if(final){source.value=String(Math.round(get().volume*100));}return;}const raw=Number(source.value);if(!Number.isFinite(raw))return;const value=Math.round(Math.max(0,Math.min(100,raw)));get()?.setVolume(value/100);range.value=String(value);if(source!==number||final)number.value=String(value);};
      range.addEventListener('input',()=>commit(range));number.addEventListener('input',()=>commit(number));number.addEventListener('change',()=>commit(number,true));
    }render();
  }
  host.SettingsSystem=Object.freeze({mount,render});mount();
})(window);
