/* Arena status pills are independent of the card's passive tooltip. */
(function(host){
  'use strict';
  const doc=host.document, models=new WeakMap(), lists=new WeakMap();
  const turns=n=>n>0?`${n} ${n===1?'turn':'turns'} remaining`:'';
  function runtimeBadges(rows){
    const body=[];
    for(const row of rows){
      const label=String(row.label||''),tone=row.tone||'buff';
      // Canonical combat badges have the actual runtime values and expiration.
      if(['burn','bleed','poison','shield','freeze','stun','invincible','guard'].includes(tone)||
        /^(?:BLEED|BURN|POISON|HINDRED|FEAR|FROST|FREEZE|STUN|SNAIL|HYPNOTIS|HYPNOS|IMMUNE|INVINCIBLE|PASSIVE OFF|ALIEN WATCH|[-+]\d+(?:\.\d+)?% ATK\b)/i.test(label))continue;
      if(tone==='passive'&&!row.category)continue; // Passive name / last event, not a persistent effect.
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
      body.push({key:label.replace(/\d+(?:\.\d+)?/g,'#'),name:label,type:tone==='debuff'||row.category==='status'?'Debuff':'Buff',
        icon:row.icon,tone,label,detail,turns:Number(label.match(/(?:^|\D)(\d+)t\b/i)?.[1])||0,
        duration:/^NEXT\b/.test(label)?'Next attack':undefined});
    }
    return body;
  }

  let root,tip,heading,meta,detail,facts,active,pinned=false,current='',queued=false;
  function element(tag,cls){const node=doc.createElement(tag);node.className=cls;return node;}
  function hide(){
    active?.removeAttribute('aria-describedby');active=null;pinned=false;current='';
    if(tip)tip.hidden=true;
  }
  function place(){
    queued=false;
    if(!active||!active.isConnected||!active.getClientRects().length){hide();return;}
    const r=active.getBoundingClientRect(),w=tip.offsetWidth,h=tip.offsetHeight;
    if(r.bottom<0||r.top>host.innerHeight||r.right<0||r.left>host.innerWidth){hide();return;}
    const left=Math.max(8,Math.min(r.left,host.innerWidth-w-8));
    const top=r.top>=h+15?r.top-h-7:Math.max(8,Math.min(r.bottom+7,host.innerHeight-h-8));
    tip.style.left=left+'px';tip.style.top=top+'px';
  }
  function show(target){
    const m=models.get(target);if(!tip||!m)return;
    if(active!==target){
      active?.removeAttribute('aria-describedby');active=target;target.setAttribute('aria-describedby',tip.id);
      doc.dispatchEvent(new Event('arena-status-open'));
    }
    const key=JSON.stringify(m);
    if(current!==key){
      current=key;heading.textContent=m.name;tip.dataset.tone=m.tone||'buff';
      meta.textContent=[m.type,turns(m.turns)||m.duration,m.stacks?`${m.stacks} ${m.stacks===1?'stack':'stacks'}`:''].filter(Boolean).join(' · ');
      detail.textContent=m.detail;
      facts.replaceChildren(...(m.facts||[]).map(text=>{const li=doc.createElement('li');li.textContent=text;return li;}));
      facts.hidden=!facts.childElementCount;
    }
    tip.classList.toggle('is-pinned',pinned);tip.hidden=false;
    if(!queued){queued=true;host.requestAnimationFrame(place);}
  }
  function bind(target,model){
    models.set(target,model);
    if(active===target)show(target);
  }
  function render(container,rows,kind){
    if(!container)return;
    let view=lists.get(container);
    if(!view){view={nodes:new Map(),order:''};lists.set(container,view);}
    const nodes=[],seen=new Set();
    for(const model of rows){
      const key=model.key;if(seen.has(key))continue;seen.add(key);
      let badge=view.nodes.get(key);
      const cls=kind==='passive'?'passive-status-badge':'battle-effect-badge';
      if(!badge){
        badge=element('button',cls);badge.type='button';badge.dataset.statusInspect='';view.nodes.set(key,badge);
      }
      const tone=String(model.tone||'buff').replace(/[^a-z0-9_-]/gi,'');
      badge.className=`${cls} ${cls}--${tone}`;badge.dataset.tone=tone;
      const label=`${model.icon||'✦'} ${model.label}`;if(badge.textContent!==label)badge.textContent=label;
      bind(badge,model);nodes.push(badge);
    }
    for(const [key,node] of view.nodes)if(!seen.has(key)){if(active===node)hide();view.nodes.delete(key);}
    const order=[...seen].join('|');
    if(order!==view.order){
      const focus=doc.activeElement;
      container.replaceChildren(...nodes);
      if(nodes.includes(focus))focus.focus({preventScroll:true});
      view.order=order;
    }
  }
  function mount(arena){
    if(root||!arena)return;root=arena;
    tip=element('div','arena-status-tooltip');tip.id='arenaStatusTooltip';tip.hidden=true;tip.setAttribute('role','tooltip');
    heading=element('strong','arena-status-tooltip__title');meta=element('small','arena-status-tooltip__meta');
    detail=element('p','arena-status-tooltip__detail');facts=element('ul','arena-status-tooltip__facts');
    tip.append(heading,meta,detail,facts);doc.body.append(tip);
    const find=e=>e.target?.closest?.('[data-status-inspect]');
    root.addEventListener('pointerover',e=>{const target=find(e);if(!target)return;e.stopPropagation();if(e.pointerType!=='touch'&&!pinned&&active!==target)show(target);});
    root.addEventListener('pointerout',e=>{const target=find(e);if(!target)return;e.stopPropagation();if(!pinned&&active===target&&!target.contains(e.relatedTarget?.nodeType?e.relatedTarget:null)&&doc.activeElement!==target)hide();});
    root.addEventListener('focusin',e=>{const target=find(e);if(target){e.stopPropagation();if(!pinned)show(target);}});
    root.addEventListener('focusout',e=>{const target=find(e);if(target===active&&!pinned)hide();});
    root.addEventListener('click',e=>{const target=find(e);if(!target)return;e.stopPropagation();if(active===target&&pinned)hide();else{pinned=true;show(target);}});
    doc.addEventListener('arena-passive-open',hide);
    doc.addEventListener('pointerdown',e=>{if(active&&!active.contains(e.target)&&!tip.contains(e.target))hide();},{capture:true});
    doc.addEventListener('keydown',e=>{if(active&&e.key==='Escape'){e.stopPropagation();hide();}},{capture:true});
    host.addEventListener('resize',hide,{passive:true});
    host.addEventListener('scroll',e=>{if(e.target!==tip&&!e.target?.closest?.('.arena-status-tooltip'))hide();},{passive:true,capture:true});
    const observer=new MutationObserver(()=>{if(active&&!root.getClientRects().length)hide();});
    observer.observe(root,{attributes:true,attributeFilter:['class','hidden']});
    const modal=root.closest('#battleModal');if(modal)observer.observe(modal,{attributes:true,attributeFilter:['class','hidden']});
  }
  host.ArenaStatusView=Object.freeze({mount,render,runtimeBadges});
})(window);
