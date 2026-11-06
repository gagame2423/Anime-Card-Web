/* Index-only filter drafts. Gameplay, inventory and Arena selectors stay separate. */
(function(host){
  'use strict';
  const SORTS=Object.freeze(['damage','hp','rarity','level']);
  const RARITY_ORDER=Object.freeze(['Common','Rare','Epic','Legendary','Mythic','Secret','Monarch']);
  const DEFAULT=Object.freeze({sort:'rarity',elements:Object.freeze([]),rarities:Object.freeze([]),categories:Object.freeze([])});
  let applied=DEFAULT,draft=null,ui=null,bridge={},sets={elements:new Set(),rarities:new Set(),categories:new Set()};
  let registry={elements:[],rarities:[],categories:[]};
  const doc=host.document;
  function registries(){
    registry={elements:[...(host.ElementSystem?.TYPES||[])],categories:[...(host.CategorySystem?.TYPES||[])],rarities:[...new Set((host.ALL_CARDS||[]).map(c=>c.rarity).filter(Boolean))].sort((a,b)=>{
      const ai=RARITY_ORDER.indexOf(a),bi=RARITY_ORDER.indexOf(b);return (ai<0?100:ai)-(bi<0?100:bi)||a.localeCompare(b);
    })};
    return registry;
  }
  function normalize(value={}){
    const next={sort:SORTS.includes(value.sort)?value.sort:'rarity'};
    for(const kind of ['elements','rarities','categories']){const selected=new Set(Array.isArray(value[kind])?value[kind]:[]);next[kind]=Object.freeze(registry[kind].filter(v=>selected.has(v)));}
    return Object.freeze(next);
  }
  function matches(card){
    return (!sets.elements.size||sets.elements.has(card?.element))&&(!sets.rarities.size||sets.rarities.has(card?.rarity))&&(!sets.categories.size||(card?.category||[]).some(c=>sets.categories.has(c)));
  }
  const unrollableCompare=(a,b)=>Number(Number(a?.chance)===0)-Number(Number(b?.chance)===0);
  function rarityCompare(a,b){
    // Thẻ không thể roll luôn đứng sau nhóm có tỷ lệ roll.
    const exclusive=unrollableCompare(a,b);if(exclusive)return exclusive;
    const chance=c=>Math.max(0,Number(c?.chance)||0),aa=chance(a),bb=chance(b);
    if(aa!==bb)return aa>bb?-1:1;
    return RARITY_ORDER.indexOf(b?.rarity)-RARITY_ORDER.indexOf(a?.rarity)||String(a?.name||'').localeCompare(String(b?.name||''));
  }
  function apply(value=draft){
    applied=normalize(value||DEFAULT);
    sets={elements:new Set(applied.elements),rarities:new Set(applied.rarities),categories:new Set(applied.categories)};
    updateTrigger();bridge.onApply?.();return applied;
  }
  function button(kind,value,label=value){
    const node=doc.createElement('button');node.type='button';node.className='index-filter-option';node.dataset.indexFilterKind=kind;node.dataset.indexFilterValue=value;node.setAttribute('aria-pressed','false');
    if(kind==='elements'){
      node.classList.add('index-element-option');node.dataset.element=value;
      const img=doc.createElement('img');img.src=host.ElementSystem.ICONS[value];img.alt='';img.width=32;img.height=32;
      const fallback=doc.createElement('span');fallback.className='index-element-fallback';fallback.textContent=value.slice(0,1);fallback.hidden=true;
      img.addEventListener('error',()=>{img.hidden=true;fallback.hidden=false;},{once:true});
      node.append(img,fallback);
    }
    const text=doc.createElement('span');text.textContent=label;node.append(text);return node;
  }
  function mount(){
    if(ui)return true;const get=id=>doc?.getElementById(id);
    const next={root:get('indexFiltersModal'),trigger:get('indexFiltersButton'),summary:get('indexFilterSummary'),count:get('indexFilterCount'),sort:get('indexSortOptions'),elements:get('indexElementOptions'),rarities:get('indexRarityOptions'),categories:get('indexCategoryOptions'),search:get('indexCategorySearch'),empty:get('indexCategoryEmpty'),status:get('indexFilterDraftStatus'),close:get('indexFiltersClose'),cancel:get('indexFiltersCancel'),reset:get('indexFiltersReset'),apply:get('indexFiltersApply')};
    if(Object.values(next).some(node=>!node))return false;ui=next;registries();
    ui.sort.replaceChildren(...SORTS.map(v=>button('sort',v,v==='damage'?'DAMAGE':v.toUpperCase())));
    for(const kind of ['elements','rarities','categories'])ui[kind].replaceChildren(...registry[kind].map(v=>button(kind,v)));
    ui.trigger.addEventListener('click',open);
    ui.close.addEventListener('click',close);ui.cancel.addEventListener('click',close);
    ui.reset.addEventListener('click',()=>{draft=normalize(DEFAULT);ui.search.value='';paintDraft();});
    ui.apply.addEventListener('click',()=>{apply();close();});
    ui.root.addEventListener('click',event=>{
      if(event.target===ui.root){close();return;}
      const target=event.target.closest('[data-index-filter-kind]');if(!target||!draft)return;
      const kind=target.dataset.indexFilterKind,value=target.dataset.indexFilterValue;
      if(kind==='sort')draft=normalize({...draft,sort:value});
      else if(registry[kind]?.includes(value)){const selection=new Set(draft[kind]);selection.has(value)?selection.delete(value):selection.add(value);draft=normalize({...draft,[kind]:[...selection]});}
      paintDraft();
    });
    ui.search.addEventListener('input',filterCategories);
    doc.addEventListener('keydown',event=>{
      if(ui.root.classList.contains('hidden'))return;
      if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();close();return;}
      if(event.key==='Tab'){
        const focusable=[...ui.root.querySelectorAll('button,input')].filter(n=>!n.disabled&&!n.hidden&&n.getClientRects().length),first=focusable[0],last=focusable[focusable.length-1];
        if(event.shiftKey&&doc.activeElement===first){event.preventDefault();last?.focus();}
        else if(!event.shiftKey&&doc.activeElement===last){event.preventDefault();first?.focus();}
      }
    },true);
    updateTrigger();return true;
  }
  function filterCategories(){
    if(!ui)return;const query=ui.search.value.trim().toLocaleLowerCase();let shown=0;
    for(const node of ui.categories.children){node.hidden=!node.dataset.indexFilterValue.toLocaleLowerCase().includes(query);if(!node.hidden)shown++;}
    ui.empty.hidden=shown>0;
  }
  function paintDraft(){
    if(!ui||!draft)return;
    for(const node of ui.root.querySelectorAll('[data-index-filter-kind]')){const kind=node.dataset.indexFilterKind,value=node.dataset.indexFilterValue,selected=kind==='sort'?draft.sort===value:draft[kind].includes(value);node.setAttribute('aria-pressed',String(selected));node.classList.toggle('is-selected',selected);}
    ui.status.textContent=draft.categories.length?draft.categories.length+' categories selected · matches any selected category.':'No categories selected · all categories included.';
    filterCategories();
  }
  function updateTrigger(){
    if(!ui)return;const count=applied.elements.length+applied.rarities.length+applied.categories.length+(applied.sort==='rarity'?0:1);
    ui.count.textContent=String(count);ui.count.hidden=count===0;ui.trigger.classList.toggle('is-active',count>0);
    ui.trigger.setAttribute('aria-label','Sort and filter Card Index'+(count?' · '+count+' selections':''));
    const parts=[applied.sort==='damage'?'DAMAGE ↓':applied.sort.toUpperCase()+' ↓'];
    for(const [key,label] of [['elements','element'],['rarities','rarity'],['categories','category']])if(applied[key].length)parts.push(applied[key].length+' '+label+' selection'+(applied[key].length===1?'':'s'));
    ui.summary.textContent=parts.join(' · ');
  }
  function open(){if(!mount())return false;draft=normalize(applied);ui.search.value='';paintDraft();ui.root.classList.remove('hidden');ui.trigger.setAttribute('aria-expanded','true');ui.close.focus();return true;}
  function close(){if(!ui)return;ui.root.classList.add('hidden');ui.trigger.setAttribute('aria-expanded','false');draft=null;ui.trigger.focus();}
  host.IndexFilterSystem=Object.freeze({SORTS,matches,unrollableCompare,rarityCompare,apply,open,close,configure(options={}){bridge=options;return mount();},get state(){return applied;},get signature(){return JSON.stringify(applied);},get ready(){return Boolean(ui);}});
})(window);
