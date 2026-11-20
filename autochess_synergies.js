/* Phase 2: every registered trait has thresholds, distinct effects and a live tooltip. */
(function(host){
 'use strict';
 const TIERS=Object.freeze(['Inactive','Bronze','Silver','Gold','Prismatic']),THRESHOLDS=Object.freeze([2,4,6,8]);
 const ALIASES=Object.freeze({Villain:'Villian',AntiVillain:'AntiVillian',Jojo:'JoJo',Naruto:'Ninja','One Piece':'Pirate',JJK:'Jujutsu','Demon Slayer':'DemonSlayer','Dragon Ball':'DragonWarrior'});
 const names={Ninja:'Ninja · Naruto',Pirate:'Pirate · One Piece',Jujutsu:'Jujutsu · JJK',DemonSlayer:'Demon Slayer',DragonWarrior:'Dragon Warrior · Dragon Ball'};
 // A profile combines a unique stat package with a named combat proc. Percentages are additive.
 const profiles={
  Fire:{icon:'♨',bonus:{atk:.07},proc:'ember',power:.035,text:'All allies gain ATK; attacks stack Burn for 3 own turns (ATK scaling).'},
  Water:{icon:'◈',bonus:{mana:4,shield:.12},proc:'tide',power:.025,text:'Allies gain Energy on attacks, stronger Shields; a healing wave every 4 seconds.'},
  Nature:{icon:'❧',bonus:{regen:.006,reflect:.025},proc:'roots',power:.01,text:'All allies regenerate max HP each second and reflect incoming damage.'},
  Electric:{icon:'ϟ',bonus:{speed:.08},proc:'lightning',power:.22,text:'Allies gain attack speed; every third attack chains lightning to 2/3/4/5 enemies.'},
  Dark:{icon:'☾',bonus:{vamp:.04},proc:'execution',power:.08,text:'All allies gain omnivamp and deal bonus damage to targets below 40% HP.'},
  Holy:{icon:'✧',bonus:{trueDamage:.05,reduction:.025},proc:'purify',power:.01,text:'Convert damage to True Damage, reduce incoming damage; cleanse normal debuffs every 5 seconds.'},
  Hero:{icon:'♜',bonus:{hp:.06},proc:'rescue',power:.035,text:'Hero attacks shield the lowest-HP ally every third strike.'},
  Villian:{icon:'♟',bonus:{atk:.06},proc:'plunder',power:.10,text:'Villians deal extra damage to wounded targets and gain 1–3 lobby Gold on a PvP win.'},
  AntiHero:{icon:'◐',bonus:{vamp:.025},proc:'duelist',power:.12,text:'AntiHeroes gain a damage bonus when no ally is adjacent.'},
  AntiVillian:{icon:'◑',bonus:{reduction:.025},proc:'reprisal',power:.12,text:'Every fourth attack shields self and retaliates with piercing damage.'},
  Protagonist:{icon:'★',bonus:{hp:.04},proc:'growth',power:.018,text:'Every fourth attack permanently adds ATK for this fight, up to 10 growth stacks.'},
  Berserk:{icon:'✹',bonus:{atk:.05},proc:'frenzy',power:.10,text:'Missing HP increases attack speed; attacks below half HP heal the Berserker.'},
  VideoGame:{icon:'▣',bonus:{mana:3},proc:'combo',power:.24,text:'Every fifth attack spends no Energy and fires a critical combo blast.'},
  JoJo:{icon:'✺',bonus:{crit:.035},proc:'stand',power:.28,text:'Every fourth attack summons a Stand strike on a nearby second target.'},
  Jujutsu:{icon:'◎',bonus:{reduction:.02},proc:'domain',power:.16,text:'Every fourth attack creates a small domain: nearby enemies take damage and are Hindered.'},
  Fate:{icon:'♔',bonus:{shield:.12},proc:'oath',power:.07,text:'Fate units start shielded; every sixth attack restores a portion of their max-HP Shield.'},
  Pirate:{icon:'⚑',bonus:{vamp:.02},proc:'broadside',power:.20,text:'Every third attack fires a broadside into the next two nearest enemies.'},
  DragonWarrior:{icon:'♨',bonus:{atk:.05},proc:'ki',power:.35,text:'At full Energy, Dragon Warriors fire a Ki blast through the three nearest targets.'},
  PlanetDestroyer:{icon:'✷',bonus:{hp:.06},proc:'annihilate',power:.035,text:'Every sixth attack deals max-HP damage to the enemy with the most remaining HP.'},
  Ninja:{icon:'✥',bonus:{dodge:.025},proc:'ambush',power:.18,text:'Ninja first strikes deal extra damage; every fourth strike adds Bleed.'},
  Unhuman:{icon:'◇',bonus:{hp:.05,regen:.002},proc:'adapt',power:.015,text:'Every fifth attack heals self and grows max HP, up to five adaptations.'},
  Human:{icon:'♙',bonus:{mana:2},proc:'resolve',power:.04,text:'Human attacks grant nearby allies Energy; every fourth attack heals the lowest-HP ally.'},
  Captain:{icon:'♛',bonus:{hp:.04},proc:'command',power:.05,text:'Captain attacks rally nearby allies with Shields every third strike.'},
  Brutal:{icon:'⚔',bonus:{crit:.03},proc:'sunder',power:.06,text:'Every third attack sunders the target with a brief ATK debuff and bonus damage.'},
  PureEvil:{icon:'✦',bonus:{dot:.10},proc:'corrupt',power:.09,text:'Increase DoT damage; every fourth strike adds a three-turn corrupting Burn.'},
  DemonSlayer:{icon:'☀',bonus:{speed:.035},proc:'breathing',power:.22,text:'Every third strike deals bonus damage and Bleed to high-HP foes.'},
  Sins:{icon:'VII',bonus:{mana:3},proc:'sin',power:.12,text:'Sins deal extra damage to debuffed enemies and heal on every fifth attack.'},
  Alternative:{icon:'⤨',bonus:{dodge:.02},proc:'echo',power:.18,text:'Every fourth attack echoes into the target with True Damage.'},
  Army:{icon:'⚐',bonus:{hp:.05},proc:'formation',power:.05,text:'Summoned allies gain stronger stats; every fifth attack shields adjacent allies.'},
  Swordman:{icon:'†',bonus:{atk:.045},proc:'cleave',power:.24,text:'Every third strike cleaves adjacent enemies around the primary target.'},
  Supporter:{icon:'✚',bonus:{mana:3},proc:'mend',power:.20,text:'Gain 3/6/9/12 Energy per attack. Every 7/6/5/5 attacks, heal the lowest-HP ally for 20/40/60/100% ATK; Gold/Prismatic also shield the same ally for 10/20% ATK.'},
  Magician:{icon:'✵',bonus:{mana:4},proc:'nova',power:.28,text:'At full Energy, cast a spell nova at the target and its adjacent allies.'},
  Reaper:{icon:'☽',bonus:{crit:.02},proc:'harvest',power:.11,text:'Reapers heal on kills; attacks gain extra damage below 30% target HP.'},
  Hunter:{icon:'⌖',bonus:{speed:.04},proc:'mark',power:.14,text:'Every fourth attack marks the target: piercing damage and Hindered.'},
  Titan:{icon:'♜',bonus:{hp:.10},proc:'stomp',power:.18,text:'Every fourth attack stomps adjacent enemies, then shields the Titan.'},
  TitanSlayer:{icon:'⟠',bonus:{speed:.035},proc:'giantfall',power:.015,text:'Every third strike adds enemy max-HP damage, stronger against Titans.'},
  Animal:{icon:'♧',bonus:{speed:.045},proc:'pack',power:.08,text:'Pack attacks gain damage for each nearby living ally, capped at three allies.'},
  Mastermind:{icon:'♖',bonus:{mana:3},proc:'scheme',power:.045,text:'Every fourth attack reads its victim, reducing ATK and suppressing its next passive turn.'},
  Baller:{icon:'◉',bonus:{dodge:.025},proc:'direct',power:.32,text:'Every third attack is a Direct Shot ignoring damage reduction; adds Energy to nearby allies.'},
  Isekai:{icon:'⟡',bonus:{hp:.055},proc:'secondlife',power:.05,text:'Once below 25% HP, heal 10/20/30/40% max HP; every fifth strike grants Energy.'},
  Draconic:{icon:'♞',bonus:{atk:.06},proc:'roar',power:.22,text:'Every fifth attack roars at three enemies, dealing damage and one-turn Stun.'},
  Bleach:{icon:'卍',bonus:{mana:3},proc:'reiatsu',power:.20,text:'Every fourth attack unleashes Reiatsu, damaging two enemies and shielding the caster.'},
  Cartoon:{icon:'✧',bonus:{hp:.06,reduction:.03},proc:'command',power:.06,text:'Every third attack shields the Cartoon unit and adjacent allies.'},
  Gunner:{icon:'⌁',bonus:{speed:.05},proc:'ricochet',power:.25,text:'Every third ranged attack ricochets to the two nearest other enemies.'}
 };
 const registry=[...new Set([...host.ElementSystem.TYPES,...host.CategorySystem.TYPES,...(host.ALL_CARDS||[]).flatMap(c=>c.category||[])])];
 // Future registry additions receive a deterministic two-stat/proc profile immediately.
 for(const name of registry)if(!profiles[name]){const hash=host.AutoChessSystem.seedOf(name),stats=['atk','hp','speed','vamp','crit','shield'];profiles[name]={icon:'◇',bonus:{[stats[hash%6]]:.025,[stats[(hash%6+1)%6]]:.015},proc:['echo','mend','mark','pack','growth','reiatsu'][hash%6],power:.12+(hash%5)*.01,text:name+' resonance: a distinct paired stat bonus and a seeded combat technique every fourth attack.'};}
 const DEFINITIONS=Object.freeze(registry.map(id=>Object.freeze({id,name:names[id]||id,type:host.ElementSystem.TYPES.includes(id)?'element':'category',thresholds:THRESHOLDS,...profiles[id]})));
 const byId=new Map(DEFINITIONS.map(d=>[d.id,d]));
 const native=u=>u?.card||host.AutoChessSystem.card(u);
 function analyze(units,crests={}){const counts=new Map(),seen=new Set();for(const u of units||[]){const c=native(u);if(!c||seen.has(c.id))continue;seen.add(c.id);for(const id of [c.element,...(c.category||[]).map(v=>host.CategorySystem.normalize(v))])counts.set(id,(counts.get(id)||0)+1);}return DEFINITIONS.map(d=>{const realCount=counts.get(d.id)||0,virtualCount=realCount?Math.max(0,Number(crests?.[d.id])||0):0,count=realCount+virtualCount,tier=THRESHOLDS.filter(n=>count>=n).length;return{...d,count,realCount,virtualCount,tier,tierName:TIERS[tier],next:THRESHOLDS[tier]||8};}).sort((a,b)=>b.tier-a.tier||b.count-a.count||a.id.localeCompare(b.id));}
 function tooltip(row){const bonuses=Object.entries(row.bonus).map(([k,n])=>k+': '+(k==='mana'?n:n*100).toFixed(1)+(k==='mana'?' Energy':'%')+' per tier').join(' · ');return row.name+' · '+THRESHOLDS.join(' / ')+' distinct cards\n'+row.text+'\n'+bonuses+'\nCurrent: '+row.tierName+' ('+row.count+' units). Duplicate characters do not count twice.';}
 const statNames={atk:'ATK',hp:'max HP',speed:'attack speed',vamp:'omnivamp',reflect:'damage reflection',reduction:'damage reduction',trueDamage:'damage converted to True Damage',regen:'max HP regeneration / second',crit:'critical chance',dodge:'dodge chance',shield:'Shield strength',mana:'Energy per attack',dot:'DoT damage'};
 const pct=value=>Number((value*100).toFixed(3))+'%';
 function matches(unit,id){const d=byId.get(ALIASES[id]||id),c=native(unit);return Boolean(d&&c&&(d.type==='element'?c.element===d.id:host.CategorySystem.has(c,d.id)));}
 function roster(units,id){return(units||[]).filter(u=>matches(u,id));}
 function tierDetails(id,tier){
  const d=byId.get(ALIASES[id]||id);if(!d||tier<1||tier>4)return null;
  const n=tier,power=d.power*n,a=pct(power),hp=pct(power),extra=[];
  switch(d.proc){
   case'ember':extra.push('Each damaging attack adds Burn for 3 own turns: '+a+' ATK per tick, capped at 2% of the target max HP per application.');break;
   case'tide':extra.push('Every 4 seconds, each ally heals '+hp+' of its max HP.');break;
   case'roots':break;
   case'lightning':extra.push('Every third attack chains '+a+' ATK lightning to '+Math.min(5,n+1)+' nearest enemies.');break;
   case'execution':extra.push('Against enemies below 40% HP, deal '+a+' of the triggering damage as bonus damage.');break;
   case'purify':extra.push('Every 5 seconds, cleanse normal debuffs from allies. Uncleanseable effects remain.');break;
   case'rescue':extra.push('Every third attack shields the lowest-HP ally for '+hp+' of the caster max HP.');break;
   case'plunder':extra.push('A PvP victory grants +'+Math.min(3,n)+' match Gold (once per team).');break;
   case'duelist':extra.push('With no adjacent ally, deal '+a+' of the triggering damage as bonus damage.');break;
   case'reprisal':extra.push('Every fourth attack grants a '+pct(.035*n)+' max HP Shield and deals '+a+' ATK bonus damage ignoring damage reduction.');break;
   case'growth':extra.push('Every fourth attack adds '+a+' ATK for this fight, up to 10 growth stacks ('+pct(power*10)+' ATK).');break;
   case'frenzy':extra.push('Gain up to '+a+' attack speed, proportional to missing HP; below 50% HP, each attack heals '+a+' ATK.');break;
   case'combo':extra.push('Every fifth attack deals a '+pct(power*1.5)+' ATK bonus combo hit.');break;
   case'stand':extra.push('Every fourth attack deals '+a+' ATK to the nearest other enemy (primary target if alone).');break;
   case'domain':extra.push('Every fourth attack deals '+a+' ATK to up to 3 enemies nearest the target and Hinders them for 1 turn.');break;
   case'oath':extra.push('Start with a '+pct(.08*n)+' max HP Shield. Every sixth attack grants another '+hp+' max HP Shield.');break;
   case'broadside':case'ricochet':extra.push('Every third attack hits up to 2 other nearest enemies for '+a+' ATK each.');break;
   case'ki':extra.push('At 100 Energy, deal '+a+' ATK to up to 3 nearest enemies.');break;
   case'annihilate':extra.push('Every sixth attack hits the enemy with most current HP for '+hp+' of the largest enemy max HP, capped at 300% ATK.');break;
   case'ambush':extra.push('First attack deals '+a+' ATK bonus damage. Every fourth attack adds Bleed for 2 turns at '+pct(power*.5)+' ATK per turn.');break;
   case'adapt':extra.push('Every fifth attack heals '+hp+' max HP and adds '+hp+' max HP for this fight, up to 5 adaptations.');break;
   case'resolve':extra.push('Every attack grants '+(2*n)+' Energy to adjacent allies. Every fourth attack heals the lowest-HP ally for '+hp+' of the caster max HP.');break;
   case'command':case'formation':extra.push('Every '+(d.proc==='command'?'third':'fifth')+' attack shields self and adjacent allies for '+hp+' of the caster max HP.');break;
   case'sunder':extra.push('Every third attack deals '+a+' ATK bonus damage and reduces enemy ATK by '+pct(Math.min(.25,power))+' for 2 turns.');break;
   case'corrupt':extra.push('Every fourth attack adds Burn for 3 turns at '+a+' ATK per turn.');break;
   case'breathing':extra.push('Every third attack against a target above 50% HP deals '+a+' ATK bonus damage and Bleed for 2 turns at '+pct(power*.5)+' ATK per turn.');break;
   case'sin':extra.push('Against a Burned, Bleeding or Frozen enemy, deal '+a+' of triggering damage as bonus damage. Every fifth attack heals '+a+' ATK.');break;
   case'echo':extra.push('Every fourth attack deals '+a+' ATK bonus damage ignoring damage reduction.');break;
   case'cleave':extra.push('Every third attack deals '+a+' ATK to enemies adjacent to the primary target.');break;
   case'mend':extra.push('Every '+[7,6,5,5][n-1]+' attacks, heal the lowest-HP ally for '+pct([.20,.40,.60,1][n-1])+' ATK.'+(n>=3?' Shield that same ally for '+pct([0,0,.10,.20][n-1])+' ATK.':''));break;
   case'nova':extra.push('At 100 Energy, deal '+a+' ATK to the primary target and its adjacent allies.');break;
   case'harvest':extra.push('Against enemies below 30% HP, deal '+a+' of the triggering damage as bonus damage.');break;
   case'mark':extra.push('Every fourth attack deals '+a+' ATK ignoring Shields and Hinders the target for 1 turn.');break;
   case'stomp':extra.push('Every fourth attack deals '+a+' ATK to adjacent enemies and grants a '+pct(.02*n)+' max HP Shield.');break;
   case'giantfall':extra.push('Every third attack adds '+hp+' of target max HP as damage (double against Titans), capped at 200% ATK.');break;
   case'pack':extra.push('Deal +'+a+' of triggering damage per adjacent living ally, up to 3 allies.');break;
   case'scheme':extra.push('Every fourth attack reduces target ATK by '+pct(Math.min(.25,power))+' for 2 turns and suppresses its passive for 1 turn.');break;
   case'direct':extra.push('Every third attack deals '+a+' ATK ignoring damage reduction and grants '+(3*n)+' Energy to adjacent allies.');break;
   case'secondlife':extra.push('Once per fight below 25% HP, heal '+pct(.1*n)+' max HP. Every fifth attack grants '+(5*n)+' Energy.');break;
   case'roar':extra.push('Every fifth attack deals '+a+' ATK to up to 3 nearest enemies and Stuns them for 1 turn.');break;
   case'reiatsu':extra.push('Every fourth attack deals '+a+' ATK to up to 2 nearest enemies and shields self for '+a+' ATK.');break;
  }
  return{tier,name:TIERS[tier],threshold:THRESHOLDS[tier-1],scope:d.type==='element'?'All allies':'Matching '+d.name+' units',stats:Object.entries(d.bonus).map(([key,value])=>'+'+(key==='mana'?value*n:pct(value*n))+' '+(statNames[key]||key)),effects:extra};
 }
 function details(id,units=[],crests={}){const d=byId.get(ALIASES[id]||id);if(!d)return null;const row=analyze(units.filter(u=>u.board!==null),crests).find(r=>r.id===d.id);return{...row,deployed:roster(units.filter(u=>u.board!==null),d.id),bench:roster(units.filter(u=>u.board===null),d.id),pool:[...host.AutoChessSystem.pools.flat()].filter(c=>matches({card:c},d.id)),tiers:THRESHOLDS.map((_,i)=>tierDetails(d.id,i+1))};}
 function bonuses(rows,u){const b={atk:0,hp:0,speed:0,vamp:0,reflect:0,reduction:0,trueDamage:0,regen:0,crit:0,dodge:0,shield:0,mana:0,dot:0},c=native(u);for(const row of rows)if(row.tier&&(row.type==='element'||c?.category?.includes(row.id)))for(const[k,v]of Object.entries(row.bonus))b[k]=(b[k]||0)+v*row.tier;for(const[k,cap]of Object.entries({atk:.8,hp:1.2,speed:.9,vamp:.35,reflect:.25,reduction:.4,trueDamage:.4,dodge:.3,crit:.4,regen:.04,dot:.8}))b[k]=Math.min(cap,b[k]);return b;}
 function create(battle,api){
  const rows={player:analyze(battle.playerTeam.filter(u=>!u.isSummoned&&!u.isClone&&!u.companionOwner),battle.tactical?.crestCounts?.player),enemy:analyze(battle.enemyTeam.filter(u=>!u.isSummoned&&!u.isClone&&!u.companionOwner),battle.tactical?.crestCounts?.enemy)},states=new WeakMap();
  const alive=u=>u&&u.hp>0&&!u.defeated,side=u=>battle.playerTeam.includes(u)?'player':'enemy',allies=u=>(side(u)==='player'?battle.playerTeam:battle.enemyTeam).filter(alive),enemies=u=>(side(u)==='player'?battle.enemyTeam:battle.playerTeam).filter(alive);
  const distance=(a,b)=>Math.max(Math.abs(a.grid.x-b.grid.x),Math.abs(a.grid.y-b.grid.y));
  const nearby=(u,list,r=1)=>list.filter(v=>v!==u&&v.grid&&u.grid&&distance(u,v)<=r);
  const nearest=(u,list,n)=>list.slice().sort((a,b)=>distance(u,a)-distance(u,b)||a.grid.serial-b.grid.serial).slice(0,n);
  function state(u){let s=states.get(u);if(!s){s={attacks:0,growth:0,adapt:0,secondLife:false,bonuses:bonuses(rows[side(u)],u),active:rows[side(u)].filter(r=>r.tier&&(r.type==='element'||native(u)?.category?.includes(r.id)))};states.set(u,s);}return s;}
  const active=u=>state(u).active;
  function start(u){const s=state(u),b=s.bonuses;api.buff(u,'atk',b.atk,'synergy:atk');api.buff(u,'hp',b.hp,'synergy:hp',true);if(u.relic?.unique){api.buff(u,'hp',.2,'chess:uniqueHp',true);api.buff(u,'atk',.2,'chess:uniqueAtk');}for(const r of active(u))if(r.proc==='oath')api.shield(u,u.maxHp*.08*r.tier,u);}
  function energy(u,n){if(!alive(u)||!u.grid)return;u.grid.mana=Math.min(100,u.grid.mana+n);}
  function hit(u,v,n,extra={}){if(alive(v)&&alive(u))api.hit(u,v,n,{autochessSynergy:true,...extra});}
  function damage(u,v,amount,meta={}){
   if(!alive(u)||!u.grid||!amount||meta.autochessSynergy||meta.dot||meta.grimoireReflection)return;
   const b=state(u).bonuses;if(b.vamp)api.heal(u,amount*b.vamp,u);
   for(const r of active(u)){
    const n=r.tier;if(r.proc==='ember')api.dot(v,'burn',3,Math.min(v.maxHp*.02,u.atk*r.power*n),u);
    if(r.proc==='execution'&&v.hp<v.maxHp*.4)hit(u,v,amount*r.power*n);
    if(r.proc==='duelist'&&!nearby(u,allies(u)).length)hit(u,v,amount*r.power*n);
    if(r.proc==='pack')hit(u,v,amount*r.power*n*Math.min(3,nearby(u,allies(u)).length));
    if(r.proc==='harvest'&&v.hp<v.maxHp*.3)hit(u,v,amount*r.power*n);
    if(r.proc==='sin'&&(v.passiveState?.burn?.length||v.passiveState?.bleed?.length||v.passiveState?.freezeTurns))hit(u,v,amount*r.power*n);
   }
  }
  function attack(u,target){if(!alive(u))return;const s=state(u);s.attacks++;energy(u,12+s.bonuses.mana);const nAttack=s.attacks,foes=enemies(u),friends=allies(u),low=()=>friends.slice().sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
   for(const r of active(u)){const n=r.tier,power=r.power*n,ready=nAttack%3===0,atk=u.atk;
    switch(r.proc){
     case'lightning':if(ready)for(const v of nearest(target||u,foes,Math.min(5,n+1)))hit(u,v,atk*power);break;
     case'rescue':if(ready)api.shield(low(),u.maxHp*power,u);break;
     case'reprisal':if(nAttack%4===0){api.shield(u,u.maxHp*.035*n,u);hit(u,target,atk*power,{ignoreReduction:true});}break;
     case'growth':if(nAttack%4===0&&s.growth++<10)api.buff(u,'atk',power*s.growth,'trait:growth');break;
     case'frenzy':if(u.hp<u.maxHp*.5)api.heal(u,atk*power,u);break;
     case'combo':if(nAttack%5===0)hit(u,target,atk*power*1.5);break;
     case'stand':if(nAttack%4===0)hit(u,nearest(u,foes.filter(v=>v!==target),1)[0]||target,atk*power);break;
     case'domain':if(nAttack%4===0)for(const v of nearest(target||u,foes,3)){hit(u,v,atk*power);api.status(v,'hindredTurns',1,u);}break;
     case'oath':if(nAttack%6===0)api.shield(u,u.maxHp*power,u);break;
     case'broadside':case'ricochet':if(ready)for(const v of nearest(u,foes.filter(v=>v!==target),2))hit(u,v,atk*power);break;
     case'ki':if(u.grid.mana>=100)for(const v of nearest(u,foes,3))hit(u,v,atk*power);break;
     case'annihilate':if(nAttack%6===0)hit(u,foes.slice().sort((a,b)=>b.hp-a.hp)[0],Math.min(atk*3,(foes.reduce((m,v)=>Math.max(m,v.maxHp),0))*power));break;
     case'ambush':if(nAttack===1)hit(u,target,atk*power);if(nAttack%4===0)api.dot(target,'bleed',2,atk*power*.5,u);break;
     case'adapt':if(nAttack%5===0){api.heal(u,u.maxHp*power,u);if(s.adapt++<5)api.buff(u,'hp',power*s.adapt,'trait:adapt',true);}break;
     case'resolve':for(const v of nearby(u,friends))energy(v,2*n);if(nAttack%4===0)api.heal(low(),u.maxHp*power,u);break;
     case'command':case'formation':if(nAttack%(r.proc==='command'?3:5)===0)for(const v of [u,...nearby(u,friends)])api.shield(v,u.maxHp*power,u);break;
     case'sunder':if(ready){api.status(target,'weakenAttackTurns',2,u);api.status(target,'weakenAttackPct',Math.min(.25,power),u);hit(u,target,atk*power);}break;
     case'corrupt':if(nAttack%4===0)api.dot(target,'burn',3,atk*power,u);break;
     case'breathing':if(ready&&target?.hp>target?.maxHp*.5){hit(u,target,atk*power);api.dot(target,'bleed',2,atk*power*.5,u);}break;
     case'sin':if(nAttack%5===0)api.heal(u,atk*power,u);break;
     case'echo':if(nAttack%4===0)hit(u,target,atk*power,{ignoreReduction:true});break;
     case'cleave':if(ready&&target)for(const v of nearby(target,foes))hit(u,v,atk*power);break;
     case'mend':if(nAttack%[7,6,5,5][n-1]===0){const ally=low();api.heal(ally,atk*[.20,.40,.60,1][n-1],u);if(n>=3)api.shield(ally,atk*[0,0,.10,.20][n-1],u);}break;
     case'nova':if(u.grid.mana>=100)for(const v of [target,...(target?nearby(target,foes):[])])hit(u,v,atk*power);break;
     case'mark':if(nAttack%4===0){hit(u,target,atk*power,{ignoreShield:true});api.status(target,'hindredTurns',1,u);}break;
     case'stomp':if(nAttack%4===0){for(const v of nearby(u,foes))hit(u,v,atk*power);api.shield(u,u.maxHp*.02*n,u);}break;
     case'giantfall':if(ready&&target)hit(u,target,Math.min(atk*2,target.maxHp*power*(native(target)?.category?.includes('Titan')?2:1)));break;
     case'scheme':if(nAttack%4===0){api.status(target,'weakenAttackTurns',2,u);api.status(target,'weakenAttackPct',Math.min(.25,power),u);api.status(target,'passiveSuppressionTurns',1,u);}break;
     case'direct':if(ready){hit(u,target,atk*power,{ignoreReduction:true});for(const v of nearby(u,friends))energy(v,3*n);}break;
     case'secondlife':if(nAttack%5===0)energy(u,5*n);break;
     case'roar':if(nAttack%5===0)for(const v of nearest(u,foes,3)){hit(u,v,atk*power);api.status(v,'stunTurns',1,u);}break;
     case'reiatsu':if(nAttack%4===0){for(const v of nearest(u,foes,2))hit(u,v,atk*power);api.shield(u,atk*power,u);}break;
    }
   }if(u.grid.mana>=100){u.grid.mana-=100;api.popup(u,'ENERGY', 'mana');}
  }
  function second(time){for(const u of [...battle.playerTeam,...battle.enemyTeam])if(alive(u)&&u.grid){const s=state(u),b=s.bonuses;if(b.regen)api.heal(u,u.maxHp*b.regen,u);for(const r of active(u)){if(r.proc==='tide'&&time%4===0)api.heal(u,u.maxHp*r.power*r.tier,u);if(r.proc==='purify'&&time%5===0)api.cleanse(u);if(r.proc==='secondlife'&&!s.secondLife&&u.hp<u.maxHp*.25){s.secondLife=true;api.heal(u,u.maxHp*.1*r.tier,u);}}}}
  function hurt(target,source,amount,meta={}){if(!target?.grid||meta.autochessSynergy||meta.dot)return;const b=state(target).bonuses;if(alive(source)&&b.reflect)api.hit(target,source,amount*b.reflect,{autochessSynergy:true,isCounter:true});energy(target,3);}
  function speed(u){const s=state(u);let n=s.bonuses.speed;for(const r of active(u))if(r.proc==='frenzy')n+=r.power*r.tier*(1-u.hp/u.maxHp);return Math.min(1.5,n);}
  return{rows,start,attack,damage,hurt,second,speed,bonuses:u=>state(u).bonuses};
 }
 host.AutoChessSynergies=Object.freeze({DEFINITIONS,ALIASES,THRESHOLDS,TIERS,analyze,bonuses,tooltip,matches,roster,tierDetails,details,create,definition:id=>byId.get(ALIASES[id]||id)});
})(window);
