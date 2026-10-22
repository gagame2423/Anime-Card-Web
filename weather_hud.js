/* Cached battle weather overlay. Driven by existing game/Sandbox renders. */
(function(host){
  'use strict';
  let bridge={},root=null,signature='',rows=new Map(),lastSecond=-1;
  const text=(node,value)=>{if(node&&node.textContent!==value)node.textContent=value;};
  function render(){
    root ||= host.document?.getElementById('battleWeatherHud');if(!root)return;
    const snapshot=bridge.snapshot?.(),visible=Boolean(snapshot?.active);
    if(root.hidden===visible)root.hidden=!visible;
    host.document.body.classList.toggle('battle-weather-visible',visible);
    if(!visible)return;
    const entries=snapshot.weathers?.length?snapshot.weathers:[{id:'normal',name:'Normal',icon:'◯',color:'#bac8d8'}];
    const key=entries.map(e=>e.id).join('|'),second=Math.floor(snapshot.seconds||0);
    if(key!==signature){
      signature=key;root.replaceChildren();rows.clear();
      for(const entry of entries){
        const chip=host.document.createElement('div');chip.className='battle-weather-chip';chip.style.setProperty('--weather-color',entry.color||'#83d7f9');
        const name=host.document.createElement('strong');name.textContent=`${entry.icon||'◯'} ${entry.name}`;
        const timer=host.document.createElement('small');chip.append(name,timer);root.append(chip);rows.set(entry.id,{chip,timer});
      }
      lastSecond=-1;
    }
    if(second===lastSecond&&!snapshot.sandbox)return;lastSecond=second;
    for(const entry of entries){const row=rows.get(entry.id);if(!row)continue;
      const left=Number.isFinite(entry.expiresAt)?Math.max(0,Math.ceil(entry.expiresAt-(snapshot.seconds||0))):null;
      text(row.timer,snapshot.sandbox?'Sandbox':left===null?'Default':`${Math.floor(left/60)}:${String(left%60).padStart(2,'0')}`);
      const title=entry.description||'No active special weather';if(row.chip.title!==title)row.chip.title=title;
    }
  }
  host.BattleWeatherHud=Object.freeze({configure(options){bridge=options||{};render();},render});
})(window);
