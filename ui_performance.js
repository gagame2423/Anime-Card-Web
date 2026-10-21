/* Read-only ownership index, bounded view caches and on-demand mutation picker. */
(function(host){
  'use strict';
  let owner=null,source=null,inventory=null,revision=-1,index=new Map(),inventoryTotals=new Map(),inventoryByKey=new Map();
  const memoValues=new Map(),pages=new Map(),debounces=new Map(),EMPTY=Object.freeze([]);
  function knownIds(ids){return Array.isArray(ids)&&ids.length<=2&&ids.every((id,i)=>typeof id==='string'&&host.MUTATION_BY_ID[id]?.id===id&&(!i||(host.MUTATION_BY_ID[ids[i-1]].tier.rank<host.MUTATION_BY_ID[id].tier.rank)));}
  function parseKey(key,helpers){
    const separator=key.indexOf('|');if(separator<0)return helpers.parse(key);
    const cardId=key.slice(0,separator),suffix=key.slice(separator+1),ids=suffix==='base'?[]:suffix.split('+');
    if(!cardId||!knownIds(ids))return helpers.parse(key);
    return {cardId,key,mutations:ids.map(id=>host.MUTATION_BY_ID[id])};
  }
  function ensure(state,helpers){
    const nextRevision=host.RollPerformanceSystem?.revision||0;
    if(owner===state&&source===state.mutations&&inventory===state.inventory&&revision===nextRevision)return;
    const changed=owner===state&&source===state.mutations&&inventory===state.inventory?host.RollPerformanceSystem.changesSince(revision):null;
    if(changed){
      for(const {id,key}of changed){
        const inventoryCount=Math.max(0,Number(state.inventory?.[key]?.count)||0),count=Math.max(inventoryCount,Number(state.mutations?.[key])||0);
        inventoryTotals.set(id,Math.max(0,(inventoryTotals.get(id)||0)+inventoryCount-(inventoryByKey.get(key)||0)));inventoryByKey.set(key,inventoryCount);
        // Replace the array so an in-progress bulk salvage iteration keeps its snapshot.
        const entries=(index.get(id)||[]).filter(entry=>entry.key!==key);
        if(count>0){const parsed=helpers.parse(key);if(parsed)entries.push({key,count,mutations:parsed.mutations,isMulti:parsed.mutations.length>=2});}
        entries.sort(compareVariants);index.set(id,entries);
      }
      const ids=new Set(changed.map(change=>change.id));
      for(const key of memoValues.keys())if(ids.has(key.split(':',2)[1]))memoValues.delete(key);
      revision=nextRevision;return;
    }
    owner=state;source=state.mutations;inventory=state.inventory;revision=nextRevision;
    index=new Map();inventoryTotals=new Map();inventoryByKey=new Map();memoValues.clear();
    const merged=new Map();
    const add=(parsed,count)=>{if(!parsed||!(count>0))return;const existing=merged.get(parsed.key);if(!existing||existing.count<count)merged.set(parsed.key,{...parsed,count});};
    for(const [key,raw]of Object.entries(source||{}))add(parseKey(key,helpers),Math.max(0,Math.floor(Number(raw)||0)));
    const records=Array.isArray(inventory)?inventory:Object.values(inventory||{});
    for(const record of records){
      const id=String(record?.cardId??record?.id??'').trim(),count=Math.max(0,Math.floor(Number(record?.count)||0));
      if(!id||!count)continue;
      inventoryTotals.set(id,(inventoryTotals.get(id)||0)+count);
      const ids=record.mutationIds;
      const key=knownIds(ids)?id+'|'+(ids.join('+')||'base'):helpers.key(id,helpers.normalize(record.mutationIds??record.mutations??record.mutation));
      inventoryByKey.set(key,(inventoryByKey.get(key)||0)+count);add(merged.get(key)||parseKey(key,helpers),count);
    }
    for(const entry of merged.values()){
      if(!index.has(entry.cardId))index.set(entry.cardId,[]);
      index.get(entry.cardId).push({key:entry.key,count:entry.count,mutations:entry.mutations,isMulti:entry.mutations.length>=2});
    }
    for(const entries of index.values())entries.sort(compareVariants);
  }
  const rank=entry=>entry.isMulti?99:entry.mutations[0]?.tier?.rank||0;
  const compareVariants=(a,b)=>rank(a)-rank(b)||a.key.localeCompare(b.key);
  function variants(state,id,helpers){ensure(state,helpers);return index.get(id)||EMPTY;}
  function inventoryCount(state,id,helpers){ensure(state,helpers);return inventoryTotals.get(id)||0;}
  function memo(key,build){if(memoValues.has(key))return memoValues.get(key);const value=build();if(memoValues.size>=1024)memoValues.delete(memoValues.keys().next().value);memoValues.set(key,value);return value;}
  function debounce(key,job,delay=120){
    host.clearTimeout(debounces.get(key));
    debounces.set(key,host.setTimeout(()=>{debounces.delete(key);host.RollPerformanceSystem.schedule(job);},delay));
  }
  function paginate(kind,items,signature,grid,render,size=24){
    if(!grid)return items;
    let entry=pages.get(kind);
    if(!entry){
      const nav=grid.ownerDocument.createElement('nav');nav.className='view-pagination';nav.setAttribute('aria-label',kind+' pages');
      const previous=grid.ownerDocument.createElement('button'),label=grid.ownerDocument.createElement('span'),next=grid.ownerDocument.createElement('button');
      previous.type=next.type='button';previous.textContent='Previous';next.textContent='Next';
      nav.append(previous,label,next);grid.after(nav);entry={page:0,signature,nav,previous,label,next};pages.set(kind,entry);
      previous.addEventListener('click',()=>{entry.page--;render();});next.addEventListener('click',()=>{entry.page++;render();});
    }
    if(entry.signature!==signature){entry.signature=signature;entry.page=0;}
    const total=Math.max(1,Math.ceil(items.length/size));entry.page=Math.max(0,Math.min(total-1,entry.page));
    entry.nav.hidden=items.length<=size;entry.previous.disabled=entry.page===0;entry.next.disabled=entry.page===total-1;
    entry.label.textContent=`${items.length} cards • Page ${entry.page+1} / ${total}`;
    return items.slice(entry.page*size,(entry.page+1)*size);
  }
  let picker=null;
  function showVariants(options){
    const root=host.document?.getElementById('arenaMutationModal'),grid=root?.querySelector('[data-arena-mutations]'),title=root?.querySelector('h2'),more=root?.querySelector('[data-arena-more]');
    if(!root||!grid||!title||!more)return;
    picker={...options,grid,more,shown:0};title.textContent=options.name+' • Mutations';grid.replaceChildren();
    appendVariants();more.onclick=appendVariants;options.open();
  }
  function appendVariants(){
    if(!picker)return;const context=picker,fragment=context.grid.ownerDocument.createDocumentFragment();
    for(const entry of context.entries.slice(context.shown,context.shown+24)){
      const button=context.grid.ownerDocument.createElement('button');button.type='button';button.className='battle-variant-option'+(entry.key===context.selectedKey?' is-selected':'');
      button.textContent=`${entry.mutations.map(m=>m.name).join(' + ')||'Normal'} x${entry.count.toLocaleString('en-US')}`;
      button.disabled=!context.canSelect(entry);button.setAttribute('aria-pressed',String(entry.key===context.selectedKey));
      button.addEventListener('click',()=>context.select(entry));fragment.append(button);
    }
    context.shown=Math.min(context.entries.length,context.shown+24);context.grid.append(fragment);
    context.more.hidden=context.shown>=context.entries.length;context.more.textContent=`Show more (${context.entries.length-context.shown} remaining)`;
  }
  function closePicker(){if(picker){picker.grid.replaceChildren();picker.more.onclick=null;}picker=null;}
  host.UIPerformanceSystem=Object.freeze({variants,inventoryCount,memo,debounce,paginate,showVariants,closePicker});
})(window);
