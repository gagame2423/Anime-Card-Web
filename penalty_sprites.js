/* Exact rectangles for the supplied 1024px keeper sheet and 8×8 ball atlas. */
(function(host){
 'use strict';
 host.PenaltySprites=Object.freeze({
  goal:{src:'assets/sprites/goal_field.png',rect:{x:.133,y:.066,width:.734,height:.386},foregroundY:365/638,grass:{x:0,y:365,width:300,height:210}},
  keeper:{src:'assets/sprites/keeper.png',fps:3,referenceHeight:288,rects:[
   {x:62,y:12,width:164,height:288},
   {x:246,y:58,width:364,height:228},
   {x:588,y:177,width:402,height:145},
   {x:62,y:312,width:359,height:268},
   {x:398,y:365,width:276,height:320},
   {x:714,y:397,width:170,height:292},
   {x:74,y:568,width:144,height:399},
   {x:390,y:689,width:177,height:294},
   {x:686,y:744,width:236,height:241},
   {x:588,y:177,width:402,height:145,flip:true}
  ],poses:{idle:[0,5,7],left:[3],leftLow:[9],right:[1],rightLow:[2],high:[6],highRight:[4],failed:[8]}},
  ball:{src:'assets/sprites/ball_spin.png',columns:8,rows:8,fps:24,frames:Array.from({length:64},(_,i)=>i),crop:{x:17,y:17,width:94,height:94}}
 });
})(window);
