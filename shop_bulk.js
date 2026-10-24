/* Quantities, affordable bulk purchases and crash-safe cross-store item grants. */
(function(host){
 'use strict';
 const KEY='anime_card_rng_shop_bulk_v1',ITEMS='anime_card_rng_items_v1',MAX=Number.MAX_SAFE_INTEGER;
 const wallets=new Set(['tower','timetrial','raid','boss_event'].map(name=>'anime_card_rng_'+name+'_v1'));
 const modalIds=['towerShopModal','timeTrialShopModal','raidShopModal','bossEventShopModal','spookyShopModal'];
 let bridge={},busy=false,blocked=false,toastTimer=null;
 function validSave(value){return Boolean(value&&value.version===1&&value.pending===null);}
 function recover(){
  try{const data=JSON.parse(host.localStorage.getItem(KEY)||'null');
   if(data?.pending){const p=data.pending;if(data.version!==1||!wallets.has(p.key)||typeof p.before!=='string'||typeof p.items!=='string')throw Error('Invalid shop recovery record.');JSON.parse(p.before);JSON.parse(p.items);host.localStorage.setItem(p.key,p.before);host.localStorage.setItem(ITEMS,p.items);}
   host.localStorage.setItem(KEY,JSON.stringify({version:1,pending:null}));blocked=false;return true;
  }catch(_){blocked=true;return false;}
 }
 recover();
 function quantity(value=1){const n=Number(value);return Number.isFinite(n)?Math.min(MAX,Math.max(0,Math.floor(n))):0;}
 function requested(root){return quantity(root?.closest('.modal-backdrop')?.querySelector('[data-shop-quantity]')?.value??1);}
 function plan(balance,cost,id,count=1){
  const q=quantity(count),owned=host.InventorySystem.quantity(id);
  if(!q)return{quantity:0,message:'Enter a positive purchase quantity.'};
  if(!Number.isSafeInteger(balance)||balance<0||!Number.isSafeInteger(cost)||cost<1)return{quantity:0,message:'Shop balance is unavailable.'};
  if(balance<cost)return{quantity:0,message:'Insufficient coins.'};
  let actual=Math.min(q,Math.floor(balance/cost),MAX-owned);
  if(actual*cost>balance)actual--;
  return actual>0?{quantity:actual,total:actual*cost}:{quantity:0,message:'Item storage is full.'};
 }
 function notify(message){
  if(bridge.toast){bridge.toast(message);return;}
  const doc=host.document;if(!doc?.body)return;let box=doc.getElementById('shopPurchaseToast');
  if(!box){box=doc.createElement('div');box.id='shopPurchaseToast';box.className='shop-purchase-toast';box.setAttribute('role','status');doc.body.append(box);}
  box.textContent=message;box.hidden=false;host.clearTimeout(toastTimer);toastTimer=host.setTimeout(()=>{box.hidden=true;},2600);
 }
 function success(id,count){notify(`Successfully purchased ${count.toLocaleString('en-US')} x ${host.InventorySystem.getItem(id)?.name||id}!`);}
 function purchase({key,id,cost,balance,count=1,setBalance}){
  if(busy||blocked||bridge.canAct?.()===false){notify('Finish the current action before purchasing.');return false;}
  const order=plan(balance,cost,id,count);if(!order.quantity){notify(order.message);return false;}
  const before=host.localStorage.getItem(key),items=host.localStorage.getItem(ITEMS);
  if(!wallets.has(key)||before===null||items===null){notify('Unable to save this purchase.');return false;}
  busy=true;
  try{
   host.localStorage.setItem(KEY,JSON.stringify({version:1,pending:{key,before,items}}));
   if(setBalance(balance-order.total)!==true||!host.InventorySystem.grant(id,order.quantity))throw Error('Unable to save purchase.');
   host.localStorage.setItem(KEY,JSON.stringify({version:1,pending:null}));host.CloudSaveSystem?.markDirty();success(id,order.quantity);return true;
  }catch(_){
   const restored=recover();if(restored){host.InventorySystem.reload();if(setBalance(balance)!==true)blocked=true;}
   notify(blocked?'Storage unavailable. Reload to recover the purchase.':'Purchase cancelled. Coins and items preserved.');return false;
  }finally{busy=false;}
 }
 function mountHeader(modal){
  const header=modal?.querySelector('.modal-header');if(!header||header.querySelector('[data-shop-quantity]'))return;header.classList.add('shop-bulk-header');
  const label=host.document.createElement('label');label.className='shop-bulk-field';label.append('Quantity: ');
  const input=host.document.createElement('input');input.type='number';input.min='1';input.max=String(MAX);input.step='1';input.value='1';input.dataset.shopQuantity='true';input.setAttribute('aria-label',(modal.querySelector('h2')?.textContent||'Shop')+' purchase quantity');
  input.addEventListener('change',()=>{input.value=String(Math.max(1,quantity(input.value)));});label.append(input);header.insertBefore(label,header.querySelector('.modal-close'));
 }
 host.ShopBulkSystem=Object.freeze({KEY,validSave,quantity,requested,plan,purchase,notify,success,mountHeader,get blocked(){return blocked;},configure(options={}){bridge=options;for(const id of modalIds)mountHeader(host.document.getElementById(id));},flush:()=>!blocked});
})(window);
