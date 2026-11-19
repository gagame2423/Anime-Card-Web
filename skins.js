/* Cosmetic artwork only. Ownership lives in the main save through the bridge. */
(function(host){
 'use strict';
 if(host.CardSkinSystem?.version===1)return;
 const DEFINITIONS=Object.freeze([
  ['spy','kr-decade','Spy','spy.png'],['female-spy','tower-champion-shadow','Female Spy','fspy.png'],
  ['crystal-tech','tower-champion-raining-200','Crystal Tech','ctech.png'],['hell','jason-13th','Hell','jhell.png'],
  ['aqua-beach','tower-champion-raining','Beach','aquabeach.png'],['senku-female','senku','Female','senkufemale.png'],
  ['noelle-beach','noelle-silva','Beach','noellebeach.png'],['heavy','the-mourner','Heavy','mheavy.png'],
  ['mercy','wish','Mercy','wmercy.png'],['reaper','boss-event-alucard','Reaper','areaper.png']
 ].map(([id,cardId,name,file])=>Object.freeze({id,cardId,name,image:'assets/skin/'+file})));
 const byId=new Map(DEFINITIONS.map(d=>[d.id,d])),cards=new Map((host.ALL_CARDS||[]).map(c=>[c.id,c])),base=new Map([...cards].map(([id,c])=>[id,c.image])),paths=new Map();let bridge={},revision=0;
 for(const [id,path]of base)paths.set(path,id);for(const skin of DEFINITIONS)paths.set(skin.image,skin.cardId);
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const state=()=>bridge.get?.()||{},get=id=>byId.get(id),owned=id=>!!get(id)&&state().unlockedSkins?.[id]===true;
 function equipped(cardId){const id=state().equippedSkins?.[cardId],d=get(id);return d?.cardId===cardId&&owned(id)?id:null;}
 function art(card,skinId=undefined){const id=typeof card==='string'?card:card?.cardId||card?.id,skin=get(skinId===undefined?equipped(id):skinId);if(skin?.cardId===id)return skin.image;if(card&&typeof card==='object'&&card!==cards.get(id)&&card.image&&!paths.has(card.image))return card.image;return base.get(id)||card?.image||'';}
 function normalise(raw={}){const unlockedSkins=Object.fromEntries(Object.entries(raw.unlockedSkins||{}).filter(([id,v])=>v===true&&get(id))),equippedSkins=Object.fromEntries(Object.entries(raw.equippedSkins||{}).filter(([id,skin])=>get(skin)?.cardId===id&&unlockedSkins[skin]));return{unlockedSkins,equippedSkins};}
 function valid(raw){if(!raw||!['unlockedSkins','equippedSkins'].every(k=>raw[k]===undefined||raw[k]&&typeof raw[k]==='object'&&!Array.isArray(raw[k])))return false;const n=normalise(raw);return Object.keys(raw.unlockedSkins||{}).length===Object.keys(n.unlockedSkins).length&&Object.keys(raw.equippedSkins||{}).length===Object.keys(n.equippedSkins).length;}
 // Existing renderers read card.image. An accessor changes only artwork and
 // leaves every direct rarity/category/stat/passive definition untouched.
 for(const d of DEFINITIONS){const card=cards.get(d.cardId);if(card&&!Object.getOwnPropertyDescriptor(card,'image')?.get)Object.defineProperty(card,'image',{enumerable:true,configurable:false,get:()=>art(d.cardId)});}
 function refresh(cardId){revision++;if(host.document){for(const img of host.document.querySelectorAll('img[src]'))if(!img.closest('[data-skin-preview]')&&paths.get(img.getAttribute('src'))===cardId)img.src=art(cardId);}host.dispatchEvent?.(new host.CustomEvent('card-skin-change',{detail:{cardId,revision}}));bridge.onChange?.(cardId);}
 function equip(cardId,skinId=null){if(skinId!==null&&(!owned(skinId)||get(skinId).cardId!==cardId)||!cards.has(cardId))return false;if(bridge.equip?.(cardId,skinId)!==true)return false;refresh(cardId);return true;}
 let dialog=null;
 function close(){if(!dialog)return;const row=dialog;dialog=null;row.controller.abort();row.node.remove();for(const[n,value]of row.inert)if(n.isConnected)n.inert=value;row.previous?.isConnected&&row.previous.focus();}
 function open(cardId){const card=cards.get(cardId);if(!card||!host.document)return false;close();const node=host.document.createElement('section'),controller=new AbortController(),previous=host.document.activeElement,inert=[...host.document.body.children].filter(n=>!['SCRIPT','STYLE','LINK'].includes(n.tagName)).map(n=>[n,n.inert]);for(const[n]of inert)n.inert=true;
  node.className='hx-layer hx-wardrobe';node.setAttribute('role','dialog');node.setAttribute('aria-modal','true');node.setAttribute('aria-label',card.name+' Skin Wardrobe');host.document.body.append(node);dialog={node,controller,previous,inert};const opt={signal:controller.signal};
  function render(){const current=equipped(cardId),rows=[{id:null,name:'Default Skin',image:base.get(cardId)},...DEFINITIONS.filter(d=>d.cardId===cardId)];node.innerHTML='<article class="hx-panel"><header><div><small>COSMETIC COLLECTION</small><h2>'+esc(card.name)+' · Skin Wardrobe</h2><p>Same stats. Your signature look.</p></div><button data-skin-close aria-label="Close Skin Wardrobe">×</button></header><div class="hx-skin-gallery">'+rows.map(d=>{const unlocked=d.id===null||owned(d.id),active=current===d.id;return'<button data-skin-preview data-skin-id="'+(d.id||'default')+'" data-rarity="'+esc(card.rarity)+'" class="hx-skin-card '+(active?'is-equipped':'')+' '+(!unlocked?'is-locked':'')+'" '+(!unlocked?'disabled':'')+'><img src="'+esc(d.image)+'" alt="'+esc(d.name)+'"><span class="hx-skin-state">'+(active?'EQUIPPED':unlocked?'UNLOCKED':'LOCKED')+'</span><div><h3>'+esc(d.name)+'</h3><small>'+(!unlocked?'Obtained from Hextech Chest':active?'Your current artwork':'Click to equip')+'</small></div>'+(!unlocked?'<b class="hx-skin-lock" aria-hidden="true">◇</b>':'')+'</button>';}).join('')+'</div><p class="hx-modal-status" role="status"></p></article>';}
  node.addEventListener('click',e=>{const el=e.target?.closest?.('[data-skin-id]');if(e.target===node||e.target?.closest?.('[data-skin-close]'))close();else if(el){if(equip(cardId,el.dataset.skinId==='default'?null:el.dataset.skinId))render();else node.querySelector('[role=status]').textContent='Unable to save this skin. Your previous selection is preserved.';}},opt);
  host.document.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close();}else if(e.key==='Tab'){const list=[...node.querySelectorAll('button:not(:disabled)')],first=list[0],last=list.at(-1);if(e.shiftKey&&host.document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&host.document.activeElement===last){e.preventDefault();first?.focus();}}},{...opt,capture:true});render();node.querySelector('[data-skin-close]').focus();return true;
 }
 host.CardSkinSystem=Object.freeze({version:1,DEFINITIONS,get,owned,equipped,art,base:id=>base.get(id)||'',resolvePath:path=>paths.has(path)?art(paths.get(path)):path,normalise,valid,equip,open,close,get active(){return !!dialog;},get revision(){return revision;},configure(options={}){bridge=options;}});
})(typeof window!=='undefined'?window:self);
