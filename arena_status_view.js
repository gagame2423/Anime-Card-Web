/* Arena status pills are independent of the card's passive tooltip. */
(function(host){
  'use strict';
  const doc=host.document, lists=new WeakMap();
  const turns=n=>n>0?`${n} ${n===1?'turn':'turns'} remaining`:'';
  function runtimeBadges(rows){
    const body=[];
    for(const row of rows){
      const label=String(row.label||''),tone=row.tone||'buff';
      // Canonical combat badges have the actual runtime values and expiration.
      if(['burn','black-flame','bleed','poison','shield','freeze','stun','invincible','guard'].includes(tone)||
        /^(?:BLACK FLAME|BLEED|BURN|POISON|HINDRED|FEAR|FROST|FREEZE|STUN|SNAIL|HYPNOTIS|HYPNOS|HYPOTHESIS|IMMUNE|INVINCIBLE|PASSIVE OFF|ALIEN WATCH|[-+]\d+(?:\.\d+)?% ATK\b)/i.test(label))continue;
      // Native modes and counters may have no category. Exclude only the
      // explicitly redundant identity and event-history badges.
      if(!label.trim()||row.presentationRole==='identity'||row.presentationRole==='history')continue;
      const detail=/^NEXT\b/.test(label)?'Applies to the next eligible attack.':
        /^CRIT$/.test(label)?'The last attack was a critical hit.':
        /^DOOM/.test(label)?'When the countdown ends, this fighter is defeated permanently.':
        /^SAW CONTRACT/.test(label)?'Grants 20% ATK. Each attack has a 20% chance to miss.':
        /^LAST HERO STANDING/.test(label)?'Grants +50% ATK and immunity to debuffs while this fighter is the last living ally.':
        /^AURA\b/.test(label)?'Each Aura stack adds 10% Critical Damage, up to 5 stacks.':
        /^SLIME\b/.test(label)?'Spend 1 Slime Point to survive a fatal hit.':
        /^BERSERKER$/.test(label)?'Attacks apply Bleed while Berserker is active.':
        /^KUUGA BLUE/.test(label)?'While in Blue Form, gain +20% Critical Chance.':
        /^KUUGA GREEN/.test(label)?'While in Green Form, gain +50% Critical Damage.':
        /^KUUGA PURPLE/.test(label)?'While in Purple Form, gain +30% maximum HP.':
        /^PAPER /.test(label)?'Each Paper stack removes 1 percentage point of damage reduction. A new shield is broken at 5 stacks, consuming 5 Paper.':
        `Current combat state: ${label}.`;
      body.push({key:row.key||label.replace(/\d+(?:\.\d+)?/g,'#'),name:row.name||label,type:row.category==='passive'||tone==='passive'||tone==='form'?'Passive':tone==='debuff'||row.category==='status'?'Debuff':'Buff',
        icon:row.icon,tone,label,detail:row.detail||detail,facts:row.facts||[],choices:row.choices,choiceLabel:row.choiceLabel,
        turns:row.turns??(Number(label.match(/(?:^|\D)(\d+)t\b/i)?.[1])||0),
        duration:row.duration||(/^NEXT\b/.test(label)?'Next attack':undefined)});
    }
    return body;
  }

  // The overlay follows the logical fighter side and status key, not a temporary pill.
  let root,tip,heading,meta,detail,facts,active=null,pinned=false,current='',queued=false,leaveTimer=0,pointer=null;
  const records=new Map();
  const stopLeave=()=>{host.clearTimeout(leaveTimer);leaveTimer=0;};
  const element=(tag,cls)=>{const node=doc.createElement(tag);node.className=cls;return node;};
  const toneFor=m=>{
    const key=String(m.key||'').toLowerCase(),name=String(m.name||m.label||'').toLowerCase();
    return /^black.flame/.test(key)||/^black flame/.test(name)?'black-flame':
      /^fear/.test(key)||/^fear\b/.test(name)?'fear':
      /^hind(?:red|ered)/.test(key)||/^hind(?:red|ered)\b/.test(name)?'hindred':
      /^hyp(?:nosis|othesis|notis)/.test(key)||/^hyp(?:nosis|othesis|notis)/.test(name)?'hypnosis':
      String(m.tone||'buff').replace(/[^a-z0-9_-]/gi,'');
  };
  function hide(){
    stopLeave();active?.badge?.removeAttribute('aria-describedby');active=null;pinned=false;current='';
    if(tip)tip.hidden=true;
  }
  function schedulePlace(){if(!queued){queued=true;host.requestAnimationFrame(place);}}
  function place(){
    queued=false;
    const badge=active?.badge;
    if(!badge?.isConnected||!badge.getClientRects().length){if(active)hide();return;}
    const r=badge.getBoundingClientRect(),w=tip.offsetWidth,h=tip.offsetHeight;
    if(r.bottom<0||r.top>host.innerHeight||r.right<0||r.left>host.innerWidth){hide();return;}
    const left=Math.max(8,Math.min(r.left,host.innerWidth-w-8));
    const above=r.top>=h+12, below=r.bottom+h+12<=host.innerHeight;
    const top=above?r.top-h-6:below?r.bottom+6:Math.max(8,Math.min(r.bottom+6,host.innerHeight-h-8));
    tip.style.left=left+'px';tip.style.top=top+'px';
  }
  function show(record,refresh=false){
    if(!tip||!record?.model)return;
    if(!refresh)stopLeave();
    if(active!==record){
      active?.badge?.removeAttribute('aria-describedby');active=record;
      doc.dispatchEvent(new Event('arena-status-open'));
    }
    active.badge.setAttribute('aria-describedby',tip.id);
    const m=record.model,key=JSON.stringify(m);
    if(current!==key){
      current=key;heading.textContent=m.name;tip.dataset.tone=toneFor(m);
      meta.textContent=[m.type,turns(m.turns)||m.duration,m.stacks?`${m.stacks} ${m.stacks===1?'stack':'stacks'}`:''].filter(Boolean).join(' · ');
      detail.textContent=m.detail;
      facts.replaceChildren(...(m.facts||[]).map(text=>{const li=doc.createElement('li');li.textContent=text;return li;}));
      facts.hidden=!facts.childElementCount;
    }
    tip.classList.toggle('is-pinned',pinned);tip.hidden=false;
    schedulePlace();
  }
  function render(container,rows,kind='effect',side,unit){
    if(!container)return;
    side=side||(container.closest('.battle-enemy')||/enemy/i.test(container.id)?'enemy':'player');
    let view=lists.get(container);
    if(!view){view={nodes:new Map(),unit};lists.set(container,view);}
    if(unit&&view.unit&&view.unit!==unit){
      if(active?.side===side)hide();
      for(const record of view.nodes.values())records.delete(record.id);
      view.nodes.clear();container.replaceChildren();
    }
    view.unit=unit||view.unit;
    const nodes=[],seen=new Set();
    for(const model of rows){
      const key=model.key;if(seen.has(key))continue;seen.add(key);
      let record=view.nodes.get(key);
      const cls=kind==='passive'?'passive-status-badge':'battle-effect-badge';
      if(!record){
        const badge=element('button',cls);badge.type='button';badge.dataset.statusInspect='';
        record={badge,side,key,id:side+':'+kind+':'+key,model};badge.dataset.statusKey=record.id;
        view.nodes.set(key,record);records.set(record.id,record);
      }
      const badge=record.badge,tone=toneFor(model),choice=Array.isArray(model.choices)&&model.choices.length>0;
      const className=cls+' '+cls+'--'+tone+(choice?' arena-mode-readout':'');if(badge.className!==className)badge.className=className;
      if(badge.dataset.tone!==tone)badge.dataset.tone=tone;
      const label=(model.icon||'✦')+' '+model.label;
      if(choice){
        const signature=JSON.stringify([model.name,model.choices.map(x=>[x.id,x.label])]);
        if(record.choiceSignature!==signature){
          const title=element('span','arena-mode-readout__title');title.textContent=model.name;
          const selected=element('span','arena-mode-readout__selected'),options=element('span','arena-mode-readout__options');
          const chips=model.choices.map(c=>{const chip=element('span','arena-mode-readout__option');chip.textContent=c.label;options.append(chip);return chip;});
          badge.replaceChildren(title,selected,options);record.choiceParts={selected,chips};record.choiceSignature=signature;
        }
        if(record.choiceParts.selected.textContent!==model.choiceLabel)record.choiceParts.selected.textContent=model.choiceLabel;
        model.choices.forEach((c,index)=>record.choiceParts.chips[index].classList.toggle('is-selected',!!c.selected));
        badge.setAttribute('aria-label',model.label+'. Inspect passive selection');
      }else{
        record.choiceSignature=null;record.choiceParts=null;
        if(badge.textContent!==label)badge.textContent=label;
        badge.setAttribute('aria-label',label);
      }
      record.model=model;nodes.push(badge);
    }
    for(const [key,record] of view.nodes)if(!seen.has(key)){
      if(active===record)hide();records.delete(record.id);record.badge.remove();view.nodes.delete(key);
    }
    // Reconcile only nodes whose position changed; never replace the entire pill list.
    for(let i=0;i<nodes.length;i++)if(container.children[i]!==nodes[i])container.insertBefore(nodes[i],container.children[i]||null);
    if(active?.side===side&&nodes.includes(active.badge))show(active,true);
  }
  function isTarget(record,node){return Boolean(record&&node?.nodeType&&record.badge.contains(node));}
  function isTip(node){return Boolean(node?.nodeType&&tip.contains(node));}
  function closeAfterMovement(){
    if(!active||pinned)return;
    // Allow a brief crossing of the small gap between pill and overlay,
    // but an explicit move far from both should close immediately.
    const dist=n=>{const r=n.getBoundingClientRect();return Math.hypot(Math.max(0,r.left-pointer.x,pointer.x-r.right),Math.max(0,r.top-pointer.y,pointer.y-r.bottom));};
    if(pointer&&doc.activeElement!==active.badge&&Math.min(dist(active.badge),dist(tip))>22){hide();return;}
    stopLeave();leaveTimer=host.setTimeout(()=>{
      if(!active||pinned||doc.activeElement===active.badge)return;
      const target=pointer&&doc.elementFromPoint(pointer.x,pointer.y);
      if(!isTarget(active,target)&&!isTip(target))hide();
    },160);
  }
  function mount(arena){
    if(root||!arena)return;root=arena;
    tip=element('div','arena-status-tooltip');tip.id='arenaStatusTooltip';tip.hidden=true;tip.setAttribute('role','tooltip');
    heading=element('strong','arena-status-tooltip__title');meta=element('small','arena-status-tooltip__meta');
    detail=element('p','arena-status-tooltip__detail');facts=element('ul','arena-status-tooltip__facts');
    tip.append(heading,meta,detail,facts);doc.body.append(tip);
    const find=e=>records.get(e.target?.closest?.('[data-status-inspect]')?.dataset.statusKey);
    const point=e=>({x:e.clientX,y:e.clientY});
    const moved=e=>!pointer||pointer.x!==e.clientX||pointer.y!==e.clientY;
    root.addEventListener('pointerover',e=>{
      const record=find(e);if(!record)return;e.stopPropagation();
      if(e.pointerType==='touch'||pinned)return;
      // Layout and attack animations can synthesize boundary events without user movement.
      if(active&&active!==record&&!moved(e))return;
      pointer=point(e);show(record);
    });
    root.addEventListener('pointerout',e=>{
      const record=find(e);if(!record)return;e.stopPropagation();
      if(pinned||record!==active||isTarget(record,e.relatedTarget)||isTip(e.relatedTarget))return;
      if(moved(e)){pointer=point(e);closeAfterMovement();}
    });
    doc.addEventListener('pointermove',e=>{
      if(e.pointerType==='touch'||!moved(e))return;pointer=point(e);
      if(!active||pinned)return;
      const next=find(e);if(next){show(next);return;}
      if(isTip(e.target)){stopLeave();return;}
      if(!leaveTimer)closeAfterMovement();
    },{passive:true,capture:true});
    tip.addEventListener('pointerenter',stopLeave);
    tip.addEventListener('pointerleave',e=>{if(!pinned&&moved(e)&&!isTarget(active,e.relatedTarget)){pointer=point(e);closeAfterMovement();}});
    doc.documentElement.addEventListener('pointerleave',e=>{if(!pinned&&!e.relatedTarget)hide();});
    root.addEventListener('focusin',e=>{const record=find(e);if(record){e.stopPropagation();if(!pinned)show(record);}});
    root.addEventListener('focusout',e=>{const record=find(e);if(record===active&&!pinned&&!isTip(e.relatedTarget)&&!isTarget(record,pointer&&doc.elementFromPoint(pointer.x,pointer.y)))hide();});
    root.addEventListener('click',e=>{const record=find(e);if(!record)return;e.stopPropagation();if(active===record&&pinned)hide();else{pinned=true;show(record);}});
    doc.addEventListener('arena-passive-open',hide);
    doc.addEventListener('pointerdown',e=>{if(active&&!isTarget(active,e.target)&&!isTip(e.target))hide();},{capture:true});
    doc.addEventListener('keydown',e=>{if(active&&e.key==='Escape'){e.stopImmediatePropagation();e.preventDefault();hide();}},{capture:true});
    host.addEventListener('blur',()=>{if(!pinned)hide();});
    host.addEventListener('resize',()=>{if(active)schedulePlace();},{passive:true});
    host.addEventListener('scroll',e=>{if(active&&!isTip(e.target))schedulePlace();},{passive:true,capture:true});
    const observer=new MutationObserver(()=>{if(active&&!root.getClientRects().length)hide();});
    observer.observe(root,{attributes:true,attributeFilter:['class','hidden']});
    const modal=root.closest('#battleModal');if(modal)observer.observe(modal,{attributes:true,attributeFilter:['class','hidden']});
  }
  host.ArenaStatusView=Object.freeze({mount,render,runtimeBadges});
})(window);
