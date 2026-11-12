/* Pure shot rules + a small clock-driven state machine. No DOM or animation timers. */
(function(host){
 'use strict';
 const ZONES=Object.freeze(['Top-Left','Top-Center','Top-Right','Middle-Left','Center','Middle-Right','Bottom-Left','Bottom-Center','Bottom-Right'].map((name,id)=>Object.freeze({id,name,x:(id%3+.5)/3,y:(Math.floor(id/3)+.5)/3,corner:[0,2,6,8].includes(id)})));
 const KEEPER_CONFIG=Object.freeze({coveredZones:3});
 const COVERAGE=Object.freeze(ZONES.map(keeper=>Object.freeze([...ZONES].sort((a,b)=>{
  const distance=z=>(z.x-keeper.x)**2+(z.y-keeper.y)**2;
  return distance(a)-distance(b)||Math.abs(a.y-keeper.y)-Math.abs(b.y-keeper.y)||a.id-b.id;
 }).slice(0,KEEPER_CONFIG.coveredZones).map(z=>z.id))));
 const keeperCoverage=zone=>COVERAGE[zone]||Object.freeze([]);
 const keeperCovers=(keeperZone,shotZone)=>keeperCoverage(keeperZone).includes(shotZone);
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number(v)||0));
 const randomUnit=r=>clamp(r(),0,1-Number.EPSILON);
 // Widths/tolerance are fractions of the bar; speed is bar lengths per second.
 const TIMING_CONFIG=Object.freeze({
  baseGreenZoneWidth:.06,
  statScalingFactor:.0024,
  needleSpeed:1.4,
  hitDetectionTolerance:.001,
  yellowZoneWidth:.06,
  maxGreenZoneWidth:.24
 });
 function timingConfig(options=TIMING_CONFIG){
  if(options===TIMING_CONFIG)return options;
  const bounded=(key,min,max)=>Number.isFinite(options?.[key])?clamp(options[key],min,max):TIMING_CONFIG[key];
  const maxGreenZoneWidth=bounded('maxGreenZoneWidth',.01,.4);
  return Object.freeze({
   baseGreenZoneWidth:Math.min(bounded('baseGreenZoneWidth',.01,.4),maxGreenZoneWidth),
   statScalingFactor:bounded('statScalingFactor',0,.02),
   needleSpeed:bounded('needleSpeed',.1,8),
   hitDetectionTolerance:bounded('hitDetectionTolerance',0,.02),
   yellowZoneWidth:bounded('yellowZoneWidth',0,.1),
   maxGreenZoneWidth
  });
 }
 function parameters(upgrades={},options=TIMING_CONFIG){
  const config=timingConfig(options);
  const levels=Object.fromEntries(['shoot','curve','accuracy'].map(k=>[k,clamp(upgrades[k],0,host.PenaltyStatsSystem.CONFIG.maxLevel)]));
  return {...levels,greenWidth:Math.min(config.maxGreenZoneWidth,config.baseGreenZoneWidth+levels.accuracy*config.statScalingFactor),speed:1+levels.shoot*.024};
 }
 function timingWindows(upgrades={},options=TIMING_CONFIG){
  const config=timingConfig(options),p=parameters(upgrades,config);
  // Render the same tolerance-expanded interval that hit detection accepts.
  const halfGreen=Math.min(.5,p.greenWidth/2+config.hitDetectionTolerance);
  const halfYellow=Math.min(.5,halfGreen+config.yellowZoneWidth);
  return {greenStart:.5-halfGreen,greenEnd:.5+halfGreen,greenWidth:halfGreen*2,
   yellowStart:.5-halfYellow,yellowEnd:.5+halfYellow,yellowWidth:halfYellow*2,redWidth:1-halfYellow*2};
 }
 function timing(power,stats={},options=TIMING_CONFIG){
  const w=timingWindows(stats,options),position=clamp(power),epsilon=Number.EPSILON*4;
  return position>=w.greenStart-epsilon&&position<=w.greenEnd+epsilon?'green':position>=w.yellowStart-epsilon&&position<=w.yellowEnd+epsilon?'yellow':'red';
 }
 function needleAt(seconds,options=TIMING_CONFIG){
  const config=timingConfig(options),time=Number.isFinite(seconds)?Math.max(0,seconds):0;
  const phase=(time%(2/config.needleSpeed))*config.needleSpeed;
  return phase<=1?phase:2-phase;
 }
 function evaluateShot({zone,power,upgrades={},random=Math.random,timingConfig:options=TIMING_CONFIG}){
  if(!Number.isInteger(zone)||!ZONES[zone])throw Error('Choose one goal zone.');
  power=clamp(power);const p=parameters(upgrades,options),quality=timing(power,upgrades,options),target=ZONES[zone];
  const miss=quality==='red'&&randomUnit(random)<.80;
  let driftX=quality==='yellow'?(randomUnit(random)-.5)*.08:0,driftY=quality==='yellow'?(randomUnit(random)-.5)*.06:0;
  if(miss){driftX=target.x<.5?-.3:.3;driftY=-.3;}
  const x=clamp(target.x+driftX),y=clamp(target.y+driftY),actualZone=Math.min(2,Math.floor(y*3))*3+Math.min(2,Math.floor(x*3));
  const same=randomUnit(random)<.42;
  const others=ZONES.filter(z=>z.id!==actualZone),keeperZone=same?actualZone:others[Math.floor(randomUnit(random)*others.length)].id;
  const precision=1-Math.abs(power-.5)*2;
  const saveChance=clamp(({green:.35,yellow:.72,red:.96})[quality]+(1-precision)*.08-p.shoot*.006-p.curve*(target.corner?.006:.002),.03,.98);
  const saved=!miss&&keeperCovers(keeperZone,actualZone)&&randomUnit(random)<saveChance,goal=!miss&&!saved;
  const rating=miss?'WEAK KICK!':saved?'SAVED!':quality==='red'?'WEAK KICK!':quality==='green'&&target.corner?'PERFECT CORNER!':'GREAT SHOT!';
  return {zone,power,actualZone,keeperZone,quality,goal,saved,miss,rating,duration:clamp(({green:.72,yellow:1.05,red:1.4})[quality]/p.speed,.30,2),curve:target.corner?(target.x<.5?1:-1)*(.02+p.curve*.0015):0,driftX,driftY};
 }
 function create({stats=host.PenaltyStatsSystem,random=Math.random,onChange=()=>{},timingConfig:options=TIMING_CONFIG}={}){
  const config=timingConfig(options);
  let phase='closed',paused=false,zone=0,power=0,elapsed=0,needlePhase=0,shot=null,lastResult=null,error='';
  const emit=()=>onChange(snapshot());
  function snapshot(){const data=stats.snapshot(),session=data.session,windows=timingWindows(data.upgrades,config);return {phase,paused,zone,power,elapsed,shot,lastResult,error,stats:data,attempts:session?.shots.length||0,goals:session?.shots.filter(s=>s.goal).length||0,greenWidth:windows.greenWidth,windows,timingQuality:shot&&!['ready','charging','closed'].includes(phase)?shot.quality:timing(power,data.upgrades,config)};}
  function settle(){const result=stats.commitShot();if(!result){error='Unable to save this shot. Retry to keep its original result.';phase='save-error';emit();return false;}lastResult=result;shot=result.shot;phase=result.complete?'result':'impact';elapsed=0;error='';emit();return true;}
  function open(){const session=stats.openSession();if(!session){error='Unable to open session. Finish the current activity or check storage.';emit();return false;}phase='ready';paused=false;elapsed=0;power=0;needlePhase=0;shot=null;lastResult=null;error='';if(session.pending){settle();return true;}if(session.shots.length===5)phase='result';emit();return true;}
  function next(){if(phase!=='result')return false;return open();}
  function select(id){if(phase!=='ready'||paused||!Number.isInteger(id)||!ZONES[id])return false;zone=id;emit();return true;}
  function charge(){if(phase!=='ready'||paused)return false;phase='charging';error='';emit();return true;}
  function cancelCharge(){if(phase==='charging'){phase='ready';emit();}}
  function release(){if(phase!=='charging'||paused)return false;shot=evaluateShot({zone,power,upgrades:stats.snapshot().upgrades,random,timingConfig:config});if(!stats.prepareShot(shot)){phase='ready';error='Unable to save the shot. No attempt was used.';emit();return false;}phase='flight';elapsed=0;emit();return true;}
  function pause(value=!paused){if(phase==='closed')return;cancelCharge();paused=Boolean(value);emit();}
  function update(seconds){
   if(paused||phase==='closed'||!Number.isFinite(seconds)||seconds<0)return;
   if(phase==='ready'||phase==='charging'){
    // Modulo arithmetic handles dropped frames without a catch-up loop.
    needlePhase=(needlePhase+(seconds%(2/config.needleSpeed))*config.needleSpeed)%2;
    power=needlePhase<=1?needlePhase:2-needlePhase;
   }else if(phase==='flight'){
    elapsed=Math.min(shot.duration,elapsed+seconds);if(elapsed>=shot.duration)settle();
   }else if(phase==='impact'){
    elapsed=Math.min(1.05,elapsed+seconds);if(elapsed>=1.05){phase='ready';elapsed=0;shot=null;emit();}
   }
  }
  function close(){cancelCharge();phase='closed';paused=false;shot=null;emit();}
  return Object.freeze({open,next,select,charge,cancelCharge,release,pause,update,close,snapshot,retry:()=>phase==='save-error'&&settle()});
 }
 host.PenaltyGame=Object.freeze({ZONES,KEEPER_CONFIG,keeperCoverage,keeperCovers,TIMING_CONFIG,timingConfig,parameters,timingWindows,needleAt,timing,evaluateShot,create});
})(window);
