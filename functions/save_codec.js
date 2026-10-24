/* Existing protected-save wire format; never changes non-item progress. */
'use strict';
const crypto=require('node:crypto');
const SALT='ANIME_CARD_RNG_SECURE_SECRET_KEY_2026',FORMAT='anime-card-rng-protected-save',ITEMS='anime_card_rng_items_v1',MAX=Number.MAX_SAFE_INTEGER;
const checksum=data=>crypto.createHmac('sha256',SALT).update(data,'utf8').digest('hex');
function decode(payload){
 if(typeof payload!=='string'||payload.length>16*1024*1024||!/^[A-Za-z0-9+/]*={0,2}$/.test(payload))throw Error('Invalid Cloud payload.');
 const bytes=Buffer.from(payload,'base64');if(bytes.toString('base64')!==payload)throw Error('Non-canonical Cloud payload.');
 const text=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(bytes),p=JSON.parse(text);
 if(p.format!==FORMAT||p.version!==1||typeof p.data!=='string'||Buffer.byteLength(p.data)>10*1024*1024||!/^[a-f0-9]{64}$/.test(p.checksum))throw Error('Invalid protected save.');
 if(text!==JSON.stringify({format:FORMAT,version:1,data:p.data,checksum:p.checksum})||!crypto.timingSafeEqual(Buffer.from(checksum(p.data),'hex'),Buffer.from(p.checksum,'hex')))throw Error('Cloud integrity check failed.');
 const bundle=JSON.parse(p.data);if(bundle.format!=='anime-card-rng-save'||bundle.version!==1||!bundle.storage||Array.isArray(bundle.storage))throw Error('Invalid game bundle.');return bundle;
}
function encode(bundle){const data=JSON.stringify(bundle);if(Buffer.byteLength(data)>10*1024*1024)throw Error('Cloud save is too large.');return Buffer.from(JSON.stringify({format:FORMAT,version:1,data,checksum:checksum(data)}),'utf8').toString('base64');}
function addOrbs(bundle,amount){
 if(!Number.isSafeInteger(amount)||amount<1)throw Error('Invalid Star Orb reward.');
 const inventory=bundle.storage[ITEMS]||{version:3,items:{},buffs:{},paused:{},receipts:{},misses:0};
 if(!inventory.items||typeof inventory.items!=='object')throw Error('Invalid Cloud item storage.');
 if(Array.isArray(inventory.items))inventory.items=Object.fromEntries(inventory.items.map(item=>[item.id,item]));
 const existing=inventory.items.star_orb,quantity=typeof existing==='number'?existing:Number(existing?.quantity??existing?.count??0);
 if(!Number.isSafeInteger(quantity)||quantity<0||quantity>MAX-amount)throw Error('Star Orb storage is full or invalid. Reward remains in mailbox.');
 inventory.items.star_orb={...(typeof existing==='object'?existing:{}),id:'star_orb',name:'Star Orb',type:'exp_food',tier:'epic',icon:'🌟',image:'assets/items/starorb.png',description:'1,000 base EXP × your EXP Multiplier. Infinity Mode.',quantity:quantity+amount,metadata:existing?.metadata||{}};
 bundle.storage[ITEMS]=inventory;return bundle;
}
module.exports={decode,encode,addOrbs,digest:payload=>crypto.createHash('sha256').update(payload,'utf8').digest('hex')};
