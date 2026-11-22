/* Shared Relic presentation for Craft, Storage, Equip and the tactical tooltip.
   Rules and live passive capabilities come exclusively from RelicSystem. */
(function(host){
 'use strict';
 const R=host.RelicSystem;
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const title=s=>s?String(s)[0].toUpperCase()+String(s).slice(1):'';
 const percent=n=>(n*100).toLocaleString('en-US',{maximumFractionDigits:4})+'%';
 const label=(value,extra='')=>'<span class="relic-condition '+extra+'">'+esc(value)+'</span>';
 const statNames={atk:'ATK',hp:'Max HP',followChance:'Follow-up chance'};
 const pillars=parts=>parts.map(c=>c.type==='element'
  ?'<span class="relic-condition">'+host.ElementSystem.inlineMarkup(c.value)+'</span>'
  :label(c.label)).join('');
 function badges(match){
  return '<span class="relic-match-badges">'+(match?.base.active?label('Compatible','is-base-match'):'')+
   (match?.unique?.active?label('Unique Match','is-unique-match'):'')+'</span>';
 }
 function rowsFor(roll,cards){
  return (cards||[]).map(row=>{
   const card=row.card||row;
   return {card,match:R.compatibility(row.unit||card,roll),image:row.image||card.image,stars:row.stars,owned:row.owned};
  }).filter(row=>row.card?.id&&row.match);
 }
 function portrait({card,image,stars,owned}){
  return '<span class="relic-portrait" data-rarity="'+esc(card.rarity)+'"'+(owned===true?' data-owned="true"':'')+'>'+
   '<img src="'+esc(image||'')+'" alt="" loading="lazy" decoding="async"><span>'+esc(card.name)+'</span>'+
   (stars?'<small>'+esc(stars)+'★</small>':'')+'</span>';
 }
 function group(heading,rows,opts){
  const render=items=>'<div class="relic-portrait-strip'+(opts.team?' ac-relic-matches':'')+'">'+items.map(portrait).join('')+'</div>';
  const limit=opts.limit||rows.length;
  return '<section class="relic-compatible-group"><h4>'+esc(heading)+(opts.team?'':' <small>'+rows.length+'</small>')+'</h4>'+
   (rows.length?render(rows.slice(0,limit)):'<p class="relic-empty">'+esc(opts.empty||'No matching cards')+'</p>')+
   (rows.length>limit?'<details class="relic-more"><summary>Show '+(rows.length-limit)+' more</summary>'+render(rows.slice(limit))+'</details>':'')+
   '</section>';
 }
 function related(roll,cards,opts={}){
  const rows=rowsFor(roll,cards),rules=R.compatibility(null,roll);if(!rules)return '';
  const baseHeading=opts.team?'Base Stats · '+(rules.base.conditions.length?'Matching '+rules.base.conditions.map(c=>c.label).join(' + ')+' Team Cards':'All Units'):'Base Stat Compatible';
  const base=group(baseHeading,rows.filter(row=>row.match.base.active),opts);
  const unique=!rules.unique?'':group(
   rules.unique.universal?(opts.team?'Compatible Team Cards (All Units)':'Unique Compatible · All Cards'):
   opts.team?'Unique Eligibility · '+rules.unique.conditions.filter(c=>c.type!=='note').map(c=>c.label).join(' + '):'Unique Compatible',
   rows.filter(row=>row.match.unique?.active),opts);
  return '<div class="relic-compatible-groups">'+(opts.team?base+unique:unique+base)+'</div>';
 }
 function collection(all=false){
  const owned=R.ownedCards(),ids=new Set(owned.map(card=>card.id));
  return (all?[...owned,...(host.ALL_CARDS||[]).filter(card=>!ids.has(card.id))]:owned).map(card=>({card,owned:ids.has(card.id)}));
 }
 function stats(roll,d){
  const keys=d.stat==='both'?['atk','hp']:[d.stat];
  return '<dl class="relic-stat-grid">'+keys.map(k=>'<div><dt>'+esc(statNames[k])+'</dt><dd>'+
    (roll.template?d.ranges.map((range,i)=>'<small>'+['C','R','L'][i]+'</small> '+esc(range.join('–'))+(k==='followChance'?' pp':'%')).join(' <span aria-hidden="true">·</span> '):
     '+'+esc(percent(roll[k]||0)+(k==='followChance'?' points':'')))+'</dd></div>').join('')+'</dl>';
 }
 function markup(r,opts={}){
  const raw=r?.metadata?.relic||r,rolled=R.validRoll(raw),roll=rolled?R.normalizeRoll(raw):R.template(raw?.kind);
  if(!roll)return '<p>Unknown Relic.</p>';
  const d=R.DEFINITIONS.find(d=>d.kind===roll.kind),rules=R.compatibility(opts.card,roll);
  const tier=roll.template?'template':roll.unique?'unique':roll.rarity;
  const headline=roll.template?'Recipe Preview':roll.unique?'Unique Legendary':title(roll.rarity);
  const bound=r?.metadata?.binding,card=bound&&(host.ALL_CARDS||[]).find(c=>c.id===bound.cardId);
  const header=opts.header===false?'':'<header class="relic-inspect-head"><span class="relic-inspect-icon"><img src="'+esc(d.image)+'" alt="" decoding="async"></span><div><small>'+esc(headline)+'</small><h3>'+esc(d.name)+'</h3></div>'+
    (opts.team?'<span class="ac-relic-close-hint">Click or tap to pin</span>':'')+'</header>';
  const unique=rules.unique?'<section class="relic-unique ac-relic-unique"><strong><span aria-hidden="true">✦</span> '+(roll.template?'Unique Potential':'Unique')+'</strong><p>'+esc(roll.template?d.unique:R.uniqueText(roll))+'</p>'+
   '<div class="relic-conditions">'+(pillars(rules.unique.conditions)||label('All Cards'))+'</div></section>':'';
  const profile=opts.card?'<p class="relic-inspect-wearer"><strong>'+esc(opts.card.name)+'</strong> '+(rules.base.active||rules.unique?.active?badges(rules):label('No Active Match'))+'</p>':'';
  const foot=opts.team?'Previews use your board and bench, including while scouting.':roll.template?'C: Common · R: Rare · L: Legendary. Exact values are rolled when crafted.':
   bound?'Equipped to '+(card?.name||bound.cardId)+' · all mutations.':opts.binding?'Unbound.':'';
  return '<article class="relic-inspect'+(opts.team?' is-tactical':'')+'" data-relic-tier="'+esc(tier)+'">'+header+profile+stats(roll,d)+
   '<div class="relic-conditions">'+(pillars(rules.base.conditions)||label('All Cards'))+'</div>'+unique+
   (opts.cards?related(roll,opts.cards,opts):'')+(foot?'<footer>'+esc(foot)+'</footer>':'')+'</article>';
 }
 host.RelicInspection=Object.freeze({badges,collection,related,markup});
})(window);
