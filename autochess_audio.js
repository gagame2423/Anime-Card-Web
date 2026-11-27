/* Auto Chess keeps its existing filenames and public API; playback uses GameAudio. */
(function(host){
 'use strict';
 const RANK_FILES=Object.freeze(['itob','btos','stog','gtop','ptoe','etod','dtom','mtogm','gmtoc']);
 const FILES=Object.freeze({hextech:'hextech_open',refresh:'shop',xp:'exp',level:'levelup',fuse:'fuse',victory:'win',defeat:'lose',buy:'buy',sell:'sell',deploy:'deploy',draft:'draft',travel:'travel'});
 const OPTIONAL=Object.freeze(['buy','sell','deploy','draft','travel','hextech']),WARNING_SECONDS=10,warned=new Set();
 const audio=()=>host.GameAudio;
 function play(file,kind='countdown',fallback=null){return audio()?.playFile(file,'chess',{channel:kind,priority:kind==='rank'?8:kind==='result'?7:kind==='countdown'?5:4,gap:110,fileFallback:fallback})||false;}
 function sfx(event){return FILES[event]?play(FILES[event],['victory','defeat'].includes(event)?'result':'action'):false;}
 function rankUp(from,to){return Number.isInteger(from)&&Number.isInteger(to)&&to>from&&to>=1&&to<=9?play(RANK_FILES[to-1],'rank',to===8?'mtog':null):false;}
 function countdown(s,remaining){
  if(!s||s.finished||!['planning','carousel','augment','combat'].includes(s.phase)||!(remaining>0&&remaining<=WARNING_SECONDS))return false;
  const key=s.id+'/'+host.AutoChessSystem.label(s);if(warned.has(key))return false;warned.add(key);if(warned.size>600)warned.delete(warned.values().next().value);return play('countdown10s');
 }
 host.AutoChessAudio=Object.freeze({RANK_FILES,FILES,OPTIONAL,WARNING_SECONDS,play,sfx,rankUp,countdown,
  warm(){for(const file of ['shop','exp','levelup','fuse','win','lose'])audio()?.prime('assets/audio/'+file+'.mp3');},
  sync:()=>audio()?.sync(),stop:()=>audio()?.stop('chess'),diagnostics:()=>audio()?.diagnostics()});
})(window);
