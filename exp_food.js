/* EXP Food definitions, atomic feeding, recovery and a cached modal controller. */
(function(host){
 'use strict';
 const KEY='anime_card_rng_food_v1',MAIN_KEY='anime_card_rng_save_v1',MAX=Number.MAX_SAFE_INTEGER;
 const FOODS=Object.freeze([
  Object.freeze({id:'star_orb',name:'Star Orb',type:'exp_food',tier:'epic',icon:'🌟',image:'assets/items/starorb.png',baseExp:1000,description:'1,000 base EXP × your EXP Multiplier. Infinity wave clears and weekly #1 rewards.'}),
  Object.freeze({id:'spooky_candy',name:'Spooky Candy',type:'exp_food',tier:'rare',icon:'🍬',image:'assets/items/spcandy.png',baseExp:1000,description:'1,000 base EXP × your EXP Multiplier. Spooky Shop: 100 Spooky Coins.'}),
  Object.freeze({id:'bread',name:'Bread',type:'exp_food',tier:'common',icon:'🍞',image:'assets/items/bread.png',baseExp:25,description:'25 base EXP × your EXP Multiplier. Win any real battle mode to receive 1–3 Bread. Sandbox excluded.'})
 ]),byId=new Map(FOODS.map(food=>[food.id,food]));
 let bridge={},ui=null,cardId='',selected=new Map(),busy=false,blocked=false;
 function register(){for(const food of FOODS)host.InventorySystem.registerItem(food);}
 function validSave(record){return record?.version===1&&record.pending===null;}
 function recover(){
  try{
   const saved=JSON.parse(host.localStorage.getItem(KEY)||'null');
   if(saved?.pending){const p=saved.pending;
    if(saved.version!==1||typeof p.mainBefore!=='string'||typeof p.itemsBefore!=='string'||!JSON.parse(p.mainBefore)?.schemaVersion||!JSON.parse(p.itemsBefore)?.items)throw Error('Invalid feeding recovery record.');
    host.localStorage.setItem(MAIN_KEY,p.mainBefore);host.localStorage.setItem(host.InventorySystem.KEY,p.itemsBefore);host.InventorySystem.reload();
   }
   host.localStorage.setItem(KEY,JSON.stringify({version:1,pending:null}));blocked=false;return true;
  }catch(error){blocked=true;return false;}
 }
 function amountOf(n){return Number.isSafeInteger(n)&&n>=0?n:0;}
 function normalizeSelection(selection){const rows=[];for(const [id,n]of selection instanceof Map?selection:Object.entries(selection||{})){const quantity=amountOf(n);if(quantity&&byId.has(id))rows.push({id,quantity});else if(n)throw Error('Invalid EXP Food selection.');}return rows;}
 function budget(rows,multiplier){const base=rows.reduce((n,row)=>Math.min(MAX,n+byId.get(row.id).baseExp*row.quantity),0);const m=Number(multiplier);return Math.min(MAX,Math.floor(base*(Number.isFinite(m)?Math.max(0,m):1)));}
 function feed(id,selection){
  if(busy||blocked||host.SandboxSystem?.active||bridge.canAct?.()!==true)return {ok:false,message:'Finish the battle before feeding.'};
  let rows;try{rows=normalizeSelection(selection);}catch(error){return{ok:false,message:error.message};}
  if(!rows.length)return{ok:false,message:'Select EXP Food first.'};
  if(rows.some(row=>host.InventorySystem.quantity(row.id)<row.quantity))return{ok:false,message:'Food quantities have changed. Select again.'};
  busy=true;
  try{
   const plan=bridge.prepare(id,rows,budget(rows,bridge.expMultiplier?.()));
   const pending={mainBefore:plan.mainBefore,itemsBefore:plan.itemsBefore};
   host.localStorage.setItem(KEY,JSON.stringify({version:1,pending}));
   host.localStorage.setItem(host.InventorySystem.KEY,plan.itemsAfter);host.localStorage.setItem(MAIN_KEY,plan.mainAfter);
   host.localStorage.setItem(KEY,JSON.stringify({version:1,pending:null}));
   host.InventorySystem.reload();try{bridge.onCommit?.();}catch(error){host.console?.warn('Feeding saved; UI refresh failed.',error);}
   return{ok:true,...plan.result,message:'+'+plan.result.gained.toLocaleString('en-US')+' EXP · Lvl '+plan.result.level+'/1000'};
  }catch(error){const restored=recover();if(restored)bridge.onCommit?.();return{ok:false,message:restored?'Unable to feed: '+error.message+' Food and EXP preserved.':'Storage unavailable. Reload to recover feeding before continuing.'};}
  finally{busy=false;}
 }
 function rewardVictory(battle,random=Math.random){
  if(!battle||battle.sandbox||battle.mode==='sandbox'||host.SandboxSystem?.active||battle.foodRewardRecorded)return 0;
  const won=battle.questResultWon??(battle.outcome==='victory');if(!won)return 0;
  const receipt=battle.questContext?.id;if(!receipt)return 0;
  const quantity=battle.foodRewardQuantity ||= 1+Math.floor(Math.max(0,Math.min(1-Number.EPSILON,Number(random())||0))*3);
  const before=host.InventorySystem.quantity('bread');
  if(!host.InventorySystem.grantOnce('food_victory',receipt,'bread',quantity))return 0;
  battle.foodRewardRecorded=true;return host.InventorySystem.quantity('bread')-before;
 }
 const make=(tag,cls='',text)=>{const n=host.document.createElement(tag);n.className=cls;if(text!==undefined)n.textContent=text;return n;};
 function foodArt(food){const root=make('span','feed-food-art'),fallback=make('span','',food.icon),img=make('img');img.src=food.image;img.alt=food.name;img.loading='lazy';img.addEventListener('error',()=>img.remove(),{once:true});img.addEventListener('load',()=>{fallback.hidden=true;},{once:true});root.append(fallback,img);return root;}
 function mount(){
  if(ui)return true;const doc=host.document,root=doc?.getElementById('feedFoodModal');if(!root)return false;
  const get=id=>doc.getElementById(id),next={root,image:get('feedCardImage'),fallback:get('feedCardFallback'),name:get('feedCardName'),level:get('feedCardLevel'),exp:get('feedCardExp'),progress:get('feedCardProgress'),grid:get('feedFoodGrid'),preview:get('feedSelectedItems'),expPreview:get('feedExpPreview'),status:get('feedFoodStatus'),confirm:get('feedConfirm'),add:get('feedAddAll'),remove:get('feedRemoveAll')};
  if(Object.values(next).some(n=>!n))return false;ui=next;
  ui.grid.addEventListener('input',event=>{const id=event.target.dataset.foodQuantity;if(!byId.has(id))return;selected.set(id,Math.max(0,Math.min(host.InventorySystem.quantity(id),Math.floor(Number(event.target.value)||0))));paint(false);});
  ui.add.addEventListener('click',()=>{selected=new Map(FOODS.map(food=>[food.id,host.InventorySystem.quantity(food.id)]));paint();});
  ui.remove.addEventListener('click',()=>{selected.clear();paint();});
  ui.confirm.addEventListener('click',()=>{const result=feed(cardId,selected);ui.status.textContent=result.message;if(result.ok)selected.clear();paint();});
  ui.image.addEventListener('error',()=>{ui.image.hidden=true;ui.fallback.hidden=false;});return true;
 }
 function paint(rebuild=true){
  if(!ui)return;const info=bridge.describe?.(cardId);if(!info)return;
  ui.name.textContent=info.name;ui.level.textContent=`Lvl ${info.level}/1000`;ui.exp.textContent=info.maxed?'MAX LEVEL':`${info.exp.toLocaleString('en-US')} / ${info.required.toLocaleString('en-US')} EXP`;ui.progress.value=info.progress;
  if(ui.image.getAttribute('src')!==info.image){ui.image.hidden=!info.image;ui.fallback.hidden=Boolean(info.image);if(info.image)ui.image.src=info.image;else ui.image.removeAttribute('src');}ui.image.alt=info.name;ui.fallback.textContent=info.name;
  if(rebuild){const tiles=FOODS.filter(food=>host.InventorySystem.quantity(food.id)>0).map(food=>{const owned=host.InventorySystem.quantity(food.id),tile=make('label','feed-food-tile'),input=make('input');input.type='number';input.min='0';input.max=String(owned);input.step='1';input.value=String(Math.min(selected.get(food.id)||0,owned));input.dataset.foodQuantity=food.id;input.setAttribute('aria-label',food.name+' quantity');tile.append(foodArt(food),make('strong','',food.name),make('small','',`x${owned.toLocaleString('en-US')} · ${food.baseExp.toLocaleString('en-US')} EXP each`),input);return tile;});ui.grid.replaceChildren(...(tiles.length?tiles:[make('p','','No EXP Food owned. Win a battle for Bread or visit Spooky Shop.')]));}
  const rows=normalizeSelection(selected).map(row=>({...row,quantity:Math.min(row.quantity,host.InventorySystem.quantity(row.id))})).filter(row=>row.quantity>0);
  ui.preview.replaceChildren(...rows.map(row=>{const item=make('span','feed-selected-item');item.append(foodArt(byId.get(row.id)),make('span','',`${byId.get(row.id).name} x${row.quantity.toLocaleString('en-US')}`));return item;}));
  const gain=budget(rows,bridge.expMultiplier?.());ui.expPreview.textContent=`+${gain.toLocaleString('en-US')} EXP · EXP x${Number(bridge.expMultiplier?.()||1).toFixed(2)}${info.maxed?' · MAX LEVEL':''}`;
  ui.confirm.disabled=busy||blocked||info.maxed||!gain||bridge.canAct?.()!==true;ui.add.disabled=info.maxed;
 }
 function open(id){if(!mount()||bridge.canAct?.()!==true||!bridge.describe?.(id))return false;cardId=id;selected.clear();ui.status.textContent='';paint();bridge.open?.();return true;}
 const recovered=recover();register();
 if(!recovered)host.GameStartup?.report('food-recovery','Unable to recover EXP Food transaction. Reload before continuing.');
 host.ExpFoodSystem=Object.freeze({KEY,FOODS,recovered,register,validSave,recover,feed,rewardVictory,budget,open,configure:options=>{bridge=options||{};},get blocked(){return blocked;},flush:()=>!blocked&&!busy,reset:()=>{host.localStorage.removeItem(KEY);recover();register();}});
})(window);
