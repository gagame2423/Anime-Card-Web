/* Shared tactical roles, Energy triggers and spatial hit testing for the two live arenas.
   Coordinates belong to the arena adapter; hit selection and telegraphs use the same geometry. */
(function(host){
 'use strict';
 const TURN_SECONDS=1.35,ENERGY_MAX=100,WALL_ENERGY=20;
 const roles=Object.freeze({'tower-champion-normal-200':'Melee','jake-the-dog':'Support','kon':'Melee','yoshino-junpei':'Melee','antony-mu':'Melee','pochita':'Support'});
 const shapes=Object.freeze({'jake-the-dog':'pierce',zenitsu:'pierce',krixi:'pierce',bakugo:'blast','ender-dragon':'blast','tower-champion-normal-200':'blast','reagan-robot':'blast','finn-the-human':'strike',yasuo:'strike',yone:'strike',jinx:'blast'});
 const alive=u=>u&&u.hp>0&&!u.defeated;
 function roleOf(value){
  const card=value?.card||value,category=card?.category||[],role=card?.combatRole;
  if(['Melee','Ranged','Support'].includes(role))return role;
  if(roles[card?.id])return roles[card.id];
  if(category.includes('Supporter'))return 'Support';
  if(Number(card?.attackRange)>0)return Number(card.attackRange)>1?'Ranged':'Melee';
  return category.some(c=>c==='Gunner'||c==='Magician')?'Ranged':'Melee';
 }
 function rangeOf(card){return Number(card?.attackRange)>0?Math.max(1,Math.min(4,Math.floor(card.attackRange))):roleOf(card)!=='Melee'?(card?.category?.includes('Gunner')?4:3):1;}
 function shapeOf(card){
  if(shapes[card?.id])return shapes[card.id];
  const description=String(card?.passive?.description||'');
  if(/pierc(?:e|es|ing)\s+(?:through|the enemy team|up to|(?:all|multiple|\d+) enem)|\b(?:beam|lance)\b/i.test(description))return 'pierce';
  if(/\b(?:blast|blasts|explosion|explodes|detonat\w*)\b|damage to all enemies/i.test(description))return 'blast';
  return roleOf(card)==='Ranged'?'pierce':'strike';
 }
 const TITLES=Object.freeze({pierce:'Piercing Pulse',blast:'Arcane Blast',strike:'Crescent Strike',support:'Guardian Pulse'});
 function profile(card){
  const role=roleOf(card),shape=role==='Support'?'support':shapeOf(card);
  const description={pierce:'Deal 100% current ATK as special damage to enemies intersecting a forward line.',blast:'Deal 80% current ATK as special damage to enemies within a radius around the caster.',strike:'Deal 100% current ATK as special damage to enemies inside a frontal cone.',support:'Heal and shield the living ally (including self) with the lowest HP percentage, each for 50% current ATK.'}[shape];
  return {role,shape,name:TITLES[shape],description};
 }
 function direction(origin,target,facing={x:1,y:0}){
  facing ||= {x:1,y:0};const x=target?target.x-origin.x:facing.x,y=target?target.y-origin.y:facing.y,mag=Math.hypot(x,y);
  return mag>1e-8?{x:x/mag,y:y/mag}:{x:1,y:0};
 }
 // Capsule line, disk and sector include a unit's collision radius.
 function contains(shape,p,r=0){
  const dx=p.x-shape.x,dy=p.y-shape.y,d=Math.hypot(dx,dy);
  if(shape.kind==='blast')return d<=shape.radius+r;
  const f=dx*shape.dx+dy*shape.dy,across=Math.abs(dx*shape.dy-dy*shape.dx);
  if(shape.kind==='pierce')return f>=-r&&f<=shape.range+r&&across<=shape.width+r;
  if(shape.kind==='strike'){
   if(d>shape.range+r||f<-r)return false;
   return d<=r||Math.atan2(across,f)<=shape.angle+Math.asin(Math.min(1,r/Math.max(d,1e-8)));
  }
  return false;
 }
 function geometry(adapter,source,target,kind,options={}){
  const pos=adapter.point(source);if(!pos)return null;
  const scale=adapter.scale||1,dir=direction(pos,options.facingOnly?null:adapter.point(target),adapter.facing?.(source));
  // Native skills and Energy pulses can override their reach, in grid-cell units.
  return {kind,x:pos.x,y:pos.y,dx:dir.x,dy:dir.y,
   range:(options.range??(kind==='pierce'?5.3:2.55))*scale,
   radius:(options.radius??2.35)*scale,width:(options.width??.48)*scale,
   angle:options.angle??Math.PI/3};
 }
 function targets(battle,source,target,kind,options={},candidates){
  const rows=(candidates||[]).filter(alive),adapter=battle?.spatial;
  if(!adapter)return rows;
  let shape=geometry(adapter,source,target,kind,options);
  // A native effect explicitly described as arena-wide retains its scope.
  // Only that effect expands the radial telegraph; ordinary AoEs stay local.
  if(shape&&kind==='blast'&&options.fullTeam){
   shape={...shape,radius:Math.max(shape.radius,...rows.map(u=>{const p=adapter.point(u);return p?Math.hypot(p.x-shape.x,p.y-shape.y)+(adapter.radius?.(u)||0):0;}))};
  }
  if(!shape)return [];
  adapter.emit?.(shape,source,options.label||TITLES[kind]);
  if(kind==='blast'&&options.fullTeam)return rows;
  return rows.filter(u=>{const p=adapter.point(u);return p&&contains(shape,p,adapter.radius?.(u)||0);})
    .sort((a,b)=>{if(a===target)return -1;if(b===target)return 1;const p=adapter.point(a),q=adapter.point(b);return Math.hypot(p.x-shape.x,p.y-shape.y)-Math.hypot(q.x-shape.x,q.y-shape.y);});
 }
 function castEnergy(battle,source,target,api){
  if(!alive(source))return false;
  const skill=profile(source.card),atk=Math.max(0,api.atk?.(source)??source.atk??0);
  if(skill.shape==='support'){
   const ally=api.allies(source).filter(alive).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
   if(!ally)return false;
   api.announce?.(source,skill.name);api.heal(ally,atk*.5,source);api.shield(ally,atk*.5,source);return true;
  }
  const foes=api.enemies(source).filter(alive);if(!foes.length)return false;
  target=alive(target)&&foes.includes(target)?target:foes[0];
  api.announce?.(source,skill.name);
  for(const v of targets(battle,source,target,skill.shape,{label:skill.name,facingOnly:battle.mode==='ball-arena'},foes)){
   if(!alive(source))break;
   api.hit(source,v,atk*(skill.shape==='blast'?.8:1),{energySkill:true,autochessSynergy:true,passiveAttack:true,specialAttack:true});
  }
  return true;
 }
 function mechanics(card){
  const skill=profile(card),description=String(card?.passive?.description||''),notes=[
   'Enemy-orb impacts execute normal attacks and native passive and Relic effects. Wall rebounds grant '+WALL_ENERGY+' Energy; the full meter casts '+skill.name+'.',
   'Battle-entry effects wait for this orb’s first enemy impact. Timed effects advance once per '+TURN_SECONDS+' simulation seconds ('+(TURN_SECONDS/2)+' real seconds at 2×).'
  ];
  if(skill.shape!=='support')notes.push('Energy hitbox: '+({pierce:'forward piercing line',blast:'radial blast around the caster',strike:'frontal cone strike'}[skill.shape])+'. Only intersecting enemies are hit.');
  if(shapes[card?.id])notes.push('The native area skill also uses an actual '+({pierce:'piercing line',blast:'radial blast',strike:'frontal cone'}[shapes[card.id]])+' hitbox when it fires.');
  if(card?.id==='finn-the-human')notes.push('Each enemy inside the sword cone receives the active stance damage and its matching on-hit effect.');
  if(card?.id==='yasuo')notes.push('Steel Tempest and Last Breath cleave the cone for 75% or 100% ATK on secondary targets. Last Breath stuns the enemies inside the cleave.');
  if(card?.id==='yone')notes.push('While Soul Unbound is active, secondary enemies intersecting the cone receive the normal 50%-reduced blade damage.');
  if(card?.id==='tower-champion-normal-200')notes.push('Mad Scientist sacrifices Reagan on his first enemy impact and grants Robot Armor to a surviving teammate. Robot AI and Robot Armor blasts use radial hitboxes.');
  if(/on (?:battle )?entry|at (?:battle|match) start|on reaching the frontline|when entering/i.test(description))notes.push('This card has an entry or frontline effect: it cannot fire before the first enemy impact.');
  return notes;
 }
 host.SpatialCombat=Object.freeze({TURN_SECONDS,ENERGY_MAX,WALL_ENERGY,roleOf,rangeOf,shapeOf,profile,mechanics,geometry,contains,targets,castEnergy});
})(window);
