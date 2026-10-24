'use strict';
const {onRequest}=require('firebase-functions/v2/https');
const {onSchedule}=require('firebase-functions/v2/scheduler');
const {initializeApp}=require('firebase-admin/app');
const {getAuth}=require('firebase-admin/auth');
const {getFirestore,FieldValue}=require('firebase-admin/firestore');
initializeApp();
const service=require('./infinity_service')({db:getFirestore(),stamp:()=>FieldValue.serverTimestamp()});
exports.infinityApi=onRequest({region:'asia-east1',cors:true,timeoutSeconds:60,memory:'256MiB',concurrency:1,maxInstances:10},async(req,res)=>{
 res.set('Cache-Control','no-store');if(req.method!=='POST'){res.status(405).json({ok:false,error:'POST required.'});return;}
 try{
  const match=/^Bearer (.+)$/.exec(req.get('Authorization')||'');if(!match){res.status(401).json({ok:false,error:'Google authentication required.'});return;}
  const token=await getAuth().verifyIdToken(match[1],true);if(token.firebase?.sign_in_provider!=='google.com'){res.status(403).json({ok:false,error:'Google authentication required.'});return;}
  const body=req.body;if(!body||typeof body!=='object'||JSON.stringify(body).length>4096)throw Error('Invalid request.');
  let result;if(body.action==='bootstrap')result=await service.bootstrap(token.uid);else if(body.action==='score')result=await service.score(token.uid,body);else if(body.action==='board')result=await service.board();else throw Error('Unknown Infinity action.');
  res.json({ok:true,now:Date.now(),...result});
 }catch(error){console.error('Infinity request failed:',error.message);res.status(400).json({ok:false,error:error.message||'Infinity service unavailable.'});}
});
exports.finalizeInfinityWeek=onSchedule({region:'asia-east1',schedule:'0 0 * * 1',timeZone:'Etc/UTC',retryCount:3,timeoutSeconds:540},()=>service.finalizeDueWeeks());
