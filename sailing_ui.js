/* Sailing Sea HUD and dialogs. All nodes are scoped to the standalone modal.
   The view never rolls rewards, mutates a crew or advances the game clock. */
(function(host){
 'use strict';
 const doc=host.document,M=host.SailingMap,K=host.SailingCombat,R=host.SailingRules;
 const $=id=>doc.getElementById(id),esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const fmt=n=>Math.floor(Math.max(0,Number(n)||0)+1e-7).toLocaleString('en-US'),stam=n=>Number((Math.max(0,Number(n)||0)).toFixed(1)).toLocaleString('en-US'),pct=(n,max=100)=>M.clamp((Number(n)||0)/Math.max(1,max)*100,0,100),rarityColors={Common:'#a1b7c1',Rare:'#75b5ec',Epic:'#c498f2',Legendary:'#edc16e',Mythic:'#eb829b',Secret:'#fff1be'};
 const paths={
  anchor:'M12 3v17m-3-13h6M4 13H2v2c0 5 6 7 10 7s10-2 10-7v-2h-2M9 3a3 3 0 1 1 6 0 3 3 0 0 1-6 0Z',
  crew:'M7 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM1 21v-3c0-4 3-5 6-5s6 1 6 5v3ZM16 10a2.7 2.7 0 1 0 0-5.4M16 13c4 0 7 2 7 5v3h-6',
  flag:'M5 22V3m0 1c5-4 9 4 15 0v11c-6 4-10-4-15 0',
  forge:'M3 11h18l-3 5H6ZM8 16l-3 5h14l-3-5M8 3l5 5m-3-7 5 5-3 3-5-5Z',
  upgrade:'M12 4l8 8h-5v8H9v-8H4Zm-7-2h14',
  guide:'M3 4h8v16H3zm10 0h8v16h-8M6 8h2m-2 4h2m-2 4h2m7-8h3m-3 4h3m-3 4h3',
  skull:'M8 19v-4C2 11 4 3 12 3s10 8 4 12v4ZM8 10h1m6 0h1M12 13v1M10 19v-3m4 3v-3',
  storm:'M5 13a4 4 0 0 1 0-8 5 5 0 0 1 8-2 4.5 4.5 0 1 1 5 10H5m8-2-5 7h5l-2 5 7-9h-5',
  crown:'m2 6 5 5 5-8 5 8 5-5-3 11H5ZM6 21h12',
  settings:'M10 3h4l1 3 3 1 3-1 2 4-2 2v2l2 2-2 4-3-1-3 1-1 3h-4l-1-3-3-1-3 1-2-4 2-2v-2l-2-2 2-4 3 1 3-1ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
  save:'M4 3h13l4 4v14H3V3Zm3 0v6h10V3M7 21v-8h10v8',
  exit:'M10 4H3v16h7m4-12 4 4-4 4m-6-4h13',
  wheel:'M12 2v20M2 12h20M5 5l14 14m0-14L5 19M12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z',
  point:'M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7Zm0 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
  lock:'M7 10V7a5 5 0 0 1 10 0v3M5 10h14v12H5Zm7 4v4',
  unlock:'M7 10V7a5 5 0 0 1 9-3M5 10h14v12H5Zm7 4v4',
  pause:'M8 4h3v16H8zm6 0h3v16h-3z',play:'m7 3 14 9-14 9Z',
  sword:'m3 21 8-8m-4-4 8 8M12 12l8-9 1 1-6 12M5 16l3 3',
  coin:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4v10m-3-7 3-3 3 3m-6 4 3 3 3-3',
  wave:'M1 9c4-6 8 6 12 0s8 6 11 0M1 16c4-6 8 6 12 0s8 6 11 0',
  close:'m6 6 12 12M18 6 6 18',check:'m3 12 6 6L21 6',arrow:'M3 12h18m-7-7 7 7-7 7',clock:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 4v6l5 3',
  ship:'M3 15h18l-4 6H7ZM12 2v13M11 3l-7 10h7Zm2 1 7 9h-7Z',
  sun:'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M20 4l-2 2M6 18l-2 2',
  moon:'M19 16A10 10 0 0 1 8 3a10 10 0 1 0 11 13Z',
  gem:'m12 2 9 8-9 12L3 10Zm-9 8h18m-13 0 4 12 4-12'
 };
 const icon=(name,size=20)=>`<svg class="ss-icon" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name]||paths.wave}"/></svg>`;
 function btn(action,label,extra='',ico='',cls='ss-button'){return `<button type="button" class="${cls}" data-ss-action="${action}" ${extra}>${ico?icon(ico,17):''}<span>${esc(label)}</span></button>`;}
 function actionTile(i,act,ico,label,short){return `<button type="button" class="ss-action" data-ss-action="${act}" aria-label="${i}. ${esc(label)}" title="${i}. ${esc(label)}"><span class="ss-action-circle">${icon(ico,24)}<small>${i}</small>${act==='upgrade'?'<b id="ssUpgradeReady" class="ss-ready" hidden>READY</b>':''}</span><span class="ss-action-label" data-short="${esc(short)}">${esc(label)}</span></button>`;}
 function markup(){
  return `<canvas id="ssOcean" tabindex="0" aria-label="Ocean. Use your selected movement controls to steer."></canvas><div class="ss-water-vignette"></div>
  <div id="ssHud" class="ss-hud" hidden>
   <header class="ss-top">
    <section class="ss-glass ss-captain"><div class="ss-captain-crest">${icon('anchor',26)}</div><div class="ss-captain-body"><div class="ss-kicker">SAILING SEA <b id="ssPlayerRole" class="ss-tag">CAPTAIN</b></div><div id="ssCaptainName" class="ss-captain-name">Captain</div><div class="ss-captain-meta"><b id="ssAlive">20/20</b><span>ships alive</span><b id="ssShipLevel">Lv. 1</b></div><div class="ss-hull-label"><span>SHIP HP</span><b id="ssShipHp">100 / 100</b><i id="ssRepairLock" class="ss-lock" hidden title="Ship repairs permanently locked">${icon('lock',13)}</i></div><div class="ss-meter ss-hull"><i id="ssShipHpBar"></i></div><div class="ss-small" id="ssCrewCount">1 / 5 crew</div></div></section>
    <section class="ss-glass ss-calendar"><div class="ss-day-head"><span id="ssDay">Day 1 / 15</span><button type="button" id="ssQuickPause" class="ss-mini-button" data-ss-action="pause" aria-label="Pause or resume" title="Pause / Resume (P)">${icon('pause',14)}</button></div><div class="ss-clock-row"><span id="ssSun">${icon('moon',17)}</span><strong id="ssClock">00:00</strong><span id="ssDayPeriod">NIGHT</span></div><div class="ss-time-track"><i id="ssDayFill"></i></div><div class="ss-difficulty"><span>DIFFICULTY</span><b id="ssDifficulty">1.00</b></div></section>
    <section class="ss-glass ss-bounties"><div class="ss-panel-kicker">${icon('crown',16)} <b>TOP BOUNTIES</b><button type="button" class="ss-mini-button ss-leader-toggle" data-ss-action="toggleBoard" aria-label="Toggle bounty leaders">≡</button></div><div id="ssWanted" class="ss-wanted-line"></div><ol id="ssLeaders" class="ss-leader-list" aria-label="Five highest bounties"></ol></section>
   </header>
   <aside class="ss-glass ss-sealog"><div class="ss-material-head"><div class="ss-material-gem">${icon('gem',23)}</div><div><span class="ss-kicker">MATERIAL</span><strong id="ssMaterial">0</strong></div><span id="ssHaul" class="ss-haul" hidden><img id="ssHaulIcon" alt=""><small id="ssHaulText"></small></span></div><div id="ssSeaZone" class="ss-zone"><i>${icon('wave',15)}</i><span>Open sea</span></div><div id="ssFlags" class="ss-small"></div><div class="ss-log-heading"><b>SEA LOG</b><button type="button" class="ss-mini-button ss-log-toggle" data-ss-action="toggleLog" aria-label="Expand sea log">⌄</button></div><div id="ssLog" class="ss-log" role="log" aria-label="Sea log"></div><div class="ss-quick"><button type="button" data-ss-action="save" title="Save voyage">${icon('save',15)}<span>Save</span></button><button type="button" data-ss-action="settings" title="Settings">${icon('settings',15)}<span>Settings</span></button><button type="button" id="ssQuickControl" data-ss-action="control" title="Switch movement mode">${icon('wheel',15)}<span>Direct</span></button><button type="button" data-ss-action="exit" title="Save and exit">${icon('exit',15)}<span>Exit</span></button></div><div id="ssSaveStatus" class="ss-save-note">Local voyage</div></aside>
   <div class="ss-dock-zone"><div id="ssContext" class="ss-context" hidden></div><div id="ssNavHint" class="ss-nav-hint">WASD / Arrow keys to steer</div><nav class="ss-actions" aria-label="Sailing actions">${actionTile(1,'crew','crew','Crew & Deploy','Crew')}${actionTile(2,'island','flag','Dock / Capture Island','Dock / Flag')}${actionTile(3,'craft','forge','Craft Relic','Forge')}${actionTile(4,'upgrade','upgrade','Upgrade Ship','Upgrade')}${actionTile(5,'guide','guide','Recruit Rates & Guide','Guide')}</nav></div>
   <aside class="ss-glass ss-radar"><div class="ss-radar-head"><b>OCEAN RADAR</b><span>N ↑</span></div><canvas id="ssRadar" aria-label="Ocean minimap"></canvas><div class="ss-radar-legend"><span><i class="reef"></i> Island</span><span><i class="danger"></i> Danger</span><span><i class="storm"></i> Storm</span><span><i class="gold"></i> Wanted</span></div></aside>
  </div><div id="ssJoystick" class="ss-joystick" aria-label="Touch joystick" hidden><span class="ss-joystick-ring"></span><span id="ssJoystickKnob" class="ss-joystick-knob">${icon('wheel',21)}</span></div>
  <div id="ssOverlay" class="ss-overlay" hidden></div>
  <div id="ssToast" class="ss-toast" role="status" aria-live="polite" hidden></div>
  <div id="ssPaused" class="ss-paused" hidden>${icon('pause',19)} VOYAGE PAUSED <span>Press P or Resume</span>${btn('pause','Resume','','play','ss-button ss-button--small')}</div>`;
 }
 function barMarkup(type,value,max,bind=''){return `<div class="ss-meter ss-meter--${type}"><i ${bind?'data-ss-bar="'+bind+'"':''} style="width:${pct(value,max)}%"></i></div>`;}
 function image(card,cls=''){return `<div class="ss-art ${cls}" style="--rarity:${rarityColors[card.rarity]||'#c8aa6e'}"><span aria-hidden="true">${esc(card.name.slice(0,2).toUpperCase())}</span><img loading="lazy" decoding="async" src="${esc(card.image)}" alt=""></div>`;}
 function statPair(card,stats){return `<div class="ss-stat-pair"><span>♥ <b>${fmt(stats.hp)}</b> HP</span><span>⚔ <b>${fmt(stats.atk)}</b> ATK</span></div>`;}
 function passiveDetails(c,full=false){const skill=host.SpatialCombat.profile(c);return `<details class="ss-card-passive" ${full?'open':''}><summary>${esc(c.passive?.name||'Passive')} <small>${esc(skill.role)}</small></summary><div>${esc(c.passive?.description||'No passive effect.').replace(/\n/g,'<br>')}</div><div class="ss-skill-detail"><b>${esc(skill.name)} · ${host.AutoChessCombat.SAILING_STAMINA.skill} Stamina</b><br>${esc(skill.description)}</div></details>`;}
 function draftCard(id,index,offer=null){
  const c=K.native(id),st=K.stats({cardId:id});
  return `<article class="ss-draft-card" style="--rarity:${rarityColors[c.rarity]}"><div class="ss-draft-art">${image(c)}<span class="ss-rarity-badge">${esc(c.rarity.toUpperCase())}</span><span class="ss-draft-number">0${index+1}</span></div><div class="ss-draft-info"><div class="ss-card-title"><h3>${esc(c.name)}</h3><span>${esc(c.element)}</span></div>${statPair(c,st)}${passiveDetails(c,true)}${offer?`<div class="ss-capture-chance"><span>Capture chance</span><b>${Math.round(offer.rate*100)}%</b></div>${btn('pickRecruit','Attempt capture','data-index="'+index+'"','flag','ss-button ss-primary')}`:btn('chooseCaptain','Choose captain','data-id="'+esc(id)+'"','anchor','ss-button ss-primary')}</div></article>`;
 }
 function relicLabel(r){const d=K.recipe(r?.roll?.kind);return d?.name||'Relic';}
 function relicDescription(r){return host.RelicSystem.describe(r.roll).replace(/ Unbound\\.?$/,'');}
 function crewTile(s,u,{enemy=false,selectable=false,equippable=false,replace=false}={}){
  const card=K.native(u),stats=K.stats(u),hp=u.hp,selected=s.deployIds.includes(u.uid),dead=hp<=0,roll=u.relic?.roll,locker=R.player(s).locker;
  const capture=replace?btn('replaceRecruit','Replace member','data-id="'+esc(u.uid)+'"','check','ss-button ss-button--small'):'';
  return `<article class="ss-crew-card ${selected&&selectable?'is-selected':''} ${dead?'is-dead':''}" data-ss-crew="${esc(u.uid)}" style="--rarity:${rarityColors[card.rarity]}">
   ${selectable?`<button class="ss-crew-select" data-ss-action="toggleDeploy" data-id="${esc(u.uid)}" type="button" aria-pressed="${selected&&!dead}" ${dead?'disabled':''}>${image(card)}<span class="ss-selection-marker">${selected&&!dead?icon('check',15):'+'}</span><span class="ss-crew-art-badge">${dead?'DOWN':selected?'DEPLOY':'RESERVE'}</span></button>`:`<div class="ss-crew-select ss-crew-static">${image(card)}<span class="ss-crew-art-badge">${dead?'DOWN':enemy?'ENEMY':card.rarity.toUpperCase()}</span></div>`}
   <div class="ss-crew-data"><div class="ss-card-title"><h3>${esc(card.name)}</h3><span>${esc(card.element)}</span></div><p class="ss-crew-sub">${esc(card.rarity)} · ${host.SpatialCombat.roleOf(card)} · ${fmt(stats.atk)} ATK</p><div class="ss-resource-line"><span>HP</span><b data-ss-hp="${esc(u.uid)}">${fmt(hp)} / ${fmt(stats.hp)}</b></div>${barMarkup('hp',hp,stats.hp,u.uid+':hp')}<div class="ss-resource-line"><span>STAMINA</span><b data-ss-stamina="${esc(u.uid)}">${stam(u.stamina)} / 100</b></div>${barMarkup('stamina',u.stamina,100,u.uid+':stamina')}<div data-ss-condition="${esc(u.uid)}" class="ss-condition">${dead?'Revives after '+Math.ceil(45-(u.reviveDock||0))+'s docked':u.stamina<=0?'EXHAUSTED · Basic attacks only':'Ready'}</div>
   ${roll?`<details class="ss-relic-chip"><summary><img src="${esc(K.recipe(roll.kind)?.image||'')}" alt="">${esc(relicLabel(u.relic))} <b>UNIQUE</b></summary><p>${esc(relicDescription(u.relic))}</p></details>`:''}
   ${equippable?`<label class="ss-equip-label"><span>Relic</span><select data-ss-equip="${esc(u.uid)}" aria-label="Equip Relic on ${esc(card.name)}"><option value="" ${!roll?'selected':''}>None</option>${roll?`<option value="${esc(u.relic.id)}" selected>${esc(relicLabel(u.relic))} (equipped)</option>`:''}${locker.map(r=>`<option value="${esc(r.id)}">${esc(relicLabel(r))} · ${esc(RelicRollShort(r.roll))}</option>`).join('')}</select></label>`:''}
   ${passiveDetails(card)}${capture}</div></article>`;
 }
 function RelicRollShort(roll){
  const parts=['hp','atk','critChance','dodge','stackGain','perEnemyAtk','specialBonus','summonBonus','followChance','fatalAtk','modeHp','firstAttackBonus'].filter(k=>roll[k]>0).map(k=>'+ '+(roll[k]*100).toFixed(1)+'% '+({hp:'HP',atk:'ATK',critChance:'Crit',dodge:'Dodge',stackGain:'Stacks',perEnemyAtk:'ATK/enemy',specialBonus:'Skill DMG',summonBonus:'Summon',followChance:'Follow-up',fatalAtk:'Fatal ATK',modeHp:'Mode HP',firstAttackBonus:'First hit'}[k]||k));
  return (roll.element?roll.element+' · ':'')+parts.slice(0,2).join(' / ');
 }
 function crewGrid(s,opts={}){return `<div class="ss-crew-grid">${R.player(s).crew.map(u=>crewTile(s,u,opts)).join('')}</div>`;}
 function deployHeading(s){
  const p=R.player(s),selected=p.crew.filter(u=>u.hp>0&&s.deployIds.includes(u.uid)).length;
  return `<div class="ss-deploy-head"><div><span class="ss-kicker">BOARDING PARTY</span><h3><b data-ss-selected>${selected}</b> / <span data-ss-ready>${K.living(p.crew).length}</span> living crew deployed</h3><p>Tap a portrait to change deployment. Reserves save their Stamina.</p></div><div class="ss-inline-actions">${btn('allDeploy','Select all','','check','ss-button ss-button--small')}${btn('clearDeploy','Clear','','close','ss-button ss-button--small')}</div></div>`;
 }
 function panelHeader(title,kicker,sub,mandatory=false){return `<header class="ss-panel-header"><div><span class="ss-kicker">${esc(kicker)}</span><h2>${esc(title)}</h2>${sub?`<p>${esc(sub)}</p>`:''}</div><div class="ss-panel-tools">${btn('control','Control','title="Switch movement mode (C)"','wheel','ss-button ss-button--small ss-panel-control')}${btn('exit','Save & Exit','','exit','ss-button ss-button--small ss-exit-button')}${!mandatory?`<button type="button" class="ss-close" data-ss-action="closePanel" aria-label="Close panel">${icon('close',20)}</button>`:''}</div></header>`;}
 function harbor(s,settings,loadError){
  const p=s&&R.player(s),has=!!s;
  return `<div class="ss-harbor">
  <div class="ss-harbor-emblem">${icon('anchor',64)}<span>✧</span></div><div class="ss-harbor-kicker">ANIME CARD RNG &nbsp; / &nbsp; UPDATE 35</div><h1>Sailing <em>Sea</em></h1><p class="ss-harbor-sub">The horizon belongs to the last captain standing.</p>
  <div class="ss-harbor-facts"><div>${icon('ship',21)}<strong>20</strong><span>Captains</span></div><div>${icon('clock',21)}<strong>15</strong><span>Days</span></div><div>${icon('wave',21)}<strong>4,000²</strong><span>Ocean</span></div><div>${icon('crown',21)}<strong>1</strong><span>Victor</span></div></div>
  ${has?`<section class="ss-resume-tile"><div><span class="ss-kicker">${s.phase==='finished'?'LAST VOYAGE':'SAVED VOYAGE'}</span><h3>${esc(p.name)} · Day ${s.day}</h3><p>Lv. ${p.level} · ${fmt(p.hp)} Ship HP · ${s.difficulty.toFixed(2)} difficulty · ${fmt(p.bounty)} Bounty</p></div><span class="ss-status-seal">${s.phase==='finished'?(s.result.won?'VICTORY':'ENDED'):'RESUMABLE'}</span></section>`:''}
  ${loadError?`<p class="ss-warning">${esc(loadError)}</p>`:''}
  <div class="ss-harbor-actions">${has?btn('resume',s.phase==='finished'?'View voyage result':'Resume voyage','','play','ss-button ss-primary'):''}${btn('new','New voyage','','anchor','ss-button '+(!has?'ss-primary':''))}</div>
  <p class="ss-harbor-note">Draft a Secret captain. Recruit and forge your crew. All progress stays in this voyage.</p>
  <div class="ss-harbor-secondary">${btn('guide','Captain’s guide','','guide','ss-button ss-button--small')}${btn('settings','Controls','','wheel','ss-button ss-button--small')}${btn('exit','Return to Home','','exit','ss-button ss-button--small')}</div></div>`;
 }
 function islandPanel(s){
  const p=R.player(s),i=p.docked?M.islandById(s,p.docked):M.nearestIsland(s,p);
  const near=!!M.nearestIsland(s,p,true),owner=R.get(s,i?.owner),canFlag=p.docked&&p.level>=2&&i.owner!==p.id;
  return panelHeader(i?.name||'Uncharted water','ISLAND OPERATIONS',p.docked?'Docked — harbor services are active.':'Approach an island to dock and resupply.')+
  `<div class="ss-island-banner"><div class="ss-round-emblem">${icon('flag',38)}</div><div><span class="ss-kicker">${p.docked?'HARBOR':'NEAREST ISLAND'}</span><h3>${esc(i?.name||'Island')}</h3><p>${owner?'Flag: '+esc(owner.name):'Unclaimed'} · ${p.docked?'Docked':Math.max(0,Math.round(M.distance(p,i)-i.radius))+'m from shore'}</p></div></div>
  <div class="ss-info-grid"><div><strong>1–3/s</strong><span>Material gathering</span></div><div><strong>+5%/s</strong><span>Crew max HP</span></div><div><strong>+6/s</strong><span>Stamina</span></div><div><strong>45s</strong><span>Revive fallen crew</span></div><div><strong>${R.repairLocked(s)?'LOCKED':'+2/s'}</strong><span>Ship HP repair</span></div><div><strong>+0.5/s</strong><span>Per claimed island at sea</span></div></div>
  <p class="ss-panel-note">Ship Lv. 2+ can plant a flag. Other captains can contest or capture your islands. Raiders may ambush while docked.</p>
  <div class="ss-panel-actions">${p.docked?btn('undock','Undock & sail','','ship','ss-button ss-primary')+btn('capture',i.owner===p.id?'Flag already planted':p.level<2?'Requires Ship Lv. 2':owner?'Capture flag':'Plant flag',canFlag?'':'disabled','flag'):near?btn('dock','Dock at '+i.name,'data-id="'+i.id+'"','anchor','ss-button ss-primary'):btn('course','Set course to '+i.name,'data-id="'+i.id+'"','point','ss-button ss-primary')}</div>`;
 }
 function craftPanel(s,chosen=''){
  const p=R.player(s);
  return panelHeader('Island forge','LEGENDARY UNIQUE RELICS',p.docked?'Craft with your voyage Material. Each Relic rolls independent stats.':'Dock at an island to activate the forge.')+
  `<div class="ss-forge-toolbar"><div><span class="ss-kicker">MATERIAL AVAILABLE</span><strong data-ss-wallet>${fmt(p.material)}</strong></div><label>Craft for <select id="ssCraftTarget" aria-label="Craft Relic for"><option value="">Relic locker</option>${p.crew.map(u=>`<option value="${esc(u.uid)}" ${chosen===u.uid?'selected':''}>${esc(K.native(u).name)}</option>`).join('')}</select></label></div>
  ${!p.docked?'<p class="ss-warning">At sea — the forge is unavailable until you dock.</p>':''}
  <div class="ss-recipe-grid">${K.recipes.map(d=>{
   const u=p.crew.find(c=>c.uid===chosen),match=u?host.RelicSystem.compatibility(K.native(u),host.RelicSystem.template(d.kind)):null;
   const materials=Object.entries(d.original).map(([id,n])=>({item:host.MaterialSystem.get(id)||host.InventorySystem.definition?.(id),id,n}));
   return `<article class="ss-recipe"><div class="ss-recipe-top"><div class="ss-recipe-art"><img src="${esc(d.image)}" alt=""></div><div><span class="ss-rarity-text">LEGENDARY · UNIQUE</span><h3>${esc(d.name)}</h3><span class="ss-cost">${icon('gem',14)} ${d.cost} Material</span></div></div><p>${esc(d.unique)}</p>${match?`<span class="ss-match ${match.base.active||match.unique?.active?'is-match':''}">${match.unique?.active?'Unique compatible':match.base.active?'Base stat compatible':'Conditional roll · inspect wearer'}</span>`:''}<details class="ss-recipe-rules"><summary>Adapted recipe</summary><div>${materials.length?materials.map(m=>`<span title="${esc(m.item?.name||m.id)}"><img src="${esc(m.item?.image||'')}" alt="">${esc(m.item?.name||m.id)} ×${m.n}</span>`).join(''):'Salvage recipe'}</div><small>Spend ${d.cost} generic voyage Material, not account items.</small></details>${btn('forge','Forge · '+d.cost,'data-kind="'+d.kind+'" data-ss-cost="'+d.cost+'" '+(!p.docked||p.material+1e-7<d.cost?'disabled':''),'forge','ss-button ss-primary ss-button--small')}</article>`;
  }).join('')}</div>`;
 }
 function upgradePanel(s){
  const p=R.player(s),req=R.UPGRADES[p.level],ready=R.canUpgrade(p),names=['','Sloop','Brigantine','Galleon'];
  return panelHeader('Upgrade ship','SHIPWRIGHT',req?'Expand your crew and master the sea.':'Your Galleon has reached the maximum level.')+
  `<div class="ss-upgrade-stages">${[1,2,3].map(l=>`<div class="ss-upgrade-stage ${l===p.level?'current':l<p.level?'past':''}"><div>${icon('ship',24+l*9)}</div><b>Lv. ${l}</b><span>${names[l]}</span><strong>${R.CAP[l]} crew slots</strong>${l===p.level?'<small>CURRENT SHIP</small>':l<p.level?'<small>UNLOCKED</small>':'<small>LOCKED</small>'}</div>`).join('')}</div>
  ${req?`<div class="ss-upgrade-requirements"><div class="ss-resource-line"><span>Material</span><b data-ss-upgrade-mat>${fmt(p.material)} / ${fmt(req.material)}</b></div>${barMarkup('stamina',p.material,req.material,'upgrade:mat')}${req.beasts?`<div class="ss-resource-line"><span>Sea Beasts defeated</span><b>${p.beasts} / 5</b></div>${barMarkup('hp',p.beasts,5)}`:''}</div><p class="ss-panel-note">${p.level===1?'750 Material takes about one full day of uninterrupted island farming. Lv. 2 also unlocks island flags.':'Upgrade requires 2,000 Material and five Sea Beast victories. Storm Zones are slower but offer the strongest hunt.'}</p><div class="ss-panel-actions">${btn('doUpgrade','Upgrade to Lv. '+(p.level+1),'data-ss-upgrade '+(ready?'':'disabled'),'upgrade','ss-button ss-primary')}</div>`:`<div class="ss-max-ship"><strong>MAX LEVEL</strong><p>10 crew slots. Claim islands, hunt bounties and survive.</p></div>`}`;
 }
 function guidePanel(s){
  return panelHeader('Captain’s guide','SAILING SEA HANDBOOK','An independent, 20-captain roguelike. All voyage rewards stay at sea.')+
  `<div class="ss-guide-grid"><article><h3>${icon('clock',20)} The voyage</h3><p>1 day = 360 real seconds. 1 in-game hour = 15 seconds. Difficulty starts at 1.00 and rises by 1.00 each dawn. Pirate victories multiply it by 1.005–1.03; Sea Beast victories by 1.01–1.10, including off-screen captains.</p><p>Last ship standing wins. At the end of Day 15, the highest-Bounty surviving captain wins (ties: hull HP, then sinks, then captain ID).</p></article><article><h3>${icon('anchor',20)} Harbor</h3><p>Dock to gather 1–3 Material each second, heal 5% max crew HP/s, gain 6 Stamina/s, revive dead cards after 45 seconds of safe docking and repair 2 Ship HP/s. At sea, no natural HP recovery or revival; Stamina +1.5/s between battles and for resting reserves at sea.</p><p>At Difficulty 10, hull repair is permanently disabled. Craft Legendary Unique Relics on islands. Lv. 2+ flags yield 0.5 Material/s per island while at sea, plus Bounty for holding territory.</p></article><article><h3>${icon('skull',20)} Danger waters</h3><p>At Difficulty 1, pirate crews have 3–4 Common cards. At 10+, they have 6–7 Mythic/Secret cards. Win 20–45 Material, 90 Bounty and one recruit attempt. Choose a recruit or replace a member when full. Salvage grants 10 + 5 × rarity tier (Common tier 0) Material.</p><p>Choose 1–${s?R.cap(R.player(s)):5} living crew. Lose a boarding fight and suffer hull damage; a zero-HP ship sinks. A raid offers Defend Island or Flee to Sea.</p></article><article><h3>${icon('storm',20)} Storms & stamina</h3><p>Storms slow ships by 40%. Hunt a single Sea Beast with a powerful Mythic or Secret passive for 320 Bounty and a Beast victory toward Lv. 3. Zones relocate at every dawn.</p><p>Auto Chess stats, traits and skills. Actions spend up to 1.6 Stamina; every fourth funded attack can cast its skill for 8 more. At 0, basic attacks deal 75% damage; offensive replacements and active casts are disabled. Element advantage 1.5x, disadvantage 0.75x.</p></article><article><h3>${icon('crown',20)} Golden Bounty</h3><p>A random surviving captain is marked each day. Survive until dawn to double Bounty. Sinking the Wanted Target steals 100% of its Bounty; normal sinks take 35% plus a 120-Bounty sink award. Holding flags earns 0.5 Bounty/s.</p><p>Rivals are farmers, danger raiders, storm hunters and bounty hunters. The golden marker is visible across the ocean. Board nearby ships to challenge them.</p></article><article><h3>${icon('wheel',20)} Navigation</h3><p>Direct: WASD / arrow keys on desktop, joystick on touch. Point-to-move: click/tap the ocean or radar to set a waypoint. Dock, then use Undock to sail again. Hotkeys 1–5 open actions, P pauses, Escape closes panels.</p><p>New drafts, required choices, explicit pause and closed/background tabs stop the voyage clock. Autosaves are local; Resume restores your checkpoint, including battles.</p></article></div>
  <section class="ss-guide-rates"><span class="ss-kicker">RECRUIT CAPTURE CHANCES</span><table><thead><tr><th>Rarity</th><th>Lv. 1</th><th>Lv. 2</th><th>Lv. 3</th></tr></thead><tbody>${K.RARITIES.map((r,i)=>`<tr><th style="color:${rarityColors[r]}">${r}</th>${[1,2,3].map(l=>`<td>${Math.round(K.chance(l,i)*100)}%</td>`).join('')}</tr>`).join('')}</tbody></table><small>Draft 3 cards from the defeated pirate roster; select exactly one capture attempt. A failed attempt cannot be rerolled.</small></section>`;
 }
 function settingsPanel(settings,paused,hasRun,harbor){
  return panelHeader('Voyage settings','CAPTAIN’S CABIN','Choose how to steer. Preferences can change at any time.')+
  `<div class="ss-setting-heading"><span class="ss-kicker">MOVEMENT CONTROL</span></div><div class="ss-control-options"><button type="button" class="ss-control-choice ${settings.control==='direct'?'selected':''}" data-ss-action="setControl" data-mode="direct">${icon('wheel',37)}<strong>Direct control</strong><span>WASD / arrows · virtual joystick on touch devices</span><b>${settings.control==='direct'?'ACTIVE':'SELECT'}</b></button><button type="button" class="ss-control-choice ${settings.control==='point'?'selected':''}" data-ss-action="setControl" data-mode="point">${icon('point',37)}<strong>Click / tap to move</strong><span>Point at the ocean or radar and steer to the waypoint</span><b>${settings.control==='point'?'ACTIVE':'SELECT'}</b></button></div><div class="ss-setting-row"><div><b>Sound effects</b><p>Shared with every game mode.</p></div><div class="ss-audio-controls"><button type="button" class="ss-button" data-ss-action="audioMute" aria-pressed="${!host.GameAudio.settings().muted}">${host.GameAudio.settings().muted?"SFX OFF":"SFX ON"}</button><label>Volume <output id="ssAudioValue">${Math.round(host.GameAudio.settings().volume*100)}%</output><input id="ssAudioVolume" type="range" min="0" max="100" value="${Math.round(host.GameAudio.settings().volume*100)}" aria-label="Sound effects volume"></label></div></div><div class="ss-setting-row"><div><b>Voyage clock</b><p>Stops all captains, combat and recovery while paused. No offline catch-up.</p></div>${btn('pause',paused?'Resume':'Pause',hasRun&&!harbor?'':'disabled',paused?'play':'pause')}</div><div class="ss-setting-row"><div><b>Local checkpoint</b><p>Saved every five seconds and after important actions.</p></div>${btn('save','Save now',hasRun?'':'disabled','save')}</div><div class="ss-setting-row"><div><b>Start over</b><p>Replace your current voyage with a new seeded ocean.</p></div>${btn('new','New voyage','','anchor','ss-button ss-danger-button')}</div>`;
 }
 function encounterPanel(s){
  const e=s.encounter,p=R.player(s),ambush=s.phase==='ambush',claim=e.intent==='contest',kind=e.kind==='beast'?'SEA BEAST':e.kind==='captain'?'CAPTAIN ENCOUNTER':'PIRATE CREW';
  const action=ambush?(claim?'Contest island (Fight)':'Defend Island (Fight)'):e.kind==='beast'?'Engage Sea Beast':e.kind==='captain'?'Board captain':'Board pirate crew';
  const selected=p.crew.filter(u=>u.hp>0&&s.deployIds.includes(u.uid)).length;
  return panelHeader(e.name,ambush?'ISLAND ALERT · '+kind:'HOSTILE CONTACT · '+kind,'Difficulty '+e.difficulty.toFixed(2)+'  /  '+K.living(e.crew).length+' living opponents · Clock paused for deployment',true)+
  `<div class="ss-encounter-banner"><div class="ss-round-emblem ss-round-emblem--danger">${icon(e.kind==='beast'?'storm':e.kind==='captain'?'ship':'skull',32)}</div><div><h3>${ambush?(claim?'Fight for the flag': 'An enemy ship has arrived!'):e.kind==='beast'?'Storm hunt':e.kind==='captain'?'Boarding action':'Recruitment opportunity'}</h3><p>${e.kind==='pirate'?'Victory: 20–45 Material, 90 Bounty and 1-of-3 recruit draft.':e.kind==='beast'?'Victory: 320 Bounty and one Sea Beast defeat.':'A losing captain takes hull damage. Sinking a Wanted captain claims the full Bounty.'}</p></div></div>
  <div class="ss-enemy-lineup">${e.crew.map(u=>{const c=K.native(u),st=K.stats(u);return `<details class="ss-enemy-card"><summary>${image(c)}<div><b>${esc(u.beast?'Beast · '+c.name:c.name)}</b><span style="color:${rarityColors[c.rarity]}">${esc(c.rarity)} · ${esc(c.element)}</span><small>${fmt(u.hp)}/${fmt(st.hp)} HP · ${fmt(st.atk)} ATK</small></div></summary><p>${esc(c.passive?.name)} — ${esc(c.passive?.description)}</p></details>`;}).join('')}</div>${deployHeading(s)}${crewGrid(s,{selectable:true})}
  <div class="ss-panel-actions ss-sticky-actions"><p class="ss-deploy-warning" data-ss-deploy-note>${selected?'Deploy '+selected+' crew · Preserve resting reserves.':'No living crew selected. Retreat or select at least one.'}</p>${btn('flee',ambush?'Flee to Sea':e.kind==='captain'?'Retreat (−8 Ship HP)':'Retreat (−6 Ship HP)','','exit','ss-button ss-danger-button')}${btn('fight',action,'data-ss-fight '+(selected?'':'disabled'),'sword','ss-button ss-primary')}</div>`;
 }
 function recruitPanel(s){
  const p=R.player(s),d=s.recruit;
  if(!d.accepted)return panelHeader('Recruit a survivor','CAPTURE DRAFT','Select one of the defeated crew. The rate depends on your ship level. Clock paused.',true)+`<div class="ss-draft-grid">${d.offers.map((o,i)=>draftCard(o.cardId,i,o)).join('')}</div>`;
  const c=K.native(d.accepted);
  return panelHeader('Crew capacity reached','RECRUIT CAPTURED','Replace a current crew member or salvage the new recruit.',true)+
   `<div class="ss-new-recruit">${image(c)}<div><span class="ss-rarity-text">${esc(c.rarity.toUpperCase())} · CAPTURED</span><h3>${esc(c.name)}</h3>${statPair(c,K.stats({cardId:c.id}))}</div>${btn('salvageRecruit','Salvage +'+K.salvageValue(c.id)+' Material','','gem','ss-button ss-primary')}</div><p class="ss-panel-note">Replacing a card returns its equipped Relic to your locker.</p>${crewGrid(s,{replace:true})}`;
 }
 function reportPanel(s){
  const r=s.report,won=r.winner==='player',draw=r.winner==='draw';
  return panelHeader(won?'Victory':draw?'Draw':'Defeat','BOARDING REPORT',r.name,true)+`<div class="ss-result-crest ${won?'win':draw?'draw':'loss'}">${icon(won?'crown':draw?'wheel':'skull',70)}<h3>${won?'Enemy crew defeated':draw?'Both crews withdrew':'Your crew was defeated'}</h3><p>Health and Stamina of deployed crew carry over to the voyage.</p></div><div class="ss-info-grid ss-reward-grid"><div><strong data-ss-report-hp>${fmt(r.hpAfter)} / 100</strong><span>Ship HP ${r.hpAfter<r.hpBefore?'(−'+Math.ceil(r.hpBefore-r.hpAfter)+')':''}</span></div><div><strong>+${fmt(r.material)}</strong><span>Material</span></div><div><strong>+${fmt(r.bounty)}</strong><span>Bounty</span></div><div><strong>${r.beasts}</strong><span>Sea Beasts defeated</span></div></div><div class="ss-panel-actions">${btn('continue',s.recruit?'Open recruit draft':'Continue voyage','','arrow','ss-button ss-primary')}</div>`;
 }
 function finishedPanel(s){
  const p=R.player(s),r=s.result;
  return panelHeader(r.won?'Ruler of the Sea':'Voyage ended',r.won?'VICTORY':'DEFEAT',r.reason==='time-limit'?'Day 15 · Bounty standings':r.reason==='sunk'?'Your ship sank.': 'You are the last captain afloat.',true)+
   `<div class="ss-result-crest ${r.won?'win':'loss'}">${icon(r.won?'crown':'anchor',76)}<h3>Placement #${r.rank} / 20</h3><p>${r.winnerName?'Winner: '+esc(r.winnerName):'Your voyage ended on Day '+s.day+'.'}</p></div><div class="ss-info-grid ss-reward-grid"><div><strong>${fmt(p.bounty)}</strong><span>Final Bounty</span></div><div><strong>${p.sinks}</strong><span>Ships sunk</span></div><div><strong>${p.pirates}</strong><span>Pirate victories</span></div><div><strong>${p.beasts}</strong><span>Sea Beast victories</span></div><div><strong>Lv. ${p.level}</strong><span>Final ship</span></div><div><strong>${s.difficulty.toFixed(2)}</strong><span>Final difficulty</span></div></div><div class="ss-panel-actions">${btn('exit','Return to Home','','exit')}${btn('new','Start new voyage','','anchor','ss-button ss-primary')}</div>`;
 }
 function combatPanel(s){
  return `<header class="ss-panel-header ss-combat-header"><div><span class="ss-kicker">BOARDING BATTLE · STAMINA RULES</span><h2>${esc(s.combat.encounter.name)}</h2><p id="ssBattleTimer">Preparing crew…</p></div><div class="ss-panel-tools">${btn('control','Control','title="Switch movement mode (C)"','wheel','ss-button ss-button--small ss-panel-control')}${btn('pause','Pause','','pause','ss-button ss-button--small')}${btn('exit','Save & Exit','','exit','ss-button ss-button--small')}</div></header><div class="ss-combat-layout"><section class="ss-battle-roster"><h3>${icon('flag',16)} YOUR CREW</h3><div id="ssFriendlyRoster" class="ss-live-roster"></div></section><div class="ss-deck-frame"><canvas id="ssBattleBoard" aria-label="Live tactical boarding combat"></canvas><div id="ssRestoring" class="ss-restoring" hidden>Restoring battle checkpoint…</div></div><section class="ss-battle-roster ss-battle-roster--enemy"><h3>${icon('skull',16)} ENEMY CREW</h3><div id="ssHostileRoster" class="ss-live-roster"></div></section></div><section class="ss-battle-log-panel"><h3>${icon('sword',16)} BOARDING LOG</h3><div id="ssBattleLog" role="log"></div></section>`;
 }

 function makeView(actions){
  const root=$('sailingSeaModal');if(!root)return null;
  root.innerHTML=markup();
  const canvas=$('ssOcean'),radar=$('ssRadar'),overlay=$('ssOverlay'),renderer=M.makeRenderer(canvas,radar);
  let activePanel=null,context={},lastState=null,lastVoyageId=null,boardKey='',lastWanted='',lastLog=-1,logKey='',lastCombatAt=-Infinity,lastBoardAt=-Infinity,lastBoardTime=-1,battleCanvas=null,battleCtx=null,boardW=0,boardH=0,boardDpr=1;
  let toastTimer=null,joystickPointer=null,lastControl=null,leaderOpen=false,logOpen=false,priorInert=[];
  const images=new Map(),friendlyRows=new Map(),hostileRows=new Map();
  const text=(el,value)=>{if(el&&el.textContent!==String(value))el.textContent=String(value);};
  const style=(el,key,value)=>{if(el&&el.style[key]!==value)el.style[key]=value;};
  function setHidden(el,hidden){if(el&&el.hidden!==!!hidden)el.hidden=!!hidden;}
  function find(event,selector){const el=event.target instanceof host.Element?event.target:event.target?.parentElement;return el?.closest?.(selector)||null;}
  root.addEventListener('click',event=>{
   const b=find(event,'[data-ss-action]');if(!b||!root.contains(b)||b.disabled)return;
   const action=b.dataset.ssAction;
   if(action==='audioMute'){const s=host.GameAudio.setMuted(!host.GameAudio.settings().muted);b.textContent=s.muted?'SFX OFF':'SFX ON';b.setAttribute('aria-pressed',String(!s.muted));host.GameAudio.play('ui_click','sailing');return;}
   if(!['toggleDeploy','allDeploy','clearDeploy','control','setControl'].includes(action))host.GameAudio?.play('ui_click','sailing');
   if(action==='toggleBoard'){leaderOpen=!leaderOpen;root.classList.toggle('ss-board-expanded',leaderOpen);return;}
   if(action==='toggleLog'){logOpen=!logOpen;root.classList.toggle('ss-log-expanded',logOpen);return;}
   actions.act(action,{...b.dataset});
  });
  root.addEventListener('input',event=>{if(event.target?.id==='ssAudioVolume'){const s=host.GameAudio.setVolume(Number(event.target.value)/100);text($('ssAudioValue'),Math.round(s.volume*100)+'%');}});
  root.addEventListener('change',event=>{
   const input=find(event,'select');if(!input)return;
   if(input.id==='ssCraftTarget')actions.act('craftTarget',{id:input.value});
   else if(input.dataset.ssEquip)actions.act('equip',{uid:input.dataset.ssEquip,id:input.value});
  });
  root.addEventListener('error',event=>{if(event.target?.tagName==='IMG')event.target.style.visibility='hidden';},true);
  canvas.addEventListener('pointerdown',event=>{
   if(event.button!==0&&event.pointerType==='mouse')return;
   const r=canvas.getBoundingClientRect();actions.point(renderer.worldAt(event.clientX-r.left,event.clientY-r.top));if(event.cancelable)event.preventDefault();
  });
  radar.addEventListener('pointerdown',event=>{
   if(event.button!==0&&event.pointerType==='mouse')return;
   const r=radar.getBoundingClientRect();actions.point(renderer.miniAt(event.clientX-r.left,event.clientY-r.top));if(event.cancelable)event.preventDefault();
  });
  const joystick=$('ssJoystick'),knob=$('ssJoystickKnob');
  function joystickMove(event){
   const r=joystick.getBoundingClientRect(),dx=event.clientX-r.left-r.width/2,dy=event.clientY-r.top-r.height/2,max=Math.max(1,r.width*.34),d=Math.hypot(dx,dy),scale=d>max?max/d:1;
   style(knob,'transform','translate('+dx*scale+'px,'+dy*scale+'px)');actions.joystick({x:dx*scale/max,y:dy*scale/max});
   if(event.cancelable)event.preventDefault();
  }
  joystick.addEventListener('pointerdown',event=>{if(joystickPointer!==null)return;joystickPointer=event.pointerId;joystick.setPointerCapture?.(event.pointerId);joystickMove(event);});
  joystick.addEventListener('pointermove',event=>{if(event.pointerId===joystickPointer)joystickMove(event);});
  function endJoystick(event){if(event&&event.pointerId!==joystickPointer)return;joystickPointer=null;style(knob,'transform','translate(0,0)');actions.joystick(null);}
  for(const type of ['pointerup','pointercancel','lostpointercapture'])joystick.addEventListener(type,endJoystick);
  function open(){
   const app=$('app');priorInert=[];
   for(const el of doc.body.children){if(el===root||['SCRIPT','STYLE','LINK'].includes(el.tagName)||el.id==='gameStartupNotice')continue;if('inert' in el){priorInert.push([el,el.inert]);el.inert=true;}}
   root.hidden=false;doc.body.classList.add('sailing-active');root.focus({preventScroll:true});renderer.reset();
   lastLog=-1;boardKey='';lastWanted='';logKey='';lastState=null;lastVoyageId=null;lastControl=null;activePanel=null;leaderOpen=false;logOpen=false;root.classList.remove('ss-board-expanded','ss-log-expanded');
  }
  function close(){
   endJoystick();root.hidden=true;overlay.hidden=true;overlay.replaceChildren();activePanel=null;battleCanvas=battleCtx=null;
   for(const[el,inert]of priorInert)el.inert=inert;priorInert=[];
   doc.body.classList.remove('sailing-active');host.clearTimeout(toastTimer);$('ssToast').hidden=true;images.clear();friendlyRows.clear();hostileRows.clear();
  }
  function toast(message,tone='info'){
   const node=$('ssToast');text(node,message);node.dataset.tone=tone;node.hidden=false;host.clearTimeout(toastTimer);toastTimer=host.setTimeout(()=>node.hidden=true,4300);
  }
  function panel(name,s,ctx={},force=false){
   const same=activePanel===name;
   context=ctx;
   if(!name){
    if(activePanel){overlay.replaceChildren();overlay.hidden=true;activePanel=null;battleCanvas=battleCtx=null;friendlyRows.clear();hostileRows.clear();root.dataset.panel='';endJoystick();root.focus({preventScroll:true});}
    return;
   }
   if(same&&!force)return;
   const scroll= same?overlay.querySelector('.ss-panel-scroll')?.scrollTop||0:0;
   const opened=same?[...overlay.querySelectorAll('details[open]')].map(n=>n.querySelector('summary')?.textContent).filter(Boolean):[];
   let content='',wide=false,mandatory=false;
   switch(name){
    case'harbor':content=harbor(s,ctx.settings,ctx.loadError);break;
    case'new-confirm':
     content=panelHeader('Start a new voyage?','HARBOR','Your previous voyage will be replaced.')+`<p class="ss-warning">All crew, Material, flags and Bounty in the old voyage will be lost. Your main collection is unaffected.</p><div class="ss-panel-actions">${btn('cancelNew','Cancel','','close')}${btn('confirmNew','Start new voyage','','anchor','ss-button ss-danger-button')}</div>`;break;
    case'draft':
     mandatory=true;wide=true;content=panelHeader('Choose your captain','DAY ZERO · SECRET DRAFT','Three independent Secret cards. Choose one to begin your voyage.',true)+`<div class="ss-draft-grid">${s.draft.map((id,i)=>draftCard(id,i)).join('')}</div>`;break;
    case'crew':
     wide=true;content=panelHeader('Crew & deploy','SHIP ROSTER',R.player(s).crew.length+' / '+R.cap(R.player(s))+' crew slots · '+R.player(s).locker.length+' Relics in the locker')+deployHeading(s)+crewGrid(s,{selectable:true,equippable:true})+`<p class="ss-panel-note">HP and Stamina are saved across battles. Change Relics while no encounter is pending. Captains are never drawn from your account inventory.</p><div class="ss-panel-actions">${btn('closePanel','Return to sea','','check','ss-button ss-primary')}</div>`;break;
    case'island':content=islandPanel(s);break;
    case'craft':wide=true;content=craftPanel(s,ctx.craftTarget);break;
    case'upgrade':content=upgradePanel(s);break;
    case'guide':wide=true;content=guidePanel(s);break;
    case'settings':content=settingsPanel(ctx.settings,ctx.paused,!!s,ctx.harbor);break;
    case'encounter':case'ambush':wide=true;mandatory=true;content=encounterPanel(s);break;
    case'recruit':wide=true;mandatory=true;content=recruitPanel(s);break;
    case'report':mandatory=true;content=reportPanel(s);break;
    case'finished':mandatory=true;content=finishedPanel(s);break;
    case'combat':wide=true;mandatory=true;content=combatPanel(s);break;
    default:return;
   }
   activePanel=name;root.dataset.panel=name;overlay.hidden=false;
   overlay.innerHTML=`<section class="ss-panel ${wide?'ss-panel--wide':''} ${name==='harbor'?'ss-panel--harbor':''} ${name==='combat'?'ss-panel--combat':''}" role="region" aria-label="${esc(name)}"><div class="ss-panel-scroll">${content}</div></section>`;
   const scrollbox=overlay.querySelector('.ss-panel-scroll');if(scrollbox)scrollbox.scrollTop=scroll;
   if(same)for(const details of overlay.querySelectorAll('details'))if(opened.includes(details.querySelector('summary')?.textContent))details.open=true;
   if(name==='combat'){
    battleCanvas=$('ssBattleBoard');battleCtx=battleCanvas?.getContext('2d');boardW=boardH=0;lastCombatAt=lastBoardAt=-Infinity;lastBoardTime=-1;friendlyRows.clear();hostileRows.clear();logKey='';
   }else {battleCanvas=battleCtx=null;friendlyRows.clear();hostileRows.clear();}
   if(!same){endJoystick();(overlay.querySelector('.ss-panel')||overlay).setAttribute('tabindex','-1');(overlay.querySelector('.ss-panel')||overlay).focus({preventScroll:true});}
  }
  function livePanel(s,ctx){
   if(!activePanel||!s)return;
   const p=R.player(s);
   if(['crew','encounter','ambush'].includes(activePanel)){
    const available=p.crew.filter(u=>u.hp>0),selected=available.filter(u=>s.deployIds.includes(u.uid)).length;
    for(const u of p.crew){
     const tile=overlay.querySelector('[data-ss-crew="'+u.uid+'"]');if(!tile)continue;
     const max=K.stats(u).hp,isSelected=s.deployIds.includes(u.uid)&&u.hp>0,dead=u.hp<=0;
     tile.classList.toggle('is-selected',isSelected);tile.classList.toggle('is-dead',dead);
     text(tile.querySelector('[data-ss-hp]'),fmt(u.hp)+' / '+fmt(max));text(tile.querySelector('[data-ss-stamina]'),stam(u.stamina)+' / 100');
     style(tile.querySelector('[data-ss-bar$=":hp"]'),'width',pct(u.hp,max)+'%');style(tile.querySelector('[data-ss-bar$=":stamina"]'),'width',pct(u.stamina)+'%');
     const cond=tile.querySelector('[data-ss-condition]');text(cond,dead?'Revives after '+Math.ceil(45-(u.reviveDock||0))+'s docked':u.stamina<=0?'EXHAUSTED · Basic attacks only':'Ready');
     const button=tile.querySelector('button.ss-crew-select');if(button){button.disabled=dead;button.setAttribute('aria-pressed',String(isSelected));const marker=button.querySelector('.ss-selection-marker');if(marker&&marker.dataset.selected!==String(isSelected)){marker.dataset.selected=String(isSelected);marker.innerHTML=isSelected?icon('check',15):'+';}text(button.querySelector('.ss-crew-art-badge'),dead?'DOWN':isSelected?'DEPLOY':'RESERVE');}
    }
    for(const n of overlay.querySelectorAll('[data-ss-selected]'))text(n,selected);for(const n of overlay.querySelectorAll('[data-ss-ready]'))text(n,available.length);
    const fight=overlay.querySelector('[data-ss-fight]');if(fight)fight.disabled=!selected;
    text(overlay.querySelector('[data-ss-deploy-note]'),selected?'Deploy '+selected+' crew · Preserve resting reserves.':'No living crew selected. Retreat or select at least one.');
   }else if(activePanel==='craft'){
    text(overlay.querySelector('[data-ss-wallet]'),fmt(p.material));
    for(const b of overlay.querySelectorAll('[data-ss-cost]'))b.disabled=!p.docked||p.material+1e-7<Number(b.dataset.ssCost);
   }else if(activePanel==='upgrade'){
    const req=R.UPGRADES[p.level];if(req){
     text(overlay.querySelector('[data-ss-upgrade-mat]'),fmt(p.material)+' / '+fmt(req.material));style(overlay.querySelector('[data-ss-bar="upgrade:mat"]'),'width',pct(p.material,req.material)+'%');
     const b=overlay.querySelector('[data-ss-upgrade]');if(b)b.disabled=!R.canUpgrade(p);
    }
   }
   if(['settings','combat'].includes(activePanel)){const pause=overlay.querySelector('[data-ss-action="pause"]');if(pause){text(pause.querySelector('span'),ctx.paused?'Resume':'Pause');}}
  }
  function hud(s,ctx={}){
   if(activePanel==='settings'){
    const a=host.GameAudio.settings(),toggle=overlay.querySelector('[data-ss-action="audioMute"]'),range=$('ssAudioVolume'),percent=Math.round(a.volume*100);
    if(toggle){text(toggle,a.muted?'SFX OFF':'SFX ON');toggle.setAttribute('aria-pressed',String(!a.muted));}
    if(range&&host.document.activeElement!==range)range.value=String(percent);text($('ssAudioValue'),percent+'%');
   }
   const harbor=ctx.harbor||!s||s.phase==='draft';setHidden($('ssHud'),harbor);
   const hasPanel=!!activePanel; $('ssHud').inert=hasPanel||harbor;canvas.inert=hasPanel;
   const showPaused=!!ctx.paused&&!hasPanel&&!harbor&&s?.phase!=='finished';
   setHidden($('ssPaused'),!showPaused);
   const touch=!!(host.matchMedia?.('(pointer: coarse)')?.matches||host.navigator.maxTouchPoints>0);
   const joystickVisible=!harbor&&!hasPanel&&!ctx.paused&&s?.phase==='sailing'&&ctx.settings.control==='direct'&&touch&&!R.player(s).docked;
   if(!joystickVisible&&joystickPointer!==null)endJoystick();setHidden(joystick,!joystickVisible);
   if(harbor)return;
   if(lastVoyageId!==s.id){lastVoyageId=s.id;lastLog=-1;boardKey='';lastWanted='';$('ssLog').replaceChildren();}
   const p=R.player(s),lock=R.repairLocked(s),wanted=R.get(s,s.wantedId),zone=M.atZone(s,p),dock=M.islandById(s,p.docked),near=M.nearestIsland(s,p,true);
   text($('ssCaptainName'),p.name);text($('ssAlive'),R.survivors(s).length+'/20');text($('ssShipLevel'),'Lv. '+p.level);text($('ssShipHp'),fmt(p.hp)+' / 100');style($('ssShipHpBar'),'width',pct(p.hp)+'%');
   $('ssShipHpBar').classList.toggle('critical',p.hp<=30);setHidden($('ssRepairLock'),!lock);
   text($('ssCrewCount'),p.crew.length+' / '+R.cap(p)+' crew · '+K.living(p.crew).length+' ready');
   text($('ssDay'),'Day '+s.day+' / 15');text($('ssClock'),R.clock(s));text($('ssDifficulty'),s.difficulty.toFixed(2));$('ssDifficulty').classList.toggle('danger',lock);
   const hour=(s.elapsed%360)/15,daylight=hour>=6&&hour<=19;
   const sun=$('ssSun');if(sun.dataset.day!==String(daylight)){sun.dataset.day=String(daylight);sun.innerHTML=icon(daylight?'sun':'moon',17);}text($('ssDayPeriod'),daylight?'DAY':'NIGHT');style($('ssDayFill'),'width',((s.elapsed%360)/360*100)+'%');
   const qp=$('ssQuickPause');if(qp.dataset.paused!==String(!!ctx.paused)){qp.dataset.paused=String(!!ctx.paused);qp.innerHTML=icon(ctx.paused?'play':'pause',14);}
   const leaders=R.ranking(s).slice(0,5),key=JSON.stringify(leaders.map(v=>[v.id,v.name,v.level,fmt(v.bounty),v.id===s.wantedId]));
   if(key!==boardKey){boardKey=key;$('ssLeaders').innerHTML=leaders.map((v,i)=>`<li class="${v.id===s.wantedId?'wanted':''} ${v.id==='player'?'own':''}"><span class="ss-rank">${i+1}</span><span class="ss-leader-name">${esc(v.name)} ${v.id==='player'?'<small>YOU</small>':''}</span>${v.id===s.wantedId?icon('crown',12):''}<b>${fmt(v.bounty)}</b></li>`).join('');}
   const wantedKey=(wanted?.id||'')+'|'+(wanted?.hp>0)+'|'+(wanted?.name||'');
   if(lastWanted!==wantedKey){lastWanted=wantedKey;$('ssWanted').innerHTML=R.alive(wanted)?icon('crown',13)+'<span>Wanted: <b>'+esc(wanted.name)+'</b></span>':icon('crown',13)+'<span>Wanted bounty ended</span>';}
   text($('ssMaterial'),fmt(p.material));const haul=p.lastHaul,haulItem=haul&&host.MaterialSystem.get(haul.id);
   setHidden($('ssHaul'),!haulItem||s.elapsed-haul.time>5);if(haulItem&&s.elapsed-haul.time<=5){const img=$('ssHaulIcon');if(img.getAttribute('src')!==haulItem.image){img.style.visibility='';img.setAttribute('src',haulItem.image);}text($('ssHaulText'),'+'+haul.gain+' '+haulItem.name);}
   const zoneBox=$('ssSeaZone'),zoneKind=dock?'dock':zone?.kind||'open';
   if(zoneBox.dataset.kind!==zoneKind){zoneBox.dataset.kind=zoneKind;zoneBox.querySelector('i').innerHTML=icon(dock?'anchor':zone?.kind==='storm'?'storm':zone?'skull':'wave',15);}
   const hazardSeconds=p.hazardAt&&p.zoneId===zone?.id&&s.elapsed>=p.cooldownUntil?' · '+Math.max(0,Math.ceil(p.hazardAt-s.elapsed))+'s':'';
   text(zoneBox.querySelector('span'),dock?'Docked · '+dock.name:zone?.kind==='storm'?'Storm Zone · −40% speed'+hazardSeconds:zone?'Danger Zone'+hazardSeconds:near?'Open sea · Dock nearby':'Open sea');
   const flags=R.claimed(s,p).length;text($('ssFlags'),flags?'⚑ '+flags+' island'+(flags===1?'':'s')+' · +'+(flags*.5).toFixed(1)+' Material/s at sea':'No claimed islands');
   const logbox=$('ssLog'),newest=s.logs.at(-1)?.id||0;
   if(lastLog!==newest){
    const bottom=lastLog<0||logbox.scrollHeight-logbox.scrollTop-logbox.clientHeight<25;
    const visibleIds=new Set(s.logs.map(l=>String(l.id)));
    for(const n of [...logbox.children])if(!visibleIds.has(n.dataset.logId))n.remove();
    if(lastLog>newest)logbox.replaceChildren();
    const have=new Set([...logbox.children].map(n=>Number(n.dataset.logId))),fragment=doc.createDocumentFragment();
    for(const l of s.logs)if(!have.has(l.id)){const row=doc.createElement('div');row.dataset.logId=l.id;row.dataset.tone=l.tone;const stamp=doc.createElement('time');stamp.textContent='D'+l.day+' '+String(Math.floor(l.time%360/15)).padStart(2,'0')+':'+String(Math.floor((l.time%15)*4)).padStart(2,'0');const span=doc.createElement('span');span.textContent=l.message;row.append(stamp,span);fragment.append(row);}
    logbox.append(fragment);if(bottom)logbox.scrollTop=logbox.scrollHeight;lastLog=newest;
   }
   text($('ssSaveStatus'),ctx.saveStatus||'Local voyage');setHidden($('ssUpgradeReady'),!R.canUpgrade(p));
   const control=ctx.settings.control,quick=$('ssQuickControl');if(control!==lastControl){lastControl=control;quick.innerHTML=icon(control==='direct'?'wheel':'point',15)+'<span>'+(control==='direct'?'Direct':'Point')+'</span>';}
   const hint=$('ssNavHint');text(hint,ctx.paused?'Voyage paused':dock?'Docked · Use Dock / Flag to depart':control==='direct'?(touch?'Drag the joystick to sail':'WASD / Arrow keys to sail'):'Click or tap the sea or radar to set course');
   const rival=ctx.rival,contextNode=$('ssContext');const contextKey=rival?rival.id+'|'+fmt(rival.hp)+'|'+fmt(rival.bounty):'';
   if(contextNode.dataset.key!==contextKey){contextNode.dataset.key=contextKey;contextNode.innerHTML=rival?btn('board','Board '+rival.name,'data-id="'+rival.id+'"','sword','ss-button ss-board-button')+`<span>${fmt(rival.hp)} HP · ${fmt(rival.bounty)} Bounty</span>`:'';}
   setHidden(contextNode,!rival||hasPanel||ctx.paused);
   livePanel(s,ctx);lastState=s;
  }
  function ocean(s,now,dt,waypoint){renderer.draw(s,now,dt,waypoint);}
  function portrait(path){
   if(!path)return null;
   let item=images.get(path);if(!item){item=new host.Image();item.decoding='async';item.src=path;images.set(path,item);}return item;
  }
  function crop(ctx,img,x,y,w,h){
   if(!img?.complete||!img.naturalWidth||!img.naturalHeight)return false;
   const scale=Math.max(w/img.naturalWidth,h/img.naturalHeight),sw=w/scale,sh=h/scale;
   ctx.drawImage(img,(img.naturalWidth-sw)/2,(img.naturalHeight-sh)/2,sw,sh,x,y,w,h);return true;
  }
  function drawBattle(fight){
   if(!battleCanvas||!battleCtx||!fight?.battle)return;
   const c=battleCanvas,ctx=battleCtx,w=Math.max(1,c.clientWidth),h=Math.max(1,c.clientHeight),dpr=Math.min(1.6,host.devicePixelRatio||1);
   if(w!==boardW||h!==boardH||dpr!==boardDpr){boardW=w;boardH=h;boardDpr=dpr;c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);}
   ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#091b26';ctx.fillRect(0,0,w,h);
   const cell=Math.min((w-12)/7,(h-12)/8),ox=(w-cell*7)/2,oy=(h-cell*8)/2;
   const tile=(x,y)=>({x:ox+(x+.5)*cell,y:oy+(y+.5)*cell});
   for(let y=0;y<8;y++)for(let x=0;x<7;x++){
    ctx.fillStyle=y<4?(x+y)%2?'#392d30':'#35282d':(x+y)%2?'#17363d':'#142e38';
    ctx.fillRect(ox+x*cell+1,oy+y*cell+1,cell-2,cell-2);
    ctx.strokeStyle=y<4?'#7563583b':'#80babb26';ctx.lineWidth=.7;ctx.strokeRect(ox+x*cell+1.5,oy+y*cell+1.5,cell-3,cell-3);
   }
   ctx.strokeStyle='#e6c388a0';ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(ox,oy+4*cell);ctx.lineTo(ox+7*cell,oy+4*cell);ctx.stroke();ctx.setLineDash([]);
   const units=[...fight.battle.playerTeam,...fight.battle.enemyTeam],now=fight.visibleTime;
   for(const e of fight.events)if(e.shape&&now-e.at<1.35&&now>=e.at){
    const a=e.shape,pos=tile(a.x,a.y),alpha=Math.max(0,1-(now-e.at)/1.35)*.7;
    ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle=e.side==='player'?'#67e4d6':'#eaa079';ctx.strokeStyle=e.side==='player'?'#c1fff2':'#ffcc9d';ctx.lineWidth=1.8;
    if(a.kind==='blast'){ctx.beginPath();ctx.arc(pos.x,pos.y,a.radius*cell,0,Math.PI*2);ctx.fill();ctx.stroke();}
    else if(a.kind==='pierce'){ctx.beginPath();ctx.moveTo(pos.x,pos.y);ctx.lineTo(pos.x+a.dx*a.range*cell,pos.y+a.dy*a.range*cell);ctx.lineWidth=Math.max(3,a.width*2*cell);ctx.stroke();}
    else {ctx.beginPath();ctx.moveTo(pos.x,pos.y);const angle=Math.atan2(a.dy,a.dx);ctx.arc(pos.x,pos.y,a.range*cell,angle-a.angle,angle+a.angle);ctx.closePath();ctx.fill();ctx.stroke();}
    ctx.restore();
   }
   for(const u of units){
    if(!u.grid||!u.card||u.hp<=0||u.defeated)continue;
    const p=tile(u.grid.renderX??u.grid.x,u.grid.renderY??u.grid.y),tw=cell*.78,th=cell*.83,x=p.x-tw/2,y=p.y-th/2,color=rarityColors[u.card.rarity]||'#cbb69b',r=u.passiveState||{},friendly=u.grid.side==='player';
    ctx.fillStyle='#04101b';ctx.fillRect(x-2,y-2,tw+4,th+5);ctx.strokeStyle=color;ctx.lineWidth=1.4;ctx.strokeRect(x-1,y-1,tw+2,th+2);
    if(!crop(ctx,portrait(u.card.image),x,y,tw,th)){ctx.fillStyle=friendly?'#21474f':'#4e3637';ctx.fillRect(x,y,tw,th);ctx.font='bold '+Math.max(9,cell*.24)+'px system-ui';ctx.textAlign='center';ctx.fillStyle=color;ctx.fillText(u.card.name.slice(0,2),p.x,p.y);}
    if(u.grid.stamina<=0){ctx.fillStyle='#10151876';ctx.fillRect(x,y,tw,th);ctx.font='bold '+Math.max(7,cell*.12)+'px system-ui';ctx.fillStyle='#ffe2a1';ctx.textAlign='center';ctx.fillText('TIRED',p.x,y+th*.53);}
    ctx.fillStyle='#09121be9';ctx.fillRect(x,y+th-10,tw,10);ctx.beginPath();ctx.rect(x,y+th-11,tw,11);ctx.save();ctx.clip();
    ctx.font='700 '+Math.max(7,cell*.14)+'px system-ui';ctx.textAlign='center';ctx.fillStyle='#f4f4da';ctx.fillText(u.card.name,p.x,y+th-3);ctx.restore();
    ctx.fillStyle='#14202a';ctx.fillRect(x,y+th+1,tw,3.5);ctx.fillStyle=friendly?'#82e8b6':'#f08885';ctx.fillRect(x,y+th+1,tw*pct(u.hp,u.maxHp)/100,3.5);
    ctx.fillStyle='#14202a';ctx.fillRect(x,y+th+6,tw,3);ctx.fillStyle='#e3b771';ctx.fillRect(x,y+th+6,tw*pct(u.grid.stamina)/100,3);
    if(r.shield>0){ctx.fillStyle='#8ab9f7';ctx.fillRect(x,y-4,tw*pct(r.shield,u.maxHp)/100,2);}
    if(r.stunTurns>0||r.freezeTurns>0){ctx.fillStyle=r.freezeTurns>0?'#81dff7':'#e9c2fa';ctx.beginPath();ctx.arc(x+tw-2,y+3,3.4,0,Math.PI*2);ctx.fill();}
   }
   for(const e of fight.events)if(e.text&&Number.isFinite(e.x)&&now>=e.at&&now-e.at<.95){
    const p=tile(e.x,e.y),age=now-e.at;ctx.save();ctx.globalAlpha=Math.max(0,1-age/.98);ctx.font='800 '+(e.tone==='damage'?10:9)+'px system-ui';ctx.textAlign='center';ctx.fillStyle=e.tone==='heal'?'#88efc2':e.tone==='skill'?'#ffda8c':e.tone==='debuff'?'#e4aff5':'#f6ece1';ctx.shadowColor='#000';ctx.shadowBlur=3;ctx.fillText(String(e.text).slice(0,24),p.x,p.y-cell*.25-age*18);ctx.restore();
   }
  }
  function effectsText(u){const r=u.passiveState||{},effects=[];
   if(r.stunTurns>0)effects.push('STUN '+r.stunTurns+'t');if(r.freezeTurns>0)effects.push('FREEZE '+r.freezeTurns+'t');
   if(r.burn?.length)effects.push('BURN ×'+r.burn.length);if(r.bleed?.length)effects.push('BLEED ×'+r.bleed.length);if(r.poison?.length)effects.push('POISON ×'+r.poison.length);
   if(r.hypnosisTurns>0)effects.push('HYPNOSIS');if(r.fearTurns>0)effects.push('FEAR');if(r.shield>0)effects.push('SHIELD '+fmt(r.shield));if(u.grid?.stamina<=0&&u.hp>0)effects.push('EXHAUSTED');
   return effects.join(' · ');
  }
  function updateRoster(id,units,map){
   const list=$(id);if(!list)return;
   const seen=new Set();
   for(const u of units){if(!u.grid||!u.card)continue;const uid=String(u.grid.uid);seen.add(uid);
    let r=map.get(uid);
    if(!r){
     const node=doc.createElement('div');node.className='ss-live-card';node.style.setProperty('--rarity',rarityColors[u.card.rarity]||'#c8aa6e');
     const art=doc.createElement('div');art.className='ss-live-art';const img=doc.createElement('img');img.alt='';img.src=u.card.image;art.append(img);const data=doc.createElement('div');data.className='ss-live-data';
     data.innerHTML='<strong></strong><small class="ss-live-hp"></small><div class="ss-meter ss-meter--hp"><i></i></div><small class="ss-live-stamina"></small><div class="ss-meter ss-meter--stamina"><i></i></div><em></em>';
     node.append(art,data);list.append(node);r={node,img,name:data.querySelector('strong'),hp:data.querySelector('.ss-live-hp'),stamina:data.querySelector('.ss-live-stamina'),hpBar:data.querySelector('.ss-meter--hp i'),staminaBar:data.querySelector('.ss-meter--stamina i'),status:data.querySelector('em')};map.set(uid,r);
    }
    r.node.classList.toggle('defeated',u.hp<=0||u.defeated);if(r.img.getAttribute('src')!==u.card.image){r.img.style.visibility='';r.img.src=u.card.image;}
    text(r.name,(u.grid.sailingBeast?'Beast · ':'')+u.card.name);text(r.hp,fmt(u.hp)+' / '+fmt(u.maxHp)+' HP');text(r.stamina,stam(u.grid.stamina)+' / 100 Stamina');style(r.hpBar,'width',pct(u.hp,u.maxHp)+'%');style(r.staminaBar,'width',pct(u.grid.stamina)+'%');text(r.status,u.hp<=0?'DOWN':effectsText(u)||'');
   }
   for(const[uid,r]of map)if(!seen.has(uid)){r.node.remove();map.delete(uid);}
  }
  function combat(fight,now,paused){
   if(activePanel!=='combat'||!fight)return;if(!paused||lastBoardTime!==fight.visibleTime||now-lastBoardAt>=.2){drawBattle(fight);lastBoardAt=now;lastBoardTime=fight.visibleTime;}
   setHidden($('ssRestoring'),!fight.restoring);
   text($('ssBattleTimer'),fight.restoring?'Restoring battle checkpoint…':(paused?'PAUSED · ':'')+fight.visibleTime.toFixed(1)+' / 60s · Native tactical combat');
   if(now-lastCombatAt<.16)return;lastCombatAt=now;
   updateRoster('ssFriendlyRoster',fight.battle.playerTeam,friendlyRows);updateRoster('ssHostileRoster',fight.battle.enemyTeam,hostileRows);
   const logs=fight.logs,last=logs.join('\n'),log=$('ssBattleLog');
   if(log&&last!==logKey){const atBottom=!logKey||log.scrollHeight-log.scrollTop-log.clientHeight<24;logKey=last;const fragment=doc.createDocumentFragment();for(const line of logs){const row=doc.createElement('div');row.className=/EXHAUSTED|STATUS|DEBUFF|STUN/i.test(line)?'status':/PASSIVE|SKILL|RELIC|CHAMPION/i.test(line)?'skill':/HEAL/i.test(line)?'heal':'';row.textContent=line;fragment.append(row);}log.replaceChildren(fragment);if(atBottom)log.scrollTop=log.scrollHeight;}
  }
  return {root,open,close,toast,panel,hud,ocean,combat,endJoystick,focus(){root.focus({preventScroll:true});},get panelName(){return activePanel;}};
 }
 host.SailingUI=Object.freeze({makeView,icon});
})(window);

